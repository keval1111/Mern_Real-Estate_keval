const Property = require('../models/Property');
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const initialProperties = require('../data/initialProperties');
const { sendSellerApprovalEmail, sendSellerRejectionEmail } = require('../services/emailService');
const { recordPropertySale } = require('../services/paymentTrackingService');

exports.getProperties = async (req, res) => {
  try {
    const {
      city,
      location,
      minPrice,
      maxPrice,
      beds,
      baths,
      category,
      status,
      search,
      sort,
      page,
      limit,
      includeAll,
    } = req.query;

    const hasPagination = page !== undefined || limit !== undefined;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || (hasPagination ? 9 : 50)));
    const skip = (pageNumber - 1) * limitNumber;

    // Build Match Criteria
    const matchConditions = [];

    if (req.user && req.user.role === 'Sub-Admin') {
      const canViewAll = req.user.accessPermissions?.canViewAllProperties;
      if (!canViewAll) {
        matchConditions.push({ createdBy: req.user._id });
      }
    } else if (req.query.createdBy) {
      matchConditions.push({ createdBy: req.query.createdBy });
    }

    // Status filter
    if (status && status !== 'All') {
      matchConditions.push({ status });
    } else if (!includeAll) {
      matchConditions.push({ status: { $nin: ['Pending Verification', 'Rejected'] } });
    }

    // Category filter (e.g. category=Royal House or Farm Vila/Farm Villa)
    if (category && category !== 'All') {
      const escaped = category.trim().replace(/villa|vila/i, 'vil+a');
      matchConditions.push({
        category: { $regex: new RegExp(`^${escaped}$`, 'i') },
      });
    }

    // City / Location filter
    const targetCity = city || location;
    if (targetCity && targetCity.trim()) {
      const cityRegex = { $regex: targetCity.trim(), $options: 'i' };
      matchConditions.push({
        $or: [
          { city: cityRegex },
          { location: cityRegex },
        ],
      });
    }

    // Beds filter (e.g. beds=3 means 3+ beds)
    if (beds) {
      const bedsNum = Number(beds);
      if (!isNaN(bedsNum)) {
        matchConditions.push({ beds: { $gte: bedsNum } });
      }
    }

    // Baths filter
    if (baths) {
      const bathsNum = Number(baths);
      if (!isNaN(bathsNum)) {
        matchConditions.push({ baths: { $gte: bathsNum } });
      }
    }

    // Price range filters (minPrice / maxPrice)
    const priceFilter = {};
    if (minPrice) {
      const min = Number(String(minPrice).replace(/[^0-9.]/g, ''));
      if (!isNaN(min)) priceFilter.$gte = min;
    }
    if (maxPrice) {
      const max = Number(String(maxPrice).replace(/[^0-9.]/g, ''));
      if (!isNaN(max)) priceFilter.$lte = max;
    }
    if (Object.keys(priceFilter).length > 0) {
      matchConditions.push({ priceNumber: priceFilter });
    }

    // Keyword search across title, location, city, description
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      matchConditions.push({
        $or: [
          { title: searchRegex },
          { location: searchRegex },
          { city: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
        ],
      });
    }

    const matchQuery = matchConditions.length > 0 ? { $and: matchConditions } : {};

    // Sort options
    let sortStage = { createdAt: -1 };
    if (sort === 'price_desc' || sort === 'price-desc' || sort === 'highest') {
      sortStage = { priceNumber: -1, createdAt: -1 };
    } else if (sort === 'price_asc' || sort === 'price-asc' || sort === 'lowest') {
      sortStage = { priceNumber: 1, createdAt: -1 };
    } else if (sort === 'newest' || sort === 'date_desc') {
      sortStage = { createdAt: -1 };
    } else if (sort === 'oldest' || sort === 'date_asc') {
      sortStage = { createdAt: 1 };
    } else if (sort === 'beds_desc') {
      sortStage = { beds: -1, createdAt: -1 };
    } else if (sort === 'featured') {
      sortStage = { featured: -1, createdAt: -1 };
    }

    // High performance MongoDB Aggregation Pipeline with $facet
    const pipeline = [
      { $match: matchQuery },
      { $sort: sortStage },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNumber },
          ],
          totalCount: [
            { $count: 'total' },
          ],
        },
      },
    ];

    const results = await Property.aggregate(pipeline);
    const data = results[0]?.data || [];
    const total = results[0]?.totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNumber) || 1;

    // Auto-seed if database is empty on first install
    if (total === 0 && Object.keys(matchQuery).length === 0) {
      const count = await Property.countDocuments();
      if (count === 0) {
        console.log('Seeding initial properties into MongoDB...');
        const seeded = await Property.insertMany(initialProperties);
        return res.json({
          success: true,
          count: seeded.length,
          total: seeded.length,
          page: 1,
          totalPages: 1,
          limit: limitNumber,
          hasPrevPage: false,
          hasNextPage: false,
          data: seeded,
        });
      }
    }

    // Map fallback values for any legacy properties in DB
    const mappedData = data.map((item) => ({
      ...item,
      totalUnits: item.totalUnits !== undefined && item.totalUnits !== null ? item.totalUnits : 2,
      availableUnits:
        item.availableUnits !== undefined && item.availableUnits !== null
          ? item.availableUnits
          : item.totalUnits !== undefined && item.totalUnits !== null
          ? item.totalUnits
          : 2,
    }));

    res.json({
      success: true,
      count: mappedData.length,
      total,
      page: pageNumber,
      totalPages,
      limit: limitNumber,
      hasPrevPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
      data: mappedData,
    });
  } catch (error) {
    console.error('Error fetching properties with aggregation:', error);
    res.status(500).json({ success: false, message: 'Server error fetching properties', error: error.message });
  }
};

exports.getPropertyByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let property = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      property = await Property.findById(idOrSlug);
    }
    if (!property) {
      property = await Property.findOne({ slug: idOrSlug.toLowerCase() });
    }
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const propObj = property.toObject ? property.toObject() : property;
    if (propObj.totalUnits === undefined || propObj.totalUnits === null) {
      propObj.totalUnits = 2;
    }
    if (propObj.availableUnits === undefined || propObj.availableUnits === null) {
      propObj.availableUnits = propObj.status === 'Sold' ? 0 : propObj.totalUnits;
    }

    res.json({ success: true, data: propObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching property', error: error.message });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const { title, price, location, category, beds, baths, sqft, image, description, featured, amenities, yearBuilt } = req.body;

    if (!title || !price || !location) {
      return res.status(400).json({ success: false, message: 'Title, price, and location are required' });
    }

    // Sub-Admin KYC verification check
    if (req.user && req.user.role === 'Sub-Admin' && req.user.kycStatus !== 'Approved') {
      return res.status(403).json({
        success: false,
        code: 'KYC_NOT_APPROVED',
        message: 'KYC Verification Required: Your KYC status must be Approved by Super Admin before adding properties.',
      });
    }

    const priceNum = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
    const totalUnitsNum = Math.max(1, parseInt(req.body.totalUnits, 10) || 1);
    const availableUnitsNum =
      req.body.availableUnits !== undefined && req.body.availableUnits !== null
        ? Math.max(0, parseInt(req.body.availableUnits, 10))
        : totalUnitsNum;

    const property = new Property({
      title,
      price: price.startsWith('$') ? price : `$${price}`,
      priceNumber: priceNum,
      location,
      category: category || 'Properties',
      beds: Number(beds) || 3,
      baths: Number(baths) || 2,
      sqft: sqft || '1,500',
      totalUnits: totalUnitsNum,
      availableUnits: availableUnitsNum,
      image: image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      description: description || '',
      featured: Boolean(featured),
      amenities: amenities || [],
      yearBuilt: yearBuilt || '2024',
      status: availableUnitsNum === 0 ? 'Sold' : 'Active',
      createdBy: req.user ? req.user._id : (req.body.createdBy || null),
      createdByName: req.user ? req.user.name : (req.body.createdByName || 'Super Admin'),
      createdByEmail: req.user ? req.user.email : (req.body.createdByEmail || ''),
      creatorRole: req.user ? req.user.role : (req.body.creatorRole || 'Super Admin'),
    });

    const savedProperty = await property.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('propertyAvailabilityUpdated', {
        propertyId: savedProperty._id,
        slug: savedProperty.slug,
        totalUnits: savedProperty.totalUnits,
        availableUnits: savedProperty.availableUnits,
        status: savedProperty.status,
      });
    }
    res.status(201).json({ success: true, message: 'Property created successfully', data: savedProperty });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating property', error: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const idParam = req.params.idOrSlug || req.params.id;
    let property = null;
    if (idParam && idParam.match(/^[0-9a-fA-F]{24}$/)) {
      property = await Property.findById(idParam);
    }
    if (!property && idParam) {
      property = await Property.findOne({ slug: String(idParam).toLowerCase() });
    }
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Role-based Ownership & Management Permission Check
    if (req.user && req.user.role === 'Sub-Admin') {
      const canManageAll = req.user.accessPermissions?.canManageAllProperties;
      const isOwner = property.createdBy && property.createdBy.toString() === req.user._id.toString();
      if (!canManageAll && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You only have permission to edit properties added by yourself.',
        });
      }
    }

    Object.assign(property, req.body);
    if (req.body.price) {
      const priceNum = parseFloat(String(req.body.price).replace(/[^0-9.]/g, '')) || 0;
      property.priceNumber = priceNum;
    }
    if (req.body.totalUnits !== undefined) {
      property.totalUnits = Math.max(1, parseInt(req.body.totalUnits, 10) || 1);
    }
    if (req.body.availableUnits !== undefined) {
      property.availableUnits = Math.max(0, parseInt(req.body.availableUnits, 10));
    }
    if (property.availableUnits === 0 && property.status === 'Active') {
      property.status = 'Sold';
    } else if (property.availableUnits > 0 && property.status === 'Sold') {
      property.status = 'Active';
    }

    const updated = await property.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('propertyAvailabilityUpdated', {
        propertyId: updated._id,
        slug: updated.slug,
        totalUnits: updated.totalUnits,
        availableUnits: updated.availableUnits,
        status: updated.status,
      });
    }

    // If property was marked Sold, ensure payment tracking transaction is recorded
    if (updated.status === 'Sold') {
      try {
        const existingPayout = await Payout.findOne({ propertyId: updated._id });
        if (!existingPayout) {
          const directOrder = new Order({
            orderId: `ORD-SALE-${Math.floor(100000 + Math.random() * 900000)}`,
            customer: 'Property Buyer (Direct Allotment)',
            email: 'buyer.direct@realestate.com',
            phone: '+91 98000 00000',
            item: updated.title,
            propertyId: updated._id,
            quantity: 1,
            total: updated.price || `$${updated.priceNumber || 100000}`,
            totalNumber: updated.priceNumber || 100000,
            status: 'Completed',
          });
          const savedOrder = await directOrder.save();
          await recordPropertySale({
            order: savedOrder,
            property: updated,
            io,
          });
        }
      } catch (saleErr) {
        console.warn('Property sale payment tracking warning in updateProperty:', saleErr.message);
      }
    }

    res.json({ success: true, message: 'Property updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating property', error: error.message });
  }
};

exports.togglePropertyStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Role-based Ownership & Management Permission Check
    if (req.user && req.user.role === 'Sub-Admin') {
      const canManageAll = req.user.accessPermissions?.canManageAllProperties;
      const isOwner = property.createdBy && property.createdBy.toString() === req.user._id.toString();
      if (!canManageAll && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You only have permission to change status of properties added by yourself.',
        });
      }
    }

    const nextStatus =
      property.status === 'Active'
        ? 'Pending'
        : property.status === 'Pending'
        ? 'Sold'
        : 'Active';

    property.status = nextStatus;
    const updated = await property.save();

    // If property was marked Sold, ensure payment tracking transaction is recorded
    if (nextStatus === 'Sold') {
      try {
        const io = req.app.get('io');
        const existingPayout = await Payout.findOne({ propertyId: updated._id });
        if (!existingPayout) {
          const directOrder = new Order({
            orderId: `ORD-SALE-${Math.floor(100000 + Math.random() * 900000)}`,
            customer: 'Property Buyer (Direct Allotment)',
            email: 'buyer.direct@realestate.com',
            phone: '+91 98000 00000',
            item: updated.title,
            propertyId: updated._id,
            quantity: 1,
            total: updated.price || `$${updated.priceNumber || 100000}`,
            totalNumber: updated.priceNumber || 100000,
            status: 'Completed',
          });
          const savedOrder = await directOrder.save();
          await recordPropertySale({
            order: savedOrder,
            property: updated,
            io,
          });
        }
      } catch (saleErr) {
        console.warn('Property sale payment tracking warning in togglePropertyStatus:', saleErr.message);
      }
    }

    res.json({ success: true, message: `Status updated to ${nextStatus}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling status', error: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Role-based Ownership & Management Permission Check
    if (req.user && req.user.role === 'Sub-Admin') {
      const canManageAll = req.user.accessPermissions?.canManageAllProperties;
      const isOwner = property.createdBy && property.createdBy.toString() === req.user._id.toString();
      if (!canManageAll && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You only have permission to delete properties added by yourself.',
        });
      }
    }

    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting property', error: error.message });
  }
};

exports.resetDefaults = async (req, res) => {
  try {
    await Property.deleteMany({});
    const seeded = await Property.insertMany(initialProperties);
    res.json({ success: true, message: 'Catalog reset to 12 default luxury properties', count: seeded.length, data: seeded });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resetting properties', error: error.message });
  }
};

exports.submitSellRequest = async (req, res) => {
  try {
    const {
      title,
      price,
      location,
      city,
      category,
      beds,
      baths,
      sqft,
      yearBuilt,
      image,
      description,
      amenities,
      sellerName,
      sellerEmail,
      sellerPhone,
      documentUrls,
      sellerId,
    } = req.body;

    if (!title || !price || !location) {
      return res.status(400).json({ success: false, message: 'Title, price, and location are required' });
    }

    const priceNum = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
    const formattedPrice = price.startsWith('$') || price.startsWith('₹') || price.startsWith('Rs') ? price : `$${price}`;

    const defaultSteps = [
      {
        title: 'Listing Submission & Documents Audit',
        desc: 'Property specification, seller proof and deed documentation uploaded.',
        date: 'Today • Verification Pending',
        completed: true,
      },
      {
        title: 'Field Valuation & Physical Inspection',
        desc: 'Certified valuer site visit and market valuation certificate generation.',
        date: 'Scheduled within 48 hrs',
        completed: false,
      },
      {
        title: 'Live On Marketplace & Buyer Viewings',
        desc: 'Property published to high-net-worth buyers & investors network.',
        date: 'Pending Inspection',
        completed: false,
      },
      {
        title: 'Buyer Offer & Escrow Token',
        desc: 'Offer negotiation & booking token deposit held in legal escrow.',
        date: 'Pending',
        completed: false,
      },
      {
        title: 'Deed Registration & Seller Payout',
        desc: 'Sub-registrar signing & 100% escrow funds released to seller bank account.',
        date: 'Pending',
        completed: false,
      },
    ];

    const property = new Property({
      title,
      price: formattedPrice,
      priceNumber: priceNum,
      location,
      city: city || 'Mumbai',
      category: category || 'Properties',
      beds: Number(beds) || 3,
      baths: Number(baths) || 2,
      sqft: sqft || '1,800 sq ft',
      yearBuilt: yearBuilt || '2024',
      image: image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      description: description || 'Prime residential property submitted for verified marketplace listing.',
      amenities: amenities && amenities.length > 0 ? amenities : ['24/7 Security', 'Car Parking', 'Power Backup'],
      status: 'Pending Verification',
      isSellerSubmission: true,
      sellerId: sellerId || (req.user ? req.user._id : undefined),
      sellerName: sellerName || (req.user ? req.user.name : 'Verified Seller'),
      sellerEmail: sellerEmail || (req.user ? req.user.email : ''),
      sellerPhone: sellerPhone || (req.user ? req.user.phone : ''),
      documentUrls: documentUrls || ['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'],
      currentStep: 1,
      steps: defaultSteps,
    });

    const saved = await property.save();
    res.status(201).json({
      success: true,
      message: 'Property listing submitted successfully! Pending verification by Admin.',
      data: saved,
    });
  } catch (error) {
    console.error('Error submitting sell request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit sell request', error: error.message });
  }
};

exports.getSellerRequests = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {
      $or: [
        { isSellerSubmission: true },
        { status: { $in: ['Pending Verification', 'Rejected'] } },
      ],
    };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$and = [
        query,
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { sellerName: { $regex: search, $options: 'i' } },
            { sellerEmail: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const requests = await Property.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error('Error fetching seller requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch seller requests', error: error.message });
  }
};

exports.approveSellRequest = async (req, res) => {
  try {
    const { adminValuation, verificationNotes } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.status = 'Active';
    if (adminValuation) property.adminValuation = adminValuation;
    if (verificationNotes) property.verificationNotes = verificationNotes;

    // Advance steps to marketplace live
    if (property.steps && property.steps.length >= 3) {
      property.steps[0].completed = true;
      property.steps[1].completed = true;
      property.steps[1].date = 'Inspected & Approved by Valuation Officer';
      property.steps[2].completed = true;
      property.steps[2].date = 'Live on Marketplace';
      property.currentStep = 3;
    }

    const updated = await property.save();

    // Send automated seller approval email notification
    let emailResult = null;
    try {
      emailResult = await sendSellerApprovalEmail(updated);
    } catch (mailErr) {
      console.warn('⚠️ Seller approval email warning:', mailErr.message);
    }

    res.json({
      success: true,
      message: `Property "${property.title}" approved and published to the live marketplace!`,
      data: updated,
      emailSent: emailResult?.success || false,
      emailPreview: emailResult?.previewUrl || null,
    });
  } catch (error) {
    console.error('Error approving property:', error);
    res.status(500).json({ success: false, message: 'Error approving property', error: error.message });
  }
};

exports.rejectSellRequest = async (req, res) => {
  try {
    const { reason, verificationNotes } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.status = 'Rejected';
    property.verificationNotes = reason || verificationNotes || 'Property documentation or specifications did not meet portal standards.';

    const updated = await property.save();

    // Send automated seller rejection email notification
    let emailResult = null;
    try {
      emailResult = await sendSellerRejectionEmail(updated, property.verificationNotes);
    } catch (mailErr) {
      console.warn('⚠️ Seller rejection email warning:', mailErr.message);
    }

    res.json({
      success: true,
      message: `Property "${property.title}" has been rejected.`,
      data: updated,
      emailSent: emailResult?.success || false,
      emailPreview: emailResult?.previewUrl || null,
    });
  } catch (error) {
    console.error('Error rejecting property:', error);
    res.status(500).json({ success: false, message: 'Error rejecting property', error: error.message });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const { email } = req.query;
    let query = { isSellerSubmission: true };

    if (req.user && req.user._id) {
      query.$or = [{ sellerId: req.user._id }, { sellerEmail: req.user.email }];
    } else if (email) {
      query.sellerEmail = email;
    }

    const submissions = await Property.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, message: 'Error fetching submissions', error: error.message });
  }
};


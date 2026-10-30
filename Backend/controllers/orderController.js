const Order = require('../models/Order');
const Property = require('../models/Property');
const User = require('../models/User');
const Payout = require('../models/Payout');
const { sendBookingConfirmationEmail } = require('../services/emailService');
const { recordPropertySale } = require('../services/paymentTrackingService');

exports.getOrders = async (req, res) => {
  try {
    const { email, customer } = req.query;
    const filter = {};
    if (email) {
      filter.email = { $regex: new RegExp(email, 'i') };
    } else if (customer) {
      filter.customer = { $regex: new RegExp(customer, 'i') };
    }

    if (req.user && req.user.role === 'Sub-Admin') {
      const canViewAllOrders = req.user.accessPermissions?.canViewAllOrders;
      if (!canViewAllOrders) {
        const myProperties = await Property.find({ createdBy: req.user._id }).select('_id title');
        const myIds = myProperties.map((p) => p._id.toString());
        const myObjectIds = myProperties.map((p) => p._id);
        const myTitles = myProperties.map((p) => p.title);
        filter.$or = [
          { propertyId: { $in: [...myIds, ...myObjectIds] } },
          { item: { $in: myTitles } },
        ];
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      email,
      phone,
      item,
      propertyId,
      quantity,
      total,
      tokenPaid,
      tokenAmount,
      address,
      city,
      state,
      pincode,
      country,
      propertyImage,
      kycDocuments,
    } = req.body;

    if (!customer || !email || !item || !total) {
      return res.status(400).json({ success: false, message: 'Customer, email, item, and total are required' });
    }

    const bookingQuantity = Math.max(1, parseInt(quantity, 10) || 1);

    // 1. Locate Property by ID or Slug or Name
    let targetProperty = null;
    if (propertyId) {
      if (typeof propertyId === 'string' && propertyId.match(/^[0-9a-fA-F]{24}$/)) {
        targetProperty = await Property.findById(propertyId);
      }
      if (!targetProperty) {
        targetProperty = await Property.findOne({ slug: String(propertyId).toLowerCase() });
      }
    }

    if (!targetProperty && item) {
      const itemClean = String(item).split('+')[0].trim();
      targetProperty = await Property.findOne({
        $or: [
          { title: new RegExp(`^${itemClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          { slug: itemClean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
        ],
      });
    }

    // 2. Validate and atomically deduct availableUnits if property exists
    if (targetProperty) {
      const currentAvail =
        targetProperty.availableUnits !== undefined
          ? targetProperty.availableUnits
          : targetProperty.totalUnits || 1;

      if (currentAvail < bookingQuantity) {
        return res.status(400).json({
          success: false,
          code: 'INSUFFICIENT_UNITS',
          message:
            currentAvail <= 0
              ? `Property "${targetProperty.title}" is completely Sold Out! No units available.`
              : `Cannot book ${bookingQuantity} unit(s). Only ${currentAvail} unit(s) currently available for "${targetProperty.title}".`,
          availableUnits: currentAvail,
          totalUnits: targetProperty.totalUnits || 1,
        });
      }

      // Atomic Update: Ensures no overselling during simultaneous bookings
      const updatedProperty = await Property.findOneAndUpdate(
        {
          _id: targetProperty._id,
          availableUnits: { $gte: bookingQuantity },
        },
        {
          $inc: { availableUnits: -bookingQuantity },
        },
        { new: true }
      );

      if (!updatedProperty) {
        return res.status(400).json({
          success: false,
          code: 'UNITS_JUST_BOOKED',
          message: `The last available unit(s) for "${targetProperty.title}" were just booked. Please choose another listing.`,
        });
      }

      // Auto-set status to 'Sold' when remaining units reach 0
      if (updatedProperty.availableUnits === 0 && updatedProperty.status !== 'Sold') {
        updatedProperty.status = 'Sold';
        await updatedProperty.save();
      }

      targetProperty = updatedProperty;

      // Broadcast real-time availability update to all connected users
      const io = req.app.get('io');
      if (io) {
        io.emit('propertyAvailabilityUpdated', {
          propertyId: targetProperty._id,
          slug: targetProperty.slug,
          title: targetProperty.title,
          totalUnits: targetProperty.totalUnits,
          availableUnits: targetProperty.availableUnits,
          status: targetProperty.status,
        });
      }
    }

    const totalNum = parseFloat(String(total).replace(/[^0-9.]/g, '')) || 0;

    const order = new Order({
      customer,
      email,
      phone: phone || '',
      item,
      propertyId: targetProperty ? targetProperty._id : propertyId || null,
      quantity: bookingQuantity,
      total: String(total).startsWith('$') || String(total).startsWith('₹') || String(total).startsWith('Rs') ? String(total) : `$${total}`,
      totalNumber: totalNum,
      tokenPaid: tokenPaid || (tokenAmount ? `$${tokenAmount}` : 'Rs. 1,00,000.00'),
      status: 'Processing',
      address: address || '742 Evergreen Terrace, Springfield',
      city: city || 'Springfield',
      state: state || 'Oregon',
      pincode: pincode || '97477',
      country: country || 'United States',
      propertyImage: propertyImage || (targetProperty ? targetProperty.image : ''),
      kycDocuments: kycDocuments || {
        panNumber: '',
        aadhaarNumber: '',
        panCardUrl: '',
        aadhaarDocUrl: '',
        status: 'Under Review',
      },
    });

    const saved = await order.save();

    try {
      await recordPropertySale({
        order: saved,
        property: targetProperty,
        io: req.app.get('io'),
      });
    } catch (payoutErr) {
      console.warn('⚠️ Payment tracking recording warning in createOrder:', payoutErr.message);
    }

    // Trigger confirmation email asynchronously
    sendBookingConfirmationEmail(saved).catch((e) =>
      console.warn('⚠️ Order email async warning:', e.message)
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: saved,
      remainingUnits: targetProperty ? targetProperty.availableUnits : undefined,
      propertyStatus: targetProperty ? targetProperty.status : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
  }
};

// Helper to find order by _id or orderId
const findOrder = async (id) => {
  if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
    const byId = await Order.findById(id);
    if (byId) return byId;
  }
  return await Order.findOne({ orderId: id });
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await findOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    const updated = await order.save();
    res.json({ success: true, message: 'Order status updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order', error: error.message });
  }
};

exports.advanceOrderStep = async (req, res) => {
  try {
    const { step, milestoneNotes } = req.body;
    const order = await findOrder(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Default step names
    const defaultStepNames = [
      { title: 'Booking Request Received', desc: 'Order details and initial token payment recorded' },
      { title: 'KYC & Title Deed Verification', desc: 'Title deed, KYC and buyer background check' },
      { title: 'Site Inspection & Legal Clearance', desc: 'Physical appraisal & municipal approvals' },
      { title: 'Ownership Transfer & Key Handover', desc: 'Possession handover & key collection' },
    ];

    let currentSteps = order.trackingSteps && order.trackingSteps.length === 4
      ? order.trackingSteps
      : defaultStepNames.map((s, idx) => ({
          title: s.title,
          desc: s.desc,
          date: idx === 0 ? 'Completed' : 'Pending',
          completed: idx === 0,
        }));

    // Target step (1 to 4). If not provided, increment by 1
    let nextStep = step !== undefined ? Number(step) : (order.trackingStep || 1) + 1;
    if (nextStep > 4) nextStep = 4;
    if (nextStep < 1) nextStep = 1;

    // Update each step's completed status
    currentSteps = currentSteps.map((s, index) => {
      const stepNum = index + 1;
      if (stepNum < nextStep) {
        return {
          ...s,
          completed: true,
          date: s.date && s.date !== 'Pending' ? s.date : 'Completed',
        };
      } else if (stepNum === nextStep) {
        return {
          ...s,
          completed: true,
          date: `Completed Today (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        };
      } else {
        return {
          ...s,
          completed: false,
          date: 'Pending',
        };
      }
    });

    order.trackingStep = nextStep;
    order.trackingSteps = currentSteps;
    if (milestoneNotes !== undefined) order.milestoneNotes = milestoneNotes;

    // If final step reached, update overall order status
    if (nextStep === 4) {
      order.status = 'Completed';
    } else if (order.status === 'Completed' && nextStep < 4) {
      order.status = 'Processing';
    }

    const updated = await order.save();
    res.json({
      success: true,
      message: `Order tracking milestone updated to Step ${nextStep}: "${currentSteps[nextStep - 1]?.title}"`,
      data: updated,
    });
  } catch (error) {
    console.error('Error advancing order step:', error);
    res.status(500).json({ success: false, message: 'Failed to advance tracking step', error: error.message });
  }
};

exports.assignAgentToOrder = async (req, res) => {
  try {
    const { name, role, phone, email, avatar } = req.body;
    const order = await findOrder(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!name) {
      return res.status(400).json({ success: false, message: 'Agent name is required' });
    }

    order.assignedAgent = {
      name,
      role: role || 'Senior Property Advisor & Legal Officer',
      phone: phone || '+91 98200 11223',
      email: email || 'advisor@modernrealestate.com',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };

    const updated = await order.save();
    res.json({
      success: true,
      message: `Legal officer "${name}" assigned to order #${order.orderId}`,
      data: updated,
    });
  } catch (error) {
    console.error('Error assigning agent:', error);
    res.status(500).json({ success: false, message: 'Failed to assign agent', error: error.message });
  }
};

exports.updateKycStatus = async (req, res) => {
  try {
    const { status, verifiedBy, rejectionReason } = req.body;
    const order = await findOrder(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.kycDocuments = {
      ...(order.kycDocuments || {}),
      status: status || 'Verified',
      verifiedAt: status === 'Verified' ? new Date() : null,
      verifiedBy: verifiedBy || 'Senior Legal Conveyancing Officer',
      rejectionReason: rejectionReason || '',
    };

    // If KYC is verified, ensure Step 2 of tracking is marked complete
    if (status === 'Verified') {
      if ((order.trackingStep || 1) < 2) {
        order.trackingStep = 2;
      }
      if (Array.isArray(order.trackingSteps) && order.trackingSteps.length >= 2) {
        order.trackingSteps[1].completed = true;
        order.trackingSteps[1].date = `Verified on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
    }

    const updated = await order.save();
    res.json({
      success: true,
      message: `KYC status updated to "${status}" for Order #${order.orderId}`,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating KYC status:', error);
    res.status(500).json({ success: false, message: 'Failed to update KYC status', error: error.message });
  }
};


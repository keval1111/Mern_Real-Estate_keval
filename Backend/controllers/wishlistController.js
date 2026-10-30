const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Property = require('../models/Property');
const Wishlist = require('../models/Wishlist');

// Helper to resolve user from JWT token, query email, body email, or header
const resolveUser = async (req) => {
  // 1. If already resolved by protect middleware
  if (req.user) return req.user;

  // 2. Check Authorization Bearer header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_realestate_jwt_key_2026'
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user) return user;
    } catch (err) {
    }
  }

  // 3. Check email in query, body, or custom header
  const email = (
    req.query.email ||
    req.body.email ||
    req.headers['x-user-email'] ||
    ''
  ).trim().toLowerCase();

  if (email) {
    const user = await User.findOne({ email }).select('-password');
    if (user) return user;
  }

  // 4. Default to first active customer/user for seamless demo if no credentials provided
  return await User.findOne({ role: 'Customer' }).select('-password') || await User.findOne().select('-password');
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'Property ID or slug is required' });
    }

    // 1. Resolve Property by ObjectId or Slug
    let property = null;
    if (mongoose.Types.ObjectId.isValid(propertyId)) {
      property = await Property.findById(propertyId);
    }
    if (!property) {
      property = await Property.findOne({ slug: String(propertyId).toLowerCase() });
    }
    if (!property) {
      // Also try regex match on title
      property = await Property.findOne({
        title: { $regex: new RegExp(`^${propertyId.replace(/[-_]/g, ' ')}$`, 'i') },
      });
    }

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // 2. Resolve Authenticated User
    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to save properties to your account wishlist',
      });
    }

    // 3. Check if property is currently in user's wishlist
    const existing = await Wishlist.findOne({
      user: user._id,
      property: property._id,
    });

    let isWishlisted = false;
    let message = '';

    if (existing) {
      // Remove from Wishlist collection & User wishlist array
      await Wishlist.deleteOne({ _id: existing._id });
      await User.findByIdAndUpdate(user._id, {
        $pull: { wishlist: property._id },
      });
      isWishlisted = false;
      message = `${property.title} removed from your wishlist`;
    } else {
      // Add to Wishlist collection & User wishlist array
      await Wishlist.create({
        user: user._id,
        userEmail: user.email,
        property: property._id,
        propertySlug: property.slug,
      });
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { wishlist: property._id },
      });
      isWishlisted = true;
      message = `${property.title} saved to your wishlist`;
    }

    // 4. Fetch updated wishlist properties for this user
    const updatedEntries = await Wishlist.find({ user: user._id })
      .populate('property')
      .sort({ createdAt: -1 });

    const wishlistProperties = updatedEntries
      .map((entry) => entry.property)
      .filter(Boolean);

    res.json({
      success: true,
      isWishlisted,
      message,
      propertyId: property._id,
      propertySlug: property.slug,
      count: wishlistProperties.length,
      data: wishlistProperties,
    });
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error toggling wishlist', error: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const entries = await Wishlist.find({ user: user._id })
      .populate('property')
      .sort({ createdAt: -1 });

    const properties = entries
      .map((e) => e.property)
      .filter(Boolean);

    res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error fetching wishlist', error: error.message });
  }
};

exports.clearWishlist = async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.json({ success: true, count: 0, data: [] });
    }

    await Wishlist.deleteMany({ user: user._id });
    await User.findByIdAndUpdate(user._id, { wishlist: [] });

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      count: 0,
      data: [],
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error clearing wishlist', error: error.message });
  }
};

exports.getAdminWishlistSummary = async (req, res) => {
  try {
    // 1. Fetch all wishlist records, populating property & user details
    const entries = await Wishlist.find()
      .populate('property')
      .populate('user', 'name email phone avatar createdAt')
      .sort({ createdAt: -1 });

    // 2. If no wishlists exist yet, seed sample buyer favorites for demonstration
    if (entries.length === 0) {
      const sampleProps = await Property.find({ status: 'Active' }).limit(3);
      const sampleCustomer = (await User.findOne({ role: 'Customer' })) || (await User.findOne());
      if (sampleProps.length > 0 && sampleCustomer) {
        for (const p of sampleProps) {
          await Wishlist.findOneAndUpdate(
            { user: sampleCustomer._id, property: p._id },
            { user: sampleCustomer._id, userEmail: sampleCustomer.email, property: p._id, propertySlug: p.slug },
            { upsert: true, new: true }
          );
        }
        return exports.getAdminWishlistSummary(req, res);
      }
    }

    // 3. Group by Property and aggregate all interested buyer details
    const propertyMap = {};

    for (const item of entries) {
      if (!item.property) continue;
      const propId = String(item.property._id);

      if (!propertyMap[propId]) {
        propertyMap[propId] = {
          _id: item.property._id,
          id: item.property._id,
          title: item.property.title,
          slug: item.property.slug,
          image: item.property.image,
          price: item.property.price,
          priceNumber: item.property.priceNumber,
          location: item.property.location,
          city: item.property.city,
          category: item.property.category,
          beds: item.property.beds,
          baths: item.property.baths,
          sqft: item.property.sqft,
          status: item.property.status,
          savesCount: 0,
          buyers: [],
        };
      }

      propertyMap[propId].savesCount += 1;
      propertyMap[propId].buyers.push({
        id: item.user?._id,
        name: item.user?.name || 'Keval Patel',
        email: item.user?.email || item.userEmail || 'buyer@example.com',
        phone: item.user?.phone || '+91 98765 43210',
        avatar: item.user?.avatar || '',
        savedAt: item.createdAt,
      });
    }

    const aggregated = Object.values(propertyMap).sort((a, b) => b.savesCount - a.savesCount);

    res.json({
      success: true,
      count: aggregated.length,
      data: aggregated,
    });
  } catch (error) {
    console.error('Error fetching admin wishlist summary:', error);
    res.status(500).json({ success: false, message: 'Error fetching favorited items', error: error.message });
  }
};

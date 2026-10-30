const Review = require('../models/Review');
const Property = require('../models/Property');

// Initial seed reviews for real estate properties
const defaultReviews = [
  {
    propertyId: '1',
    propertyTitle: 'The Imperial Sky Villa',
    author: 'Rajesh Singhania',
    email: 'rajesh.singhania@investments.com',
    rating: 5,
    title: 'Breathtaking Mumbai Skyline Views',
    comment: 'The private elevator and infinity balcony views exceeded expectations. Transaction and legal compliance was handled seamlessly by the team.',
    mediaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    status: 'Approved',
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    propertyId: '2',
    propertyTitle: 'Sea Face Royal Mansion',
    author: 'Ayesha Merchant',
    email: 'ayesha.merchant@vogue.in',
    rating: 5,
    title: 'Top-tier luxury and security',
    comment: 'The architectural finishes and high-end security protocols make this one of the finest addresses in Worli. Very satisfied with our site visit and booking.',
    mediaUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    status: 'Approved',
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    propertyId: '3',
    propertyTitle: 'Nikol Luxury Farm Estate',
    author: 'Vikram Mehta',
    email: 'vikram.mehta@infra.co.in',
    rating: 4,
    title: 'Serene countryside living',
    comment: 'Expansive private lawns and beautiful clubhouse amenities. Minor delay in paperwork verification, but overall excellent value.',
    mediaUrl: '',
    status: 'Approved',
    verifiedBuyer: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
];

exports.createReview = async (req, res) => {
  try {
    const {
      propertyId,
      propertyTitle,
      author,
      email,
      rating,
      title,
      comment,
      mediaUrl,
      status,
      verifiedBuyer,
    } = req.body;

    if (!propertyId || !propertyTitle) {
      return res.status(400).json({ success: false, message: 'Property details are required' });
    }

    if (!author || !email || !comment) {
      return res.status(400).json({ success: false, message: 'Author name, email, and comment are required' });
    }

    const review = new Review({
      propertyId: String(propertyId),
      propertyTitle: String(propertyTitle),
      author: String(author).trim(),
      email: String(email).trim().toLowerCase(),
      rating: Number(rating) || 5,
      title: title ? String(title).trim() : '',
      comment: String(comment).trim(),
      mediaUrl: mediaUrl || '',
      status: status || 'Approved',
      verifiedBuyer: verifiedBuyer !== undefined ? Boolean(verifiedBuyer) : true,
    });

    const saved = await review.save();
    console.log(`✓ Review created in database: "${saved.title || saved.comment.slice(0, 20)}" by ${saved.author}`);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: saved,
    });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ success: false, message: 'Error saving review to database', error: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { propertyId, status, search } = req.query;
    const query = {};

    if (propertyId) {
      query.propertyId = String(propertyId);
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim()) {
      const reg = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ author: reg }, { propertyTitle: reg }, { title: reg }, { comment: reg }];
    }

    if (req.user && req.user.role === 'Sub-Admin') {
      const canViewAllReviews = req.user.accessPermissions?.canViewAllReviews;
      if (!canViewAllReviews) {
        const myProperties = await Property.find({ createdBy: req.user._id }).select('_id title');
        const myIds = myProperties.map((p) => p._id.toString());
        const myTitles = myProperties.map((p) => p.title);
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { propertyId: { $in: myIds } },
            { propertyTitle: { $in: myTitles } },
          ],
        });
      }
    }

    let reviews = await Review.find(query).sort({ createdAt: -1 });

    // Auto-seed if database is completely empty so demo doesn't show blank
    if (reviews.length === 0 && !propertyId && !search && (!status || status === 'All')) {
      const count = await Review.countDocuments();
      if (count === 0) {
        console.log('Seeding initial demonstration reviews into MongoDB...');
        reviews = await Review.insertMany(defaultReviews);
      }
    }

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted successfully', data: deleted });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Error deleting review', error: error.message });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Pending', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, message: `Review status updated to ${status}`, data: updated });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ success: false, message: 'Error updating review status', error: error.message });
  }
};

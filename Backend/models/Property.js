const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      default: 'Properties',
      enum: ['Royal House', 'Farm Villa', 'Properties', 'Bestseller', 'Home', 'Apartment', 'Villa'],
    },
    price: {
      type: String,
      required: true,
    },
    priceNumber: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: '',
    },
    beds: {
      type: Number,
      default: 3,
    },
    baths: {
      type: Number,
      default: 2,
    },
    sqft: {
      type: String,
      default: '1,500',
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Sold', 'Pending Verification', 'Approved', 'Rejected', 'Delisted', 'Removed'],
      default: 'Active',
    },
    isDelisted: {
      type: Boolean,
      default: false,
    },
    delistedReason: {
      type: String,
      default: '',
    },
    delistedAt: {
      type: Date,
      default: null,
    },
    delistedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    totalUnits: {
      type: Number,
      default: 2,
      min: 1,
    },
    availableUnits: {
      type: Number,
      default: 2,
      min: 0,
    },
    isSellerSubmission: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdByName: {
      type: String,
      default: '',
    },
    createdByEmail: {
      type: String,
      default: '',
    },
    creatorRole: {
      type: String,
      default: 'Super Admin',
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sellerName: {
      type: String,
      default: '',
    },
    sellerEmail: {
      type: String,
      default: '',
    },
    sellerPhone: {
      type: String,
      default: '',
    },
    documentUrls: {
      type: [String],
      default: [],
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    adminValuation: {
      type: String,
      default: '',
    },
    currentStep: {
      type: Number,
      default: 1,
    },
    steps: [
      {
        title: String,
        desc: String,
        date: String,
        completed: Boolean,
      },
    ],
    inquiriesCount: {
      type: Number,
      default: 0,
    },
    offersCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    },
    description: {
      type: String,
      default: '',
    },
    amenities: {
      type: [String],
      default: [],
    },
    yearBuilt: {
      type: String,
      default: '2024',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save slug generator
propertySchema.pre('save', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  if (this.price && (!this.priceNumber || this.priceNumber === 0)) {
    const num = parseFloat(String(this.price).replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) this.priceNumber = num;
  }
  if (this.totalUnits === undefined || this.totalUnits === null || isNaN(this.totalUnits)) {
    this.totalUnits = 1;
  }
  if (this.availableUnits === undefined || this.availableUnits === null || isNaN(this.availableUnits)) {
    this.availableUnits = this.totalUnits;
  }
  // Auto-switch status based on availability (unless Delisted, Removed, or Pending)
  if (this.status !== 'Delisted' && this.status !== 'Removed' && this.status !== 'Pending Verification' && this.status !== 'Rejected') {
    if (this.availableUnits <= 0 && this.status === 'Active') {
      this.status = 'Sold';
    } else if (this.availableUnits > 0 && this.status === 'Sold') {
      this.status = 'Active';
    }
  }
  next();
});

module.exports = mongoose.model('Property', propertySchema);

const mongoose = require('mongoose');

const propertyReportSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Property ID is required'],
      index: true,
    },
    propertyTitle: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
    },
    propertyImage: {
      type: String,
      default: '',
    },
    propertyPrice: {
      type: String,
      default: '',
    },
    propertyLocation: {
      type: String,
      default: '',
    },
    propertyOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    propertyOwnerName: {
      type: String,
      default: 'Super Admin',
    },
    propertyOwnerEmail: {
      type: String,
      default: '',
    },
    propertyOwnerRole: {
      type: String,
      default: 'Super Admin',
    },
    reporterName: {
      type: String,
      required: [true, 'Reporter name is required'],
      trim: true,
    },
    reporterEmail: {
      type: String,
      required: [true, 'Reporter email is required'],
      trim: true,
      lowercase: true,
    },
    reporterPhone: {
      type: String,
      trim: true,
      default: '',
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reason: {
      type: String,
      required: [true, 'Predefined report reason is required'],
      enum: [
        'Misleading or Inaccurate Information',
        'Fraudulent Listing / Fake Ownership',
        'Incorrect Pricing / Hidden Charges',
        'Duplicate Listing',
        'Property Already Sold / Unavailable',
        'Inappropriate Images or Content',
        'Other Policy Violation',
      ],
      default: 'Misleading or Inaccurate Information',
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Detailed report description is required'],
      trim: true,
      minlength: [2, 'Description must be at least 2 characters long'],
    },
    evidenceUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Under Investigation', 'Resolved', 'Dismissed'],
      default: 'Pending Review',
      index: true,
    },
    actionTaken: {
      type: String,
      enum: [
        'None',
        'Property Removed from Portal',
        'Warning Issued to Owner',
        'Details Corrected',
        'Dismissed as Invalid',
      ],
      default: 'None',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedByName: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PropertyReport', propertyReportSchema);

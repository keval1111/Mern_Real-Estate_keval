const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    client: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    property: {
      type: String,
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    message: {
      type: String,
      default: 'I would like to schedule a viewing tour for this property.',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Completed'],
      default: 'New',
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Inquiry', inquirySchema);

const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    visitId: {
      type: String,
      unique: true,
      default: () => `VST-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    propertyId: {
      type: String,
      default: null,
    },
    propertyTitle: {
      type: String,
      required: true,
      trim: true,
    },
    propertySlug: {
      type: String,
      default: '',
    },
    propertyImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    },
    propertyLocation: {
      type: String,
      default: 'Prime Location',
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    visitType: {
      type: String,
      enum: ['In-Person Guided Tour', 'Live 3D Video Walkthrough'],
      default: 'In-Person Guided Tour',
    },
    visitDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    timeSlot: {
      type: String, // e.g. "10:00 AM - 11:00 AM"
      required: true,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Completed', 'Rescheduled', 'Cancelled'],
      default: 'Confirmed',
    },
    notes: {
      type: String,
      default: '',
    },
    assignedAgent: {
      name: { type: String, default: 'Vikram Malhotra' },
      phone: { type: String, default: '+91 98200 11223' },
      email: { type: String, default: 'vikram.advisor@modernrealestate.com' },
      avatar: {
        type: String,
        default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
    },
    googleCalendarUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly search conflicts & calendar dates
visitSchema.index({ propertyTitle: 1, visitDate: 1, timeSlot: 1 });
visitSchema.index({ customerEmail: 1 });

module.exports = mongoose.model('Visit', visitSchema);

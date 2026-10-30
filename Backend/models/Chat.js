const mongoose = require('mongoose');

const messageItemSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['customer', 'agent', 'admin', 'system'],
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

const chatSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
      default: '',
    },
    propertyTitle: {
      type: String,
      default: 'General Inquiry',
    },
    propertySlug: {
      type: String,
      default: '',
    },
    propertyImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    },
    propertyPrice: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    assignedAgent: {
      name: { type: String, default: 'Vikram Malhotra' },
      role: { type: String, default: 'Senior Property Advisor & Legal Specialist' },
      avatar: {
        type: String,
        default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      phone: { type: String, default: '+91 98200 11223' },
    },
    messages: [messageItemSchema],
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadAdminCount: {
      type: Number,
      default: 0,
    },
    unreadCustomerCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ customerEmail: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);

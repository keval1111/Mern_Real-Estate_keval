const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: () => `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    customer: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    item: {
      type: String,
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    total: {
      type: String,
      required: true,
    },
    totalNumber: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Delivered', 'Completed'],
      default: 'Processing',
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    address: {
      type: String,
      default: '742 Evergreen Terrace, Springfield',
    },
    city: {
      type: String,
      default: 'Springfield',
    },
    state: {
      type: String,
      default: 'Oregon',
    },
    pincode: {
      type: String,
      default: '97477',
    },
    country: {
      type: String,
      default: 'United States',
    },
    assignedAgent: {
      name: {
        type: String,
        default: 'Vikram Malhotra',
      },
      role: {
        type: String,
        default: 'Senior Property Advisor & Legal Officer',
      },
      phone: {
        type: String,
        default: '+91 98200 11223',
      },
      email: {
        type: String,
        default: 'vikram.advisor@modernrealestate.com',
      },
      avatar: {
        type: String,
        default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
    },
    milestoneNotes: {
      type: String,
      default: '',
    },
    tokenPaid: {
      type: String,
      default: 'Rs. 1,00,000.00',
    },
    trackingStep: {
      type: Number,
      default: 2,
    },
    trackingSteps: {
      type: Array,
      default: () => [
        { title: 'Booking Request Received', desc: 'Order details and initial token payment recorded', date: 'Completed', completed: true },
        { title: 'Document Verification', desc: 'Title deed verification, KYC and agreement drafting', date: 'In Progress', completed: true },
        { title: 'Site Inspection & Legal Clearance', desc: 'Physical appraisal & municipal approvals check', date: 'Estimated 2 Days', completed: false },
        { title: 'Handover & Ownership Transfer', desc: 'Registry signing & possession handover', date: 'Estimated 5 Days', completed: false },
      ],
    },
    propertyImage: {
      type: String,
      default: '',
    },
    paymentDetails: {
      gateway: { type: String, default: 'Razorpay' },
      razorpay_order_id: { type: String, default: '' },
      razorpay_payment_id: { type: String, default: '' },
      razorpay_signature: { type: String, default: '' },
      paidAt: { type: Date, default: Date.now },
      status: { type: String, default: 'Captured' },
    },
    allotmentReceiptId: {
      type: String,
      default: () => `RCPT-RERA-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    kycDocuments: {
      panNumber: { type: String, default: '' },
      aadhaarNumber: { type: String, default: '' },
      panCardUrl: { type: String, default: '' },
      aadhaarDocUrl: { type: String, default: '' },
      status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Verified', 'Rejected'],
        default: 'Under Review',
      },
      verifiedAt: { type: Date, default: null },
      verifiedBy: { type: String, default: '' },
      rejectionReason: { type: String, default: '' },
    },
    propertyOwner: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      role: { type: String, default: '' },
    },
    paymentSplit: {
      splitType: {
        type: String,
        enum: ['SUBADMIN_90_10', 'MAINADMIN_100', 'DIRECT'],
        default: 'DIRECT',
      },
      totalAmount: { type: Number, default: 0 },
      commissionRate: { type: Number, default: 0 },
      superAdminAmount: { type: Number, default: 0 },
      subAdminAmount: { type: Number, default: 0 },
      ownerAmount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);

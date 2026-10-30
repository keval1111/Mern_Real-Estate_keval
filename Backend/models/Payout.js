const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    payoutId: {
      type: String,
      unique: true,
      default: () => `PO-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    orderId: {
      type: String,
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    propertyTitle: {
      type: String,
      required: true,
    },
    // Owner / Creator details (Property Owner tracking)
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ownerName: {
      type: String,
      default: '',
    },
    ownerEmail: {
      type: String,
      default: '',
    },
    ownerRole: {
      type: String,
      enum: ['Super Admin', 'Main Admin', 'Admin', 'Sub-Admin', 'Staff', 'Property Editor', 'Finance Admin', 'Customer', 'User'],
      default: 'Sub-Admin',
    },
    // Sub-Admin Beneficiary (populated if property was added by a Sub-Admin)
    subAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    subAdminName: {
      type: String,
      default: '',
    },
    subAdminEmail: {
      type: String,
      default: '',
    },
    // Split Rule Type:
    // SUBADMIN_90_10: 90% to Sub-Admin, 10% to Super Admin
    // MAINADMIN_100: 100% to Main Admin, 0% platform fee
    splitType: {
      type: String,
      enum: ['SUBADMIN_90_10', 'MAINADMIN_100'],
      default: 'SUBADMIN_90_10',
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    commissionRate: {
      type: Number,
      default: 10, // 10% for Sub-Admin properties, 0% for Main Admin properties
    },
    commissionAmount: {
      type: Number,
      default: 0, // Super Admin cut (10% of Sub-Admin sales, 0 for Main Admin)
    },
    superAdminShare: {
      type: Number,
      default: 0, // Received by Super Admin (10% for Sub-Admin sales, 0 for Main Admin)
    },
    subAdminShare: {
      type: Number,
      default: 0, // Received by Sub-Admin (90% for Sub-Admin sales, 0 for Main Admin)
    },
    ownerShare: {
      type: Number,
      default: 0, // Total net amount received by owner (90% if Sub-Admin, 100% if Main Admin)
    },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
    kycStatusAtBooking: {
      type: String,
      default: 'Approved',
    },
    status: {
      type: String,
      enum: ['Eligible', 'Processing', 'Paid', 'Completed', 'On_Hold', 'Failed'],
      default: 'Eligible',
    },
    transactionReference: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      default: 'Direct Bank NEFT / RTGS',
    },
    processedBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    processedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for fast user-wise queries
payoutSchema.index({ ownerId: 1 });
payoutSchema.index({ subAdminId: 1 });
payoutSchema.index({ splitType: 1 });
payoutSchema.index({ status: 1 });

module.exports = mongoose.model('Payout', payoutSchema);

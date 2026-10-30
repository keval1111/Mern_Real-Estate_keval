const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    panOrTaxId: {
      type: String,
      default: '',
    },
    aadhaarNumber: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['Super Admin', 'Main Admin', 'Admin', 'Sub-Admin', 'Staff', 'Property Editor', 'Finance Admin', 'Customer', 'User'],
      default: 'Customer',
    },
    permissions: {
      type: String,
      default: 'Customer Portal',
    },
    accessPermissions: {
      canViewAllProperties: { type: Boolean, default: false },
      canManageAllProperties: { type: Boolean, default: false },
      canViewAllOrders: { type: Boolean, default: false },
      canViewAllReviews: { type: Boolean, default: false },
      canAccessMarketing: { type: Boolean, default: false },
      canAccessCustomers: { type: Boolean, default: false },
      canAccessAnalytics: { type: Boolean, default: false },
      canAccessReports: { type: Boolean, default: false },
      canAccessCoupons: { type: Boolean, default: false },
    },
    kycStatus: {
      type: String,
      enum: ['Not_Submitted', 'Pending', 'Approved', 'Rejected'],
      default: 'Not_Submitted',
    },
    kycDetails: {
      fullName: { type: String, default: '' },
      dob: { type: String, default: '' },
      phone: { type: String, default: '' },
      residentialAddress: { type: String, default: '' },
      documentType: { type: String, default: 'Aadhaar' },
      documentNumber: { type: String, default: '' },
      documentFileUrl: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      upiId: { type: String, default: '' },
      cancelledChequeUrl: { type: String, default: '' },
      submittedAt: { type: Date },
      rejectionReason: { type: String, default: '' },
      approvedAt: { type: Date },
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    addresses: [
      {
        id: { type: String, default: () => `addr-${Date.now()}` },
        isDefault: { type: Boolean, default: false },
        type: { type: String, default: 'Primary Residence' },
        fullName: { type: String, default: '' },
        phone: { type: String, default: '' },
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        country: { type: String, default: 'United States' },
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

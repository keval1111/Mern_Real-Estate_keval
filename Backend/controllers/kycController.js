const User = require('../models/User');
const Notification = require('../models/Notification');

exports.submitKyc = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      fullName,
      dob,
      phone,
      residentialAddress,
      documentType,
      documentNumber,
      documentFileUrl,
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      upiId,
      cancelledChequeUrl,
    } = req.body;

    // Validation
    if (!fullName || !phone || !residentialAddress) {
      return res.status(400).json({
        success: false,
        message: 'Personal details (Full Name, Phone, and Residential Address) are required.',
      });
    }

    if (!documentType || !documentNumber) {
      return res.status(400).json({
        success: false,
        message: 'Identity verification details (Document Type and Document Number) are required.',
      });
    }

    if (!bankName || !accountHolderName || !accountNumber || !ifscCode) {
      return res.status(400).json({
        success: false,
        message: 'Bank account details (Bank Name, Holder Name, Account Number, and IFSC Code) are required for payment processing.',
      });
    }

    // Save KYC details
    user.kycStatus = 'Pending';
    user.kycDetails = {
      fullName: fullName.trim(),
      dob: dob || '',
      phone: phone.trim(),
      residentialAddress: residentialAddress.trim(),
      documentType: documentType || 'Aadhaar',
      documentNumber: documentNumber.trim(),
      documentFileUrl: documentFileUrl || '',
      bankName: bankName.trim(),
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      upiId: upiId ? upiId.trim() : '',
      cancelledChequeUrl: cancelledChequeUrl || '',
      submittedAt: new Date(),
      rejectionReason: '',
    };

    // If phone is missing on user, sync it
    if (!user.phone && phone) {
      user.phone = phone.trim();
    }

    await user.save();

    // Create Notification for Super Admin
    try {
      const notif = await Notification.create({
        recipientRole: 'Super Admin',
        senderId: user._id,
        senderName: user.name,
        type: 'kyc_submission',
        title: 'New Sub-Admin KYC Verification Request',
        message: `Sub-Admin ${user.name} (${user.email}) has submitted KYC verification & bank payout details.`,
        link: '/sub-admins',
        data: {
          userId: user._id,
          name: user.name,
          email: user.email,
          documentType: user.kycDetails.documentType,
          bankName: user.kycDetails.bankName,
          submittedAt: user.kycDetails.submittedAt,
        },
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('new_notification', notif);
        io.emit('new_kyc_request', {
          userId: user._id,
          name: user.name,
          email: user.email,
          kycStatus: 'Pending',
        });
      }
    } catch (notifErr) {
      console.warn('Failed to emit or save notification for KYC submission:', notifErr.message);
    }

    res.json({
      success: true,
      message: 'KYC verification request submitted successfully. Super Admin has been notified for review.',
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
        kycDetails: user.kycDetails,
      },
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyKyc = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('kycStatus kycDetails role email name');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        kycStatus: user.kycStatus || 'Not_Submitted',
        kycDetails: user.kycDetails || {},
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllKycRequests = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ['Sub-Admin', 'Staff', 'Property Editor'] },
    }).select('-password').sort({ 'kycDetails.submittedAt': -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reviewKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Approved" or "Rejected"',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Sub-Admin user not found' });
    }

    user.kycStatus = status;
    if (status === 'Approved') {
      user.kycDetails.approvedAt = new Date();
      user.kycDetails.rejectionReason = '';
    } else {
      user.kycDetails.rejectionReason = reason || 'Verification documents could not be verified.';
    }

    await user.save();

    // Send notification to Sub-Admin
    try {
      const notif = await Notification.create({
        recipientRole: user.role,
        recipientId: user._id,
        senderId: req.user._id,
        senderName: req.user.name || 'Super Admin',
        type: status === 'Approved' ? 'kyc_approved' : 'kyc_rejected',
        title: status === 'Approved' ? '✅ KYC Verification Approved!' : '⚠️ KYC Verification Rejected',
        message:
          status === 'Approved'
            ? 'Your KYC documents & bank payout account have been verified. You can now add and publish properties.'
            : `Your KYC submission was rejected: ${user.kycDetails.rejectionReason}. Please re-submit your details.`,
        link: status === 'Approved' ? '/add-property' : '/kyc-verification',
        data: { status, reason: user.kycDetails.rejectionReason },
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('new_notification', notif);
        io.emit('kyc_status_updated', {
          userId: user._id,
          kycStatus: status,
          reason: user.kycDetails.rejectionReason,
        });
      }
    } catch (notifErr) {
      console.warn('Failed to notify Sub-Admin of KYC review decision:', notifErr.message);
    }

    res.json({
      success: true,
      message: `KYC status updated to ${status}`,
      data: {
        userId: user._id,
        kycStatus: user.kycStatus,
        kycDetails: user.kycDetails,
      },
    });
  } catch (error) {
    console.error('Error reviewing KYC:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetDemoKyc = async (req, res) => {
  try {
    let user = await User.findOne({ email: 'subadmin.pending@realestate.com' });
    const kycData = {
      fullName: 'Rohit Sharma',
      dob: '1992-05-15',
      phone: '+91 98765 43210',
      residentialAddress: 'B-402, Royal Palms, Goregaon East, Mumbai - 400063',
      documentType: 'Aadhaar Card',
      documentNumber: '8876 5432 1098',
      documentFileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      bankName: 'HDFC Bank',
      accountHolderName: 'Rohit Sharma',
      accountNumber: '501004329871',
      ifscCode: 'HDFC0001234',
      upiId: 'rohitsharma@okhdfcbank',
      cancelledChequeUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      submittedAt: new Date(),
      rejectionReason: '',
    };

    if (!user) {
      user = new User({
        name: 'Rohit Sharma (Sub-Admin)',
        email: 'subadmin.pending@realestate.com',
        password: 'admin123',
        phone: '+91 98765 43210',
        role: 'Sub-Admin',
        permissions: 'Manage Listings, Uploads & Categories',
        kycStatus: 'Pending',
        kycDetails: kycData,
        status: 'Active',
      });
      await user.save();
    } else {
      user.kycStatus = 'Pending';
      user.kycDetails = kycData;
      await user.save();
    }

    // Refresh notification
    await Notification.deleteMany({ 'data.email': 'subadmin.pending@realestate.com' });
    await Notification.create({
      recipientRole: 'Super Admin',
      senderId: user._id,
      senderName: user.name,
      type: 'kyc_submission',
      title: 'New KYC Request: Rohit Sharma',
      message: 'Sub-Admin Rohit Sharma submitted Aadhaar Card & HDFC Bank account details for KYC verification.',
      link: '/sub-admins',
      data: {
        userId: user._id,
        email: user.email,
        kycStatus: 'Pending',
        submittedAt: new Date(),
      },
      isRead: false,
    });

    res.json({
      success: true,
      message: 'Sub-Admin Rohit Sharma has been reset to Pending KYC.',
      data: user,
    });
  } catch (error) {
    console.error('Error resetting demo KYC:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


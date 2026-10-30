const Payout = require('../models/Payout');
const User = require('../models/User');
const Property = require('../models/Property');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const {
  getUserPaymentStats,
  syncHistoricalSales,
  calculateSplit,
} = require('../services/paymentTrackingService');

exports.getPayouts = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?._id;

    // Run historical sync once if payouts collection has fewer records than orders
    const orderCount = await Order.countDocuments();
    const payoutCount = await Payout.countDocuments();
    if (orderCount > payoutCount || payoutCount === 0) {
      await syncHistoricalSales();
    }

    const conditions = [];

    // Strict RBAC: Sub-Admins can ONLY view their own payouts
    if (userRole === 'Sub-Admin') {
      const matchCriteria = [];
      if (userId) {
        matchCriteria.push({ subAdminId: userId });
        matchCriteria.push({ ownerId: userId });
      }
      if (req.user?.email) {
        const emailRegex = { $regex: new RegExp(`^${req.user.email.trim()}$`, 'i') };
        matchCriteria.push({ subAdminEmail: emailRegex });
        matchCriteria.push({ ownerEmail: emailRegex });
      }
      conditions.push({ $or: matchCriteria });
    } else if (
      userRole !== 'Super Admin' &&
      userRole !== 'Main Admin' &&
      userRole !== 'Admin' &&
      !req.user?.accessPermissions?.canViewAllOrders
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only Administrators and authorized Sub-Admins can access payment tracking records.',
      });
    }

    // Optional filters
    if (req.query.status && req.query.status !== 'All') {
      conditions.push({ status: req.query.status });
    }
    if (req.query.splitType && req.query.splitType !== 'All') {
      conditions.push({ splitType: req.query.splitType });
    }
    if (req.query.ownerId) {
      conditions.push({
        $or: [{ ownerId: req.query.ownerId }, { subAdminId: req.query.ownerId }],
      });
    }
    if (req.query.search) {
      const q = req.query.search.trim();
      conditions.push({
        $or: [
          { propertyTitle: { $regex: q, $options: 'i' } },
          { ownerName: { $regex: q, $options: 'i' } },
          { ownerEmail: { $regex: q, $options: 'i' } },
          { subAdminName: { $regex: q, $options: 'i' } },
          { subAdminEmail: { $regex: q, $options: 'i' } },
          { payoutId: { $regex: q, $options: 'i' } },
          { orderId: { $regex: q, $options: 'i' } },
          { transactionReference: { $regex: q, $options: 'i' } },
        ],
      });
    }

    const finalQuery = conditions.length > 0 ? { $and: conditions } : {};
    const payouts = await Payout.find(finalQuery).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payouts.length,
      data: payouts,
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ success: false, message: 'Server error fetching payouts', error: error.message });
  }
};

exports.getPayoutSummary = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?._id;

    const query = {};
    if (userRole === 'Sub-Admin') {
      const matchCriteria = [];
      if (userId) {
        matchCriteria.push({ subAdminId: userId });
        matchCriteria.push({ ownerId: userId });
      }
      if (req.user?.email) {
        const emailRegex = { $regex: new RegExp(`^${req.user.email.trim()}$`, 'i') };
        matchCriteria.push({ subAdminEmail: emailRegex });
        matchCriteria.push({ ownerEmail: emailRegex });
      }
      query.$or = matchCriteria;
    }

    const payouts = await Payout.find(query);

    const totalSalesVolume = payouts.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    // Platform fee (10% on Sub-Admin properties)
    const totalPlatformCommission = payouts
      .filter((p) => p.splitType === 'SUBADMIN_90_10' || p.ownerRole === 'Sub-Admin')
      .reduce((sum, p) => sum + (p.commissionAmount || p.superAdminShare || 0), 0);

    // Sub-Admin share (90% on Sub-Admin properties)
    const totalSubAdminShare = payouts
      .filter((p) => p.splitType === 'SUBADMIN_90_10' || p.ownerRole === 'Sub-Admin')
      .reduce((sum, p) => sum + (p.subAdminShare || p.ownerShare || 0), 0);

    // Main Admin direct share (100% on Main Admin properties)
    const totalMainAdminDirectShare = payouts
      .filter((p) => p.splitType === 'MAINADMIN_100' || p.ownerRole !== 'Sub-Admin')
      .reduce((sum, p) => sum + (p.ownerShare || p.totalAmount || 0), 0);

    // Total Super Admin Revenue = 100% Main Admin direct sales + 10% from all Sub-Admin sales
    const totalSuperAdminRevenue = totalMainAdminDirectShare + totalPlatformCommission;

    const totalPaidAmount = payouts
      .filter((p) => p.status === 'Paid' || p.status === 'Completed')
      .reduce((sum, p) => sum + (p.ownerShare || p.subAdminShare || p.totalAmount || 0), 0);

    const totalPendingAmount = payouts
      .filter((p) => p.status === 'Eligible' || p.status === 'Processing')
      .reduce((sum, p) => sum + (p.ownerShare || p.subAdminShare || 0), 0);

    const paidCount = payouts.filter((p) => p.status === 'Paid' || p.status === 'Completed').length;
    const pendingCount = payouts.filter((p) => p.status === 'Eligible' || p.status === 'Processing').length;

    const subAdminPayoutsCount = payouts.filter(
      (p) => p.splitType === 'SUBADMIN_90_10' || p.ownerRole === 'Sub-Admin'
    ).length;
    const mainAdminPayoutsCount = payouts.filter(
      (p) => p.splitType === 'MAINADMIN_100' || p.ownerRole !== 'Sub-Admin'
    ).length;

    res.json({
      success: true,
      data: {
        totalSalesVolume,
        totalPlatformCommission, // 10% Super Admin cut from Sub-Admin
        totalSubAdminShare, // 90% received by Sub-Admins
        totalMainAdminDirectShare, // 100% received by Main Admin
        totalSuperAdminRevenue, // 100% direct + 10% commission
        totalPaidAmount,
        totalPendingAmount,
        totalPayoutsCount: payouts.length,
        subAdminPayoutsCount,
        mainAdminPayoutsCount,
        paidCount,
        pendingCount,
      },
    });
  } catch (error) {
    console.error('Error fetching payout summary:', error);
    res.status(500).json({ success: false, message: 'Server error fetching payout summary', error: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const stats = await getUserPaymentStats({ requestingUser: req.user });
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user payment stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching user payment stats', error: error.message });
  }
};

exports.getUserTrackingDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findById(userId).select('-password');
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // RBAC: Sub-Admin can only view their own stats
    if (req.user?.role === 'Sub-Admin' && String(req.user._id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Access Denied to this user account record' });
    }

    const isSubAdmin = targetUser.role === 'Sub-Admin';

    // Fetch user properties
    const properties = await Property.find({ createdBy: targetUser._id });
    const propertiesListedCount = properties.length;
    const propertiesSoldCount = properties.filter((p) => p.status === 'Sold').length;

    // Fetch user payouts/transactions
    const payouts = await Payout.find({
      $or: [
        { ownerId: targetUser._id },
        { subAdminId: targetUser._id },
        { ownerEmail: targetUser.email },
      ],
    }).sort({ createdAt: -1 });

    const transactionsCount = payouts.length;
    const grossSalesVolume = payouts.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    let netRevenueEarned = 0;
    let commissionCut = 0;
    let directSalesRevenue = 0;
    let commissionFromSubAdmins = 0;

    if (isSubAdmin) {
      commissionCut = Math.round((grossSalesVolume * 10) / 100);
      netRevenueEarned = payouts.reduce((sum, p) => sum + (p.subAdminShare || p.ownerShare || 0), 0);
      if (netRevenueEarned === 0 && grossSalesVolume > 0) {
        netRevenueEarned = grossSalesVolume - commissionCut;
      }
    } else {
      directSalesRevenue = grossSalesVolume;
      const allSubAdminPayouts = await Payout.find({
        $or: [{ splitType: 'SUBADMIN_90_10' }, { ownerRole: 'Sub-Admin' }],
      });
      commissionFromSubAdmins = allSubAdminPayouts.reduce(
        (sum, p) => sum + (p.commissionAmount || p.superAdminShare || 0),
        0
      );
      netRevenueEarned = directSalesRevenue + commissionFromSubAdmins;
    }

    const paidAmount = payouts
      .filter((p) => p.status === 'Paid' || p.status === 'Completed')
      .reduce((sum, p) => sum + (p.ownerShare || p.subAdminShare || p.totalAmount || 0), 0);

    const pendingAmount = payouts
      .filter((p) => p.status === 'Eligible' || p.status === 'Processing')
      .reduce((sum, p) => sum + (p.ownerShare || p.subAdminShare || 0), 0);

    res.json({
      success: true,
      data: {
        user: targetUser,
        metrics: {
          propertiesListedCount,
          propertiesSoldCount,
          transactionsCount,
          grossSalesVolume,
          splitRule: isSubAdmin ? '90% Sub-Admin / 10% Super Admin' : '100% Main Admin Direct Sale',
          sharePercentage: isSubAdmin ? 90 : 100,
          platformFeePercentage: isSubAdmin ? 10 : 0,
          directSalesRevenue,
          commissionFromSubAdmins,
          commissionDeducted: commissionCut,
          netRevenueEarned,
          paidAmount,
          pendingAmount,
        },
        transactions: payouts,
      },
    });
  } catch (error) {
    console.error('Error fetching user tracking details:', error);
    res.status(500).json({ success: false, message: 'Error fetching user tracking details', error: error.message });
  }
};

exports.processPayout = async (req, res) => {
  try {
    // RBAC: Only Super Admin or Main Admin can authorize disbursement
    const isAuthorizedAdmin =
      req.user?.role === 'Super Admin' || req.user?.role === 'Main Admin' || req.user?.role === 'Admin';

    if (!isAuthorizedAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only Super Admin or Main Admin has permission to authorize and disburse Sub-Admin payouts.',
      });
    }

    const { id } = req.params;
    const { transactionReference, paymentMethod, notes } = req.body;

    const payout = await Payout.findById(id);
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout record not found' });
    }

    if (payout.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'This payout has already been processed and paid.' });
    }

    // Verify Beneficiary KYC Status
    const beneficiaryId = payout.subAdminId || payout.ownerId;
    const subAdmin = beneficiaryId ? await User.findById(beneficiaryId) : null;

    if (subAdmin && subAdmin.role === 'Sub-Admin') {
      if (subAdmin.kycStatus !== 'Approved') {
        return res.status(400).json({
          success: false,
          code: 'KYC_NOT_APPROVED',
          message: `Cannot process payout: Sub-Admin "${subAdmin.name}" has KYC status "${subAdmin.kycStatus || 'Not Submitted'}". Sub-Admin KYC must be Approved before payment release.`,
        });
      }

      // Verify Bank Details
      const bank = subAdmin.kycDetails;
      if (!bank?.accountNumber || !bank?.ifscCode) {
        return res.status(400).json({
          success: false,
          code: 'MISSING_BANK_DETAILS',
          message: `Cannot process payout: Sub-Admin "${subAdmin.name}" does not have verified bank account details on file.`,
        });
      }

      payout.bankDetails = {
        bankName: bank.bankName || 'HDFC Bank',
        accountHolderName: bank.accountHolderName || subAdmin.name,
        accountNumber: bank.accountNumber,
        ifscCode: bank.ifscCode,
        upiId: bank.upiId || '',
      };
    }

    // Update Payout Record
    payout.status = 'Paid';
    payout.transactionReference =
      transactionReference || `UTR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    payout.paymentMethod = paymentMethod || 'Direct Bank NEFT / RTGS';
    payout.notes = notes || 'Payout share processed and transferred to verified KYC bank account.';
    payout.processedAt = new Date();
    payout.processedBy = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    };

    await payout.save();

    // Create Notification for Sub-Admin
    if (subAdmin && subAdmin.role === 'Sub-Admin') {
      try {
        const notif = await Notification.create({
          recipientRole: 'Sub-Admin',
          recipientId: subAdmin._id,
          senderId: req.user._id,
          senderName: req.user.name || 'Super Admin',
          type: 'payout_processed',
          title: '💰 Payout Share Disbursed (90%)!',
          message: `Payment share of 90% (Rs. ${payout.subAdminShare.toLocaleString('en-IN')}) for property "${payout.propertyTitle}" has been transferred to your ${payout.bankDetails.bankName} account (Ref: ${payout.transactionReference}).`,
          link: '/payouts',
          data: {
            payoutId: payout.payoutId,
            amount: payout.subAdminShare,
            transactionRef: payout.transactionReference,
          },
        });

        const io = req.app.get('io');
        if (io) {
          io.emit('new_notification', notif);
          io.emit('payout_status_updated', {
            payoutId: payout.payoutId,
            subAdminId: subAdmin._id,
            status: 'Paid',
            transactionRef: payout.transactionReference,
          });
        }
      } catch (notifErr) {
        console.warn('Notification warning on payout process:', notifErr.message);
      }
    }

    res.json({
      success: true,
      message: `Payout of Rs. ${(payout.subAdminShare || payout.ownerShare).toLocaleString('en-IN')} successfully processed to ${payout.bankDetails?.bankName || 'bank account'} (${payout.transactionReference})!`,
      data: payout,
    });
  } catch (error) {
    console.error('Error processing payout:', error);
    res.status(500).json({ success: false, message: 'Server error processing payout', error: error.message });
  }
};

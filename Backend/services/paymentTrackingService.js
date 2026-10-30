const Order = require('../models/Order');
const Property = require('../models/Property');
const User = require('../models/User');
const Payout = require('../models/Payout');
const Notification = require('../models/Notification');

function calculateSplit({ totalAmount, ownerRole }) {
  const numericAmount = Math.max(0, parseFloat(String(totalAmount).replace(/[^0-9.]/g, '')) || 0);

  const isSubAdmin = ownerRole === 'Sub-Admin';

  if (isSubAdmin) {
    const commissionRate = 10; // 10% to Super Admin
    const superAdminAmount = Math.round((numericAmount * commissionRate) / 100);
    const subAdminAmount = numericAmount - superAdminAmount; // 90% to Sub-Admin

    return {
      splitType: 'SUBADMIN_90_10',
      totalAmount: numericAmount,
      commissionRate,
      superAdminAmount,
      subAdminAmount,
      ownerAmount: subAdminAmount,
      ruleDescription: '90% Sub-Admin / 10% Super Admin',
    };
  }

  // Main Admin, Super Admin, or direct platform listing: 100% to Main Admin
  return {
    splitType: 'MAINADMIN_100',
    totalAmount: numericAmount,
    commissionRate: 0,
    superAdminAmount: 0,
    subAdminAmount: 0,
    ownerAmount: numericAmount, // 100% to Main Admin
    ruleDescription: '100% Main Admin Direct Sale',
  };
}

/**
 * Record or update payment tracking record when a property is sold / booked
 */
async function recordPropertySale({ order, property, io }) {
  try {
    if (!order) return null;

    // 1. Locate Property if not passed directly
    let targetProperty = property;
    if (!targetProperty && order.propertyId) {
      if (typeof order.propertyId === 'string' && order.propertyId.match(/^[0-9a-fA-F]{24}$/)) {
        targetProperty = await Property.findById(order.propertyId);
      }
      if (!targetProperty) {
        targetProperty = await Property.findOne({ slug: String(order.propertyId).toLowerCase() });
      }
    }

    if (!targetProperty && order.item) {
      const itemClean = String(order.item).split('+')[0].trim();
      targetProperty = await Property.findOne({
        $or: [
          { title: new RegExp(`^${itemClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          { slug: itemClean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
        ],
      });
    }

    // 2. Identify Property Owner / Creator
    let owner = null;
    let mainAdminUser = await User.findOne({ role: { $in: ['Super Admin', 'Main Admin'] } });

    if (targetProperty && targetProperty.createdBy) {
      owner = await User.findById(targetProperty.createdBy);
    }

    if (!owner && targetProperty && targetProperty.creatorRole === 'Sub-Admin') {
      owner = await User.findOne({
        $or: [
          { email: targetProperty.createdByEmail },
          { name: targetProperty.createdByName },
          { role: 'Sub-Admin' },
        ],
      });
    }

    // Fallback: If no owner specified, it belongs directly to Main Admin
    if (!owner) {
      owner = mainAdminUser || {
        _id: null,
        name: targetProperty?.createdByName || 'Main Admin',
        email: targetProperty?.createdByEmail || 'admin@realestate.com',
        role: targetProperty?.creatorRole || 'Main Admin',
      };
    }

    const ownerRole = owner?.role || targetProperty?.creatorRole || 'Main Admin';
    const isSubAdmin = ownerRole === 'Sub-Admin';

    // 3. Determine Total Sale Amount
    let totalVal = order.totalNumber;
    if (!totalVal || totalVal < 100) {
      const fromTotal = parseFloat(String(order.total || '').replace(/[^0-9.]/g, ''));
      const fromProp = targetProperty ? targetProperty.priceNumber : 0;
      totalVal = fromTotal && fromTotal >= 100 ? fromTotal : (fromProp || 100000);
    }

    // 4. Calculate 90/10 Sub-Admin vs 100% Main Admin split
    const split = calculateSplit({ totalAmount: totalVal, ownerRole });

    // 5. Update Order with self-contained property owner & split details
    order.propertyOwner = {
      id: owner?._id || null,
      name: owner?.name || 'Main Admin',
      email: owner?.email || '',
      role: ownerRole,
    };
    order.paymentSplit = {
      splitType: split.splitType,
      totalAmount: split.totalAmount,
      commissionRate: split.commissionRate,
      superAdminAmount: split.superAdminAmount,
      subAdminAmount: split.subAdminAmount,
      ownerAmount: split.ownerAmount,
    };
    await order.save();

    // 6. Find existing Payout record for this orderId or create new
    let payout = await Payout.findOne({ orderId: order.orderId });

    const bankSnapshot = {
      bankName: owner?.kycDetails?.bankName || (isSubAdmin ? 'HDFC Bank' : 'Primary Operating Bank'),
      accountHolderName: owner?.kycDetails?.accountHolderName || owner?.name || 'Beneficiary',
      accountNumber: owner?.kycDetails?.accountNumber || (isSubAdmin ? '501004329871' : '100200300400'),
      ifscCode: owner?.kycDetails?.ifscCode || (isSubAdmin ? 'HDFC0001234' : 'SBIN0001234'),
      upiId: owner?.kycDetails?.upiId || '',
    };

    const payoutData = {
      orderId: order.orderId,
      propertyId: targetProperty ? targetProperty._id : order.propertyId || null,
      propertyTitle: targetProperty ? targetProperty.title : order.item || 'Luxury Property',
      ownerId: owner?._id || null,
      ownerName: owner?.name || 'Main Admin',
      ownerEmail: owner?.email || '',
      ownerRole,
      subAdminId: isSubAdmin ? owner?._id : null,
      subAdminName: isSubAdmin ? owner?.name : 'N/A (Main Admin Direct)',
      subAdminEmail: isSubAdmin ? owner?.email : '',
      splitType: split.splitType,
      totalAmount: split.totalAmount,
      commissionRate: split.commissionRate,
      commissionAmount: split.superAdminAmount,
      superAdminShare: split.superAdminAmount,
      subAdminShare: split.subAdminAmount,
      ownerShare: split.ownerAmount,
      bankDetails: bankSnapshot,
      kycStatusAtBooking: owner?.kycStatus || 'Approved',
      // If already Paid keep Paid, else Sub-Admin is Eligible, Main Admin is Completed
      status: payout?.status === 'Paid' ? 'Paid' : isSubAdmin ? 'Eligible' : 'Completed',
      notes: isSubAdmin
        ? `Sub-Admin property sold: 90% (Rs. ${split.subAdminAmount.toLocaleString('en-IN')}) received by Sub-Admin "${owner?.name}", 10% (Rs. ${split.superAdminAmount.toLocaleString('en-IN')}) platform fee received by Super Admin.`
        : `Main Admin direct sale: 100% (Rs. ${split.ownerAmount.toLocaleString('en-IN')}) received directly by Main Admin "${owner?.name}".`,
    };

    if (payout) {
      Object.assign(payout, payoutData);
      await payout.save();
    } else {
      payout = await Payout.create(payoutData);
    }

    // 7. Emit Real-time Socket Event
    if (io) {
      io.emit('payment_tracking_updated', {
        payoutId: payout.payoutId,
        orderId: order.orderId,
        ownerId: owner?._id,
        ownerName: owner?.name,
        ownerRole,
        splitType: split.splitType,
        totalAmount: split.totalAmount,
        ownerShare: split.ownerAmount,
        superAdminShare: split.superAdminAmount,
        subAdminShare: split.subAdminAmount,
        status: payout.status,
      });
    }

    return payout;
  } catch (err) {
    console.error('Error in recordPropertySale:', err);
    return null;
  }
}

async function syncHistoricalSales() {
  try {
    const orders = await Order.find({});
    let mainAdminUser = await User.findOne({ role: { $in: ['Super Admin', 'Main Admin'] } });

    for (const order of orders) {
      // Find property
      let prop = null;
      if (order.propertyId) {
        if (typeof order.propertyId === 'string' && order.propertyId.match(/^[0-9a-fA-F]{24}$/)) {
          prop = await Property.findById(order.propertyId);
        }
        if (!prop) {
          prop = await Property.findOne({ slug: String(order.propertyId).toLowerCase() });
        }
      }
      if (!prop && order.item) {
        const itemClean = String(order.item).split('+')[0].trim();
        prop = await Property.findOne({
          $or: [
            { title: new RegExp(`^${itemClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            { slug: itemClean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
          ],
        });
      }

      let owner = null;
      if (prop && prop.createdBy) {
        owner = await User.findById(prop.createdBy);
      }
      if (!owner && prop && prop.creatorRole === 'Sub-Admin') {
        owner = await User.findOne({
          $or: [
            { email: prop.createdByEmail },
            { name: prop.createdByName },
            { role: 'Sub-Admin' },
          ],
        });
      }
      if (!owner) {
        owner = mainAdminUser;
      }

      const ownerRole = owner?.role || prop?.creatorRole || 'Main Admin';
      const isSubAdmin = ownerRole === 'Sub-Admin';

      let totalVal = order.totalNumber;
      if (!totalVal || totalVal < 100) {
        const fromTotal = parseFloat(String(order.total || '').replace(/[^0-9.]/g, ''));
        const fromProp = prop ? prop.priceNumber : 0;
        totalVal = fromTotal && fromTotal >= 100 ? fromTotal : (fromProp || 100000);
      }

      const split = calculateSplit({ totalAmount: totalVal, ownerRole });

      // Update Order
      order.propertyOwner = {
        id: owner?._id || null,
        name: owner?.name || 'Main Admin',
        email: owner?.email || '',
        role: ownerRole,
      };
      order.paymentSplit = {
        splitType: split.splitType,
        totalAmount: split.totalAmount,
        commissionRate: split.commissionRate,
        superAdminAmount: split.superAdminAmount,
        subAdminAmount: split.subAdminAmount,
        ownerAmount: split.ownerAmount,
      };
      await order.save();

      // Check Payout
      let payout = await Payout.findOne({ orderId: order.orderId });
      const payoutData = {
        orderId: order.orderId,
        propertyId: prop ? prop._id : order.propertyId || null,
        propertyTitle: prop ? prop.title : order.item || 'Luxury Property',
        ownerId: owner?._id || null,
        ownerName: owner?.name || 'Main Admin',
        ownerEmail: owner?.email || '',
        ownerRole,
        subAdminId: isSubAdmin ? owner?._id : null,
        subAdminName: isSubAdmin ? owner?.name : 'N/A (Main Admin Direct)',
        subAdminEmail: isSubAdmin ? owner?.email : '',
        splitType: split.splitType,
        totalAmount: split.totalAmount,
        commissionRate: split.commissionRate,
        commissionAmount: split.superAdminAmount,
        superAdminShare: split.superAdminAmount,
        subAdminShare: split.subAdminAmount,
        ownerShare: split.ownerAmount,
        status: payout ? payout.status : isSubAdmin ? 'Eligible' : 'Completed',
        bankDetails: {
          bankName: owner?.kycDetails?.bankName || (isSubAdmin ? 'HDFC Bank' : 'Primary Operating Bank'),
          accountHolderName: owner?.kycDetails?.accountHolderName || owner?.name || 'Beneficiary',
          accountNumber: owner?.kycDetails?.accountNumber || (isSubAdmin ? '501004329871' : '100200300400'),
          ifscCode: owner?.kycDetails?.ifscCode || (isSubAdmin ? 'HDFC0001234' : 'SBIN0001234'),
          upiId: owner?.kycDetails?.upiId || '',
        },
        kycStatusAtBooking: owner?.kycStatus || 'Approved',
        notes: isSubAdmin
          ? `Sub-Admin property sale: 90% (Rs. ${split.subAdminAmount.toLocaleString('en-IN')}) received by Sub-Admin "${owner?.name}", 10% (Rs. ${split.superAdminAmount.toLocaleString('en-IN')}) platform fee received by Super Admin.`
          : `Main Admin direct sale: 100% (Rs. ${split.ownerAmount.toLocaleString('en-IN')}) received directly by Main Admin "${owner?.name}".`,
      };

      if (payout) {
        // Upgrade legacy 5% commission records to accurate 10%/90% and ensure correct owner
        payout.ownerId = payoutData.ownerId;
        payout.ownerName = payoutData.ownerName;
        payout.ownerEmail = payoutData.ownerEmail;
        payout.ownerRole = payoutData.ownerRole;
        payout.splitType = payoutData.splitType;
        payout.totalAmount = payoutData.totalAmount;
        payout.commissionRate = payoutData.commissionRate;
        payout.commissionAmount = payoutData.commissionAmount;
        payout.superAdminShare = payoutData.superAdminShare;
        payout.subAdminShare = payoutData.subAdminShare;
        payout.ownerShare = payoutData.ownerShare;
        if (!payout.bankDetails?.bankName) payout.bankDetails = payoutData.bankDetails;
        await payout.save();
      } else {
        await Payout.create(payoutData);
      }
    }
    console.log('✅ Historical sales synced with 90/10 Sub-Admin and 100% Main Admin rules.');
  } catch (err) {
    console.warn('⚠️ Historical sales sync warning:', err.message);
  }
}

async function getUserPaymentStats({ requestingUser }) {
  // Sync historical sales first to ensure pristine numbers
  await syncHistoricalSales();

  const isSuperOrMain =
    !requestingUser ||
    requestingUser.role === 'Super Admin' ||
    requestingUser.role === 'Main Admin' ||
    requestingUser.role === 'Admin';

  // Get all users with relevant administrative roles
  const users = await User.find({
    role: { $in: ['Super Admin', 'Main Admin', 'Admin', 'Sub-Admin'] },
  }).select('_id name email role phone avatar kycStatus kycDetails createdAt');

  // Load all payouts and properties
  const allPayouts = await Payout.find({});
  const allProperties = await Property.find({});

  // Compute total 10% commissions earned by Super Admin from all Sub-Admin sales
  const subAdminPayouts = allPayouts.filter(
    (p) => p.splitType === 'SUBADMIN_90_10' || p.ownerRole === 'Sub-Admin'
  );
  const totalSubAdminCommissionsToSuperAdmin = subAdminPayouts.reduce(
    (sum, p) => sum + (p.commissionAmount || p.superAdminShare || 0),
    0
  );

  const userStats = [];

  for (const u of users) {
    // If requesting user is Sub-Admin, only include their own data unless authorized
    if (!isSuperOrMain && String(u._id) !== String(requestingUser._id)) {
      continue;
    }

    const isSubAdmin = u.role === 'Sub-Admin';
    const isMainOrSuper = u.role === 'Super Admin' || u.role === 'Main Admin' || u.role === 'Admin';

    // User's properties
    const userProperties = allProperties.filter(
      (p) => p.createdBy && String(p.createdBy) === String(u._id)
    );
    const propertiesListedCount = userProperties.length;
    const propertiesSoldCount = userProperties.filter((p) => p.status === 'Sold').length;

    // User's transactions / payouts
    const userPayouts = allPayouts.filter((p) => {
      if (p.ownerId && String(p.ownerId) === String(u._id)) return true;
      if (isSubAdmin && p.subAdminId && String(p.subAdminId) === String(u._id)) return true;
      if (p.ownerEmail && p.ownerEmail.toLowerCase() === u.email.toLowerCase()) return true;
      return false;
    });

    const transactionsCount = userPayouts.length;
    const grossSalesVolume = userPayouts.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    let netRevenueEarned = 0;
    let commissionCut = 0;
    let directSalesRevenue = 0;
    let commissionFromSubAdmins = 0;

    if (isSubAdmin) {
      // 90% to Sub-Admin, 10% deducted as Super Admin fee
      commissionCut = Math.round((grossSalesVolume * 10) / 100);
      netRevenueEarned = userPayouts.reduce((sum, p) => sum + (p.subAdminShare || p.ownerShare || 0), 0);
      if (netRevenueEarned === 0 && grossSalesVolume > 0) {
        netRevenueEarned = grossSalesVolume - commissionCut;
      }
    } else {
      // 100% of direct property sales to Main Admin
      directSalesRevenue = grossSalesVolume;
      // Main/Super Admin also earns 10% platform commission from all Sub-Admin property sales!
      commissionFromSubAdmins = totalSubAdminCommissionsToSuperAdmin;
      netRevenueEarned = directSalesRevenue + commissionFromSubAdmins;
    }

    const paidAmount = userPayouts
      .filter((p) => p.status === 'Paid' || p.status === 'Completed')
      .reduce((sum, p) => sum + (p.ownerShare || p.subAdminShare || p.totalAmount || 0), 0);

    const pendingAmount = userPayouts
      .filter((p) => p.status === 'Eligible' || p.status === 'Processing')
      .reduce((sum, p) => sum + (p.ownerShare || p.subAdminShare || 0), 0);

    const paidCount = userPayouts.filter((p) => p.status === 'Paid' || p.status === 'Completed').length;
    const pendingCount = userPayouts.filter((p) => p.status === 'Eligible' || p.status === 'Processing').length;

    userStats.push({
      userId: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone || '',
      avatar: u.avatar || '',
      kycStatus: u.kycStatus || 'Not_Submitted',
      bankDetails: u.kycDetails || {},
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
      paidCount,
      pendingCount,
      recentTransactions: userPayouts.map((p) => ({
        payoutId: p.payoutId,
        orderId: p.orderId,
        propertyTitle: p.propertyTitle,
        propertyId: p.propertyId,
        totalAmount: p.totalAmount,
        ownerShare: p.ownerShare,
        subAdminShare: p.subAdminShare,
        superAdminShare: p.superAdminShare || p.commissionAmount,
        commissionRate: p.commissionRate,
        splitType: p.splitType,
        status: p.status,
        paymentMethod: p.paymentMethod,
        transactionReference: p.transactionReference,
        date: p.createdAt,
      })),
    });
  }

  // Calculate Overall Platform Summary
  const totalSalesVolume = allPayouts.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalSubAdminRevenue = subAdminPayouts.reduce((sum, p) => sum + (p.subAdminShare || 0), 0);
  const totalMainAdminDirectRevenue = allPayouts
    .filter((p) => p.splitType === 'MAINADMIN_100' || p.ownerRole !== 'Sub-Admin')
    .reduce((sum, p) => sum + (p.ownerShare || p.totalAmount || 0), 0);
  const totalSuperAdminPlatformCommission = totalSubAdminCommissionsToSuperAdmin;
  const totalSuperAdminTotalRevenue = totalMainAdminDirectRevenue + totalSuperAdminPlatformCommission;

  return {
    success: true,
    userStats,
    overall: {
      totalTransactions: allPayouts.length,
      totalSalesVolume,
      totalSuperAdminRevenue: totalSuperAdminTotalRevenue,
      totalMainAdminDirectRevenue,
      totalSuperAdminPlatformCommission,
      totalSubAdminRevenue,
      subAdminsCount: users.filter((u) => u.role === 'Sub-Admin').length,
      mainAdminsCount: users.filter((u) => u.role === 'Super Admin' || u.role === 'Main Admin').length,
    },
  };
}

module.exports = {
  calculateSplit,
  recordPropertySale,
  syncHistoricalSales,
  getUserPaymentStats,
};

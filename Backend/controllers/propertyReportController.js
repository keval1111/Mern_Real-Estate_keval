const mongoose = require('mongoose');
const PropertyReport = require('../models/PropertyReport');
const Property = require('../models/Property');
const User = require('../models/User');

exports.submitPropertyReport = async (req, res) => {
  try {
    const {
      propertyId,
      reason,
      description,
      reporterName,
      reporterEmail,
      reporterPhone,
      evidenceUrl,
    } = req.body;

    if (!propertyId || !reason || !description || !reporterName || !reporterEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: property ID, reason, description, reporter name, and email.',
      });
    }

    // 1. Verify property existence (supports ObjectId, slug, or title)
    let property = null;
    if (mongoose.Types.ObjectId.isValid(propertyId)) {
      property = await Property.findById(propertyId);
    }
    if (!property) {
      property = await Property.findOne({
        $or: [
          { slug: String(propertyId).toLowerCase() },
          { title: new RegExp(`^${propertyId}$`, 'i') },
        ],
      });
    }

    // 2. Fetch owner information
    let ownerId = property?.createdBy || null;
    let ownerName = property?.createdByName || 'Super Admin';
    let ownerEmail = property?.createdByEmail || '';
    let ownerRole = property?.creatorRole || 'Super Admin';

    if (ownerId && (!ownerName || ownerName === 'Super Admin')) {
      const ownerUser = await User.findById(ownerId).select('name email role');
      if (ownerUser) {
        ownerName = ownerUser.name;
        ownerEmail = ownerUser.email;
        ownerRole = ownerUser.role || 'Sub-Admin';
      }
    }

    const resolvedPropId = property?._id ? String(property._id) : String(propertyId);
    const propTitle = property?.title || req.body.propertyTitle || 'Property Listing';
    const propImage = property?.image || (property?.images && property.images[0]) || req.body.propertyImage || '';
    const propPrice = property?.price || req.body.propertyPrice || `$${property?.priceNumber || 0}`;
    const propLocation = property?.location || property?.city || req.body.propertyLocation || 'Undisclosed';

    // 3. Create the report record
    const report = new PropertyReport({
      propertyId: resolvedPropId,
      propertyTitle: propTitle,
      propertyImage: propImage,
      propertyPrice: propPrice,
      propertyLocation: propLocation,
      propertyOwner: ownerId,
      propertyOwnerName: ownerName,
      propertyOwnerEmail: ownerEmail,
      propertyOwnerRole: ownerRole,
      reporterName: reporterName.trim(),
      reporterEmail: reporterEmail.trim().toLowerCase(),
      reporterPhone: (reporterPhone || '').trim(),
      reporterId: req.user ? req.user._id : null,
      reason,
      description: description.trim(),
      evidenceUrl: evidenceUrl || '',
      status: 'Pending Review',
      actionTaken: 'None',
    });

    const savedReport = await report.save();

    // 4. Calculate total report count on this property
    const totalReportsOnProperty = await PropertyReport.countDocuments({
      propertyId: resolvedPropId,
      status: { $ne: 'Dismissed' },
    });

    // 5. Emit real-time WebSocket notification if socket instance exists
    const io = req.app.get('io');
    if (io) {
      io.emit('new_property_report', {
        reportId: savedReport._id,
        propertyId: resolvedPropId,
        propertyTitle: propTitle,
        propertyOwner: ownerId,
        propertyOwnerName: ownerName,
        reason: savedReport.reason,
        reporterName: savedReport.reporterName,
        totalReportsOnProperty,
        createdAt: savedReport.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Property report submitted successfully. Our compliance desk and the property manager have been notified.',
      data: savedReport,
      totalReportsOnProperty,
    });
  } catch (error) {
    console.error('Error submitting property report:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {}).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ') || 'Validation error submitting property report',
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error submitting property report',
      error: error.message,
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { status, reason, propertyId, search } = req.query;
    const user = req.user;

    const query = {};

    const isSuperOrMain =
      user.role === 'Super Admin' || user.role === 'Main Admin' || user.role === 'Admin';

    if (!isSuperOrMain) {
      // Sub-Admin role: scope by propertyOwner or email
      query.$or = [{ propertyOwner: user._id }, { propertyOwnerEmail: user.email }];
    }

    // 2. Optional Filters
    if (status && status !== 'All') {
      query.status = status;
    }
    if (reason && reason !== 'All') {
      query.reason = reason;
    }
    if (propertyId) {
      query.propertyId = propertyId;
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = query.$or || [];
      query.$or.push(
        { propertyTitle: regex },
        { reporterName: regex },
        { reporterEmail: regex },
        { description: regex },
        { reason: regex }
      );
    }

    const reports = await PropertyReport.find(query).sort({ createdAt: -1 });

    // 3. Compute Summary Metrics
    const baseCountQuery = !isSuperOrMain
      ? { $or: [{ propertyOwner: user._id }, { propertyOwnerEmail: user.email }] }
      : {};

    const allUserReports = await PropertyReport.find(baseCountQuery);

    const totalReports = allUserReports.length;
    const pendingCount = allUserReports.filter((r) => r.status === 'Pending Review').length;
    const investigatingCount = allUserReports.filter((r) => r.status === 'Under Investigation').length;
    const resolvedCount = allUserReports.filter((r) => r.status === 'Resolved').length;
    const dismissedCount = allUserReports.filter((r) => r.status === 'Dismissed').length;

    const propertyReportCountMap = {};
    allUserReports.forEach((r) => {
      if (r.status !== 'Dismissed') {
        const pId = String(r.propertyId);
        if (!propertyReportCountMap[pId]) {
          propertyReportCountMap[pId] = {
            propertyId: pId,
            propertyTitle: r.propertyTitle,
            propertyImage: r.propertyImage,
            propertyOwnerName: r.propertyOwnerName,
            propertyOwnerRole: r.propertyOwnerRole,
            count: 0,
            pendingCount: 0,
            reports: [],
          };
        }
        propertyReportCountMap[pId].count += 1;
        if (r.status === 'Pending Review') {
          propertyReportCountMap[pId].pendingCount += 1;
        }
        propertyReportCountMap[pId].reports.push({
          id: r._id,
          reason: r.reason,
          status: r.status,
          date: r.createdAt,
        });
      }
    });

    const highRiskProperties = Object.values(propertyReportCountMap)
      .filter((p) => p.count >= 2)
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: reports,
      metrics: {
        totalReports,
        pendingCount,
        investigatingCount,
        resolvedCount,
        dismissedCount,
        multipleReportsCount: highRiskProperties.length,
        highRiskProperties: highRiskProperties.map((p) => p.propertyId),
        highRiskPropertyDetails: highRiskProperties,
      },
      viewerRole: user.role,
      isSuperAdmin: isSuperOrMain,
    });
  } catch (error) {
    console.error('Error fetching property reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property reports',
      error: error.message,
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await PropertyReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const user = req.user;
    const isSuperOrMain =
      user.role === 'Super Admin' || user.role === 'Main Admin' || user.role === 'Admin';
    const isOwner =
      report.propertyOwner && report.propertyOwner.toString() === user._id.toString();

    if (!isSuperOrMain && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have permission to view reports for this property.',
      });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching report', error: error.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status, actionTaken, adminNotes } = req.body;
    const report = await PropertyReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const user = req.user;
    const isSuperOrMain =
      user.role === 'Super Admin' || user.role === 'Main Admin' || user.role === 'Admin';
    const isOwner =
      report.propertyOwner && report.propertyOwner.toString() === user._id.toString();

    if (!isSuperOrMain && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have permission to update this report.',
      });
    }

    if (status) report.status = status;
    if (actionTaken) report.actionTaken = actionTaken;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;

    report.reviewedBy = user._id;
    report.reviewedByName = user.name;
    report.reviewedAt = new Date();

    const updated = await report.save();

    res.json({
      success: true,
      message: `Report status updated to "${report.status}"`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update report status', error: error.message });
  }
};

exports.takeDownPropertyBySuperAdmin = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { reason, actionNotes } = req.body;
    const user = req.user;

    const isSuperOrMain =
      user.role === 'Super Admin' || user.role === 'Main Admin' || user.role === 'Admin';

    if (!isSuperOrMain) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Take-down authority to remove properties from the portal is strictly reserved for Super Admin.',
      });
    }

    // 1. Find the property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    const previousStatus = property.status;
    property.status = 'Delisted';
    property.availableUnits = 0;
    property.isDelisted = true;
    property.delistedReason =
      reason || 'Property removed from portal by Super Admin following multiple violation reports.';
    property.delistedAt = new Date();
    property.delistedBy = user._id;

    await property.save();

    // 2. Mark all active reports on this property as Resolved with actionTaken
    const updateResult = await PropertyReport.updateMany(
      { propertyId: property._id, status: { $ne: 'Dismissed' } },
      {
        $set: {
          status: 'Resolved',
          actionTaken: 'Property Removed from Portal',
          reviewedBy: user._id,
          reviewedByName: user.name,
          reviewedAt: new Date(),
          adminNotes: actionNotes
            ? `${actionNotes} | Property removed from portal by Super Admin (${user.name}).`
            : `Property delisted from portal by Super Admin (${user.name}) on ${new Date().toLocaleDateString()}.`,
        },
      }
    );

    // 3. Emit real-time socket event so frontend and admin listings update live
    const io = req.app.get('io');
    if (io) {
      io.emit('propertyAvailabilityUpdated', {
        propertyId: property._id,
        slug: property.slug,
        status: 'Delisted',
        availableUnits: 0,
        isDelisted: true,
      });
      io.emit('property_delisted_notification', {
        propertyId: property._id,
        propertyTitle: property.title,
        ownerId: property.createdBy,
        delistedBy: user.name,
        delistedAt: new Date(),
      });
    }

    res.json({
      success: true,
      message: `Property "${property.title}" has been taken down and removed from the portal. Associated reports have been marked as Resolved.`,
      data: {
        propertyId: property._id,
        propertyTitle: property.title,
        previousStatus,
        currentStatus: property.status,
        reportsResolvedCount: updateResult.modifiedCount,
      },
    });
  } catch (error) {
    console.error('Error taking down property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to take down property',
      error: error.message,
    });
  }
};

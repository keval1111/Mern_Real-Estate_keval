const Visit = require('../models/Visit');
const { sendVisitScheduledEmail, generateWhatsAppLink } = require('../services/emailService');

const STANDARD_SLOTS = [
  '09:30 AM - 10:30 AM',
  '11:00 AM - 12:00 PM',
  '01:00 PM - 02:00 PM',
  '03:00 PM - 04:00 PM',
  '04:30 PM - 05:30 PM',
  '06:00 PM - 07:00 PM',
];

const PRESET_AGENTS = [
  {
    name: 'Vikram Malhotra',
    phone: '+91 98200 11223',
    email: 'vikram.advisor@modernrealestate.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Ananya Deshmukh',
    phone: '+91 98110 55443',
    email: 'ananya.legal@modernrealestate.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Rajesh Singhania',
    phone: '+91 98330 99887',
    email: 'rajesh.singhania@modernrealestate.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Rohan Kapoor',
    phone: '+91 98440 22331',
    email: 'rohan.appraisal@modernrealestate.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
];

// Helper to construct Google Calendar Add-to-Calendar URL
const buildGoogleCalendarUrl = (visit, agent) => {
  try {
    const title = encodeURIComponent(`Private Property Visit: ${visit.propertyTitle}`);
    const details = encodeURIComponent(
      `Appointment ID: ${visit.visitId}\n` +
      `Property: ${visit.propertyTitle}\n` +
      `Tour Format: ${visit.visitType}\n` +
      `Hosted by Senior Advisor: ${agent.name} (Phone: ${agent.phone}, Email: ${agent.email})\n` +
      `Client: ${visit.customerName} (${visit.customerPhone})\n` +
      `Location: ${visit.propertyLocation || 'Prime Location'}`
    );
    const location = encodeURIComponent(visit.propertyLocation || 'Property Site');

    // Parse YYYY-MM-DD
    const dateClean = (visit.visitDate || '').replace(/[^0-9]/g, '');
    let startHour = '100000';
    let endHour = '110000';

    if (visit.timeSlot && visit.timeSlot.includes('PM')) {
      const parts = visit.timeSlot.match(/(\d+):(\d+)\s*PM/);
      if (parts) {
        let h = parseInt(parts[1], 10);
        if (h < 12) h += 12;
        const m = parts[2] || '00';
        startHour = `${String(h).padStart(2, '0')}${m}00`;
        endHour = `${String(h + 1).padStart(2, '0')}${m}00`;
      }
    } else if (visit.timeSlot && visit.timeSlot.includes('AM')) {
      const parts = visit.timeSlot.match(/(\d+):(\d+)\s*AM/);
      if (parts) {
        let h = parseInt(parts[1], 10);
        if (h === 12) h = 0;
        const m = parts[2] || '00';
        startHour = `${String(h).padStart(2, '0')}${m}00`;
        endHour = `${String(h + 1).padStart(2, '0')}${m}00`;
      }
    }

    const datesParam = `${dateClean}T${startHour}/${dateClean}T${endHour}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
  } catch (err) {
    return 'https://calendar.google.com';
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { propertyTitle, propertyId, visitDate } = req.query;

    if (!visitDate) {
      return res.status(400).json({ success: false, message: 'visitDate query parameter is required' });
    }

    // Query existing non-cancelled bookings for this date and property
    const filter = {
      visitDate,
      status: { $ne: 'Cancelled' },
    };

    if (propertyTitle) {
      filter.propertyTitle = propertyTitle;
    } else if (propertyId) {
      filter.propertyId = propertyId;
    }

    const bookedVisits = await Visit.find(filter).select('timeSlot visitId');
    const bookedSlotNames = new Set(bookedVisits.map((v) => v.timeSlot));

    const slotAvailability = STANDARD_SLOTS.map((slot) => ({
      slot,
      available: !bookedSlotNames.has(slot),
    }));

    res.json({
      success: true,
      visitDate,
      property: propertyTitle || propertyId || 'General',
      totalSlots: STANDARD_SLOTS.length,
      availableCount: slotAvailability.filter((s) => s.available).length,
      slots: slotAvailability,
    });
  } catch (error) {
    console.error('Error checking visit slot availability:', error);
    res.status(500).json({ success: false, message: 'Failed to check slot availability', error: error.message });
  }
};

exports.scheduleVisit = async (req, res) => {
  try {
    const {
      propertyId,
      propertyTitle,
      propertySlug,
      propertyImage,
      propertyLocation,
      customerName,
      customerEmail,
      customerPhone,
      visitType,
      visitDate,
      timeSlot,
      notes,
    } = req.body;

    // Validation
    if (!propertyTitle || !customerName || !customerEmail || !customerPhone || !visitDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: propertyTitle, customerName, customerEmail, customerPhone, visitDate, timeSlot',
      });
    }

    // Double-Booking Check (Slot Conflict Prevention)
    const conflict = await Visit.findOne({
      propertyTitle,
      visitDate,
      timeSlot,
      status: { $ne: 'Cancelled' },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `The slot "${timeSlot}" on ${visitDate} is already reserved for "${propertyTitle}". Please select another available time slot.`,
        conflictSlot: timeSlot,
      });
    }

    // Assign dedicated property advisor
    const assignedAgent = PRESET_AGENTS[Math.floor(Math.random() * PRESET_AGENTS.length)];

    const visitId = `VST-${Math.floor(100000 + Math.random() * 900000)}`;

    const newVisit = new Visit({
      visitId,
      propertyId: propertyId || null,
      propertyTitle,
      propertySlug: propertySlug || '',
      propertyImage: propertyImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      propertyLocation: propertyLocation || 'Prime Location',
      customerName,
      customerEmail,
      customerPhone,
      visitType: visitType || 'In-Person Guided Tour',
      visitDate,
      timeSlot,
      notes: notes || '',
      assignedAgent,
      status: 'Confirmed',
    });

    // Generate Google Calendar Link
    newVisit.googleCalendarUrl = buildGoogleCalendarUrl(newVisit, assignedAgent);

    const saved = await newVisit.save();

    // Send confirmation email asynchronously
    let emailStatus = null;
    try {
      emailStatus = await sendVisitScheduledEmail(saved);
    } catch (e) {
      console.warn('⚠️ Visit confirmation email non-fatal error:', e.message);
    }

    // Generate WhatsApp confirmation message link
    const whatsappMsg = `Hello ${customerName}, your ${saved.visitType} for "${saved.propertyTitle}" is confirmed for ${saved.visitDate} at ${saved.timeSlot}. Hosted by ${assignedAgent.name} (${assignedAgent.phone}). Appointment ID: ${saved.visitId}.`;
    const whatsappLink = generateWhatsAppLink(customerPhone, whatsappMsg);

    res.status(201).json({
      success: true,
      message: `Property visit successfully scheduled for ${saved.visitDate} at ${saved.timeSlot}! Confirmation email dispatched.`,
      data: saved,
      googleCalendarUrl: saved.googleCalendarUrl,
      whatsappLink,
      emailPreview: emailStatus?.previewUrl || null,
    });
  } catch (error) {
    console.error('Error scheduling visit:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule visit', error: error.message });
  }
};

exports.getVisits = async (req, res) => {
  try {
    const { status, date, email, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (date) {
      query.visitDate = date;
    }

    if (email) {
      query.customerEmail = { $regex: email, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { visitId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { propertyTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const visits = await Visit.find(query).sort({ visitDate: 1, createdAt: -1 });

    res.json({
      success: true,
      count: visits.length,
      data: visits,
    });
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch visits', error: error.message });
  }
};

exports.updateVisitStatus = async (req, res) => {
  try {
    const { status, notes, timeSlot, visitDate } = req.body;
    let visit = await Visit.findById(req.params.id);
    if (!visit) {
      visit = await Visit.findOne({ visitId: req.params.id });
    }

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit appointment not found' });
    }

    if (status) visit.status = status;
    if (notes !== undefined) visit.notes = notes;
    if (visitDate) visit.visitDate = visitDate;
    if (timeSlot) visit.timeSlot = timeSlot;

    const updated = await visit.save();
    res.json({
      success: true,
      message: `Visit status updated to "${updated.status}"`,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating visit status:', error);
    res.status(500).json({ success: false, message: 'Failed to update visit', error: error.message });
  }
};

exports.deleteVisit = async (req, res) => {
  try {
    let visit = await Visit.findById(req.params.id);
    if (!visit) {
      visit = await Visit.findOne({ visitId: req.params.id });
    }

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    await visit.deleteOne();
    res.json({ success: true, message: 'Site visit cancelled and removed successfully' });
  } catch (error) {
    console.error('Error deleting visit:', error);
    res.status(500).json({ success: false, message: 'Failed to delete visit', error: error.message });
  }
};

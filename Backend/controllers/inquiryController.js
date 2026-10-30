const Inquiry = require('../models/Inquiry');

exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching inquiries', error: error.message });
  }
};

exports.createInquiry = async (req, res) => {
  try {
    const { client, email, phone, property, propertyId, message } = req.body;

    if (!client || !email) {
      return res.status(400).json({ success: false, message: 'Client name and email are required' });
    }

    const inquiry = new Inquiry({
      client,
      email,
      phone: phone || '',
      property: property || 'General Inquiry / Storefront',
      propertyId: propertyId || null,
      message: message || 'Interested in luxury real estate properties.',
      status: 'New',
    });

    const saved = await inquiry.save();

    // Broadcast real-time event to Admin panel via Socket.io
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('new_inquiry_received', saved);
        io.emit('new_admin_notification', {
          type: 'inquiry',
          customerName: saved.client,
          lastMessage: saved.message,
          propertyTitle: saved.property,
          roomId: null
        });
      }
    } catch (socketErr) {
      console.warn('Socket emit notice:', socketErr);
    }

    res.status(201).json({ success: true, message: 'Inquiry submitted successfully', data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting inquiry', error: error.message });
  }
};

exports.updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    inquiry.status = status || 'Completed';
    const updated = await inquiry.save();
    res.json({ success: true, message: 'Inquiry status updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating inquiry', error: error.message });
  }
};

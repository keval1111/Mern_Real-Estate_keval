const Order = require('../models/Order');
const {
  sendBookingConfirmationEmail,
  getTransporter,
  generateWhatsAppLink,
} = require('../services/emailService');

exports.sendTestNotification = async (req, res) => {
  try {
    const { email } = req.body;
    const targetEmail = email || 'customer@example.com';

    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Modern Real Estate" <noreply@modernrealestate.com>',
      to: targetEmail,
      subject: '✅ SMTP & Nodemailer Configuration Verified - Modern Real Estate',
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #059669; margin-top: 0;">SMTP Notification Test Successful</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Your Nodemailer email service is operational and configured properly. Automated booking invoices and seller verification notifications will be delivered smoothly.
          </p>
          <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #334155;">
            <strong>Recipient:</strong> ${targetEmail}<br/>
            <strong>Timestamp:</strong> ${new Date().toLocaleString()}<br/>
            <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}
          </div>
        </div>
      `,
    });

    const nodemailer = require('nodemailer');
    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.json({
      success: true,
      message: `Test email sent successfully to ${targetEmail}`,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send test email', error: error.message });
  }
};

exports.resendOrderEmail = async (req, res) => {
  try {
    const { orderId } = req.params;
    let order = await Order.findOne({ orderId });
    if (!order && orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const emailResult = await sendBookingConfirmationEmail(order);

    res.json({
      success: emailResult.success,
      message: emailResult.success
        ? `Booking confirmation email re-dispatched to ${order.email}`
        : 'Failed to send email',
      previewUrl: emailResult.previewUrl || null,
      error: emailResult.error || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error resending email', error: error.message });
  }
};

const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const role = req.query.role || 'Super Admin';
    const userId = req.query.userId;

    const query = {
      $or: [
        { recipientRole: role },
        ...(userId ? [{ recipientId: userId }] : []),
      ],
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const role = req.body.role || 'Super Admin';
    await Notification.updateMany({ recipientRole: role, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


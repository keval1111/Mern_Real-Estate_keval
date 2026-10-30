const nodemailer = require('nodemailer');

// Helper to create transporter based on environment or fallback test account
let transporterPromise = null;

const getTransporter = async () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If real credentials are provided in .env
  if (user && pass && user !== 'your_email@gmail.com' && pass !== 'your_app_password') {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  // Fallback: Lazy init Ethereal test transporter for local test/dev
  if (!transporterPromise) {
    transporterPromise = (async () => {
      try {
        const testAccount = await nodemailer.createTestAccount();
        console.log('📧 Nodemailer initialized with Ethereal test account:', testAccount.user);
        return nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (err) {
        console.warn('⚠️ Could not create Ethereal test account, using json/console mock transport:', err.message);
        return nodemailer.createTransport({
          jsonTransport: true,
        });
      }
    })();
  }

  return await transporterPromise;
};

const FROM_ADDRESS = process.env.EMAIL_FROM || '"Modern Real Estate Estates" <noreply@modernrealestate.com>';

/**
 * 1. Send Booking Confirmation & Allotment Deed Email to Buyer
 */
const sendBookingConfirmationEmail = async (order) => {
  try {
    const transporter = await getTransporter();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const trackUrl = `${clientUrl}/account`;
    const receiptId = order.allotmentReceiptId || `RCPT-RERA-${order.orderId || Math.floor(100000 + Math.random() * 900000)}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - Modern Real Estate</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
        .badge { display: inline-block; background: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 12px; }
        .title { font-size: 24px; font-weight: 800; margin: 0 0 6px; letter-spacing: -0.5px; }
        .subtitle { font-size: 13px; color: #a1a1aa; margin: 0; }
        .body { padding: 32px; }
        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px; }
        .prop-img { width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 16px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 500; }
        .value { color: #0f172a; font-weight: 700; text-align: right; }
        .btn { display: block; text-align: center; background: #09090b; color: #ffffff !important; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; margin: 24px 0 16px; }
        .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="badge">Booking Confirmed</span>
          <h1 class="title">Allotment Deed & Receipt</h1>
          <p class="subtitle">Receipt ID: <strong>${receiptId}</strong></p>
        </div>
        <div class="body">
          <p style="font-size: 15px; margin-top: 0;">Dear <strong>${order.customer}</strong>,</p>
          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            Congratulations! Your token advance booking for <strong>${order.item}</strong> has been confirmed. Your allotment slot is now locked under modern real estate compliance regulations.
          </p>

          ${order.propertyImage ? `<img src="${order.propertyImage}" alt="${order.item}" class="prop-img" />` : ''}

          <div class="box">
            <div class="row">
              <span class="label">Booking Order ID:</span>
              <span class="value">${order.orderId || 'ORD-VERIFIED'}</span>
            </div>
            <div class="row">
              <span class="label">Property:</span>
              <span class="value">${order.item}</span>
            </div>
            <div class="row">
              <span class="label">Customer Email:</span>
              <span class="value">${order.email}</span>
            </div>
            <div class="row">
              <span class="label">Contact Phone:</span>
              <span class="value">${order.phone || 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Token Amount Paid:</span>
              <span class="value" style="color: #059669;">${order.tokenPaid || 'Rs. 1,00,000.00'}</span>
            </div>
            <div class="row">
              <span class="label">Total Property Valuation:</span>
              <span class="value">${order.total}</span>
            </div>
            <div class="row">
              <span class="label">Payment Status:</span>
              <span class="value" style="color: #059669;">Success (Payment ID: ${order.paymentDetails?.razorpay_payment_id || 'Captured'})</span>
            </div>
            <div class="row">
              <span class="label">Assigned Legal Advisor:</span>
              <span class="value">Vikram Malhotra (+91 98200 11223)</span>
            </div>
          </div>

          <a href="${trackUrl}" class="btn">View Booking & Download Deed</a>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
            Next Step: Your dedicated legal advisor will reach out within 24 hours to schedule the physical site appraisal and title deed registry formalities.
          </p>
        </div>
        <div class="footer">
          Modern Real Estate Platform &copy; 2026. All rights reserved.<br />
          Official RERA Certified Property Allotment Notification.
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: FROM_ADDRESS,
      to: order.email,
      subject: `🎉 Booking Confirmed: ${order.item} (Receipt: ${receiptId})`,
      html: htmlContent,
      text: `Dear ${order.customer}, Your booking for ${order.item} has been confirmed. Receipt ID: ${receiptId}. Token Paid: ${order.tokenPaid}. Track at: ${trackUrl}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Service] Booking confirmation sent to ${order.email} (MessageId: ${info.messageId})`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [Ethereal Email Preview URL]: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('❌ [Email Service] Failed to send booking email:', error.message);
    return { success: false, error: error.message };
  }
};

/** 2. Send Seller Listing Approval Email*/
const sendSellerApprovalEmail = async (property) => {
  try {
    const transporter = await getTransporter();
    const recipient = property.sellerEmail;
    if (!recipient) {
      console.warn('⚠️ [Email Service] No seller email provided for approval notification');
      return { success: false, message: 'No seller email' };
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const propertyUrl = `${clientUrl}/checkout?property=${property.slug || property._id}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Property Approved - Modern Real Estate</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #059669; padding: 32px; text-align: center; color: #ffffff; }
        .body { padding: 32px; }
        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
        .btn { display: block; text-align: center; background: #059669; color: #ffffff !important; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="margin: 0; font-size: 22px;">Listing Verified & Published!</h1>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">Your property is now live on our marketplace.</p>
        </div>
        <div class="body">
          <p>Dear <strong>${property.sellerName || 'Valued Seller'}</strong>,</p>
          <p style="line-height: 1.6; color: #475569;">
            We are pleased to inform you that your property submission <strong>"${property.title}"</strong> has been thoroughly inspected, verified by our valuation committee, and published to the live marketplace.
          </p>

          <div class="box">
            <p style="margin: 4px 0;"><strong>Property:</strong> ${property.title}</p>
            <p style="margin: 4px 0;"><strong>Location:</strong> ${property.location || property.city || 'Prime Location'}</p>
            <p style="margin: 4px 0;"><strong>Approved Valuation:</strong> ${property.adminValuation || property.price}</p>
            <p style="margin: 4px 0;"><strong>Verification Status:</strong> <span style="color: #059669; font-weight: 700;">Active & Verified</span></p>
            ${property.verificationNotes ? `<p style="margin: 4px 0; font-size: 12px; color: #64748b;"><strong>Notes:</strong> ${property.verificationNotes}</p>` : ''}
          </div>

          <a href="${propertyUrl}" class="btn">View Live Marketplace Listing</a>

          <p style="font-size: 12px; color: #64748b;">
            When interested buyers schedule visits or place token advances, you will receive real-time notifications directly.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: recipient,
      subject: `🎉 Approved & Live: "${property.title}" is now published on Modern Real Estate`,
      html: htmlContent,
      text: `Congratulations ${property.sellerName}! Your property "${property.title}" is verified and live. View here: ${propertyUrl}`,
    });

    console.log(`✅ [Email Service] Seller approval email sent to ${recipient}`);
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('❌ [Email Service] Failed to send seller approval email:', error.message);
    return { success: false, error: error.message };
  }
};

/*3. Send Seller Listing Rejection Email*/
const sendSellerRejectionEmail = async (property, reason) => {
  try {
    const transporter = await getTransporter();
    const recipient = property.sellerEmail;
    if (!recipient) return { success: false, message: 'No seller email' };

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Property Submission Update</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #dc2626; padding: 32px; text-align: center; color: #ffffff; }
        .body { padding: 32px; }
        .box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 18px; margin: 20px 0; color: #991b1b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="margin: 0; font-size: 22px;">Notice Regarding Property Submission</h1>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 13px;">Action required on your listing submission</p>
        </div>
        <div class="body">
          <p>Dear <strong>${property.sellerName || 'Valued Seller'}</strong>,</p>
          <p style="line-height: 1.6; color: #475569;">
            Thank you for submitting your property <strong>"${property.title}"</strong>. During our valuation and title verification process, our compliance team encountered the following reason:
          </p>

          <div class="box">
            <strong>Verification Feedback / Reason:</strong>
            <p style="margin: 8px 0 0; font-size: 13px;">${reason || 'Required documentation unclear or valuation criteria not met.'}</p>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            You can re-upload verified title deeds, clear photographs, or updated ownership documents from your seller dashboard to re-apply for marketplace listing.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: recipient,
      subject: `Update regarding your property submission: "${property.title}"`,
      html: htmlContent,
      text: `Notice regarding "${property.title}": ${reason}`,
    });

    console.log(`✅ [Email Service] Seller rejection email sent to ${recipient}`);
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('❌ [Email Service] Failed to send seller rejection email:', error.message);
    return { success: false, error: error.message };
  }
};

const sendVisitScheduledEmail = async (visit) => {
  try {
    const transporter = await getTransporter();
    const recipient = visit.customerEmail;
    if (!recipient) return { success: false, message: 'No recipient email' };

    const calendarUrl = visit.googleCalendarUrl || 'https://calendar.google.com';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const propertyUrl = visit.propertySlug ? `${clientUrl}/checkout?property=${visit.propertySlug}` : clientUrl;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Site Visit Confirmed - Modern Real Estate</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #09090b 0%, #1e293b 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
        .badge { display: inline-block; background: #3b82f6; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 12px; }
        .title { font-size: 22px; font-weight: 800; margin: 0 0 6px; }
        .body { padding: 32px; }
        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px; }
        .prop-img { width: 100%; height: 180px; object-fit: cover; border-radius: 12px; margin-bottom: 16px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 500; }
        .value { color: #0f172a; font-weight: 700; text-align: right; }
        .btn { display: block; text-align: center; background: #2563eb; color: #ffffff !important; padding: 13px 26px; border-radius: 12px; font-weight: 700; font-size: 13px; text-decoration: none; margin: 18px 0; }
        .footer { padding: 18px 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="badge">${visit.visitType || 'Site Visit'}</span>
          <h1 class="title">Property Tour Confirmed!</h1>
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">Appointment ID: <strong>${visit.visitId}</strong></p>
        </div>
        <div class="body">
          <p style="font-size: 14px; margin-top: 0;">Dear <strong>${visit.customerName}</strong>,</p>
          <p style="font-size: 13px; color: #475569; line-height: 1.6;">
            Your upcoming private property tour for <strong>${visit.propertyTitle}</strong> has been locked in our schedule. Our senior real estate advisor will host you and walk you through every corner.
          </p>

          ${visit.propertyImage ? `<img src="${visit.propertyImage}" alt="${visit.propertyTitle}" class="prop-img" />` : ''}

          <div class="box">
            <div class="row">
              <span class="label">Property:</span>
              <span class="value">${visit.propertyTitle}</span>
            </div>
            <div class="row">
              <span class="label">Location:</span>
              <span class="value">${visit.propertyLocation || 'Prime Location'}</span>
            </div>
            <div class="row">
              <span class="label">Date:</span>
              <span class="value" style="color: #2563eb;">${visit.visitDate}</span>
            </div>
            <div class="row">
              <span class="label">Time Slot:</span>
              <span class="value" style="color: #2563eb;">${visit.timeSlot}</span>
            </div>
            <div class="row">
              <span class="label">Tour Format:</span>
              <span class="value">${visit.visitType}</span>
            </div>
            <div class="row">
              <span class="label">Assigned Advisor:</span>
              <span class="value">${visit.assignedAgent?.name || 'Senior Property Specialist'} (${visit.assignedAgent?.phone || '+91 98200 11223'})</span>
            </div>
          </div>

          <a href="${calendarUrl}" target="_blank" class="btn">📅 Add to Google Calendar</a>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
            <strong>Important Note:</strong> Please bring a valid Government photo ID for gated community gate pass security clearance.
          </p>
        </div>
        <div class="footer">
          Modern Real Estate Platform &copy; 2026. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: recipient,
      subject: `🗓️ Site Visit Confirmed: ${visit.propertyTitle} on ${visit.visitDate} (${visit.timeSlot})`,
      html: htmlContent,
      text: `Dear ${visit.customerName}, your site visit for ${visit.propertyTitle} is confirmed on ${visit.visitDate} at ${visit.timeSlot}. Assigned agent: ${visit.assignedAgent?.name || 'Vikram Malhotra'}.`,
    });

    console.log(`✅ [Email Service] Site visit confirmation sent to ${recipient} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('❌ [Email Service] Failed to send site visit email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 5. Generate Instant WhatsApp Direct Message URL for Agent/Buyer
 */
const generateWhatsAppLink = (phone, text) => {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
};

module.exports = {
  sendBookingConfirmationEmail,
  sendSellerApprovalEmail,
  sendSellerRejectionEmail,
  sendVisitScheduledEmail,
  generateWhatsAppLink,
  getTransporter,
};

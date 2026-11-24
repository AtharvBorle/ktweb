const nodemailer = require('nodemailer');
const config = require('../config/config');
const { logger } = require('../utils/helpers');

class EmailService {
  constructor() {
    this.transporter = null;
    this._initTransporter();
  }

  _initTransporter() {
    const { host, port, secure, user, pass } = config.smtp;
    if (user && pass && pass.trim() !== '') {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass
        }
      });
    } else {
      this.transporter = null;
    }
  }

  /**
   * Send notification email when a new contact inquiry is received
   */
  async sendContactNotification(contactData) {
    const { name, email, phone, subject, message } = contactData;
    const recipient = config.adminNotificationEmail;

    // Refresh transporter if credentials updated in environment
    if (!this.transporter && config.smtp.user && config.smtp.pass && config.smtp.pass.trim() !== '') {
      this._initTransporter();
    }

    if (!this.transporter) {
      logger.info(`[SMTP] Email notification skipped: SMTP_PASS is empty in .env. Message safely stored in database.`);
      return { success: false, reason: 'SMTP_NOT_CONFIGURED' };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #334155; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; border-top: 4px solid #F4821E; box-shadow: 0 4px 15px rgba(0,0,0,0.06); overflow: hidden; }
          .header { background: #1e293b; color: #ffffff; padding: 24px 30px; }
          .header h2 { margin: 0 0 6px 0; font-size: 20px; color: #ffffff; }
          .header p { margin: 0; font-size: 13px; color: #94a3b8; }
          .content { padding: 30px; }
          .field { margin-bottom: 18px; }
          .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #F4821E; margin-bottom: 4px; }
          .value { font-size: 15px; color: #1e293b; background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0; }
          .message-box { font-size: 15px; line-height: 1.6; color: #1e293b; background: #fff7ed; padding: 16px; border-radius: 6px; border-left: 3px solid #F4821E; white-space: pre-wrap; }
          .footer { padding: 20px 30px; background: #f1f5f9; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Kunal Tilak Official Website</h2>
            <p>New Contact Inquiry Received</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Full Name</div>
              <div class="value">${name || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="label">Email Address</div>
              <div class="value">${email || 'Not provided'}</div>
            </div>
            <div class="field">
              <div class="label">Phone / Mobile</div>
              <div class="value">${phone || 'Not provided'}</div>
            </div>
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${subject || 'Website Inquiry'}</div>
            </div>
            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${message || ''}</div>
            </div>
          </div>
          <div class="footer">
            This inquiry was submitted from the official Kunal Tilak website contact form at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: config.smtp.from,
      to: recipient,
      replyTo: email || undefined,
      subject: `[New Inquiry] ${name} - Kunal Tilak Official Website`,
      text: `New Contact Inquiry:\n\nName: ${name}\nEmail: ${email || 'N/A'}\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'Website Inquiry'}\n\nMessage:\n${message}\n`,
      html: htmlContent
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`[SMTP] Contact notification email successfully sent to ${recipient} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      logger.warn(`[SMTP] Error sending contact notification email: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new EmailService();

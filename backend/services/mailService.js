const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.mailtrap.io';
const SMTP_PORT = parseInt(process.env.SMTP_PORT) || 2525;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@narcovt.gov';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

let isConfigured = false;
transporter.verify((error, success) => {
  if (error || !SMTP_USER || !SMTP_PASS) {
    console.log('[MailService] Warning: SMTP parameters missing or invalid. Falling back to console-logging mock email service.');
  } else {
    console.log('[MailService] SMTP Connection established successfully.');
    isConfigured = true;
  }
});

class MailService {
  /**
   * Sends an email notification.
   * @param {string} to Recipient email address
   * @param {string} subject Email subject
   * @param {string} text Plain text content
   * @param {string} html HTML content (optional)
   * @returns {Promise<boolean>}
   */
  async sendEmail({ to, subject, text, html }) {
    if (!isConfigured) {
      console.log('\n==================================================');
      console.log('✉️  MOCK EMAIL SENT');
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text:    ${text}`);
      console.log('==================================================\n');
      return true;
    }

    try {
      await transporter.sendMail({
        from: `"NarcoVT Command Center" <${SMTP_FROM}>`,
        to,
        subject,
        text,
        html
      });
      return true;
    } catch (error) {
      console.error('[MailService] SMTP send failure:', error);
      return false;
    }
  }

  /**
   * Sends registration OTP email.
   * @param {string} to 
   * @param {string} otp 
   */
  async sendVerificationOTP(to, otp) {
    return this.sendEmail({
      to,
      subject: 'NarcoVT - Verify Your Account',
      text: `Your account verification code is: ${otp}. This code is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #003366;">NarcoVT</h2>
          <p>Thank you for registering. Please verify your identity using the confidential verification code below:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; padding: 10px; background-color: #f5f5f5; text-align: center; border-radius: 4px; color: #003366; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #666;">This code expires in 10 minutes. Do not share this OTP with anyone.</p>
        </div>
      `
    });
  }

  /**
   * Sends password reset OTP email.
   * @param {string} to 
   * @param {string} otp 
   */
  async sendPasswordResetOTP(to, otp) {
    return this.sendEmail({
      to,
      subject: 'NarcoVT - Password Reset OTP',
      text: `Your password recovery code is: ${otp}. This code is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #003366;">NarcoVT</h2>
          <p>We received a password reset request. Please use the verification code below to restore access:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; padding: 10px; background-color: #f5f5f5; text-align: center; border-radius: 4px; color: #003366; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #666;">This code expires in 10 minutes.</p>
        </div>
      `
    });
  }

  /**
   * Sends registration confirmation and complaint submission receipt email.
   */
  async sendSubmissionAlert(to, name, complaintId) {
    return this.sendEmail({
      to,
      subject: `[NarcoVT] Confidential Complaint Filed - ID: ${complaintId}`,
      text: `Hello ${name},\n\nYour drug activity complaint has been filed successfully. Tracking ID: ${complaintId}.\n\nYou can track the investigation progress live on your Citizen Dashboard.`,
      html: `
        <h3>NarcoVT Security Intake Receipt</h3>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your drug activity complaint has been registered. Tracking ID: <strong>${complaintId}</strong>.</p>
        <p>You can track the status of this report live on the Citizen Portal.</p>
      `
    });
  }

  /**
   * Sends case status change alerts.
   */
  async sendStatusAlert(to, name, complaintId, newStatus) {
    return this.sendEmail({
      to,
      subject: `[NarcoVT] Status Update for Report ID: ${complaintId}`,
      text: `Hello ${name},\n\nThe status of your complaint ${complaintId} has changed to: ${newStatus}.\n\nPlease log in to your dashboard to inspect official notes.`,
      html: `
        <h3>NarcoVT Status Alert</h3>
        <p>Hello <strong>${name}</strong>,</p>
        <p>The status of your complaint <strong>${complaintId}</strong> has been updated to: <strong>${newStatus}</strong>.</p>
        <p>Please log in to your dashboard to inspect official notes.</p>
      `
    });
  }
}

module.exports = new MailService();

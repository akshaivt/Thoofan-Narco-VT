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

// Verify connection configuration
transporter.verify((error, success) => {
  if (error || !SMTP_USER || !SMTP_PASS) {
    console.log('[EmailService] Warning: SMTP parameters missing or invalid. Falling back to console-logging mock email service.');
  } else {
    console.log('[EmailService] SMTP Connection established successfully.');
    isConfigured = true;
  }
});

/**
 * Dispatch an email alert. Logs to the console in development/mock setups.
 */
const sendEmail = async (to, subject, text, html) => {
  if (!isConfigured) {
    console.log(`
=========================================
[MOCK EMAIL DISPATCHED]
To: ${to}
Subject: ${subject}
Text: ${text}
=========================================
    `);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"NarcoVT Intelligence Center" <${SMTP_FROM}>`,
      to,
      subject,
      text,
      html
    });
    return true;
  } catch (error) {
    console.error('[EmailService] Failed to send email via SMTP:', error);
    return false;
  }
};

const sendSubmissionEmail = async (email, name, complaintId) => {
  const subject = `[NarcoVT] Confidential Complaint Filed - ID: ${complaintId}`;
  const text = `Hello ${name},\n\nYour drug activity complaint has been filed successfully. Complaint Tracking ID: ${complaintId}.\n\nYou can track the investigation progress live on your Citizen Dashboard using this ID.\n\nStay Safe,\nNarcoVT Command Center`;
  const html = `
    <h3>NarcoVT Security Intake Receipt</h3>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your drug activity complaint has been registered. Tracking ID: <strong>${complaintId}</strong>.</p>
    <p>You can track the status of this report live on the Citizen Portal.</p>
    <p><em>Command Center Operational Security Desk</em></p>
  `;
  return sendEmail(email, subject, text, html);
};

const sendStatusChangeEmail = async (email, name, complaintId, newStatus) => {
  const subject = `[NarcoVT] Status Update for Report ID: ${complaintId}`;
  const text = `Hello ${name},\n\nThe status of your complaint ${complaintId} has changed to: ${newStatus}.\n\nPlease log in to your dashboard to inspect official notes.\n\nCommand Center Desk`;
  const html = `
    <h3>NarcoVT Status Alert</h3>
    <p>Hello <strong>${name}</strong>,</p>
    <p>The status of your complaint <strong>${complaintId}</strong> has been updated to: <span style="font-weight: bold; color: #1e3a8a;">${newStatus}</span>.</p>
    <p>Please log in to your dashboard to inspect official notes.</p>
    <p><em>Command Center Operational Security Desk</em></p>
  `;
  return sendEmail(email, subject, text, html);
};

const sendPasswordResetEmail = async (email, name, otpCode) => {
  const subject = `[NarcoVT] Reset Password Verification OTP`;
  const text = `Hello ${name},\n\nWe received a request to reset your password. Your Verification OTP is: ${otpCode}.\n\nThis OTP will expire in 10 minutes.\n\nCommand Center Desk`;
  const html = `
    <h3>Password Recovery Desk</h3>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your verification OTP code is: <strong style="font-size: 16px; letter-spacing: 2px;">${otpCode}</strong>.</p>
    <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
  `;
  return sendEmail(email, subject, text, html);
};

module.exports = {
  sendSubmissionEmail,
  sendStatusChangeEmail,
  sendPasswordResetEmail
};

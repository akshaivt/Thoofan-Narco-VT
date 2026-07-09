/**
 * Service to handle email notifications (verification codes, OTPs, etc.).
 * (Mocked implementation for development/testing - prints messages to the console)
 */
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
    console.log('\n==================================================');
    console.log('✉️  MOCK EMAIL SENT');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text:    ${text}`);
    if (html) {
      console.log(`HTML:    Included (Length: ${html.length} chars)`);
    }
    console.log('==================================================\n');
    return true;
  }

  /**
   * Sends registration OTP email.
   * @param {string} to 
   * @param {string} otp 
   */
  async sendVerificationOTP(to, otp) {
    return this.sendEmail({
      to,
      subject: 'Operation Toofan - Verify Your Account',
      text: `Your account verification code is: ${otp}. This code is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #003366;">Operation Toofan</h2>
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
      subject: 'Operation Toofan - Password Reset OTP',
      text: `Your password recovery code is: ${otp}. This code is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #003366;">Operation Toofan</h2>
          <p>We received a request to reset your password. Use the verification code below to authorize the change:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; padding: 10px; background-color: #f5f5f5; text-align: center; border-radius: 4px; color: #003366; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #666;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    });
  }
}

module.exports = new MailService();

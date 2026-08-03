const crypto = require('crypto');

/**
 * Generates a 6-digit numeric OTP string.
 * @returns {string}
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hashes a string (OTP) using SHA-256 for secure database storage.
 * @param {string} otp 
 * @returns {string} Hashed hex string
 */
const hashOTP = (otp) => {
  if (!otp) return null;
  return crypto.createHash('sha256').update(otp).digest('hex');
};

module.exports = {
  generateOTP,
  hashOTP,
  generateRandomComplaintId
};

/**
 * Generates a secure random Complaint ID in the format OTF-YY-XXXXXX
 * where YY is the last two digits of the year and XXXXXX is 6 random alphanumeric characters.
 * @returns {string}
 */
function generateRandomComplaintId() {
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `OTF-${yearSuffix}-${randomStr}`;
}

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
  hashOTP
};

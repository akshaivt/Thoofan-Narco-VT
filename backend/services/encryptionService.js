const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY_STRING = process.env.ENCRYPTION_KEY || 'narcovt_narcotics_secret_encryption_key_2026';

// Derive a secure 32-byte key using SHA-256
const KEY = crypto.createHash('sha256').update(SECRET_KEY_STRING).digest();

/**
 * Encrypt a text string using AES-256-CBC.
 * Output is formatted as: iv_hex:encrypted_hex
 * 
 * @param {string} text 
 * @returns {string}
 */
const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt an AES-256-CBC encrypted token back into plaintext.
 * Falls back to returning the original string if decryption fails or format is invalid.
 * 
 * @param {string} hash 
 * @returns {string}
 */
const decrypt = (hash) => {
  if (!hash) return null;
  try {
    const parts = hash.split(':');
    if (parts.length !== 2) {
      // Fallback: If not formatted as encrypted text, return the input value
      return hash;
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[EncryptionService] Decryption failed, returning token:', error);
    return hash;
  }
};

module.exports = {
  encrypt,
  decrypt
};

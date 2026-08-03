const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  /**
   * Hashes a plain-text password using bcrypt.
   * @param {string} password 
   * @returns {Promise<string>}
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compares plain-text password with hashed password.
   * @param {string} enteredPassword 
   * @param {string} hashedPassword 
   * @returns {Promise<boolean>}
   */
  async comparePassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }

  /**
   * Generates a signed JWT token for the user.
   * @param {object} user 
   * @returns {string} Signed JWT
   */
  generateToken(user) {
    return jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET || 'super_secret_narcovt_key_12345!',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );
  }
}

module.exports = new AuthService();

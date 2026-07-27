const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: Verifies the JWT token and attaches the authenticated user model to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_narcovt_key_12345!');

      // Fetch user from DB, excluding password
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401);
        return next(new Error('User matching this token no longer exists'));
      }

      // Check if citizen is verified
      if (user.role === 'citizen' && !user.isVerified) {
        res.status(401);
        return next(new Error('Citizen account is not verified. Please complete OTP verification.'));
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401);
      return next(new Error('Not authorized, invalid or expired token'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, token required'));
  }
};

/**
 * Role-based authorization middleware.
 * Enables granular route protection. Superadmin can access admin actions.
 * @param {...string} roles Authorized roles (e.g. 'citizen', 'admin', 'superadmin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user profile missing'
      });
    }

    const userRole = req.user.role;

    // Super Admin inherits all Admin rights
    const isAuthorized = roles.includes(userRole) || 
                         (userRole === 'superadmin' && roles.includes('admin'));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role '${userRole}'`
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};

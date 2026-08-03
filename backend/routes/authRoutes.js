const express = require('express');
const router = express.Router();
const {
  registerCitizen,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Authentication Endpoints
router.post('/register', registerCitizen);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

const { decrypt } = require('../services/encryptionService');

// Protected Auth Profile Verification (Helper for React AuthState Refresh)
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: decrypt(req.user.name),
      email: decrypt(req.user.email),
      phone: decrypt(req.user.phone),
      role: req.user.role,
      policeStation: req.user.policeStation
    }
  });
});

module.exports = router;

const crypto = require('crypto');
const User = require('../models/User');
const authService = require('../services/authService');
const mailService = require('../services/mailService');
const { generateOTP, hashOTP } = require('../utils/helpers');
const { decrypt } = require('../services/encryptionService');
const {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validators/authValidator');

const hashEmail = (email) => {
  if (!email) return '';
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
};

/**
 * Register a new Citizen user.
 */
const registerCitizen = async (req, res, next) => {
  try {
    // 1. Validate payload
    const parsedData = registerSchema.parse(req.body);
    const { name, email, phone, password } = parsedData;

    // 2. Check if user already exists
    const emailLookup = hashEmail(email);
    const existingUser = await User.findOne({ emailLookup });
    if (existingUser) {
      res.status(400);
      throw new Error('An account with this email already exists.');
    }

    // 3. Hash password
    const hashedPassword = await authService.hashPassword(password);

    // 4. Generate OTP
    const rawOtp = generateOTP();
    const hashedOtp = hashOTP(rawOtp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 5. Create user (unverified citizen)
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'citizen',
      isVerified: false,
      otp: hashedOtp,
      otpExpires,
      otpPurpose: 'verification'
    });

    // 6. Send OTP (mock email logs to terminal console)
    await mailService.sendVerificationOTP(email, rawOtp);

    res.status(201).json({
      success: true,
      message: 'Citizen registered successfully. Please verify your account using the OTP sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP code for account verification or password recovery.
 */
const verifyOTP = async (req, res, next) => {
  try {
    // 1. Validate payload
    const parsedData = verifyOtpSchema.parse(req.body);
    const { email, otp, purpose } = parsedData;

    // 2. Find user matching email, purpose, and check if OTP has expired
    const emailLookup = hashEmail(email);
    const user = await User.findOne({
      emailLookup,
      otpPurpose: purpose,
      otpExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired OTP verification code.');
    }

    // 3. Match hashed OTP
    const hashedInputOtp = hashOTP(otp);
    if (user.otp !== hashedInputOtp) {
      res.status(400);
      throw new Error('Invalid or expired OTP verification code.');
    }

    // 4. Update user verification status if purpose was 'verification'
    if (purpose === 'verification') {
      user.isVerified = true;
      user.otp = null;
      user.otpExpires = null;
      user.otpPurpose = null;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Account verified successfully. You can now log in.'
      });
    } else {
      // For reset purpose, we verify correctness so frontend can proceed to reset page,
      // but we do not clear the OTP yet (resetPassword will verify and clear it).
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully. Please set your new password.'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Unified Login for Citizens, Admins, and Super Admins.
 * Role-detection is performed dynamically.
 */
const login = async (req, res, next) => {
  try {
    // 1. Validate payload
    const parsedData = loginSchema.parse(req.body);
    const { email, password } = parsedData;

    // 2. Find user
    const emailLookup = hashEmail(email);
    const user = await User.findOne({ emailLookup });
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    // 3. If citizen, verify account status
    if (user.role === 'citizen' && !user.isVerified) {
      res.status(401);
      throw new Error('Your account is not verified. Please verify using the OTP sent to your email.');
    }

    // 4. Verify password
    const isMatch = await authService.comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    // 5. Generate JWT token
    const token = authService.generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: decrypt(user.name),
        email: decrypt(user.email),
        phone: decrypt(user.phone),
        role: user.role,
        policeStation: user.policeStation
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password: Sends OTP to Citizen's email for password recovery.
 */
const forgotPassword = async (req, res, next) => {
  try {
    // 1. Validate payload
    const parsedData = forgotPasswordSchema.parse(req.body);
    const { email } = parsedData;

    // 2. Find user
    const emailLookup = hashEmail(email);
    const user = await User.findOne({ emailLookup });

    // For safety against email scanning, we reply with a successful response
    // even if email doesn't exist, but only send mail if user is a citizen.
    if (user && user.role === 'citizen') {
      // Generate reset OTP
      const rawOtp = generateOTP();
      const hashedOtp = hashOTP(rawOtp);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.otp = hashedOtp;
      user.otpExpires = otpExpires;
      user.otpPurpose = 'reset';
      await user.save();

      // Send mail
      await mailService.sendPasswordResetOTP(email, rawOtp);
    } else if (user && user.role !== 'citizen') {
      console.log(`[Forgot Password] Reset denied for administrative account: ${email}`);
    }

    res.status(200).json({
      success: true,
      message: 'If a citizen account matches that email, a password recovery OTP has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using OTP verification.
 */
const resetPassword = async (req, res, next) => {
  try {
    // 1. Validate payload
    const parsedData = resetPasswordSchema.parse(req.body);
    const { email, otp, newPassword } = parsedData;

    // 2. Find user matching email, purpose, and check if OTP has expired
    const emailLookup = hashEmail(email);
    const user = await User.findOne({
      emailLookup,
      otpPurpose: 'reset',
      otpExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired OTP verification code.');
    }

    // 3. Match OTP hash
    const hashedInputOtp = hashOTP(otp);
    if (user.otp !== hashedInputOtp) {
      res.status(400);
      throw new Error('Invalid or expired OTP verification code.');
    }

    // 4. Hash new password
    const hashedPassword = await authService.hashPassword(newPassword);

    // 5. Update user password and clear OTP properties
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    user.otpPurpose = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCitizen,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword
};

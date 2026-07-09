const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['citizen', 'admin', 'superadmin'],
      default: 'citizen'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      type: String,
      default: null
    },
    otpExpires: {
      type: Date,
      default: null
    },
    otpPurpose: {
      type: String,
      enum: ['verification', 'reset', null],
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);

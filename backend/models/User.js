const mongoose = require('mongoose');
const crypto = require('crypto');
const { encrypt } = require('../services/encryptionService');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    // The encrypted email string
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true
    },
    // Hashed email index for deterministic query searches
    emailLookup: {
      type: String,
      unique: true,
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
    policeStation: {
      type: String,
      default: null
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

// Pre-save encryption middleware hook
userSchema.pre('save', function (next) {
  // Only encrypt if modified
  if (this.isModified('email') && this.email) {
    const normalizedEmail = this.email.toLowerCase().trim();
    // Deterministic index hash
    this.emailLookup = crypto.createHash('sha256').update(normalizedEmail).digest('hex');
    this.email = encrypt(normalizedEmail);
  }

  if (this.isModified('name') && this.name) {
    // If name is already encrypted (contains ':'), skip to avoid double encrypting
    if (!this.name.includes(':')) {
      this.name = encrypt(this.name.trim());
    }
  }

  if (this.isModified('phone') && this.phone) {
    if (!this.phone.includes(':')) {
      this.phone = encrypt(this.phone.trim());
    }
  }

  next();
});

module.exports = mongoose.model('User', userSchema);

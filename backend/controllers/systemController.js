const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const authService = require('../services/authService');
const { decrypt } = require('../services/encryptionService');

// Ensure backup folder exists
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Triggers a full JSON-dump database backup.
 * Protected: Super Admin only.
 */
const exportBackup = async (req, res, next) => {
  try {
    const users = await User.find({});
    const complaints = await Complaint.find({});
    const logs = await AuditLog.find({});
    const notifications = await Notification.find({});

    const backupData = {
      timestamp: new Date().toISOString(),
      users,
      complaints,
      logs,
      notifications
    };

    const fileName = `Backup_${Date.now()}.json`;
    const filePath = path.join(BACKUP_DIR, fileName);

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');

    res.status(200).json({
      success: true,
      message: 'Database backup file exported successfully.',
      fileName,
      filePath
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restores collections from the most recent or specified backup file.
 * Protected: Super Admin only.
 */
const restoreBackup = async (req, res, next) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a)); // Sort descending to get latest

    if (files.length === 0) {
      res.status(404);
      throw new Error('No backup archive files found to restore.');
    }

    const latestFile = files[0];
    const filePath = path.join(BACKUP_DIR, latestFile);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const backupData = JSON.parse(rawData);

    // 1. Wipe collections
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});

    // 2. Insert records
    if (backupData.users && backupData.users.length > 0) {
      await User.insertMany(backupData.users);
    }
    if (backupData.complaints && backupData.complaints.length > 0) {
      await Complaint.insertMany(backupData.complaints);
    }
    if (backupData.logs && backupData.logs.length > 0) {
      await AuditLog.insertMany(backupData.logs);
    }
    if (backupData.notifications && backupData.notifications.length > 0) {
      await Notification.insertMany(backupData.notifications);
    }

    res.status(200).json({
      success: true,
      message: `Database restored successfully from: ${latestFile}.`,
      fileRestored: latestFile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve system audit logs list.
 * Protected: Super Admin only.
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({})
      .populate('userId', 'name email role')
      .populate('complaintId', 'complaintId activityType')
      .sort({ timestamp: -1 });

    const formattedLogs = logs.map(log => {
      const item = log.toObject();
      if (item.userId) {
        item.userId.name = decrypt(item.userId.name);
        item.userId.email = decrypt(item.userId.email);
      }
      return item;
    });

    res.status(200).json({
      success: true,
      count: formattedLogs.length,
      logs: formattedLogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active configuration metrics.
 * Protected: Super Admin only.
 */
const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const decryptsCount = await AuditLog.countDocuments({ action: 'REVEAL_IDENTITY' });
    const duplicateCount = await Complaint.countDocuments({ duplicateScore: { $gt: 80 } });

    // AI Status Indicator check
    const isGeminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY');

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalComplaints,
        decryptsCount,
        duplicateCount,
        geminiStatus: isGeminiConfigured ? 'Active / Online' : 'Simulation Mode / Offline',
        cloudinaryStatus: (process.env.CLOUDINARY_CLOUD_NAME) ? 'Configured / Online' : 'Local Storage Mode'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve list of administrative accounts.
 * Protected: Super Admin only.
 */
const getAdminsList = async (req, res, next) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
    const formatted = admins.map(a => ({
      id: a._id,
      name: decrypt(a.name),
      email: decrypt(a.email),
      phone: decrypt(a.phone),
      role: a.role,
      createdAt: a.createdAt
    }));

    res.status(200).json({
      success: true,
      admins: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Administrative account.
 * Protected: Super Admin only.
 */
const createAdminAccount = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400);
      throw new Error('Mandatory name, email, password, and role fields are required.');
    }

    const emailLookup = crypto
      .createHash('sha256')
      .update(email.toLowerCase().trim())
      .digest('hex');

    const existing = await User.findOne({ emailLookup });
    if (existing) {
      res.status(400);
      throw new Error('An account with this email already exists.');
    }

    const hashedPassword = await authService.hashPassword(password);

    const newAdmin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: role === 'superadmin' ? 'superadmin' : 'admin',
      isVerified: true // Administrative accounts are pre-verified
    });

    res.status(201).json({
      success: true,
      message: `Administrative ${role} account created successfully.`,
      admin: {
        id: newAdmin._id,
        name: name,
        email: email,
        role: newAdmin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportBackup,
  restoreBackup,
  getAuditLogs,
  getSystemStats,
  getAdminsList,
  createAdminAccount
};

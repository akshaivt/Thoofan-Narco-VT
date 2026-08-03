const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

class CloudinaryService {
  constructor() {
    this.isConfigured = false;
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if configuration exists and is not the default placeholder
    if (
      cloudName && cloudName !== 'your_cloudinary_cloud_name' &&
      apiKey && apiKey !== 'your_cloudinary_api_key' &&
      apiSecret && apiSecret !== 'your_cloudinary_api_secret'
    ) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
      });
      this.isConfigured = true;
      console.log('[CloudinaryService] Configured successfully.');
    } else {
      console.warn('[CloudinaryService] Warning: Credentials not configured. Storing files locally.');
    }
  }

  /**
   * Uploads file to Cloudinary.
   * On success, deletes the local file.
   * On fallback (no credentials / failure), returns the local hosting path relative to the backend.
   * @param {string} localFilePath Absolute path to local file
   * @returns {Promise<string>} File URL
   */
  async uploadFile(localFilePath) {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      return '';
    }

    const filename = path.basename(localFilePath);
    
    // Determine resource type by extension
    const ext = path.extname(localFilePath).toLowerCase();
    let resourceType = 'image';
    if (['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'].includes(ext)) {
      resourceType = 'video';
    }

    // Fallback if not configured
    if (!this.isConfigured) {
      // Return relative path to backend: /uploads/filename
      return `/uploads/${filename}`;
    }

    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        resource_type: resourceType,
        folder: 'narco_vt'
      });

      // Remove file from local disk to save server space
      fs.unlink(localFilePath, (err) => {
        if (err) console.error(`[CloudinaryService] Error deleting local file: ${err.message}`);
      });

      return result.secure_url;
    } catch (error) {
      console.error(`[CloudinaryService] Cloudinary Upload failed: ${error.message}. Returning local URL.`);
      // Return local fallback url if Cloudinary api fails
      return `/uploads/${filename}`;
    }
  }
}

module.exports = new CloudinaryService();

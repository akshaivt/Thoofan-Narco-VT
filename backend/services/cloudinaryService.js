const cloudinary = require('cloudinary').v2;

/**
 * Service to handle media uploads to Cloudinary.
 * (Stub implementation for Phase 1 - to be fully implemented in future phases)
 */
class CloudinaryService {
  constructor() {
    // Configure Cloudinary if environment variables are present
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
    }
  }

  /**
   * Uploads local file to Cloudinary.
   * @param {string} filePath 
   * @returns {Promise<object>} Mock or real upload result
   */
  async uploadMedia(filePath) {
    console.log('[CloudinaryService] Uploading file to Cloudinary (Stub):', filePath);
    return {
      secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      public_id: 'sample_id_123',
      format: 'jpg',
      bytes: 12345
    };
  }
}

module.exports = new CloudinaryService();

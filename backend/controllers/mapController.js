const Complaint = require('../models/Complaint');

/**
 * Retrieve geospatial locations of all complaints with coordinates.
 * Protected: Admin & Super Admin only.
 */
const getMapLocations = async (req, res, next) => {
  try {
    // Retrieve only records containing non-null latitude and longitude parameters
    const locations = await Complaint.find(
      {
        latitude: { $ne: null },
        longitude: { $ne: null }
      },
      'complaintId status district place priority latitude longitude incidentDate'
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMapLocations
};

const Complaint = require('../models/Complaint');

/**
 * Fetch visual statistics for Admin Analytics.
 * Protected: Admin & Super Admin only.
 */
const getAnalyticsSummary = async (req, res, next) => {
  try {
    // 1. Basic counters
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const underInvestigation = await Complaint.countDocuments({ status: 'Under Investigation' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ status: 'Rejected' });
    const highPriority = await Complaint.countDocuments({ priority: 'High' });

    // 2. Aggregate complaints by month (Format: YYYY-MM)
    const complaintsByMonth = await Complaint.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Aggregate complaints by district
    const complaintsByDistrict = await Complaint.aggregate([
      {
        $group: {
          _id: '$district',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 4. Status distribution
    const statusDistribution = [
      { name: 'Pending', value: pending },
      { name: 'Under Investigation', value: underInvestigation },
      { name: 'Resolved', value: resolved },
      { name: 'Rejected', value: rejected }
    ];

    // 5. Drug Activity Type distribution
    const activityDistribution = await Complaint.aggregate([
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      summary: {
        total,
        pending,
        underInvestigation,
        resolved,
        rejected,
        highPriority
      },
      complaintsByMonth: complaintsByMonth.map(item => ({
        month: item._id,
        count: item.count
      })),
      complaintsByDistrict: complaintsByDistrict.map(item => ({
        district: item._id,
        count: item.count
      })),
      statusDistribution,
      activityDistribution: activityDistribution.map(item => ({
        name: item._id,
        value: item.count
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsSummary
};

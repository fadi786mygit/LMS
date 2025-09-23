const User = require('../../models/User');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');
const Payment = require('../../models/Payment');

exports.getAdminDashboard = async (req, res) => {
  try {
    // Total number of users
    const totalUsers = await User.countDocuments();
    // Total number of courses
    
    const totalCourses = await Course.countDocuments();

    // Total number of enrollments
    const totalEnrollments = await Enrollment.countDocuments();

    // Active Courses (assuming you have an "isActive" field)
    const activeCourses = await Course.countDocuments({ isActive: true });

    // New Enrollments (last 7 days)
    const newEnrollments = await Enrollment.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Total Revenue from successful payments
    const totalRevenueData = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;

    // Top 4 Performing Courses
    const topCourses = await Course.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'course_enrollments'
        }
      },
      {
        $addFields: {
          enrollmentsCount: { $size: '$course_enrollments' }
        }
      },
      { $sort: { enrollmentsCount: -1 } },
      { $limit: 4 },
      { $project: { title: 1, enrollmentsCount: 1 } }
    ]);

    // Dummy User Growth Chart
    const userGrowth = await User.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" }
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
]);

const formattedUserGrowth = userGrowth.map(item => ({
  date: `${item._id.day}/${item._id.month}`,
  count: item.count
}));

    // ✅ Send all data in one response
    res.json({
      metrics: {
        totalUsers,
        activeCourses,
        newEnrollments,
        totalRevenue,
        totalCourses,
        totalEnrollments
      },
      topCourses,
      userGrowth: formattedUserGrowth  
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
};

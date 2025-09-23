const Course = require("../models/Course");

const calculateProgress = async (courseId, completedContent) => {
  const course = await Course.findById(courseId).lean();
  const totalContent = course?.content?.length || 0;

  if (totalContent === 0) return 0;

  const completedSet = new Set(
    completedContent
      .filter((c) => c && c.contentId) // ✅ avoid undefined
      .map((c) => c.contentId.toString())
  );

  const completedCount = completedSet.size;

  return Math.round((completedCount / totalContent) * 100);
};

module.exports = calculateProgress;

const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment'); // ✅ Import model
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary, uploadToCloudinary } = require("../config/cloudinary");




// @desc    Get courses by logged-in instructor
// @route   GET /api/courses/instructor
// @access  Private (Instructor only)
const getInstructorCourses = asyncHandler(async (req, res) => {
  let courses;

  if (req.user.role === 'admin') {
    // Admin sees all courses
    courses = await Course.find().populate('instructor', 'fullName');
  } else {
    // Instructor sees only their own
    courses = await Course.find({ instructor: req.user._id }).populate('instructor', 'fullName');
  }

  res.json(courses);
});


// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Instructor only)
const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    level,
    price,
    thumbnail,
    content = [],
    instructor, // From form when admin, optional
  } = req.body;

  let instructorId;

  if (req.user.role === "admin") {
    if (!instructor) {
      return res.status(400).json({ message: "Admin must select an instructor." });
    }
    instructorId = instructor;
  } else if (req.user.role === "instructor") {
    instructorId = req.user._id;
  } else {
    return res.status(403).json({ message: "Unauthorized: Only admins or instructors can create courses." });
  }

  const course = new Course({
    title,
    description,
    category,
    level,
    price,
    thumbnail,
    content,
    instructor: instructorId,
  });

  const createdCourse = await course.save();
  res.status(201).json(createdCourse);
});



// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  // ✅ Authorization check
  if (
    (!course.instructor || course.instructor?.toString() !== req.user?._id?.toString()) &&
    req.user?.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this course");
  }

  // ✅ Basic fields
  const { title, description, category, level, price } = req.body;
  if (title) course.title = title;
  if (description) course.description = description;
  if (category) course.category = category;
  if (level) course.level = level;
  if (price) course.price = price;

  // ✅ Thumbnail upload
  if (req.files && req.files.length > 0) {
    const thumb = req.files.find((f) => f.fieldname === "thumbnail");
    if (thumb) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "lms_thumbnails", resource_type: "image" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          uploadStream.end(thumb.buffer);
        });
        course.thumbnail = uploadResult.secure_url;
      } catch (err) {
        console.error("Thumbnail upload error:", err);
      }
    }
  }

  // ✅ Build a map of files for content
  const fileMap = {};
  req.files.forEach((file) => {
    const match = file.fieldname.match(/^contents\[(\d+)]\[file\]$/);
    if (match) fileMap[match[1]] = file;
  });

  // ✅ Loop through request body content items
  const contentIndexes = new Set();
  Object.keys(req.body).forEach((key) => {
    const match = key.match(/^contents\[(\d+)]\[([a-zA-Z_]+)]$/);
    if (match) contentIndexes.add(parseInt(match[1], 10));
  });

  for (let index of contentIndexes) {
    const _id = req.body[`contents[${index}][_id]`];
    const ctitle = req.body[`contents[${index}][ctitle]`];
    const type = req.body[`contents[${index}][type]`];
    let url = req.body[`contents[${index}][url]`] || "";

    // Handle file upload
    if (fileMap[index]) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "lms_contents", resource_type: type === "video" ? "video" : "raw" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          uploadStream.end(fileMap[index].buffer);
        });
        url = uploadResult.secure_url;
      } catch (err) {
        console.error("Content file upload error:", err);
      }
    }

    if (ctitle && type && (url || fileMap[index])) {
      if (_id) {
        // ✅ Update existing content
        const existing = course.content.id(_id);
        if (existing) {
          existing.ctitle = ctitle;
          existing.type = type;
          existing.url = url;
        }
      } else {
        // ✅ Add new content
        course.content.push({ ctitle, type, url });
      }
    }
  }

  const updatedCourse = await course.save();

  res.json({
    success: true,
    message: "Course updated successfully",
    course: updatedCourse,
  });
});

  // @desc    Delete course
  // @route   DELETE /api/courses/:id
  // @access  Private (Instructor/Admin)
  const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (
      (!course.instructor || course.instructor?.toString() !== req.user?._id?.toString()) &&
      req.user?.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Not authorized to delete this course');
    }

    await course.deleteOne(); // ✅ fix here
    res.json({ message: 'Course deleted successfully' });
  });



// @desc    Get all courses (for admin)
// @route   GET /api/courses
// @access  Private (Admin only)
const getAllCourses = asyncHandler(async (req, res) => {
  const { category } = req.query;

  let filter = {};
  if (category) {
    filter.category = category; // only fetch courses with matching category
  }

  const courses = await Course.find(filter)
    .populate("instructor", "fullName email")
    .sort({ createdAt: -1 });

  res.json(courses);
});



// @desc    Get course content for students
// @route   GET /api/courses/:id/content
// @access  Private (Student enrolled in course)
const getCourseContent = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id || req.user._id;

  // Check if user is enrolled in this course
  const enrollment = await Enrollment.findOne({
    user: userId,
    course: courseId
  });

  if (!enrollment) {
    return res.status(403).json({ message: "Not enrolled in this course" });
  }

  const course = await Course.findById(courseId).select('content title');

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  res.json(course.content);
});


const enrollInCourse = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const courseId = req.params.id; // ✅ from URL, not body

  // 1. Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // 2. Prevent duplicate enrollment
  const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
  if (existingEnrollment) {
    return res.status(400).json({ message: "Already enrolled in this course" });
  }

  // 3. Create enrollment record
  const enrollment = await Enrollment.create({
    user: userId,
    course: courseId,
  });

  res.status(201).json({
    message: "Enrolled successfully",
    enrollment,
  });
});
// Get user enrolled courses
const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).populate('enrolledCourses');
    res.status(200).json(user.enrolledCourses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyCourses = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user.id })
    .populate("course");

  // ✅ FIX: Filter out enrollments with null courses
  const courses = enrollments
    .map((enrollment) => enrollment.course)
    .filter(course => course !== null);

  res.json(courses);
});

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Private (Instructor/Admin)
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'fullName email');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.json(course);
});


// instructor creates course

// Create course first (no content yet)
const createCourseByInstructor = async (req, res) => {
  try {
    const { title, description, category, level, price, thumbnail } = req.body;

    const newCourse = new Course({
      title,
      description,
      category,
      level,
      price,
      thumbnail,
      instructor: req.user._id, // instructor logged in
    });

    await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


// Add content to a specific course
// Add content to a specific course
const addContentToCourse = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to add content" });
    }

    const newContents = [];
    let index = 0;

    while (req.body[`ctitle_${index}`] !== undefined) {
      const ctitle = req.body[`ctitle_${index}`];
      const type = req.body[`type_${index}`] || "video";
      let url = req.body[`url_${index}`] || "";

      // Find file for this index
      const file = req.files ? req.files.find(f => f.fieldname === `file_${index}`) : null;

      if (!ctitle || ctitle.trim() === "") {
        return res.status(400).json({ message: `Content item ${index + 1} must have a title` });
      }

      if (!file && (!url || url.trim() === "")) {
        return res.status(400).json({ message: `Content item ${index + 1} must have either a file or URL` });
      }

      // ✅ Upload to Cloudinary with correct type
      if (file) {
        try {
          let resourceType = "raw"; // default
          if (type === "video") resourceType = "video";
          if (type === "pdf") resourceType = "raw"; // PDFs go to "raw"

          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "lms_contents",
                resource_type: resourceType,
                format: type === "pdf" ? "pdf" : undefined, // force pdf format if needed
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(file.buffer);
          });

          url = uploadResult.secure_url;
        } catch (err) {
          console.error("❌ Cloudinary upload failed:", err);
          return res.status(500).json({ message: `File upload failed: ${err.message}` });
        }
      }

      newContents.push({
        ctitle: ctitle.trim(),
        type,
        url,
        createdAt: new Date(),
      });

      index++;
    }

    if (newContents.length === 0) {
      return res.status(400).json({ message: "No content data received" });
    }

    course.content.push(...newContents);
    await course.save();

    res.status(201).json({
      success: true,
      message: `Added ${newContents.length} content item(s) successfully`,
      courseId: course._id,
      courseTitle: course.title,
      totalContent: course.content.length,
    });

  } catch (error) {
    console.error("💥 Error in addContentToCourse:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});



// Add multiple quizzes to a course
const addQuizToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { quizzes } = req.body; // expect an array of quizzes

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      return res.status(400).json({ message: "Quizzes must be a non-empty array" });
    }

    // Push all quizzes into the course
    course.quizzes.push(...quizzes);
    await course.save();

    res.status(201).json({ message: "Quizzes added successfully", course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).select("quizzes");

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course.quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteQuiz = asyncHandler(async (req, res) => {
  const { courseId, quizId } = req.params;

  // Find course with quizzes
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  // Authorization: only the course's instructor or admin
  const isOwner = course.instructor?.toString() === req.user?._id?.toString();
  const isAdmin = req.user?.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to delete a quiz for this course");
  }

  // Find quiz subdocument
  const quizSubdoc = course.quizzes.id(quizId);
  if (!quizSubdoc) {
    res.status(404);
    throw new Error("Quiz not found for this course");
  }


  quizSubdoc.deleteOne();
  await course.save();

  res.json({ message: "Quiz deleted successfully" });
});

const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course belongs to this instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view students of this course" });
    }

    // Find all enrollments for this course
    const enrollments = await Enrollment.find({ course: courseId })
      .populate("user", "fullName email");

    res.json(enrollments);
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const updateQuiz = async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const { question, options, correctAnswer } = req.body;

    // Validate correctAnswer index
    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ msg: "Invalid correct answer index" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ msg: "Course not found" });

    const quiz = course.quizzes.id(quizId);
    if (!quiz) return res.status(404).json({ msg: "Quiz not found" });

    // ✅ Update fields
    quiz.question = question;
    quiz.options = options;
    quiz.correctAnswer = Number(correctAnswer);

    await course.save();
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const getQuizById = async (req, res) => {
  try {
    const { courseId, quizId } = req.params;

    // Find the course and quiz
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const quiz = course.quizzes.id(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ message: "Server error" });
  }
};



const deleteCourseContent = asyncHandler(async (req, res) => {
  const { id, contentId } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // ✅ Check if content exists in `course.content`
  const contentIndex = course.content.findIndex(
    (c) => c._id.toString() === contentId
  );

  if (contentIndex === -1) {
    return res.status(404).json({ message: "Content not found in course" });
  }

  // ✅ Remove the content
  course.content.splice(contentIndex, 1);
  await course.save();

  res.json({
    message: "Content deleted successfully",
    course,
  });
});



module.exports = {
  createCourse,
  getInstructorCourses,
  updateCourse,
  getMyCourses,
  deleteCourse,
  getAllCourses,
  getCourseById,
  enrollInCourse,
  getEnrolledCourses,
  createCourseByInstructor,
  addQuizToCourse,
  getQuizzesByCourse,
  deleteQuiz,
  getCourseStudents,
  getQuizById,
  updateQuiz,
  getCourseContent,
  addContentToCourse,
  deleteCourseContent
};

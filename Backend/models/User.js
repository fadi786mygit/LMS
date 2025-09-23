const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['admin', 'instructor', 'student'],
      default: 'student',
    },
    isVerified: { type: Boolean, default: false },
    profileImage: { type: String, default: '' },

    // 🟢 New field for enrollments
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;

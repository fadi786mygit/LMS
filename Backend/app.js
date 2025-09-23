const express = require('express');
const cors = require('cors');
const app = express();
const studentQuizRoutes = require("./routes/studentQuizRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const videoRoutes = require("./routes/videoRoutes");





app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // ✅ FIXED
app.use('/api/instructor', require('./routes/instructorRoutes')); // ✅ FIXED
app.use("/api/student", studentQuizRoutes);
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use("/api/attempts", attemptRoutes);
app.use("/api/videos", videoRoutes);





// Register routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes')); // ✅ FIXED

module.exports = app;

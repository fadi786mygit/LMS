const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();
const cors = require('cors');


// Connect to MongoDB
connectDB();





// ✅ Use app from app.js
const app = require('./app');

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/certificates", express.static(path.join(__dirname, "certificates")));





app.use(express.json());
app.use(cors());

// ✅ Register admin routes here
const adminDashboardRoutes = require('./routes/admin/dashboardRoutes');
app.use('/api/admin/dashboard', adminDashboardRoutes);


// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT,  () => console.log(`🚀 Server running on port ${PORT}`));

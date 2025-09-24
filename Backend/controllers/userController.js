const VerificationCode = require('../models/VerificationCode');
const sendEmail = require('../utils/sendEmail');

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');




// @desc    Request email verification
// @route   POST /api/users/request-verification
// @access  Public
const requestEmailVerification = asyncHandler(async (req, res) => {
  const { email, username, fullName, phone} = req.body;

  if (!email || !username || !fullName || !phone ) {
    res.status(400);
    return res.status(400).json({ message: 'All fields (fullName, username, email, phone) are required' });
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res.status(400).json({ message: 'Email or username already in use' });
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await VerificationCode.create({ email, username, fullName, phone, code, expiresAt });

  const html = `
    <h3>Your Cyber LMS verification code:</h3>
    <h2>${code}</h2>
    <p>This code will expire in 10 minutes.</p>
  `;

  await sendEmail(email, 'Verify your Cyber LMS Email', html);

  res.status(200).json({ message: 'Verification code sent to email' });
});



// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, role } = req.body;

  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    username, // ✅ THIS IS REQUIRED
    email,
    password: hashedPassword,
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role), // ✅ this is important!
    });
  } else {
    return res.status(400).json({ message: 'Invalid user data' });
  }
});


// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Email not registered' });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
   return res.status(401).json({ message: 'Password is not correct'});
  }

res.json({
  _id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  token: generateToken(user._id, user.role), // ✅ this is important!
});


});



const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required." });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found." });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await VerificationCode.create({
  email,
  code,
  username: user.username,
  fullName: user.fullName,
  phone: user.phone,
  expiresAt: new Date(Date.now() + 10 * 60 * 1000)
});


  await sendEmail(email, 'Password Reset Code', `Your password reset code is: ${code}`);

  res.status(200).json({ message: "Verification code sent to email." });
};

const getUsers = async (req, res) => {
  try{

  const users = await User.find({});
  res.json(users);
  }
  catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Add User (Admin)
const addUser = async (req, res) => {
  try {
    const { fullName, username, email, password, role, isVerified } = req.body;

    if (!fullName || !username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
      role,
      isVerified: isVerified || false,
    });

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Single User (Admin)
// const getSingleUser = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required." });
//     }
 
//     const user = await User.findOne({_id: userId});
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//    res.json({
//       fullName: user.fullName,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//       isVerified: user.isVerified
//     });
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// Delete User (Admin)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await User.deleteOne({ _id: userId });
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await User.findById(userId).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user); // Send the whole user object
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullName, username, email, role, isVerified } = req.body;
    
    if (!userId || !fullName || !username || !email || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        username,
        email,
        role,
        isVerified: isVerified === true || isVerified === "true"
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all instructors (Admin)
const getInstructors = asyncHandler(async (req, res) => {
  const instructors = await User.find({ role: 'instructor' }).select('_id fullName email');
  res.json(instructors);
});




const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id || req.user.id).select('-password');

        if (!user || user.role !== 'user') {
            return res.status(403).json({ message: 'Access denied. Not a regular user.' });
        }

        const fullImageUrl = user.profileImage
            ? `${req.protocol}://${req.get('host')}/uploads/${user.profileImage}`
            : `${req.protocol}://${req.get('host')}/images/default-image.png`;

        res.status(200).json({
            ...user.toObject(),
            profileImage: fullImageUrl,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload or change user profile picture
// @desc    Upload or change user profile picture
// Upload or change user profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const { uploadToCloudinary } = require("../config/cloudinary");

    const result = await uploadToCloudinary(
      req.file.buffer,
      "profile_images",
      req.file.mimetype,
      `user_${user._id}_${Date.now()}`
    );

    user.profileImage = result.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImage: result.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// @desc    Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const { fullName, email, currentPassword, newPassword, profileImage } = req.body;

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (profileImage) user.profileImage = profileImage;

    // Handle password change if newPassword is provided
    if (newPassword) {
      // Check if currentPassword is provided
      if (!currentPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is required to set a new password' 
        });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }
      
      // Hash and set new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage || null
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  registerUser,
  loginUser,
  requestEmailVerification,
  getUsers,
  requestPasswordReset,
  addUser,
  getSingleUser,
  deleteUser,
  updateUser,
  getInstructors,
  uploadProfilePicture,
  getUserProfile,
  updateUserProfile
 
};

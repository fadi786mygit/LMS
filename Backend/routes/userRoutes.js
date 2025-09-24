const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload')
const { protect} = require('../middleware/authMiddleware');

const userController = require('../controllers/userController');

// Auth-related user actions
router.post('/request-verification', userController.requestEmailVerification);
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/request-password-reset', userController.requestPasswordReset); // password reset request
router.get('/get-users', userController.getUsers); // get all users
router.get('/get-users/:id', userController.getSingleUser);  // get single user
router.post('/add-user', userController.addUser);  // add user
router.delete('/delete-user/:id', userController.deleteUser); // deleting user
router.put('/update-user/:id', userController.updateUser); // update user details
router.get('/instructors', userController.getInstructors); // get all instructors
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);
router.post("/upload",protect, upload.single("profileImage"), userController.uploadProfilePicture);



module.exports = router;

const express = require('express');
const router = express.Router();

const {verifyCode, setPassword,} = require('../controllers/authController');

router.post('/verify-code', verifyCode);
router.post('/set-password', setPassword);


module.exports = router;

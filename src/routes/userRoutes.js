const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Test Route
router.get('/test', (req, res) => {
   res.send('Test route is working!');
});

// User registration
router.post('/register', userController.registerUser);

// Request OTP for password reset
router.post('/request-reset', userController.requestReset);

// Reset password with OTP
router.post('/reset-password', userController.resetPassword);

module.exports = router;

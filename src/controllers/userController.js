const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const sendOTPEmail = require('../utils/emailUtils'); 

// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// User Registration
exports.registerUser = async (req, res) => {
   const { email, password } = req.body;

   try {
       // Hash the password
       const hashedPassword = await bcrypt.hash(password, 10);
       const newUser = new User({ email, password: hashedPassword });

       // Save new user
       await newUser.save();
       res.status(201).send('User registered successfully');
   } catch (error) {
       res.status(400).send('Error registering user: ' + error.message);
   }
};

// Request OTP for password reset
exports.requestReset = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send('User not found');
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiration = Date.now() + 300000; // 5 minutes
    await user.save();

    await sendOTPEmail(email, otp);
    res.send('OTP sent to your email');
};

// Reset password
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpiration < Date.now()) {
        return res.status(400).send('Invalid OTP or OTP expired');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null; 
    user.otpExpiration = null; 
    await user.save();

    res.send('Password reset successfully');
};

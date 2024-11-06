require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpiration: { type: Date },
});

const User = mongoose.model('User', userSchema);

// Function to generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
async function sendOTPEmail(recipientEmail, otp) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    let mailOptions = {
        from: process.env.EMAIL,
        to: recipientEmail,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${recipientEmail}: ${otp}`);
    } catch (error) {
        console.error('Error sending OTP: ', error);
    }
}

// User Registration Endpoint
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    
    try {
        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(400).send('Error registering user: ' + error.message);
    }
});

// Request OTP for password reset
app.post('/request-reset', async (req, res) => {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send('User not found');
    }

    // Generate OTP and set expiration time
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiration = Date.now() + 300000; // OTP valid for 5 minutes
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);
    res.send('OTP sent to your email');
});

// Verify OTP and reset password
app.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpiration < Date.now()) {
        return res.status(400).send('Invalid OTP or OTP expired');
    }

    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null; // Clear OTP after use
    user.otpExpiration = null; // Clear expiration
    await user.save();

    res.send('Password reset successfully');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

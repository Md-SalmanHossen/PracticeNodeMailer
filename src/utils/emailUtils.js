const nodemailer = require('nodemailer');

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

// Export the function
module.exports = sendOTPEmail;

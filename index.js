require('dotenv').config(); // Ensure dotenv is configured

const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./src/config/db'); // Check the correct path
const userRoutes = require('./src/routes/userRoutes'); // Correct path

const app = express();

app.use(express.json()); // For parsing JSON
app.use(bodyParser.json()); // Alternative JSON parser

// Connect to MongoDB
connectDB();

// Use user routes (with correct API base path)
app.use('/api/users', userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

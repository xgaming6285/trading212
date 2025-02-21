// Import required dependencies
const express = require('express'); // Web framework for Node.js
const cors = require('cors'); // Enable Cross-Origin Resource Sharing
const connectDB = require('./config/db'); // Database connection function
require('dotenv').config(); // Load environment variables from .env file

// Create Express application instance
const app = express();

// Connect to MongoDB database
// This establishes the connection to the database configured in config/db.js
connectDB();

// Set up middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// Register API routes
// All routes defined in routes/api.js will be prefixed with /api
app.use('/api', require('./routes/api'));

// Get port from environment variables or use 5000 as default
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Log when server starts
}); 
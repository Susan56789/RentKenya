require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5050;

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded images
app.use('/uploads', express.static(uploadDir));

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://rent254.onrender.com'] 
      : ['http://localhost:8080', 'http://localhost:3000'], 
    credentials: true, // Required for cookies, authorization headers with HTTPS
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // Preflight results cache time in seconds
  };
  
  // Apply CORS middleware
  app.use(cors(corsOptions));
  
  // Handle preflight requests
  app.options('*', cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB and start the server
const run = async () => {
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        // Store database collections in `app.locals`
        const database = client.db('rentkenya');
        app.locals.users = database.collection('users');
        app.locals.houses = database.collection('houses');

        // Import and use routes
        const userRoutes = require('./routes/users');
        const houseRoutes = require('./routes/houses');

        app.use('/api/users', userRoutes);
        app.use('/api/houses', houseRoutes);

        // Graceful shutdown handling
        const closeDatabase = async () => {
            console.log('🔄 Closing database connection...');
            await client.close();
            console.log('✅ MongoDB connection closed');
            process.exit(0);
        };

        process.on('SIGINT', closeDatabase);
        process.on('SIGTERM', closeDatabase);

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Error connecting to the database:', error.message);
        process.exit(1); // Exit process if connection fails
    }
};

run();

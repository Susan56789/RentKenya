require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5050;

// MongoDB URI
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Middleware setup
const corsOptions = {
    origin: ['http://localhost:8080', 'https://rent254.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
  };

  
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
const run = async () => {
    try {
        await client.connect();
        console.log('Connected to the database');
        
        const database = client.db('rentkenya');
        app.locals.users = database.collection('users');
        app.locals.houses = database.collection('houses');
        
        // Import routes
        const userRoutes = require('./routes/users');
        const houseRoutes = require('./routes/houses');
        
        // Use routes
        app.use('/api/users', userRoutes);
        app.use('/api/houses', houseRoutes);
        
        process.on('SIGINT', async () => {
            await client.close();
            console.log('MongoDB connection closed');
            process.exit(0);
        });
        
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

run();
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path'); // Ensure path is imported

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5050;

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB URI
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });

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

// Connect to MongoDB and start the server
const run = async () => {
    try {
        await client.connect();
        console.log('Connected to the database');

        // Store database collections in `app.locals`
        const database = client.db('rentkenya');
        app.locals.users = database.collection('users');
        app.locals.houses = database.collection('houses');

        // Import and use routes
        const userRoutes = require('./routes/users');
        const houseRoutes = require('./routes/houses');

        app.use('/api/users', userRoutes);
        app.use('/api/houses', houseRoutes);

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            await client.close();
            console.log('MongoDB connection closed');
            process.exit(0);
        });

        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1); // Exit process if connection fails
    }
};

run();

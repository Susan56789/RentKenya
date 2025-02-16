// server.js
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
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const userRoutes = require('./routes/users');
const houseRoutes = require('./routes/houses');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/houses', houseRoutes);

// Connect to MongoDB
const run = async () => {
    try {
        await client.connect();
        console.log('Connected to the database');

        const database = client.db('rentkenya');
        app.locals.users = database.collection('users');
        app.locals.houses = database.collection('houses');

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

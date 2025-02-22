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


// Allowed origins
const allowedOrigins = [
    'https://rent254.onrender.com',
    'https://rentkenya.onrender.com',
    'http://localhost:8080',
    'http://localhost:5000'
];

//CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 204, // Prevents unnecessary 200 responses for preflight requests
    maxAge: 86400 // Cache preflight response for 24 hours
};

// Apply CORS Middleware **before routes**
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// Additional CORS Headers
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    next();
});

// Handle CORS errors
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: 'CORS Error',
            message: 'Origin not allowed by CORS policy'
        });
    }
    next(err);
});

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

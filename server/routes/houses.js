const express = require('express');
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});


const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .jpeg, .jpg and .png format allowed!'));
    }
});

// Add House - requires authentication
router.post('/', auth, upload.array('photos', 5), async (req, res) => {
    try {
        const { location, price, datePosted, type, purpose } = req.body;
        
        // Validate required fields
        if (!location || !price || !datePosted || !type || !purpose) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate photos
        if (!req.files || req.files.length < 2) {
            return res.status(400).json({ message: 'Minimum 2 photos required' });
        }

        // Get user details
        const user = await req.app.locals.users.findOne({ _id: new ObjectId(req.user.userId) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create photo URLs array
        const photoUrls = req.files.map(file => `/uploads/${file.filename}`);

        // Create house document
        const newHouse = {
            location,
            price: Number(price),
            datePosted: new Date(datePosted),
            type,
            purpose,
            photos: photoUrls,
            seller: {
                id: user._id,
                name: user.username,
                email: user.email,
                phone: user.phoneNumber
            },
            createdAt: new Date(),
            status: 'available'
        };

        const result = await req.app.locals.houses.insertOne(newHouse);
        res.status(201).json({ 
            message: 'House added successfully',
            houseId: result.insertedId,
            house: newHouse
        });

    } catch (error) {
        console.error('Add House Error:', error);
        res.status(500).json({ 
            message: 'Failed to add house', 
            error: error.message 
        });
    }
});

// Get All Houses
router.get('/', async (req, res) => {
    try {
        const { type, purpose, location, minPrice, maxPrice } = req.query;
        
        // Build query filters
        const filter = {};
        if (type) filter.type = type;
        if (purpose) filter.purpose = purpose;
        if (location) filter.location = new RegExp(location, 'i');
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const houses = await req.app.locals.houses
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        res.json(houses);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch houses', 
            error: error.message 
        });
    }
});

// Get House by ID
router.get('/:id', async (req, res) => {
    try {
        const house = await req.app.locals.houses.findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }
        
        res.json(house);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch house', 
            error: error.message 
        });
    }
});

// Update House
router.put('/:id', auth, upload.array('photos', 5), async (req, res) => {
    try {
        const house = await req.app.locals.houses.findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }
        
        if (house.seller.id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updates = {
            ...req.body,
            updatedAt: new Date()
        };

        if (req.files?.length > 0) {
            updates.photos = req.files.map(file => `/uploads/${file.filename}`);
        }

        if (updates.price) updates.price = Number(updates.price);
        if (updates.datePosted) updates.datePosted = new Date(updates.datePosted);

        await req.app.locals.houses.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updates }
        );

        res.json({ message: 'House updated successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to update house', 
            error: error.message 
        });
    }
});

// Delete House
router.delete('/:id', auth, async (req, res) => {
    try {
        const house = await req.app.locals.houses.findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }
        
        if (house.seller.id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await req.app.locals.houses.deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'House deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to delete house', 
            error: error.message 
        });
    }
});

module.exports = router;
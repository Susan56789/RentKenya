// routes/houses.js
const express = require('express');
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');

const router = express.Router();

// Add House - requires authentication
router.post('/', auth, async (req, res) => {
    const { title, location, price, description, imageUrl, phoneNumber } = req.body;
    if (!title || !location || !price || !description || !phoneNumber) {
        return res.status(400).json({ message: 'All fields except imageUrl are required' });
    }
    
    try {
        // Get user details from the database
        const user = await req.app.locals.users.findOne({ _id: new ObjectId(req.user.userId) });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Create house with seller details
        const newHouse = {
            title,
            location,
            price,
            description,
            imageUrl,
            seller: {
                id: user._id,
                name: user.username,
                email: user.email,
                phone: phoneNumber
            },
            createdAt: new Date()
        };
        
        const result = await req.app.locals.houses.insertOne(newHouse);
        res.status(201).json({ message: 'House added', houseId: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add house', error: error.message });
    }
});

// Get All Houses
router.get('/', async (req, res) => {
    try {
        const houses = await req.app.locals.houses.find().sort({ createdAt: -1 }).toArray();
        res.json(houses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch houses', error });
    }
});

// Get House by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const house = await req.app.locals.users.findOne({ _id: new ObjectId(id) });
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }
        res.json(house);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch house', error });
    }
});

// Update House - only by the owner
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { title, location, price, description, imageUrl, phoneNumber } = req.body;
    
    try {
        const house = await req.app.locals.houses.findOne({ _id: new ObjectId(id) });
        
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }
        
        // Check if the current user is the owner
        if (house.seller.id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this house' });
        }
        
        const updates = {
            title,
            location,
            price,
            description,
            imageUrl,
            'seller.phone': phoneNumber,
            updatedAt: new Date()
        };
        
        // Remove undefined fields
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
        
        const result = await req.app.locals.houses.updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );
        
        res.json({ message: 'House updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update house', error: error.message });
    }
});

// Delete House - only by the owner
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
        const house = await req.app.locals.houses.findOne({ _id: new ObjectId(id) });
        
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }
        
        // Check if the current user is the owner
        if (house.seller.id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this house' });
        }
        
        const result = await req.app.locals.houses.deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'House deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete house', error: error.message });
    }
});

module.exports = router;
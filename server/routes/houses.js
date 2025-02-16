// routes/houses.js
const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Add House
router.post('/', async (req, res) => {
    const { title, location, price, description, imageUrl } = req.body;
    if (!title || !location || !price || !description) {
        return res.status(400).json({ message: 'All fields except imageUrl are required' });
    }
    try {
        const newHouse = { title, location, price, description, imageUrl, createdAt: new Date() };
        const result = await req.app.locals.houses.insertOne(newHouse);
        res.status(201).json({ message: 'House added', houseId: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add house', error });
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

// Delete House
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await req.app.locals.houses.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            res.json({ message: 'House deleted successfully' });
        } else {
            res.status(404).json({ message: 'House not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete house', error });
    }
});

module.exports = router;
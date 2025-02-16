// routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
        const normalizedEmail = email.toLowerCase();

        // Check if user already exists
        const existingUser = await req.app.locals.users.findOne({ email: normalizedEmail });
        console.log('Existing User:', existingUser);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Generated Hash:', hashedPassword);

        const user = {
            username,
            email: normalizedEmail,
            password: hashedPassword,
            phoneNumber: phoneNumber || '',
            createdAt: new Date()
        };

        // Insert the user
        const result = await req.app.locals.users.insertOne(user);
        console.log('Insert Result:', result);

        if (result.acknowledged) {
            res.status(201).json({
                message: 'User registered',
                userId: result.insertedId
            });
        } else {
            throw new Error('User insertion failed');
        }

    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    try {
        const user = await req.app.locals.users.findOne({ email });
        console.log('User:', user);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials: User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password Match:', passwordMatch);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials: Incorrect password' });
        }

        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber || ''
            }
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});


// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await req.app.locals.users.findOne(
            { _id: new ObjectId(req.user.userId) },
            { projection: { password: 0 } } // Exclude password from results
        );
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
    }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
    const { username, phoneNumber, currentPassword, newPassword } = req.body;
    const updates = {};
    
    try {
        // Get current user
        const user = await req.app.locals.users.findOne({ _id: new ObjectId(req.user.userId) });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update fields if provided
        if (username) updates.username = username;
        if (phoneNumber) updates.phoneNumber = phoneNumber;
        
        // Handle password change if requested
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            updates.password = await bcrypt.hash(newPassword, 10);
        }
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }
        
        // Add updated timestamp
        updates.updatedAt = new Date();
        
        const result = await req.app.locals.users.updateOne(
            { _id: new ObjectId(req.user.userId) },
            { $set: updates }
        );
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
});

module.exports = router;
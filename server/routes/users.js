const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
        const normalizedEmail = email.toLowerCase();

        const existingUser = await req.app.locals.users.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = {
            username,
            email: normalizedEmail,
            password: hashedPassword,
            phoneNumber: phoneNumber || '',
            createdAt: new Date(),
            resetPasswordToken: null,
            resetPasswordExpires: null
        };

        const result = await req.app.locals.users.insertOne(user);
        
        if (!result.acknowledged) {
            throw new Error('User insertion failed');
        }

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertedId
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const normalizedEmail = email.toLowerCase();
        const user = await req.app.locals.users.findOne({ email: normalizedEmail });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Request Password Reset
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const normalizedEmail = email.toLowerCase();
        const user = await req.app.locals.users.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save token to database
        await req.app.locals.users.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: hashedToken,
                    resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
                }
            }
        );

        
        res.json({
            message: 'Password reset email sent',
            resetToken 
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Error processing password reset request' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const user = await req.app.locals.users.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await req.app.locals.users.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null
                }
            }
        );

        res.json({ message: 'Password has been reset successfully' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Change Password (authenticated route)
router.post('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required' });
    }

    try {
        const user = await req.app.locals.users.findOne({ _id: new ObjectId(req.user.userId) });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await req.app.locals.users.updateOne(
            { _id: user._id },
            { 
                $set: { 
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            }
        );

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});

module.exports = router;
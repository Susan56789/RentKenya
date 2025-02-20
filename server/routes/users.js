const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting configuration
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: { message: 'Too many login attempts, please try again later' }
});

const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts
    message: { message: 'Too many registration attempts, please try again later' }
});

// Password validation
const isStrongPassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
};

// Register User
router.post('/register', registrationLimiter, async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;
    
    if (!username?.trim() || !email?.trim() || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
        return res.status(400).json({ 
            message: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters' 
        });
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const sanitizedUsername = username.trim();

        // Check both email and username uniqueness
        const existingUser = await req.app.locals.users.findOne({
            $or: [
                { email: normalizedEmail },
                { username: sanitizedUsername }
            ]
        });

        if (existingUser) {
            const field = existingUser.email === normalizedEmail ? 'email' : 'username';
            return res.status(409).json({ message: `User with this ${field} already exists` });
        }

        const hashedPassword = await bcrypt.hash(password, 12); // Increased from 10 to 12 rounds
        
        const user = {
            username: sanitizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            phoneNumber: phoneNumber?.trim() || '',
            createdAt: new Date(),
            lastPasswordChange: new Date(),
            failedLoginAttempts: 0,
            accountLocked: false,
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
router.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    
    if (!email?.trim() || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await req.app.locals.users.findOne({ email: normalizedEmail });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if account is locked
        if (user.accountLocked) {
            return res.status(423).json({ message: 'Account is locked due to too many failed attempts' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            // Increment failed attempts
            const failedAttempts = (user.failedLoginAttempts || 0) + 1;
            const updateData = { failedLoginAttempts: failedAttempts };
            
            // Lock account after 5 failed attempts
            if (failedAttempts >= 5) {
                updateData.accountLocked = true;
                updateData.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
            }
            
            await req.app.locals.users.updateOne(
                { _id: user._id },
                { $set: updateData }
            );
            
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Reset failed attempts on successful login
        await req.app.locals.users.updateOne(
            { _id: user._id },
            { 
                $set: { 
                    failedLoginAttempts: 0,
                    accountLocked: false,
                    lockoutUntil: null,
                    lastLoginAt: new Date()
                }
            }
        );

        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email,
                version: user.lastPasswordChange 
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: '1h',
                algorithm: 'HS256'
            }
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
router.post('/forgot-password', rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3
}), async (req, res) => {
    const { email } = req.body;
    
    if (!email?.trim()) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await req.app.locals.users.findOne({ email: normalizedEmail });

        // Return success even if user not found (prevents email enumeration)
        if (!user) {
            return res.json({ message: 'If an account exists, a password reset email will be sent' });
        }

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        await req.app.locals.users.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: hashedToken,
                    resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
                    resetPasswordAttempts: 0
                }
            }
        );

        // In production, send this token via email instead of returning it
        res.json({
            message: 'If an account exists, a password reset email will be sent',
            resetToken // Remove this in production
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
});

// Reset Password
router.post('/reset-password', rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3
}), async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token?.trim() || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (!isStrongPassword(newPassword)) {
        return res.status(400).json({ 
            message: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters' 
        });
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

        // Prevent password reuse
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password must be different from the current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await req.app.locals.users.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                    lastPasswordChange: new Date(),
                    failedLoginAttempts: 0,
                    accountLocked: false
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

    if (!isStrongPassword(newPassword)) {
        return res.status(400).json({ 
            message: 'New password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters' 
        });
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

        // Prevent password reuse
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password must be different from the current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        await req.app.locals.users.updateOne(
            { _id: user._id },
            { 
                $set: { 
                    password: hashedPassword,
                    lastPasswordChange: new Date(),
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
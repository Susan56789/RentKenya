const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token:', token);

    if (!token) {
        return res.status(401).json({ message: 'Missing token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth Error:', error.message);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = auth;

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    let token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (!token) {
      return res.status(401).json({ message: 'Access token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: false });
    req.user = decoded;

    // Check if token is close to expiring 
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp - currentTime < 300) {
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.setHeader('Authorization', `Bearer ${newToken}`);
    }
    
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;

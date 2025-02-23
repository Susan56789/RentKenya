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

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Calculate token age in hours
      const tokenAgeInHours = (Date.now() - (decoded.iat * 1000)) / (1000 * 60 * 60);

      // If token is older than 24 hours, generate new one
      if (tokenAgeInHours >= 24) {
        const newToken = jwt.sign(
          { 
            userId: decoded.userId, 
            email: decoded.email,
            iat: Math.floor(Date.now() / 1000) // Force new iat
          },
          process.env.JWT_SECRET,
          { expiresIn: '48h' } // Set expiry to 48h to ensure overlap
        );

        // Send new token in header
        res.setHeader('X-New-Token', newToken);
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Token expired - try to decode it to get user info
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.userId || !decoded.email) {
          throw new Error('Invalid token structure');
        }

        // Generate new token
        const newToken = jwt.sign(
          { 
            userId: decoded.userId, 
            email: decoded.email,
            iat: Math.floor(Date.now() / 1000)
          },
          process.env.JWT_SECRET,
          { expiresIn: '48h' }
        );

        // Set user and new token
        req.user = decoded;
        res.setHeader('X-New-Token', newToken);
        next();
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({
      message: error.name === 'TokenExpiredError'
        ? 'Token expired'
        : 'Invalid token'
    });
  }
};

module.exports = auth;
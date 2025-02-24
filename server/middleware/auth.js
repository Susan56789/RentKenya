const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Extract and validate auth header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'Authorization header missing' 
      });
    }

    // Clean and validate token
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1].trim()
      : authHeader.trim();
      
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token missing' 
      });
    }

    // Verify token and handle different scenarios
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };

      // Check token age and refresh if needed
      const tokenAgeInHours = (Date.now() - (decoded.iat * 1000)) / (1000 * 60 * 60);
      
      if (tokenAgeInHours >= 23) { // Refresh slightly before expiry
        const newToken = generateToken(decoded);
        res.setHeader('X-New-Token', newToken);
      }

      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Handle expired token
        const decoded = jwt.decode(token);
        
        if (!isValidTokenPayload(decoded)) {
          throw new Error('Invalid token structure');
        }

        // Generate fresh token
        const newToken = generateToken(decoded);
        
        // Attach user info and new token
        req.user = {
          userId: decoded.userId,
          email: decoded.email
        };
        
        res.setHeader('X-New-Token', newToken);
        next();

      } else {
        // Handle other verification errors
        throw error;
      }
    }

  } catch (error) {
    console.error('Auth Error:', error);
    
    return res.status(401).json({
      success: false,
      message: getErrorMessage(error)
    });
  }
};

// Helper function to generate new tokens
const generateToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    { expiresIn: '48h' }
  );
};

// Validate token payload structure
const isValidTokenPayload = (decoded) => {
  return decoded && 
         typeof decoded === 'object' &&
         decoded.userId &&
         decoded.email;
};

// Get appropriate error message
const getErrorMessage = (error) => {
  switch(error.name) {
    case 'TokenExpiredError':
      return 'Token has expired';
    case 'JsonWebTokenError':
      return 'Invalid token format';
    case 'NotBeforeError':
      return 'Token not yet active';
    default:
      return 'Authentication failed';
  }
};

module.exports = auth;
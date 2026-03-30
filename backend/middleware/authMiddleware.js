const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    return next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const OWNER_EMAIL = 'rahuldhakarmm@gmail.com';

const seller = (req, res, next) => {
  if (req.user && (req.user.email === OWNER_EMAIL || req.user.role === 'seller' || req.user.role === 'admin')) {
    // Additionally verify if it's the specific owner email as requested
    if (req.user.email === OWNER_EMAIL) {
       next();
    } else {
       res.status(401).json({ message: 'Not authorized as a seller. Only the owner can sell.' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized as a seller' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.email === OWNER_EMAIL) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, seller, admin };

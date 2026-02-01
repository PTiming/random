const User = require('../models/User');

// Simple user identification middleware using X-User-Id header
const protect = async (req, res, next) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ message: 'Not authorized, no user ID' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid user ID' });
  }
};

module.exports = { protect };

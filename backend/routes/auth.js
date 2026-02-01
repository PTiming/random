const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const moodleService = require('../services/moodleService');
const { auth } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'student'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    user.tokens.push({ token, createdAt: new Date() });
    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login with local credentials
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    user.tokens.push({ token, createdAt: new Date() });
    user.lastLogin = new Date();
    await user.save();

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Moodle SSO login
router.post('/moodle-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Authenticate with Moodle
    const moodleAuth = await moodleService.authenticateUser(username, password);

    if (!moodleAuth.success) {
      return res.status(401).json({ error: moodleAuth.error });
    }

    // Find or create user
    let user = await User.findOne({ moodleId: moodleAuth.userId.toString() });

    if (!user) {
      // Create new user from Moodle data
      const moodleUserData = await moodleService.getUserById(moodleAuth.userId);
      if (moodleUserData && moodleUserData.length > 0) {
        const userData = moodleUserData[0];
        user = new User({
          moodleId: userData.id.toString(),
          moodleUsername: userData.username,
          moodleEmail: userData.email,
          username: userData.username,
          email: userData.email,
          firstName: userData.firstname,
          lastName: userData.lastname,
          lastMoodleSync: new Date()
        });
        await user.save();
      } else {
        return res.status(500).json({ error: 'Failed to fetch user data from Moodle' });
      }
    } else {
      // Update last sync
      user.lastMoodleSync = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    user.tokens.push({ token, createdAt: new Date() });
    user.lastLogin = new Date();
    await user.save();

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        moodleId: user.moodleId
      },
      token,
      moodleToken: moodleAuth.token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(t => t.token !== req.token);
    await req.user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

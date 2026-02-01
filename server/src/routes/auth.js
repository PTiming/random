const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { validate, validationRules } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const MoodleService = require('../services/moodle/moodleService');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validationRules.register, validate, async (req, res) => {
  try {
    const { email, password, username, firstName, lastName, institution } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      username,
      firstName,
      lastName,
      institution
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: user.toPublicProfile()
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validationRules.login, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last active and login history
    user.lastActive = new Date();
    user.loginHistory.push({
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Keep only last 10 logins
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }
    
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toPublicProfile()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

/**
 * @route   POST /api/auth/moodle
 * @desc    Login/Register via Moodle SSO
 * @access  Public
 */
router.post('/moodle', async (req, res) => {
  try {
    const { moodleToken, moodleUrl } = req.body;

    if (!moodleToken) {
      return res.status(400).json({
        success: false,
        message: 'Moodle token is required'
      });
    }

    // Validate token with Moodle and get user info
    const moodleService = new MoodleService(moodleUrl || config.moodle.url, moodleToken);
    const moodleUser = await moodleService.getUserInfo();

    if (!moodleUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Moodle token'
      });
    }

    // Find or create user
    let user = await User.findOne({ moodleId: moodleUser.userid });

    if (!user) {
      // Check if email exists
      user = await User.findOne({ email: moodleUser.email });
      
      if (user) {
        // Link existing account to Moodle
        user.moodleId = moodleUser.userid;
        user.moodleToken = moodleToken;
        user.moodleTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      } else {
        // Create new user from Moodle data
        user = new User({
          email: moodleUser.email,
          username: moodleUser.username || `moodle_${moodleUser.userid}`,
          firstName: moodleUser.firstname,
          lastName: moodleUser.lastname,
          moodleId: moodleUser.userid,
          moodleToken: moodleToken,
          moodleTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isVerified: true,
          avatar: moodleUser.profileimageurl || ''
        });
      }
    } else {
      // Update Moodle token
      user.moodleToken = moodleToken;
      user.moodleTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    user.lastMoodleSync = new Date();
    user.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      message: 'Moodle authentication successful',
      data: {
        token,
        user: user.toPublicProfile()
      }
    });
  } catch (error) {
    console.error('Moodle auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Moodle authentication failed'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('connections', 'username firstName lastName avatar')
      .select('-password -moodleToken');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal, but can be used for cleanup)
 * @access  Private
 */
router.post('/logout', auth, async (req, res) => {
  try {
    // Update last active
    await User.findByIdAndUpdate(req.userId, { lastActive: new Date() });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', auth, async (req, res) => {
  try {
    const token = jwt.sign(
      { userId: req.userId },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
});

module.exports = router;

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const moodleConnector = require('../services/moodleConnector');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      user.lastLogin = new Date();
      await user.save();

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login with Moodle SSO
// @route   POST /api/auth/moodle
// @access  Public
const loginWithMoodle = async (req, res) => {
  try {
    const { moodleToken, moodleUserId } = req.body;

    if (!moodleToken || !moodleUserId) {
      return res.status(400).json({ message: 'Moodle credentials required' });
    }

    // Verify with Moodle
    try {
      const moodleUser = await moodleConnector.getUserProfile(moodleUserId);

      if (!moodleUser) {
        return res.status(401).json({ message: 'Invalid Moodle credentials' });
      }

      // Find or create user
      let user = await User.findOne({ moodleUserId });

      if (!user) {
        user = await User.create({
          username: moodleUser.username,
          email: moodleUser.email,
          firstName: moodleUser.firstname,
          lastName: moodleUser.lastname,
          moodleUserId: moodleUser.id,
          moodleToken,
          avatar: moodleUser.profileimageurl
        });
      } else {
        // Update Moodle token
        user.moodleToken = moodleToken;
        user.lastLogin = new Date();
        await user.save();
      }

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        moodleUserId: user.moodleUserId,
        token: generateToken(user._id)
      });
    } catch (moodleError) {
      return res.status(401).json({ 
        message: 'Moodle authentication failed',
        error: moodleError.message
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('enrolledCourses.courseId', 'name code');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginWithMoodle,
  getMe
};

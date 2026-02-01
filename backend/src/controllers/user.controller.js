const User = require('../models/User');
const moodleSyncService = require('../services/moodleSync.service');

/**
 * Get all users
 * GET /api/users
 */
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'enrolledCourses.course',
        select: 'title shortName instructor'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Sync to Moodle if connected
    if (user.moodleId) {
      moodleSyncService.syncUserToMoodle(user._id, 'manual').catch(err => {
        console.error('Failed to sync user to Moodle:', err.message);
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - deactivate user
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

/**
 * Sync user with Moodle
 * POST /api/users/:id/sync-moodle
 */
exports.syncUserWithMoodle = async (req, res) => {
  try {
    const { direction = 'to_moodle' } = req.body;
    const userId = req.params.id;

    let result;
    if (direction === 'to_moodle') {
      result = await moodleSyncService.syncUserToMoodle(userId, 'manual');
    } else {
      const user = await User.findById(userId);
      if (!user?.moodleId) {
        return res.status(400).json({
          success: false,
          message: 'User not linked to Moodle'
        });
      }
      result = await moodleSyncService.syncUserFromMoodle(user.moodleId, 'manual');
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error syncing user with Moodle',
      error: error.message
    });
  }
};

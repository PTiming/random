const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const StudyGroup = require('../models/StudyGroup');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin only
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalPosts,
      totalMessages,
      totalGroups,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'admin' }),
      Post.countDocuments(),
      Message.countDocuments(),
      StudyGroup.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyStats = [];
    
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const [users, posts, messages] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
        Post.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
        Message.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } })
      ]);
      
      dailyStats.push({
        date: dayStart.toISOString().split('T')[0],
        users,
        posts,
        messages
      });
    }

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          teachers: totalTeachers,
          admins: totalAdmins,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth
        },
        content: {
          posts: totalPosts,
          messages: totalMessages,
          groups: totalGroups
        },
        dailyStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Admin only
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (role, status, etc.)
// @access  Admin only
router.put('/users/:id', async (req, res) => {
  try {
    const { role, status, name, email } = req.body;
    
    // Don't allow admin to modify themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify your own account from admin panel'
      });
    }
    
    const updateData = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Also delete user's posts and messages
    await Promise.all([
      Post.deleteMany({ author: req.params.id }),
      Message.deleteMany({ sender: req.params.id })
    ]);
    
    res.json({ success: true, message: 'User and related content deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/posts
// @desc    Get all posts for moderation
// @access  Admin only
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (req.query.reported === 'true') filter.reported = true;
    
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'name email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/posts/:id
// @desc    Delete a post
// @access  Admin only
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/create-admin
// @desc    Create a new admin user
// @access  Admin only
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create admin user
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });
    
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/activity-log
// @desc    Get recent activity log
// @access  Admin only
router.get('/activity-log', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    // Get recent users, posts, and messages
    const [recentUsers, recentPosts, recentMessages] = await Promise.all([
      User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(10),
      Post.find().populate('author', 'name').select('content author createdAt').sort({ createdAt: -1 }).limit(10),
      Message.find().populate('sender', 'name').select('content sender createdAt').sort({ createdAt: -1 }).limit(10)
    ]);
    
    // Combine and sort activities
    const activities = [
      ...recentUsers.map(u => ({
        type: 'user_joined',
        user: u.name,
        email: u.email,
        role: u.role,
        timestamp: u.createdAt
      })),
      ...recentPosts.map(p => ({
        type: 'post_created',
        user: p.author?.name || 'Unknown',
        content: p.content?.substring(0, 50) + '...',
        timestamp: p.createdAt
      })),
      ...recentMessages.map(m => ({
        type: 'message_sent',
        user: m.sender?.name || 'Unknown',
        content: m.content?.substring(0, 50) + '...',
        timestamp: m.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
    
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

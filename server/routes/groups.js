const express = require('express');
const { body, validationResult } = require('express-validator');
const StudyGroup = require('../models/StudyGroup');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/groups
// @desc    Get all study groups
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, course, myGroups } = req.query;

    let query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (course) {
      query.course = course;
    }

    if (myGroups === 'true') {
      query['members.user'] = req.user._id;
    }

    const groups = await StudyGroup.find(query)
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      groups
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching groups'
    });
  }
});

// @route   GET /api/groups/:id
// @desc    Get single group
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching group'
    });
  }
});

// @route   POST /api/groups
// @desc    Create study group
// @access  Private
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Group name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('description').optional().isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description, course, tags, isPrivate, maxMembers, avatar } = req.body;

    const group = await StudyGroup.create({
      name,
      description: description || '',
      course: course || '',
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
      tags: tags || [],
      isPrivate: isPrivate || false,
      maxMembers: maxMembers || 50,
      avatar: avatar || ''
    });

    await group.populate('creator', 'name avatar');
    await group.populate('members.user', 'name avatar');

    res.status(201).json({
      success: true,
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating group'
    });
  }
});

// @route   POST /api/groups/:id/join
// @desc    Join a study group
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if already a member
    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this group'
      });
    }

    // Check max members
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Group is full'
      });
    }

    group.members.push({ user: req.user._id, role: 'member' });
    await group.save();

    await group.populate('members.user', 'name avatar');

    res.json({
      success: true,
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining group'
    });
  }
});

// @route   POST /api/groups/:id/leave
// @desc    Leave a study group
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Can't leave if you're the creator
    if (group.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Creator cannot leave the group. Delete the group instead.'
      });
    }

    group.members = group.members.filter(m => m.user.toString() !== req.user._id.toString());
    await group.save();

    res.json({
      success: true,
      message: 'Left the group'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving group'
    });
  }
});

// @route   PUT /api/groups/:id
// @desc    Update study group
// @access  Private (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin
    const member = group.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update the group'
      });
    }

    const allowedFields = ['name', 'description', 'course', 'tags', 'isPrivate', 'maxMembers', 'avatar', 'nextMeeting'];
    const updates = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedGroup = await StudyGroup.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('creator', 'name avatar')
      .populate('members.user', 'name avatar');

    res.json({
      success: true,
      group: updatedGroup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating group'
    });
  }
});

// @route   DELETE /api/groups/:id
// @desc    Delete study group
// @access  Private (creator only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Only creator or admin can delete
    if (group.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can delete the group'
      });
    }

    await StudyGroup.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Group deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting group'
    });
  }
});

module.exports = router;

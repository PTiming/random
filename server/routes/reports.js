const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { protect, restrictTo } = require('../middleware/auth');

// Submit a report
router.post('/', protect, async (req, res) => {
  try {
    const { reportType, reportedPost, reportedUser, reportedResource, reason, description } = req.body;

    // Prevent self-reporting
    if (reportedUser && reportedUser === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot report yourself' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportType,
      reportedPost,
      reportedUser,
      reportedResource,
      reason,
      description
    });

    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reports (admin only)
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { status, reportType } = req.query;
    const query = {};

    if (status) query.status = status;
    if (reportType) query.reportType = reportType;

    const reports = await Report.find(query)
      .populate('reporter', 'firstName lastName email')
      .populate('reportedUser', 'firstName lastName email')
      .populate('reportedPost', 'content')
      .populate('reportedResource', 'title')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending reports count (admin only)
router.get('/pending-count', protect, restrictTo('admin'), async (req, res) => {
  try {
    const count = await Report.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Review report (admin only)
router.put('/:id/review', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { status, resolution, actionTaken } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolution,
        actionTaken,
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('reporter', 'firstName lastName email')
     .populate('reportedUser', 'firstName lastName email')
     .populate('reviewedBy', 'firstName lastName');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's submitted reports
router.get('/my-reports', protect, async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate('reportedPost', 'content')
      .populate('reportedUser', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

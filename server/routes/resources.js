const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { protect, restrictTo } = require('../middleware/auth');

// Get all resources
router.get('/', protect, async (req, res) => {
  try {
    const { course, category, fileType, search, verified } = req.query;
    const query = {};

    if (course) query.course = course;
    if (category) query.category = category;
    if (fileType) query.fileType = fileType;
    if (verified === 'true') query.isVerified = true;
    if (search) {
      query.$text = { $search: search };
    }

    const resources = await Resource.find(query)
      .populate('uploader', 'firstName lastName avatar role')
      .populate('verifiedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single resource
router.get('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploader', 'firstName lastName avatar role')
      .populate('verifiedBy', 'firstName lastName');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload resource
router.post('/', protect, async (req, res) => {
  try {
    const {
      title, description, fileUrl, fileType, fileSize,
      course, studyGroup, category, tags
    } = req.body;

    const resource = await Resource.create({
      uploader: req.user._id,
      title,
      description,
      fileUrl,
      fileType,
      fileSize,
      course,
      studyGroup,
      category,
      tags
    });

    await resource.populate('uploader', 'firstName lastName avatar role');

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download resource (increment counter)
router.post('/:id/download', protect, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ fileUrl: resource.fileUrl, downloads: resource.downloads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify resource (teachers/admins only)
router.put('/:id/verify', protect, restrictTo('teacher', 'admin'), async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedBy: req.user._id },
      { new: true }
    ).populate('uploader', 'firstName lastName avatar role')
     .populate('verifiedBy', 'firstName lastName');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update resource
router.put('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('uploader', 'firstName lastName avatar role');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete resource
router.delete('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await resource.deleteOne();
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .populate('instructor', 'firstName lastName email')
      .populate('additionalInstructors', 'firstName lastName')
      .limit(50);

    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get course by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email profilePicture')
      .populate('additionalInstructors', 'firstName lastName profilePicture')
      .populate('enrolledStudents', 'firstName lastName username profilePicture')
      .populate('posts');

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new course
router.post('/', auth, checkRole(['instructor', 'admin']), async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      instructor: req.user._id
    });

    await course.save();

    // Add course to instructor's courses
    req.user.courses.push(course._id);
    await req.user.save();

    res.status(201).json({ course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enroll in course
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ error: 'Already enrolled' });
    }

    course.enrolledStudents.push(req.user._id);
    await course.save();

    req.user.courses.push(course._id);
    await req.user.save();

    res.json({ message: 'Enrolled successfully', course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unenroll from course
router.delete('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    course.enrolledStudents = course.enrolledStudents.filter(
      student => !student.equals(req.user._id)
    );
    await course.save();

    req.user.courses = req.user.courses.filter(
      c => !c.equals(course._id)
    );
    await req.user.save();

    res.json({ message: 'Unenrolled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's enrolled courses
router.get('/user/enrolled', auth, async (req, res) => {
  try {
    const courses = await Course.find({ enrolledStudents: req.user._id })
      .populate('instructor', 'firstName lastName')
      .select('name code description startDate endDate');

    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', ['name', 'email'])
      .populate('students', ['name', 'email']);
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/courses
// @desc    Create a course (teacher/admin only)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, moodleCourseId } = req.body;

    const newCourse = new Course({
      title,
      description,
      teacher: req.user.id,
      moodleCourseId: moodleCourseId || ''
    });

    const course = await newCourse.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already enrolled' });
    }

    course.students.push(req.user.id);
    await course.save();

    const user = await User.findById(req.user.id);
    user.enrolledCourses.push(course.id);
    await user.save();

    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/courses/:id/assignments
// @desc    Add assignment to course
// @access  Private
router.post('/:id/assignments', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const { title, description, dueDate, moodleAssignmentId } = req.body;

    course.assignments.push({
      title,
      description,
      dueDate,
      moodleAssignmentId: moodleAssignmentId || ''
    });

    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

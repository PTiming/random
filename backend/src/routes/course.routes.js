const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getCourseStudents,
  syncCourseWithMoodle
} = require('../controllers/course.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected routes
router.use(protect);

// Course management (instructors and admins)
router.post('/', authorize('instructor', 'admin'), createCourse);
router.put('/:id', authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', authorize('instructor', 'admin'), deleteCourse);

// Enrollment
router.post('/:id/enroll', enrollInCourse);
router.delete('/:id/enroll', unenrollFromCourse);

// Course students (instructors and admins)
router.get('/:id/students', authorize('instructor', 'admin'), getCourseStudents);

// Moodle sync (instructors and admins)
router.post('/:id/sync-moodle', authorize('instructor', 'admin'), syncCourseWithMoodle);

module.exports = router;

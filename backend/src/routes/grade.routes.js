const express = require('express');
const router = express.Router();
const {
  getCourseGrades,
  getAllCourseGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  syncGradesFromMoodle,
  getMyGrades
} = require('../controllers/grade.controller');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Student routes
router.get('/my-grades', getMyGrades);
router.get('/course/:courseId', getCourseGrades);

// Instructor/Admin routes
router.get('/course/:courseId/all', authorize('instructor', 'admin'), getAllCourseGrades);
router.post('/', authorize('instructor', 'admin'), createGrade);
router.put('/:id', authorize('instructor', 'admin'), updateGrade);
router.delete('/:id', authorize('instructor', 'admin'), deleteGrade);

// Moodle sync
router.post('/sync-moodle', authorize('instructor', 'admin'), syncGradesFromMoodle);

module.exports = router;

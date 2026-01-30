const express = require('express');
const router = express.Router();
const {
  getStudentGrades,
  getCourseGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  getMyGrades
} = require('../controllers/gradeController');
const { authenticate } = require('../middleware/auth');
const { isTeacherOrAdmin, isAdmin, isStudent, authorizeRoles, ROLES } = require('../middleware/rbac');

// All routes require authentication
router.use(authenticate);

// Student routes
router.get('/my-grades', authorizeRoles(ROLES.STUDENT), getMyGrades);

// Teacher or Admin routes
router.get('/student/:studentId', isTeacherOrAdmin, getStudentGrades);
router.get('/course/:courseId', isTeacherOrAdmin, getCourseGrades);
router.post('/', isTeacherOrAdmin, createGrade);
router.put('/:id', isTeacherOrAdmin, updateGrade);

// Admin only routes
router.delete('/:id', isAdmin, deleteGrade);

module.exports = router;

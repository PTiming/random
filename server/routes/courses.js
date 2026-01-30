const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getTeacherCourses,
  getEnrolledCourses
} = require('../controllers/courseController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isTeacherOrAdmin, isStudent, ROLES, authorizeRoles } = require('../middleware/rbac');

// Public routes (with optional auth for access control)
router.get('/', optionalAuth, getAllCourses);
router.get('/:id', optionalAuth, getCourseById);

// Protected routes - Teacher specific
router.get('/teacher/my-courses', authenticate, authorizeRoles(ROLES.TEACHER, ROLES.ADMIN), getTeacherCourses);

// Protected routes - Student specific
router.get('/student/enrolled', authenticate, authorizeRoles(ROLES.STUDENT), getEnrolledCourses);
router.post('/:id/enroll', authenticate, authorizeRoles(ROLES.STUDENT), enrollInCourse);
router.delete('/:id/enroll', authenticate, authorizeRoles(ROLES.STUDENT), unenrollFromCourse);

// Protected routes - Teacher or Admin
router.post('/', authenticate, isTeacherOrAdmin, createCourse);
router.put('/:id', authenticate, isTeacherOrAdmin, updateCourse);
router.delete('/:id', authenticate, isTeacherOrAdmin, deleteCourse);

module.exports = router;

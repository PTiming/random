import { Router } from 'express';
import courseController from '../controllers/course.controller';
import { authenticate } from '../middleware/auth';
import { RBACMiddleware } from '../middleware/rbac';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/courses
 * @desc    Get all courses
 * @access  Authenticated users
 */
router.get('/', courseController.getCourses.bind(courseController));

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Authenticated users
 */
router.get('/:id', courseController.getCourseById.bind(courseController));

/**
 * @route   POST /api/courses
 * @desc    Create new course
 * @access  Admin, Instructor
 */
router.post(
  '/',
  RBACMiddleware.requireRole(['Admin', 'Instructor']),
  courseController.createCourse.bind(courseController)
);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course
 * @access  Admin, Instructor
 */
router.put(
  '/:id',
  RBACMiddleware.requireRole(['Admin', 'Instructor']),
  courseController.updateCourse.bind(courseController)
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course
 * @access  Admin only
 */
router.delete(
  '/:id',
  RBACMiddleware.requireRole(['Admin']),
  courseController.deleteCourse.bind(courseController)
);

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll user in course
 * @access  Admin, Instructor
 */
router.post(
  '/:id/enroll',
  RBACMiddleware.requireRole(['Admin', 'Instructor']),
  courseController.enrollUser.bind(courseController)
);

/**
 * @route   GET /api/courses/:id/students
 * @desc    Get enrolled students
 * @access  Admin, Instructor
 */
router.get(
  '/:id/students',
  RBACMiddleware.requireRole(['Admin', 'Instructor']),
  courseController.getEnrolledStudents.bind(courseController)
);

/**
 * @route   POST /api/courses/:id/sync
 * @desc    Sync course to Moodle
 * @access  Admin only
 */
router.post(
  '/:id/sync',
  RBACMiddleware.requireRole(['Admin']),
  courseController.syncToMoodle.bind(courseController)
);

export default router;

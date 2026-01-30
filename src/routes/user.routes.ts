import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { RBACMiddleware } from '../middleware/rbac';
import { ResourceType, Action } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin, Instructor
 */
router.get(
  '/',
  RBACMiddleware.requireRole(['Admin', 'Instructor']),
  userController.getUsers.bind(userController)
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin, Instructor, Self
 */
router.get(
  '/:id',
  RBACMiddleware.requireSelfOrRole(['Admin', 'Instructor']),
  userController.getUserById.bind(userController)
);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Admin only
 */
router.post(
  '/',
  RBACMiddleware.requireRole(['Admin']),
  userController.createUser.bind(userController)
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin, Self
 */
router.put(
  '/:id',
  RBACMiddleware.requireSelfOrRole(['Admin']),
  userController.updateUser.bind(userController)
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin only
 */
router.delete(
  '/:id',
  RBACMiddleware.requireRole(['Admin']),
  userController.deleteUser.bind(userController)
);

/**
 * @route   POST /api/users/:id/roles
 * @desc    Assign role to user
 * @access  Admin only
 */
router.post(
  '/:id/roles',
  RBACMiddleware.requireRole(['Admin']),
  userController.assignRole.bind(userController)
);

/**
 * @route   POST /api/users/:id/sync
 * @desc    Sync user to Moodle
 * @access  Admin only
 */
router.post(
  '/:id/sync',
  RBACMiddleware.requireRole(['Admin']),
  userController.syncToMoodle.bind(userController)
);

export default router;

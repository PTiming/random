import { Router } from 'express';
import syncController from '../controllers/sync.controller';
import { authenticate } from '../middleware/auth';
import { RBACMiddleware } from '../middleware/rbac';

const router = Router();

// All routes require authentication and Admin role
router.use(authenticate);
router.use(RBACMiddleware.requireRole(['Admin']));

/**
 * @route   POST /api/sync/full
 * @desc    Trigger full sync
 * @access  Admin only
 */
router.post('/full', syncController.triggerFullSync.bind(syncController));

/**
 * @route   POST /api/sync/users
 * @desc    Sync users from Moodle
 * @access  Admin only
 */
router.post('/users', syncController.syncUsers.bind(syncController));

/**
 * @route   POST /api/sync/courses
 * @desc    Sync courses from Moodle
 * @access  Admin only
 */
router.post('/courses', syncController.syncCourses.bind(syncController));

/**
 * @route   GET /api/sync/status
 * @desc    Get sync status
 * @access  Admin only
 */
router.get('/status', syncController.getSyncStatus.bind(syncController));

/**
 * @route   GET /api/sync/logs
 * @desc    Get sync logs
 * @access  Admin only
 */
router.get('/logs', syncController.getSyncLogs.bind(syncController));

export default router;

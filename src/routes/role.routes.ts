import { Router } from 'express';
import roleController from '../controllers/role.controller';
import { authenticate } from '../middleware/auth';
import { RBACMiddleware } from '../middleware/rbac';

const router = Router();

// All routes require authentication and Admin role
router.use(authenticate);
router.use(RBACMiddleware.requireRole(['Admin']));

/**
 * @route   GET /api/roles
 * @desc    Get all roles
 * @access  Admin only
 */
router.get('/', roleController.getRoles.bind(roleController));

/**
 * @route   GET /api/roles/:id
 * @desc    Get role by ID
 * @access  Admin only
 */
router.get('/:id', roleController.getRoleById.bind(roleController));

/**
 * @route   POST /api/roles
 * @desc    Create new role
 * @access  Admin only
 */
router.post('/', roleController.createRole.bind(roleController));

/**
 * @route   PUT /api/roles/:id
 * @desc    Update role
 * @access  Admin only
 */
router.put('/:id', roleController.updateRole.bind(roleController));

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete role
 * @access  Admin only
 */
router.delete('/:id', roleController.deleteRole.bind(roleController));

/**
 * @route   POST /api/roles/:id/permissions
 * @desc    Assign permissions to role
 * @access  Admin only
 */
router.post('/:id/permissions', roleController.assignPermissions.bind(roleController));

/**
 * @route   GET /api/permissions
 * @desc    Get all permissions
 * @access  Admin only
 */
router.get('/permissions/all', roleController.getPermissions.bind(roleController));

export default router;

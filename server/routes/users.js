const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  getUsersByRole
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { isAdmin, isTeacherOrAdmin, ROLES } = require('../middleware/rbac');

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get('/', isAdmin, getAllUsers);
router.post('/', isAdmin, createUser);
router.put('/:id', isAdmin, updateUser);
router.delete('/:id', isAdmin, deleteUser);
router.put('/:id/role', isAdmin, changeUserRole);

// Admin or Teacher routes
router.get('/role/:role', isTeacherOrAdmin, getUsersByRole);

// Any authenticated user (with proper access check in controller)
router.get('/:id', getUserById);

module.exports = router;

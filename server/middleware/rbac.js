const { ROLES, PERMISSIONS, hasPermission, getRolePermissions } = require('../config/roles');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Authorizes users based on their roles and required permissions
 */

/**
 * Authorize by roles
 * @param {...string} allowedRoles - Roles allowed to access the route
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Authorize by permissions
 * @param {...string} requiredPermissions - Permissions required to access the route
 */
const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.user.role;
    const missingPermissions = requiredPermissions.filter(
      permission => !hasPermission(userRole, permission)
    );

    if (missingPermissions.length > 0) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Missing permissions: ${missingPermissions.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.'
    });
  }
  next();
};

/**
 * Check if user is teacher
 */
const isTeacher = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.TEACHER) {
    return res.status(403).json({
      success: false,
      message: 'Teacher access required.'
    });
  }
  next();
};

/**
 * Check if user is student
 */
const isStudent = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.STUDENT) {
    return res.status(403).json({
      success: false,
      message: 'Student access required.'
    });
  }
  next();
};

/**
 * Check if user is teacher or admin
 */
const isTeacherOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== ROLES.TEACHER && req.user.role !== ROLES.ADMIN)) {
    return res.status(403).json({
      success: false,
      message: 'Teacher or Admin access required.'
    });
  }
  next();
};

/**
 * Check if user owns the resource or is admin
 * @param {Function} getResourceOwnerId - Function to get owner ID from request
 */
const isOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Admin always has access
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    try {
      const ownerId = await getResourceOwnerId(req);
      
      if (req.user._id.toString() !== ownerId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource.'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking resource ownership.'
      });
    }
  };
};

/**
 * Attach user permissions to request
 */
const attachPermissions = (req, res, next) => {
  if (req.user) {
    req.userPermissions = getRolePermissions(req.user.role);
  }
  next();
};

module.exports = {
  authorizeRoles,
  authorizePermissions,
  isAdmin,
  isTeacher,
  isStudent,
  isTeacherOrAdmin,
  isOwnerOrAdmin,
  attachPermissions,
  ROLES,
  PERMISSIONS
};

/**
 * RBAC Role Definitions
 * Defines roles and their permissions for the LMS system
 */

const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

/**
 * Permission definitions for each role
 * Each permission maps to specific API actions
 */
const PERMISSIONS = {
  // User Management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  MANAGE_ROLES: 'manage_roles',
  
  // Course Management
  CREATE_COURSE: 'create_course',
  READ_COURSE: 'read_course',
  UPDATE_COURSE: 'update_course',
  DELETE_COURSE: 'delete_course',
  ENROLL_COURSE: 'enroll_course',
  
  // Content Management
  CREATE_CONTENT: 'create_content',
  READ_CONTENT: 'read_content',
  UPDATE_CONTENT: 'update_content',
  DELETE_CONTENT: 'delete_content',
  
  // Assignment Management
  CREATE_ASSIGNMENT: 'create_assignment',
  READ_ASSIGNMENT: 'read_assignment',
  SUBMIT_ASSIGNMENT: 'submit_assignment',
  GRADE_ASSIGNMENT: 'grade_assignment',
  
  // Grade Management
  VIEW_OWN_GRADES: 'view_own_grades',
  VIEW_ALL_GRADES: 'view_all_grades',
  MANAGE_GRADES: 'manage_grades',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_REPORTS: 'view_reports'
};

/**
 * Role-Permission mapping
 * Defines what each role can do in the system
 */
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Full access to all permissions
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.CREATE_COURSE,
    PERMISSIONS.READ_COURSE,
    PERMISSIONS.UPDATE_COURSE,
    PERMISSIONS.DELETE_COURSE,
    PERMISSIONS.ENROLL_COURSE,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.READ_CONTENT,
    PERMISSIONS.UPDATE_CONTENT,
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.CREATE_ASSIGNMENT,
    PERMISSIONS.READ_ASSIGNMENT,
    PERMISSIONS.SUBMIT_ASSIGNMENT,
    PERMISSIONS.GRADE_ASSIGNMENT,
    PERMISSIONS.VIEW_OWN_GRADES,
    PERMISSIONS.VIEW_ALL_GRADES,
    PERMISSIONS.MANAGE_GRADES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.TEACHER]: [
    // Teacher-specific permissions
    PERMISSIONS.READ_USER,
    PERMISSIONS.CREATE_COURSE,
    PERMISSIONS.READ_COURSE,
    PERMISSIONS.UPDATE_COURSE,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.READ_CONTENT,
    PERMISSIONS.UPDATE_CONTENT,
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.CREATE_ASSIGNMENT,
    PERMISSIONS.READ_ASSIGNMENT,
    PERMISSIONS.GRADE_ASSIGNMENT,
    PERMISSIONS.VIEW_OWN_GRADES,
    PERMISSIONS.VIEW_ALL_GRADES,
    PERMISSIONS.MANAGE_GRADES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.STUDENT]: [
    // Student-specific permissions
    PERMISSIONS.READ_COURSE,
    PERMISSIONS.ENROLL_COURSE,
    PERMISSIONS.READ_CONTENT,
    PERMISSIONS.READ_ASSIGNMENT,
    PERMISSIONS.SUBMIT_ASSIGNMENT,
    PERMISSIONS.VIEW_OWN_GRADES
  ]
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
};

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {string[]}
 */
const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions
};

const { validationResult, body, param, query } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Common validation rules
 */
const validationRules = {
  // User validations
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Post validations
  createPost: [
    body('content')
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Post content must be between 1 and 5000 characters'),
    body('visibility')
      .optional()
      .isIn(['public', 'connections', 'group', 'course', 'private'])
      .withMessage('Invalid visibility option')
  ],

  // Comment validations
  createComment: [
    body('content')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Comment must be between 1 and 2000 characters')
  ],

  // Message validations
  sendMessage: [
    body('content')
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Message must be between 1 and 5000 characters')
  ],

  // Group validations
  createGroup: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Group name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('type')
      .optional()
      .isIn(['public', 'private', 'course', 'study'])
      .withMessage('Invalid group type')
  ],

  // Notification preferences
  updateNotificationPreferences: [
    body('channels.inApp').optional().isBoolean(),
    body('channels.push').optional().isBoolean(),
    body('channels.email').optional().isBoolean(),
    body('channels.sms').optional().isBoolean(),
    body('emailFrequency')
      .optional()
      .isIn(['instant', 'hourly', 'daily', 'weekly']),
    body('quietHours.enabled').optional().isBoolean(),
    body('quietHours.start')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid time format (HH:mm)'),
    body('quietHours.end')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Invalid time format (HH:mm)')
  ],

  // Pagination
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  // MongoDB ObjectId
  mongoId: (paramName) => [
    param(paramName)
      .isMongoId()
      .withMessage(`Invalid ${paramName}`)
  ]
};

module.exports = {
  validate,
  validationRules
};

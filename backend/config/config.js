module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  moodle: {
    url: process.env.MOODLE_URL || 'https://moodle.example.com',
    token: process.env.MOODLE_TOKEN || '',
    service: process.env.MOODLE_SERVICE || 'moodle_mobile_app'
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  }
};

module.exports = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_for_development',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_social_moodle'
  },

  // Moodle Configuration
  moodle: {
    url: process.env.MOODLE_URL,
    token: process.env.MOODLE_TOKEN,
    service: process.env.MOODLE_SERVICE || 'moodle_mobile_app',
    oauth: {
      clientId: process.env.MOODLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.MOODLE_OAUTH_CLIENT_SECRET
    },
    syncInterval: parseInt(process.env.SYNC_INTERVAL_MS) || 3600000,
    enableRealtimeSync: process.env.ENABLE_REALTIME_SYNC === 'true'
  },

  // Firebase Configuration
  firebase: {
    projectId: process.env.FCM_PROJECT_ID,
    privateKey: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FCM_CLIENT_EMAIL
  },

  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'sendgrid',
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@example.com'
  },

  // SMS Configuration (Twilio)
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },

  // Client Configuration
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000'
  },

  // Notification Types
  notificationTypes: {
    // Social interactions
    NEW_COMMENT: 'new_comment',
    NEW_REACTION: 'new_reaction',
    NEW_MENTION: 'new_mention',
    NEW_REPLY: 'new_reply',
    POST_SHARED: 'post_shared',
    NEW_FOLLOWER: 'new_follower',
    CONNECTION_REQUEST: 'connection_request',
    CONNECTION_ACCEPTED: 'connection_accepted',

    // Messaging
    NEW_MESSAGE: 'new_message',
    NEW_GROUP_MESSAGE: 'new_group_message',
    MESSAGE_REACTION: 'message_reaction',

    // Groups
    GROUP_INVITATION: 'group_invitation',
    GROUP_POST: 'group_post',
    GROUP_MEMBERSHIP: 'group_membership',
    GROUP_ANNOUNCEMENT: 'group_announcement',

    // Moodle
    MOODLE_ASSIGNMENT: 'moodle_assignment',
    MOODLE_DEADLINE: 'moodle_deadline',
    MOODLE_GRADE: 'moodle_grade',
    MOODLE_ANNOUNCEMENT: 'moodle_announcement',
    MOODLE_RESOURCE: 'moodle_resource',
    MOODLE_ENROLLMENT: 'moodle_enrollment',
    MOODLE_QUIZ: 'moodle_quiz',
    MOODLE_FEEDBACK: 'moodle_feedback',

    // System
    SYSTEM_ANNOUNCEMENT: 'system_announcement',
    SYSTEM_ALERT: 'system_alert'
  },

  // Notification Priorities
  notificationPriorities: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  },

  // User Roles
  userRoles: {
    STUDENT: 'student',
    INSTRUCTOR: 'instructor',
    ADMIN: 'admin',
    INSTITUTION_ADMIN: 'institution_admin'
  }
};

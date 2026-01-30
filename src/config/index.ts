import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_this',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key_change_this',
    expiry: process.env.JWT_EXPIRY || '1h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  
  moodle: {
    url: process.env.MOODLE_URL || 'https://your-moodle-instance.com',
    token: process.env.MOODLE_TOKEN || 'your_moodle_webservice_token',
    syncInterval: parseInt(process.env.MOODLE_SYNC_INTERVAL || '300000'),
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  
  rateLimit: {
    max: parseInt(process.env.API_RATE_LIMIT || '100'),
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  
  logLevel: process.env.LOG_LEVEL || 'info',
};

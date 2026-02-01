const crypto = require('crypto');
const moodleConfig = require('../config/moodle');

/**
 * Verify Moodle webhook signature
 */
exports.verifyMoodleWebhook = (req, res, next) => {
  try {
    const signature = req.headers['x-moodle-signature'];
    const webhookSecret = moodleConfig.webhookSecret;

    if (!webhookSecret) {
      // If no secret configured, skip verification (development mode)
      console.warn('Moodle webhook secret not configured - skipping verification');
      return next();
    }

    if (!signature) {
      return res.status(401).json({
        success: false,
        message: 'Missing webhook signature'
      });
    }

    // Create HMAC of the request body
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const body = JSON.stringify(req.body);
    const expectedSignature = hmac.update(body).digest('hex');

    // Compare signatures
    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    next();
  } catch (error) {
    console.error('Webhook verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Webhook verification failed'
    });
  }
};

/**
 * Log webhook events for debugging
 */
exports.logWebhook = (req, res, next) => {
  console.log('Moodle Webhook Event:', {
    event: req.body.eventname,
    timestamp: new Date().toISOString(),
    data: req.body
  });
  next();
};

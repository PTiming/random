const nodemailer = require('nodemailer');
const config = require('../../config');

/**
 * Email Service for sending notification emails
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (config.email.host && config.email.user) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass
        }
      });
    }
  }

  /**
   * Send notification email
   */
  static async sendNotificationEmail(user, notification) {
    const service = new EmailService();
    if (!service.transporter) {
      console.warn('Email transporter not configured');
      return false;
    }

    try {
      const html = service.generateNotificationEmailHTML(user, notification);
      
      await service.transporter.sendMail({
        from: config.email.from,
        to: user.email,
        subject: notification.title,
        html
      });

      return true;
    } catch (error) {
      console.error('Send notification email error:', error);
      return false;
    }
  }

  /**
   * Send email digest
   */
  static async sendDigestEmail(user, notifications, frequency) {
    const service = new EmailService();
    if (!service.transporter) {
      console.warn('Email transporter not configured');
      return false;
    }

    try {
      const frequencyLabel = {
        hourly: 'Hourly',
        daily: 'Daily',
        weekly: 'Weekly'
      }[frequency] || 'Daily';

      const html = service.generateDigestEmailHTML(user, notifications, frequencyLabel);
      
      await service.transporter.sendMail({
        from: config.email.from,
        to: user.email,
        subject: `Your ${frequencyLabel} Notification Digest`,
        html
      });

      return true;
    } catch (error) {
      console.error('Send digest email error:', error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(user) {
    const service = new EmailService();
    if (!service.transporter) return false;

    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to EduConnect!</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.firstName},</h2>
              <p>Welcome to EduConnect - your educational social networking platform!</p>
              <p>Here's what you can do:</p>
              <ul>
                <li>Connect with classmates and instructors</li>
                <li>Join course communities and study groups</li>
                <li>Stay updated with your Moodle courses</li>
                <li>Share resources and collaborate on projects</li>
                <li>Never miss a deadline with smart notifications</li>
              </ul>
              <a href="${config.client.url}" class="button">Get Started</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EduConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await service.transporter.sendMail({
        from: config.email.from,
        to: user.email,
        subject: 'Welcome to EduConnect!',
        html
      });

      return true;
    } catch (error) {
      console.error('Send welcome email error:', error);
      return false;
    }
  }

  /**
   * Generate notification email HTML
   */
  generateNotificationEmailHTML(user, notification) {
    const iconMap = {
      'new_comment': '💬',
      'new_reaction': '❤️',
      'new_mention': '📣',
      'new_message': '✉️',
      'connection_request': '🤝',
      'moodle_assignment': '📝',
      'moodle_deadline': '⏰',
      'moodle_grade': '📊',
      'moodle_announcement': '📢',
      'group_invitation': '👥'
    };

    const icon = iconMap[notification.type] || '🔔';
    const actionUrl = notification.actionUrl || config.client.url;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { background: #ffffff; padding: 30px; }
          .notification-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .icon { font-size: 24px; margin-right: 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .unsubscribe { color: #999; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">EduConnect</h2>
          </div>
          <div class="content">
            <p>Hi ${user.firstName},</p>
            <div class="notification-card">
              <span class="icon">${icon}</span>
              <strong>${notification.title}</strong>
              <p style="margin: 10px 0 0 0;">${notification.message}</p>
            </div>
            <a href="${actionUrl}" class="button">View Details</a>
          </div>
          <div class="footer">
            <p>You're receiving this email because you have notifications enabled.</p>
            <p><a href="${config.client.url}/settings/notifications" class="unsubscribe">Manage notification preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate digest email HTML
   */
  generateDigestEmailHTML(user, notifications, frequencyLabel) {
    const notificationItems = notifications.map(n => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          <strong>${n.title}</strong><br>
          <span style="color: #666;">${n.message}</span><br>
          <small style="color: #999;">${new Date(n.createdAt).toLocaleString()}</small>
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { background: #ffffff; padding: 30px; }
          .notification-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .summary { background: #f0f4ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">Your ${frequencyLabel} Digest</h2>
          </div>
          <div class="content">
            <p>Hi ${user.firstName},</p>
            <div class="summary">
              <strong>You have ${notifications.length} new notification${notifications.length !== 1 ? 's' : ''}</strong>
            </div>
            <table class="notification-table">
              ${notificationItems}
            </table>
            <center>
              <a href="${config.client.url}/notifications" class="button">View All Notifications</a>
            </center>
          </div>
          <div class="footer">
            <p>This is your ${frequencyLabel.toLowerCase()} notification digest.</p>
            <p><a href="${config.client.url}/settings/notifications">Change digest frequency</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = EmailService;

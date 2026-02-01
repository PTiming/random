const axios = require('axios');
const cron = require('node-cron');

class MoodleService {
  constructor() {
    this.moodleUrl = process.env.MOODLE_URL || '';
    this.wsToken = process.env.MOODLE_WS_TOKEN || '';
    this.wsFunction = 'webservice/rest/server.php';
  }

  /**
   * Make a request to Moodle Web Services API
   */
  async makeRequest(functionName, params = {}) {
    try {
      const response = await axios.get(`${this.moodleUrl}/${this.wsFunction}`, {
        params: {
          wstoken: this.wsToken,
          wsfunction: functionName,
          moodlewsrestformat: 'json',
          ...params
        }
      });

      if (response.data.exception) {
        throw new Error(response.data.message || 'Moodle API error');
      }

      return response.data;
    } catch (error) {
      console.error(`Moodle API Error (${functionName}):`, error.message);
      throw error;
    }
  }

  /**
   * Get user information from Moodle
   */
  async getUserById(moodleUserId) {
    return await this.makeRequest('core_user_get_users_by_field', {
      field: 'id',
      'values[0]': moodleUserId
    });
  }

  /**
   * Get user's enrolled courses from Moodle
   */
  async getUserCourses(moodleUserId) {
    return await this.makeRequest('core_enrol_get_users_courses', {
      userid: moodleUserId
    });
  }

  /**
   * Get course details from Moodle
   */
  async getCourseById(moodleCourseId) {
    return await this.makeRequest('core_course_get_courses', {
      'options[ids][0]': moodleCourseId
    });
  }

  /**
   * Get enrolled users in a course
   */
  async getCourseEnrollments(moodleCourseId) {
    return await this.makeRequest('core_enrol_get_enrolled_users', {
      courseid: moodleCourseId
    });
  }

  /**
   * Get assignments for a course
   */
  async getCourseAssignments(moodleCourseId) {
    return await this.makeRequest('mod_assign_get_assignments', {
      'courseids[0]': moodleCourseId
    });
  }

  /**
   * Get grades for a user in a course
   */
  async getUserGrades(moodleCourseId, moodleUserId) {
    return await this.makeRequest('gradereport_user_get_grade_items', {
      courseid: moodleCourseId,
      userid: moodleUserId
    });
  }

  /**
   * Get forum discussions for a course
   */
  async getForumDiscussions(moodleForumId) {
    return await this.makeRequest('mod_forum_get_forum_discussions', {
      forumid: moodleForumId
    });
  }

  /**
   * Create a forum discussion in Moodle
   */
  async createForumDiscussion(moodleForumId, subject, message, moodleUserId) {
    return await this.makeRequest('mod_forum_add_discussion', {
      forumid: moodleForumId,
      subject: subject,
      message: message,
      userid: moodleUserId
    });
  }

  /**
   * Submit an assignment to Moodle
   */
  async submitAssignment(assignmentId, userId, submissionText, fileUrl = null) {
    const params = {
      assignmentid: assignmentId,
      userid: userId,
      'plugindata[onlinetext_editor][text]': submissionText,
      'plugindata[onlinetext_editor][format]': 1
    };

    if (fileUrl) {
      params['plugindata[files_filemanager]'] = fileUrl;
    }

    return await this.makeRequest('mod_assign_save_submission', params);
  }

  /**
   * Get calendar events from Moodle
   */
  async getCalendarEvents(moodleUserId, startDate, endDate) {
    return await this.makeRequest('core_calendar_get_calendar_events', {
      'events[userids][0]': moodleUserId,
      'options[timestart]': Math.floor(startDate.getTime() / 1000),
      'options[timeend]': Math.floor(endDate.getTime() / 1000)
    });
  }

  /**
   * Create a calendar event in Moodle
   */
  async createCalendarEvent(eventData) {
    return await this.makeRequest('core_calendar_create_calendar_events', {
      'events[0][name]': eventData.name,
      'events[0][description]': eventData.description,
      'events[0][timestart]': Math.floor(eventData.timestart.getTime() / 1000),
      'events[0][timeduration]': eventData.duration || 3600,
      'events[0][courseid]': eventData.courseid,
      'events[0][userid]': eventData.userid
    });
  }

  /**
   * Authenticate user via Moodle
   */
  async authenticateUser(username, password) {
    try {
      const response = await axios.post(`${this.moodleUrl}/login/token.php`, null, {
        params: {
          username: username,
          password: password,
          service: 'moodle_mobile_app'
        }
      });

      if (response.data.token) {
        return {
          success: true,
          token: response.data.token,
          userId: response.data.userid
        };
      } else {
        throw new Error(response.data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Moodle authentication error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sync user data from Moodle
   */
  async syncUserFromMoodle(moodleUserId, localUser) {
    try {
      const moodleUserData = await this.getUserById(moodleUserId);
      const courses = await this.getUserCourses(moodleUserId);

      if (moodleUserData && moodleUserData.length > 0) {
        const userData = moodleUserData[0];
        
        // Update local user with Moodle data
        localUser.moodleId = userData.id.toString();
        localUser.moodleUsername = userData.username;
        localUser.moodleEmail = userData.email;
        localUser.firstName = userData.firstname;
        localUser.lastName = userData.lastname;
        localUser.lastMoodleSync = new Date();

        return {
          success: true,
          user: localUser,
          courses: courses
        };
      }

      return { success: false, error: 'User not found in Moodle' };
    } catch (error) {
      console.error('Error syncing user from Moodle:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync course data from Moodle
   */
  async syncCourseFromMoodle(moodleCourseId) {
    try {
      const courseData = await this.getCourseById(moodleCourseId);
      const enrollments = await this.getCourseEnrollments(moodleCourseId);
      const assignments = await this.getCourseAssignments(moodleCourseId);

      return {
        success: true,
        course: courseData[0],
        enrollments: enrollments,
        assignments: assignments
      };
    } catch (error) {
      console.error('Error syncing course from Moodle:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule periodic sync
   */
  scheduleSync(callback, frequency = 'hourly') {
    let cronExpression;
    
    switch (frequency) {
      case 'realtime':
        // Real-time handled by webhooks
        return;
      case 'hourly':
        cronExpression = '0 * * * *'; // Every hour
        break;
      case 'daily':
        cronExpression = '0 0 * * *'; // Every day at midnight
        break;
      default:
        cronExpression = '0 * * * *'; // Default to hourly
    }

    cron.schedule(cronExpression, callback);
    console.log(`Scheduled sync job: ${frequency}`);
  }
}

module.exports = new MoodleService();

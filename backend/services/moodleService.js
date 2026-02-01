const axios = require('axios');

class MoodleService {
  constructor(moodleUrl, token) {
    this.moodleUrl = moodleUrl || process.env.MOODLE_URL;
    this.token = token;
    this.wsFunction = process.env.MOODLE_SERVICE || 'moodle_mobile_app';
  }

  // Build API URL
  buildUrl(wsfunction, params = {}) {
    const baseUrl = `${this.moodleUrl}/webservice/rest/server.php`;
    const urlParams = new URLSearchParams({
      wstoken: this.token,
      wsfunction,
      moodlewsrestformat: 'json',
      ...params
    });
    return `${baseUrl}?${urlParams.toString()}`;
  }

  // Make API request
  async makeRequest(wsfunction, params = {}) {
    try {
      const url = this.buildUrl(wsfunction, params);
      const response = await axios.get(url);
      
      if (response.data.exception) {
        throw new Error(response.data.message || 'Moodle API error');
      }
      
      return response.data;
    } catch (error) {
      console.error('Moodle API Error:', error.message);
      throw error;
    }
  }

  // Authenticate user with Moodle
  async authenticateUser(username, password) {
    try {
      const loginUrl = `${this.moodleUrl}/login/token.php`;
      const response = await axios.post(loginUrl, null, {
        params: {
          username,
          password,
          service: this.wsFunction
        }
      });

      if (response.data.token) {
        return {
          success: true,
          token: response.data.token
        };
      }

      return {
        success: false,
        error: response.data.error || 'Authentication failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user info
  async getUserInfo() {
    return await this.makeRequest('core_webservice_get_site_info');
  }

  // Get user's enrolled courses
  async getUserCourses(userId) {
    return await this.makeRequest('core_enrol_get_users_courses', { userid: userId });
  }

  // Get course content
  async getCourseContent(courseId) {
    return await this.makeRequest('core_course_get_contents', { courseid: courseId });
  }

  // Get course details
  async getCourseDetails(courseIds) {
    const ids = Array.isArray(courseIds) ? courseIds : [courseIds];
    return await this.makeRequest('core_course_get_courses', {
      'options[ids]': ids.join(',')
    });
  }

  // Get assignments for a course
  async getCourseAssignments(courseIds) {
    const ids = Array.isArray(courseIds) ? courseIds : [courseIds];
    return await this.makeRequest('mod_assign_get_assignments', {
      'courseids[]': ids
    });
  }

  // Get user's grades for a course
  async getUserGrades(courseId, userId) {
    return await this.makeRequest('gradereport_user_get_grade_items', {
      courseid: courseId,
      userid: userId
    });
  }

  // Get user's overall grades
  async getUserOverviewGrades() {
    return await this.makeRequest('gradereport_overview_get_course_grades');
  }

  // Get course participants
  async getCourseParticipants(courseId) {
    return await this.makeRequest('core_enrol_get_enrolled_users', {
      courseid: courseId
    });
  }

  // Get calendar events
  async getCalendarEvents(options = {}) {
    return await this.makeRequest('core_calendar_get_calendar_events', {
      'events[courseids]': options.courseIds || [],
      'options[timestart]': options.timestart || Math.floor(Date.now() / 1000),
      'options[timeend]': options.timeend || Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    });
  }

  // Get upcoming events/deadlines
  async getUpcomingEvents(limit = 10) {
    return await this.makeRequest('core_calendar_get_calendar_upcoming_view', {
      limit
    });
  }

  // Get forum discussions
  async getForumDiscussions(forumId, page = 0, perPage = 10) {
    return await this.makeRequest('mod_forum_get_forum_discussions', {
      forumid: forumId,
      page,
      perpage: perPage
    });
  }

  // Get quiz attempts
  async getQuizAttempts(quizId, userId) {
    return await this.makeRequest('mod_quiz_get_user_attempts', {
      quizid: quizId,
      userid: userId,
      status: 'all'
    });
  }

  // Get notifications
  async getNotifications(limit = 20) {
    return await this.makeRequest('message_popup_get_popup_notifications', {
      limit
    });
  }

  // Get private messages
  async getPrivateMessages(userId, type = 'conversations') {
    return await this.makeRequest('core_message_get_conversations', {
      userid: userId,
      type: type === 'conversations' ? 1 : 2
    });
  }

  // Search courses
  async searchCourses(criteria) {
    return await this.makeRequest('core_course_search_courses', {
      criterianame: 'search',
      criteriavalue: criteria
    });
  }

  // Get recent activity
  async getRecentActivity(courseId) {
    return await this.makeRequest('core_course_get_updates_since', {
      courseid: courseId,
      since: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60) // Last 7 days
    });
  }

  // Submit assignment
  async submitAssignment(assignmentId, text) {
    return await this.makeRequest('mod_assign_save_submission', {
      assignmentid: assignmentId,
      'plugindata[onlinetext_editor][text]': text,
      'plugindata[onlinetext_editor][format]': 1
    });
  }
}

module.exports = MoodleService;

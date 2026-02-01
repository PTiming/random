const axios = require('axios');
const config = require('../config/config');

/**
 * MoodleService - Handles all interactions with Moodle's Web Services API
 * 
 * Moodle Web Services: https://docs.moodle.org/dev/Web_services
 * 
 * Before using this service, you need to:
 * 1. Enable web services in Moodle (Site administration > Advanced features)
 * 2. Enable REST protocol (Site administration > Plugins > Web services > Manage protocols)
 * 3. Create a web service token (Site administration > Plugins > Web services > Manage tokens)
 */

class MoodleService {
  constructor(moodleUrl = null, token = null) {
    this.moodleUrl = moodleUrl || config.moodle.url;
    this.token = token || config.moodle.token;
    this.webServiceEndpoint = `${this.moodleUrl}/webservice/rest/server.php`;
  }

  /**
   * Make a request to Moodle Web Services
   */
  async makeRequest(wsfunction, params = {}) {
    try {
      const requestParams = new URLSearchParams({
        wstoken: this.token,
        wsfunction: wsfunction,
        moodlewsrestformat: 'json',
        ...params
      });

      const response = await axios.post(this.webServiceEndpoint, requestParams.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Check for Moodle error response
      if (response.data && response.data.exception) {
        throw new Error(`Moodle Error: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Moodle API Error: ${error.response.status} - ${error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Get site info (useful for testing connection)
   */
  async getSiteInfo() {
    return await this.makeRequest('core_webservice_get_site_info');
  }

  /**
   * Get user information by field
   * @param {string} field - Field to search by (id, username, email)
   * @param {string} value - Value to search for
   */
  async getUser(field, value) {
    const params = {};
    params[`field`] = field;
    params[`values[0]`] = value;

    const users = await this.makeRequest('core_user_get_users_by_field', params);
    return users && users.length > 0 ? users[0] : null;
  }

  /**
   * Get all courses the user is enrolled in
   * @param {string} userId - Moodle user ID
   */
  async getUserCourses(userId) {
    return await this.makeRequest('core_enrol_get_users_courses', {
      userid: userId
    });
  }

  /**
   * Get course details by ID
   * @param {string} courseId - Moodle course ID
   */
  async getCourseById(courseId) {
    const params = {
      'options[ids][0]': courseId
    };
    const courses = await this.makeRequest('core_course_get_courses', params);
    return courses && courses.length > 0 ? courses[0] : null;
  }

  /**
   * Get course content (sections and activities)
   * @param {string} courseId - Moodle course ID
   */
  async getCourseContents(courseId) {
    return await this.makeRequest('core_course_get_contents', {
      courseid: courseId
    });
  }

  /**
   * Get enrolled users in a course
   * @param {string} courseId - Moodle course ID
   */
  async getCourseEnrolledUsers(courseId) {
    return await this.makeRequest('core_enrol_get_enrolled_users', {
      courseid: courseId
    });
  }

  /**
   * Get user grades for a course
   * @param {string} courseId - Moodle course ID
   * @param {string} userId - Moodle user ID (optional, for specific user)
   */
  async getCourseGrades(courseId, userId = null) {
    const params = { courseid: courseId };
    if (userId) {
      params.userid = userId;
    }
    return await this.makeRequest('gradereport_user_get_grade_items', params);
  }

  /**
   * Get user's assignments for a course
   * @param {string[]} courseIds - Array of Moodle course IDs
   */
  async getAssignments(courseIds) {
    const params = {};
    courseIds.forEach((id, index) => {
      params[`courseids[${index}]`] = id;
    });
    return await this.makeRequest('mod_assign_get_assignments', params);
  }

  /**
   * Get user's assignment submissions
   * @param {string} assignmentId - Assignment ID
   */
  async getAssignmentSubmissions(assignmentId) {
    return await this.makeRequest('mod_assign_get_submissions', {
      'assignmentids[0]': assignmentId
    });
  }

  /**
   * Get forum discussions
   * @param {string} forumId - Forum ID
   */
  async getForumDiscussions(forumId) {
    return await this.makeRequest('mod_forum_get_forum_discussions', {
      forumid: forumId
    });
  }

  /**
   * Get quiz attempts for a user
   * @param {string} quizId - Quiz ID
   * @param {string} userId - Moodle user ID
   */
  async getQuizAttempts(quizId, userId) {
    return await this.makeRequest('mod_quiz_get_user_attempts', {
      quizid: quizId,
      userid: userId
    });
  }

  /**
   * Get calendar events for a user
   * @param {Object} options - Options for filtering events
   */
  async getCalendarEvents(options = {}) {
    const params = {
      'events[courseids][0]': options.courseId || '',
      'options[timestart]': options.timeStart || Math.floor(Date.now() / 1000),
      'options[timeend]': options.timeEnd || Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    };
    return await this.makeRequest('core_calendar_get_calendar_events', params);
  }

  /**
   * Search courses
   * @param {string} query - Search query
   */
  async searchCourses(query) {
    return await this.makeRequest('core_course_search_courses', {
      criterianame: 'search',
      criteriavalue: query
    });
  }

  /**
   * Get categories
   */
  async getCategories() {
    return await this.makeRequest('core_course_get_categories');
  }

  /**
   * Authenticate user and get token (requires separate auth endpoint)
   * This uses the login/token.php endpoint instead of web services
   */
  async authenticateUser(username, password) {
    try {
      const tokenEndpoint = `${this.moodleUrl}/login/token.php`;
      const response = await axios.post(tokenEndpoint, null, {
        params: {
          username: username,
          password: password,
          service: config.moodle.service
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      throw new Error(`Moodle authentication failed: ${error.message}`);
    }
  }

  /**
   * Update instance with user-specific token
   */
  setUserToken(token) {
    this.token = token;
  }
}

module.exports = MoodleService;

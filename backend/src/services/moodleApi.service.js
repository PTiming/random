const axios = require('axios');
const moodleConfig = require('../config/moodle');

/**
 * Moodle API Service
 * Handles all direct communication with Moodle's Web Services API
 */
class MoodleApiService {
  constructor() {
    this.baseUrl = moodleConfig.baseUrl;
    this.token = moodleConfig.token;
    this.endpoint = moodleConfig.endpoints.webservice;
  }

  /**
   * Make a request to Moodle Web Services API
   */
  async callMoodleApi(functionName, params = {}) {
    try {
      const url = `${this.baseUrl}${this.endpoint}`;
      const requestParams = {
        wstoken: this.token,
        wsfunction: functionName,
        moodlewsrestformat: 'json',
        ...params
      };

      const response = await axios.post(url, null, {
        params: requestParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Check for Moodle errors
      if (response.data && response.data.exception) {
        throw new Error(`Moodle API Error: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      console.error(`Moodle API call failed for ${functionName}:`, error.message);
      throw error;
    }
  }

  // ============ USER FUNCTIONS ============

  /**
   * Create a user in Moodle
   */
  async createUser(userData) {
    const params = {
      'users[0][username]': userData.username || userData.email.split('@')[0],
      'users[0][email]': userData.email,
      'users[0][firstname]': userData.firstName,
      'users[0][lastname]': userData.lastName,
      'users[0][password]': userData.password || this.generatePassword(),
      'users[0][auth]': 'manual'
    };

    const result = await this.callMoodleApi(
      moodleConfig.endpoints.functions.createUsers,
      params
    );

    return result[0]; // Return created user
  }

  /**
   * Update a user in Moodle
   */
  async updateUser(moodleUserId, userData) {
    const params = {
      'users[0][id]': moodleUserId
    };

    if (userData.email) params['users[0][email]'] = userData.email;
    if (userData.firstName) params['users[0][firstname]'] = userData.firstName;
    if (userData.lastName) params['users[0][lastname]'] = userData.lastName;

    return await this.callMoodleApi(
      moodleConfig.endpoints.functions.updateUsers,
      params
    );
  }

  /**
   * Get user by field (email, username, or id)
   */
  async getUserByField(field, value) {
    const result = await this.callMoodleApi(
      moodleConfig.endpoints.functions.getUsersByField,
      { field, 'values[0]': value }
    );

    return result[0] || null;
  }

  /**
   * Get user by Moodle ID
   */
  async getUserById(moodleUserId) {
    return await this.getUserByField('id', moodleUserId);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    return await this.getUserByField('email', email);
  }

  // ============ COURSE FUNCTIONS ============

  /**
   * Get all courses from Moodle
   */
  async getCourses() {
    return await this.callMoodleApi(moodleConfig.endpoints.functions.getCourses);
  }

  /**
   * Get course by Moodle ID
   */
  async getCourseById(moodleCourseId) {
    const result = await this.callMoodleApi(
      moodleConfig.endpoints.functions.getCoursesByField,
      { field: 'id', value: moodleCourseId }
    );

    return result.courses ? result.courses[0] : null;
  }

  /**
   * Get course by short name
   */
  async getCourseByShortName(shortName) {
    const result = await this.callMoodleApi(
      moodleConfig.endpoints.functions.getCoursesByField,
      { field: 'shortname', value: shortName }
    );

    return result.courses ? result.courses[0] : null;
  }

  /**
   * Create a course in Moodle
   */
  async createCourse(courseData) {
    const params = {
      'courses[0][fullname]': courseData.title,
      'courses[0][shortname]': courseData.shortName,
      'courses[0][categoryid]': courseData.categoryId || 1,
      'courses[0][summary]': courseData.description || '',
      'courses[0][format]': 'topics',
      'courses[0][visible]': courseData.isPublished ? 1 : 0
    };

    if (courseData.startDate) {
      params['courses[0][startdate]'] = Math.floor(new Date(courseData.startDate).getTime() / 1000);
    }

    if (courseData.endDate) {
      params['courses[0][enddate]'] = Math.floor(new Date(courseData.endDate).getTime() / 1000);
    }

    const result = await this.callMoodleApi(
      moodleConfig.endpoints.functions.createCourses,
      params
    );

    return result[0]; // Return created course
  }

  /**
   * Update a course in Moodle
   */
  async updateCourse(moodleCourseId, courseData) {
    const params = {
      'courses[0][id]': moodleCourseId
    };

    if (courseData.title) params['courses[0][fullname]'] = courseData.title;
    if (courseData.shortName) params['courses[0][shortname]'] = courseData.shortName;
    if (courseData.description) params['courses[0][summary]'] = courseData.description;
    if (courseData.isPublished !== undefined) {
      params['courses[0][visible]'] = courseData.isPublished ? 1 : 0;
    }

    return await this.callMoodleApi(
      moodleConfig.endpoints.functions.updateCourses,
      params
    );
  }

  // ============ ENROLLMENT FUNCTIONS ============

  /**
   * Enroll a user in a course
   */
  async enrollUser(moodleUserId, moodleCourseId, roleId = 5) {
    // Role IDs: 1=manager, 3=teacher, 4=non-editing teacher, 5=student
    const params = {
      'enrolments[0][userid]': moodleUserId,
      'enrolments[0][courseid]': moodleCourseId,
      'enrolments[0][roleid]': roleId
    };

    return await this.callMoodleApi(
      moodleConfig.endpoints.functions.enrollUsers,
      params
    );
  }

  /**
   * Unenroll a user from a course
   */
  async unenrollUser(moodleUserId, moodleCourseId) {
    const params = {
      'enrolments[0][userid]': moodleUserId,
      'enrolments[0][courseid]': moodleCourseId
    };

    return await this.callMoodleApi(
      moodleConfig.endpoints.functions.unenrollUsers,
      params
    );
  }

  /**
   * Get enrolled users in a course
   */
  async getEnrolledUsers(moodleCourseId) {
    return await this.callMoodleApi(
      moodleConfig.endpoints.functions.getEnrolledUsers,
      { courseid: moodleCourseId }
    );
  }

  /**
   * Get courses a user is enrolled in
   */
  async getUserCourses(moodleUserId) {
    return await this.callMoodleApi(
      moodleConfig.endpoints.functions.getUserCourses,
      { userid: moodleUserId }
    );
  }

  // ============ GRADE FUNCTIONS ============

  /**
   * Get grades for a course
   */
  async getCourseGrades(moodleCourseId, moodleUserId = null) {
    const params = { courseid: moodleCourseId };
    if (moodleUserId) params.userid = moodleUserId;

    return await this.callMoodleApi(
      moodleConfig.endpoints.functions.getCourseGrades,
      params
    );
  }

  /**
   * Get grades for specific items
   */
  async getGrades(moodleCourseId, itemIds, userIds) {
    const params = {
      courseid: moodleCourseId
    };

    if (itemIds && itemIds.length) {
      itemIds.forEach((id, index) => {
        params[`itemids[${index}]`] = id;
      });
    }

    if (userIds && userIds.length) {
      userIds.forEach((id, index) => {
        params[`userids[${index}]`] = id;
      });
    }

    return await this.callMoodleApi(
      moodleConfig.endpoints.functions.getGrades,
      params
    );
  }

  // ============ ASSIGNMENT FUNCTIONS ============

  /**
   * Get assignments for courses
   */
  async getAssignments(moodleCourseIds) {
    const params = {};
    moodleCourseIds.forEach((id, index) => {
      params[`courseids[${index}]`] = id;
    });

    return await this.callMoodleApi(
      moodleConfig.endpoints.functions.getAssignments,
      params
    );
  }

  /**
   * Get submissions for an assignment
   */
  async getSubmissions(assignmentIds) {
    const params = {};
    assignmentIds.forEach((id, index) => {
      params[`assignmentids[${index}]`] = id;
    });

    return await this.callMoodleApi(
      moodleConfig.endpoints.functions.getSubmissions,
      params
    );
  }

  // ============ COMPLETION FUNCTIONS ============

  /**
   * Get course completion status
   */
  async getCourseCompletion(moodleCourseId, moodleUserId) {
    return await this.callMoodleApi(
      moodleConfig.endpoints.functions.getCourseCompletion,
      { courseid: moodleCourseId, userid: moodleUserId }
    );
  }

  /**
   * Get activities completion status
   */
  async getActivitiesCompletion(moodleCourseId, moodleUserId) {
    return await this.callMoodleApi(
      moodleConfig.endpoints.functions.getActivitiesCompletion,
      { courseid: moodleCourseId, userid: moodleUserId }
    );
  }

  // ============ HELPER FUNCTIONS ============

  /**
   * Generate a random password
   */
  generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

module.exports = new MoodleApiService();

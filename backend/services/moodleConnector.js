const axios = require('axios');

class MoodleConnector {
  constructor() {
    this.baseUrl = process.env.MOODLE_URL;
    this.token = process.env.MOODLE_TOKEN;
    this.serviceName = process.env.MOODLE_SERVICE || 'moodle_mobile_app';
  }

  /**
   * Generic Moodle API call
   */
  async callMoodleAPI(wsfunction, params = {}) {
    try {
      const url = `${this.baseUrl}/webservice/rest/server.php`;
      const response = await axios.get(url, {
        params: {
          wstoken: this.token,
          wsfunction,
          moodlewsrestformat: 'json',
          ...params
        }
      });

      if (response.data.exception) {
        throw new Error(response.data.message || 'Moodle API Error');
      }

      return response.data;
    } catch (error) {
      console.error(`Moodle API Error (${wsfunction}):`, error.message);
      throw error;
    }
  }

  /**
   * User Authentication & Profile
   */
  async authenticateUser(username, password) {
    // Note: This requires custom Moodle plugin or OAuth2
    return await this.callMoodleAPI('auth_userkey_request_login_url', {
      user: { username }
    });
  }

  async getUserProfile(userid) {
    const users = await this.callMoodleAPI('core_user_get_users_by_field', {
      field: 'id',
      'values[0]': userid
    });
    return users[0] || null;
  }

  async getUsersByIds(userids) {
    const params = {};
    userids.forEach((id, index) => {
      params[`userids[${index}]`] = id;
    });
    return await this.callMoodleAPI('core_user_get_users', params);
  }

  /**
   * Course Management
   */
  async getUserCourses(userid) {
    return await this.callMoodleAPI('core_enrol_get_users_courses', {
      userid
    });
  }

  async getCourseDetails(courseid) {
    const courses = await this.callMoodleAPI('core_course_get_courses', {
      'options[ids][0]': courseid
    });
    return courses[0] || null;
  }

  async getCourseContents(courseid) {
    return await this.callMoodleAPI('core_course_get_contents', {
      courseid
    });
  }

  async getEnrolledUsers(courseid) {
    return await this.callMoodleAPI('core_enrol_get_enrolled_users', {
      courseid
    });
  }

  /**
   * Assignments
   */
  async getCourseAssignments(courseids) {
    const params = {};
    courseids.forEach((id, index) => {
      params[`courseids[${index}]`] = id;
    });
    return await this.callMoodleAPI('mod_assign_get_assignments', params);
  }

  async getAssignmentSubmissions(assignmentid) {
    return await this.callMoodleAPI('mod_assign_get_submissions', {
      assignmentids: [assignmentid]
    });
  }

  async submitAssignment(assignmentid, userid, submission) {
    // Note: Requires appropriate permissions
    return await this.callMoodleAPI('mod_assign_save_submission', {
      assignmentid,
      plugindata: submission
    });
  }

  async gradeAssignment(assignmentid, userid, grade, feedback = '') {
    return await this.callMoodleAPI('mod_assign_save_grade', {
      assignmentid,
      userid,
      grade: grade,
      attemptnumber: -1,
      addattempt: 0,
      workflowstate: '',
      applytoall: 0,
      plugindata: {
        assignfeedbackcomments_editor: {
          text: feedback,
          format: 1
        }
      }
    });
  }

  /**
   * Grades
   */
  async getGrades(userid, courseid) {
    return await this.callMoodleAPI('gradereport_user_get_grade_items', {
      userid,
      courseid
    });
  }

  /**
   * Forums & Discussions
   */
  async getCourseForums(courseid) {
    return await this.callMoodleAPI('mod_forum_get_forums_by_courses', {
      'courseids[0]': courseid
    });
  }

  async getForumDiscussions(forumid) {
    return await this.callMoodleAPI('mod_forum_get_forum_discussions', {
      forumid
    });
  }

  async createForumDiscussion(forumid, subject, message) {
    return await this.callMoodleAPI('mod_forum_add_discussion', {
      forumid,
      subject,
      message,
      options: []
    });
  }

  async addForumPost(postid, subject, message) {
    return await this.callMoodleAPI('mod_forum_add_discussion_post', {
      postid,
      subject,
      message
    });
  }

  /**
   * Calendar Events
   */
  async getCalendarEvents(userid) {
    return await this.callMoodleAPI('core_calendar_get_calendar_events', {
      'options[userevents]': 1,
      'options[siteevents]': 1,
      'events[userids][0]': userid
    });
  }

  async createCalendarEvent(event) {
    return await this.callMoodleAPI('core_calendar_create_calendar_events', {
      'events[0]': event
    });
  }

  /**
   * Resources & Files
   */
  async uploadFile(filepath, filearea = 'draft') {
    // Note: File upload requires multipart/form-data
    // This is a simplified version
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    
    form.append('token', this.token);
    form.append('filepath', '/');
    form.append('itemid', 0);
    form.append('file', fs.createReadStream(filepath));

    const response = await axios.post(
      `${this.baseUrl}/webservice/upload.php`,
      form,
      { headers: form.getHeaders() }
    );

    return response.data;
  }

  /**
   * Webhooks & Real-time Sync
   */
  async registerWebhook(event, callbackUrl) {
    // Note: Requires custom Moodle plugin for webhook support
    // This is a placeholder for future implementation
    console.log(`Webhook registration for ${event} -> ${callbackUrl}`);
    return { success: true, event, callbackUrl };
  }
}

module.exports = new MoodleConnector();

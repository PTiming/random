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

  // ==========================================
  // WRITE OPERATIONS (Two-Way Data Sync)
  // ==========================================

  // Make POST request for write operations
  async makePostRequest(wsfunction, data = {}) {
    try {
      const baseUrl = `${this.moodleUrl}/webservice/rest/server.php`;
      const params = new URLSearchParams({
        wstoken: this.token,
        wsfunction,
        moodlewsrestformat: 'json'
      });

      const response = await axios.post(`${baseUrl}?${params.toString()}`, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data && response.data.exception) {
        throw new Error(response.data.message || 'Moodle API error');
      }

      return response.data;
    } catch (error) {
      console.error('Moodle POST API Error:', error.message);
      throw error;
    }
  }

  // Submit assignment (text submission)
  async submitAssignment(assignmentId, text) {
    const data = new URLSearchParams();
    data.append('assignmentid', assignmentId);
    data.append('plugindata[onlinetext_editor][text]', text);
    data.append('plugindata[onlinetext_editor][format]', 1);

    return await this.makePostRequest('mod_assign_save_submission', data);
  }

  // Submit assignment for grading (after saving)
  async submitAssignmentForGrading(assignmentId) {
    const data = new URLSearchParams();
    data.append('assignmentid', assignmentId);

    return await this.makePostRequest('mod_assign_submit_for_grading', data);
  }

  // Get assignment submission status
  async getAssignmentSubmissionStatus(assignmentId, userId) {
    return await this.makeRequest('mod_assign_get_submission_status', {
      assignid: assignmentId,
      userid: userId
    });
  }

  // Create forum discussion
  async createForumDiscussion(forumId, subject, message, options = {}) {
    const data = new URLSearchParams();
    data.append('forumid', forumId);
    data.append('subject', subject);
    data.append('message', message);
    data.append('options[discussionsubscribe]', options.subscribe ? 1 : 0);

    if (options.groupId) {
      data.append('groupid', options.groupId);
    }

    return await this.makePostRequest('mod_forum_add_discussion', data);
  }

  // Reply to forum discussion
  async replyToForumPost(postId, subject, message) {
    const data = new URLSearchParams();
    data.append('postid', postId);
    data.append('subject', subject);
    data.append('message', message);

    return await this.makePostRequest('mod_forum_add_discussion_post', data);
  }

  // Get forum by course module ID
  async getForumByCourseModule(cmid) {
    return await this.makeRequest('mod_forum_get_forums_by_courses', {
      'courseids[]': cmid
    });
  }

  // Send instant message to Moodle user
  async sendInstantMessage(toUserId, text) {
    const data = new URLSearchParams();
    data.append('messages[0][touserid]', toUserId);
    data.append('messages[0][text]', text);
    data.append('messages[0][textformat]', 1); // HTML format

    return await this.makePostRequest('core_message_send_instant_messages', data);
  }

  // Send message to conversation
  async sendMessageToConversation(conversationId, text) {
    const data = new URLSearchParams();
    data.append('conversationid', conversationId);
    data.append('messages[0][text]', text);
    data.append('messages[0][textformat]', 1);

    return await this.makePostRequest('core_message_send_messages_to_conversation', data);
  }

  // Create a new conversation (private message)
  async createConversation(userIds, name = null) {
    const data = new URLSearchParams();
    userIds.forEach((id, index) => {
      data.append(`userids[${index}]`, id);
    });
    if (name) {
      data.append('name', name);
    }
    data.append('type', userIds.length > 1 ? 2 : 1); // 1 = individual, 2 = group

    return await this.makePostRequest('core_message_create_conversation', data);
  }

  // Mark messages as read
  async markMessagesAsRead(userId, conversationId) {
    const data = new URLSearchParams();
    data.append('userid', userId);
    data.append('conversationid', conversationId);

    return await this.makePostRequest('core_message_mark_all_conversation_messages_as_read', data);
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    const data = new URLSearchParams();
    data.append('notificationid', notificationId);

    return await this.makePostRequest('core_message_mark_notification_read', data);
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(userId) {
    const data = new URLSearchParams();
    data.append('useridto', userId);

    return await this.makePostRequest('core_message_mark_all_notifications_as_read', data);
  }

  // Create calendar event
  async createCalendarEvent(event) {
    const data = new URLSearchParams();
    data.append('events[0][name]', event.name);
    data.append('events[0][description]', event.description || '');
    data.append('events[0][format]', 1);
    data.append('events[0][courseid]', event.courseId || 0);
    data.append('events[0][groupid]', event.groupId || 0);
    data.append('events[0][repeats]', event.repeats || 0);
    data.append('events[0][eventtype]', event.eventType || 'user');
    data.append('events[0][timestart]', event.timeStart);
    data.append('events[0][timeduration]', event.duration || 0);

    return await this.makePostRequest('core_calendar_create_calendar_events', data);
  }

  // Delete calendar event
  async deleteCalendarEvent(eventId, repeat = false) {
    const data = new URLSearchParams();
    data.append('events[0][eventid]', eventId);
    data.append('events[0][repeat]', repeat ? 1 : 0);

    return await this.makePostRequest('core_calendar_delete_calendar_events', data);
  }

  // Update user profile preferences
  async updateUserPreferences(userId, preferences) {
    const data = new URLSearchParams();
    data.append('userid', userId);
    
    preferences.forEach((pref, index) => {
      data.append(`preferences[${index}][type]`, pref.type);
      data.append(`preferences[${index}][value]`, pref.value);
    });

    return await this.makePostRequest('core_user_update_user_preferences', data);
  }

  // Self-enroll in a course
  async selfEnrollInCourse(courseId, password = null) {
    const data = new URLSearchParams();
    data.append('courseid', courseId);
    if (password) {
      data.append('password', password);
    }

    return await this.makePostRequest('enrol_self_enrol_user', data);
  }

  // Get self-enrollment instances for a course
  async getSelfEnrollmentInfo(courseId) {
    return await this.makeRequest('enrol_self_get_instance_info', {
      instanceid: courseId
    });
  }

  // Upload a file (for assignment submissions)
  async uploadFile(fileContent, fileName, contextId, component = 'user', fileArea = 'draft', itemId = 0) {
    const data = new URLSearchParams();
    data.append('component', component);
    data.append('filearea', fileArea);
    data.append('itemid', itemId);
    data.append('filepath', '/');
    data.append('filename', fileName);
    data.append('filecontent', fileContent); // Base64 encoded
    data.append('contextlevel', 'user');
    data.append('instanceid', contextId);

    return await this.makePostRequest('core_files_upload', data);
  }

  // Submit assignment with file
  async submitAssignmentWithFile(assignmentId, fileItemId) {
    const data = new URLSearchParams();
    data.append('assignmentid', assignmentId);
    data.append('plugindata[files_filemanager]', fileItemId);

    return await this.makePostRequest('mod_assign_save_submission', data);
  }

  // Add note to user (for teachers/admins)
  async addUserNote(userId, courseId, text, publishState = 'personal') {
    const data = new URLSearchParams();
    data.append('notes[0][userid]', userId);
    data.append('notes[0][publishstate]', publishState); // 'personal', 'course', 'site'
    data.append('notes[0][courseid]', courseId);
    data.append('notes[0][text]', text);
    data.append('notes[0][format]', 1);

    return await this.makePostRequest('core_notes_create_notes', data);
  }

  // Complete activity (for completion tracking)
  async completeActivity(cmid, completed = true) {
    const data = new URLSearchParams();
    data.append('cmid', cmid);
    data.append('completed', completed ? 1 : 0);

    return await this.makePostRequest('core_completion_update_activity_completion_status_manually', data);
  }

  // Get completion status for course
  async getCourseCompletionStatus(courseId, userId) {
    return await this.makeRequest('core_completion_get_course_completion_status', {
      courseid: courseId,
      userid: userId
    });
  }

  // Rate a forum post
  async rateForumPost(contextId, component, ratingArea, itemId, rating, scaleId) {
    const data = new URLSearchParams();
    data.append('contextlevel', 'module');
    data.append('instanceid', contextId);
    data.append('component', component);
    data.append('ratingarea', ratingArea);
    data.append('itemid', itemId);
    data.append('scaleid', scaleId);
    data.append('rating', rating);

    return await this.makePostRequest('core_rating_add_rating', data);
  }
}

module.exports = MoodleService;

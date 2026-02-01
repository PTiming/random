const axios = require('axios');

/**
 * Moodle Web Services API Client
 * Handles all communication with Moodle LMS
 */
class MoodleService {
  constructor(moodleUrl, token) {
    this.baseUrl = moodleUrl;
    this.token = token;
    this.wsEndpoint = `${moodleUrl}/webservice/rest/server.php`;
  }

  /**
   * Make a request to Moodle Web Services
   */
  async makeRequest(wsfunction, params = {}) {
    try {
      const response = await axios.get(this.wsEndpoint, {
        params: {
          wstoken: this.token,
          wsfunction,
          moodlewsrestformat: 'json',
          ...params
        }
      });

      if (response.data.exception) {
        throw new Error(response.data.message || 'Moodle API error');
      }

      return response.data;
    } catch (error) {
      console.error(`Moodle API error (${wsfunction}):`, error.message);
      throw error;
    }
  }

  /**
   * Get current user information
   */
  async getUserInfo() {
    return this.makeRequest('core_webservice_get_site_info');
  }

  /**
   * Get user's enrolled courses
   */
  async getUserCourses(userId) {
    return this.makeRequest('core_enrol_get_users_courses', {
      userid: userId
    });
  }

  /**
   * Get course details
   */
  async getCourseDetails(courseId) {
    const courses = await this.makeRequest('core_course_get_courses', {
      'options[ids][0]': courseId
    });
    return courses[0];
  }

  /**
   * Get course contents (sections, modules, resources)
   */
  async getCourseContents(courseId) {
    return this.makeRequest('core_course_get_contents', {
      courseid: courseId
    });
  }

  /**
   * Get course resources
   */
  async getCourseResources(courseId) {
    const contents = await this.getCourseContents(courseId);
    const resources = [];

    for (const section of contents) {
      if (section.modules) {
        for (const module of section.modules) {
          resources.push({
            id: module.id,
            name: module.name,
            type: module.modname,
            url: module.url,
            description: module.description,
            section: section.id,
            sectionName: section.name,
            visible: module.visible,
            contents: module.contents || []
          });
        }
      }
    }

    return resources;
  }

  /**
   * Get assignments for a user
   */
  async getAssignments(userId, courseIds = []) {
    const params = {};
    
    if (courseIds.length > 0) {
      courseIds.forEach((id, index) => {
        params[`courseids[${index}]`] = id;
      });
    }

    const result = await this.makeRequest('mod_assign_get_assignments', params);
    
    // Format assignments
    const assignments = [];
    for (const course of result.courses || []) {
      for (const assignment of course.assignments || []) {
        assignments.push({
          id: assignment.id,
          courseId: course.id,
          courseName: course.fullname,
          name: assignment.name,
          description: assignment.intro,
          dueDate: assignment.duedate ? new Date(assignment.duedate * 1000) : null,
          allowSubmissionsFrom: assignment.allowsubmissionsfromdate 
            ? new Date(assignment.allowsubmissionsfromdate * 1000) : null,
          cutoffDate: assignment.cutoffdate 
            ? new Date(assignment.cutoffdate * 1000) : null,
          maxGrade: assignment.grade,
          submissionTypes: assignment.configs?.submissiontypes || []
        });
      }
    }

    return assignments;
  }

  /**
   * Get assignment submission status
   */
  async getAssignmentSubmissionStatus(assignmentId, userId) {
    return this.makeRequest('mod_assign_get_submission_status', {
      assignid: assignmentId,
      userid: userId
    });
  }

  /**
   * Submit assignment
   */
  async submitAssignment(assignmentId, submission) {
    // First, save the submission as draft
    if (submission.text) {
      await this.makeRequest('mod_assign_save_submission', {
        assignmentid: assignmentId,
        'plugindata[onlinetext_editor][text]': submission.text,
        'plugindata[onlinetext_editor][format]': 1
      });
    }

    // Then submit for grading
    return this.makeRequest('mod_assign_submit_for_grading', {
      assignmentid: assignmentId,
      acceptsubmissionstatement: 1
    });
  }

  /**
   * Get user grades
   */
  async getUserGrades(userId, courseId = null) {
    const courses = courseId 
      ? [{ id: courseId }]
      : await this.getUserCourses(userId);

    const grades = [];

    for (const course of courses) {
      try {
        const gradeReport = await this.makeRequest('gradereport_user_get_grade_items', {
          courseid: course.id,
          userid: userId
        });

        if (gradeReport.usergrades && gradeReport.usergrades[0]) {
          const userGrade = gradeReport.usergrades[0];
          grades.push({
            courseId: course.id,
            courseName: course.fullname || course.shortname,
            items: (userGrade.gradeitems || []).map(item => ({
              id: item.id,
              name: item.itemname,
              type: item.itemtype,
              module: item.itemmodule,
              grade: item.graderaw,
              maxGrade: item.grademax,
              percentage: item.percentageformatted,
              feedback: item.feedback,
              gradedAt: item.gradedategraded 
                ? new Date(item.gradedategraded * 1000) : null
            })),
            courseTotal: userGrade.gradeitems?.find(i => i.itemtype === 'course')?.graderaw,
            courseTotalMax: userGrade.gradeitems?.find(i => i.itemtype === 'course')?.grademax
          });
        }
      } catch (error) {
        console.error(`Error getting grades for course ${course.id}:`, error.message);
      }
    }

    return grades;
  }

  /**
   * Get calendar events
   */
  async getCalendarEvents(options = {}) {
    const params = {
      'options[userevents]': 1,
      'options[siteevents]': 1,
      'options[timestart]': options.timestart || Math.floor(Date.now() / 1000),
      'options[timeend]': options.timeend || Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000)
    };

    const result = await this.makeRequest('core_calendar_get_calendar_events', params);

    return (result.events || []).map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      eventType: event.eventtype,
      courseId: event.courseid,
      groupId: event.groupid,
      userId: event.userid,
      timeStart: new Date(event.timestart * 1000),
      duration: event.timeduration,
      visible: event.visible,
      moduleName: event.modulename,
      instance: event.instance
    }));
  }

  /**
   * Create calendar event
   */
  async createCalendarEvent(event) {
    return this.makeRequest('core_calendar_create_calendar_events', {
      'events[0][name]': event.name,
      'events[0][description]': event.description || '',
      'events[0][format]': 1,
      'events[0][courseid]': event.courseId || 0,
      'events[0][groupid]': event.groupId || 0,
      'events[0][repeats]': event.repeats || 0,
      'events[0][eventtype]': event.eventType || 'user',
      'events[0][timestart]': Math.floor(event.timeStart.getTime() / 1000),
      'events[0][timeduration]': event.duration || 0
    });
  }

  /**
   * Get forum discussions
   */
  async getForumDiscussions(forumId, page = 0, perPage = 10) {
    return this.makeRequest('mod_forum_get_forum_discussions', {
      forumid: forumId,
      sortby: 'timemodified',
      sortdirection: 'DESC',
      page,
      perpage: perPage
    });
  }

  /**
   * Create forum post
   */
  async createForumPost(postData) {
    if (postData.discussionId) {
      // Reply to existing discussion
      return this.makeRequest('mod_forum_add_discussion_post', {
        postid: postData.replyToId || postData.discussionId,
        subject: postData.subject,
        message: postData.message
      });
    } else {
      // Create new discussion
      return this.makeRequest('mod_forum_add_discussion', {
        forumid: postData.forumId,
        subject: postData.subject,
        message: postData.message
      });
    }
  }

  /**
   * Get user notifications
   */
  async getNotifications(userId, limit = 20) {
    const result = await this.makeRequest('message_popup_get_popup_notifications', {
      useridto: userId,
      limit
    });

    return (result.notifications || []).map(n => ({
      id: n.id,
      type: n.eventtype,
      subject: n.subject,
      fullMessage: n.fullmessage,
      smallMessage: n.smallmessage,
      contextUrl: n.contexturl,
      contextUrlName: n.contexturlname,
      timeCreated: new Date(n.timecreated * 1000),
      read: n.read,
      component: n.component
    }));
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId) {
    return this.makeRequest('core_message_mark_notification_read', {
      notificationid: notificationId,
      timeread: Math.floor(Date.now() / 1000)
    });
  }

  /**
   * Get quizzes for a course
   */
  async getQuizzes(courseId) {
    const result = await this.makeRequest('mod_quiz_get_quizzes_by_courses', {
      'courseids[0]': courseId
    });

    return (result.quizzes || []).map(quiz => ({
      id: quiz.id,
      courseId: quiz.course,
      name: quiz.name,
      description: quiz.intro,
      timeOpen: quiz.timeopen ? new Date(quiz.timeopen * 1000) : null,
      timeClose: quiz.timeclose ? new Date(quiz.timeclose * 1000) : null,
      timeLimit: quiz.timelimit,
      grade: quiz.grade,
      attempts: quiz.attempts,
      gradeMethod: quiz.grademethod
    }));
  }

  /**
   * Get enrolled users in a course
   */
  async getCourseEnrolledUsers(courseId) {
    return this.makeRequest('core_enrol_get_enrolled_users', {
      courseid: courseId
    });
  }

  /**
   * Upload file to Moodle
   */
  async uploadFile(fileData, itemId, component = 'user', filearea = 'draft') {
    // This would typically use a different endpoint for file uploads
    // Implementation depends on your Moodle setup
    throw new Error('File upload not implemented - requires specific Moodle configuration');
  }
}

module.exports = MoodleService;

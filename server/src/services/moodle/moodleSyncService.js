const MoodleService = require('./moodleService');
const { MoodleCourse, MoodleSyncLog, UserMoodleMapping } = require('../../models/Moodle');
const User = require('../../models/User');
const Group = require('../../models/Group');
const Notification = require('../../models/Notification');
const NotificationService = require('../notification/notificationService');
const config = require('../../config');

/**
 * Moodle Synchronization Service
 * Handles bidirectional sync between platform and Moodle
 */
class MoodleSyncService {
  constructor() {
    this.syncInProgress = new Map();
  }

  /**
   * Sync all data for a user
   */
  async syncUserData(user) {
    const syncKey = `user_${user._id}`;
    
    if (this.syncInProgress.get(syncKey)) {
      return { status: 'already_syncing' };
    }

    this.syncInProgress.set(syncKey, true);
    const log = await this.startSyncLog('user', 'bidirectional', user._id);

    try {
      const moodleService = new MoodleService(config.moodle.url, user.moodleToken);
      
      // Sync courses
      const courses = await moodleService.getUserCourses(user.moodleId);
      await this.syncCourses(user, courses);
      
      // Sync grades
      const grades = await moodleService.getUserGrades(user.moodleId);
      await this.syncGrades(user, grades);
      
      // Sync calendar events
      const events = await moodleService.getCalendarEvents();
      await this.syncCalendarEvents(user, events);
      
      // Sync assignments and check for deadlines
      await this.syncAssignmentsAndNotify(user, moodleService);
      
      // Sync Moodle notifications
      const notifications = await moodleService.getNotifications(user.moodleId);
      await this.syncMoodleNotifications(user, notifications);
      
      await this.completeSyncLog(log, 'completed', {
        coursesProcessed: courses.length,
        gradesProcessed: grades.length,
        eventsProcessed: events.length
      });

      return { 
        status: 'completed',
        courses: courses.length,
        grades: grades.length,
        events: events.length
      };
    } catch (error) {
      await this.completeSyncLog(log, 'failed', { error: error.message });
      throw error;
    } finally {
      this.syncInProgress.delete(syncKey);
    }
  }

  /**
   * Sync courses and create corresponding groups
   */
  async syncCourses(user, courses) {
    const mapping = await UserMoodleMapping.findOne({ platformUserId: user._id });
    
    for (const course of courses) {
      // Update or create course cache
      let cachedCourse = await MoodleCourse.findOne({ moodleCourseId: course.id });
      
      if (!cachedCourse) {
        cachedCourse = new MoodleCourse({ moodleCourseId: course.id });
      }
      
      cachedCourse.shortName = course.shortname;
      cachedCourse.fullName = course.fullname;
      cachedCourse.summary = course.summary;
      cachedCourse.categoryId = course.categoryid;
      cachedCourse.visible = course.visible !== 0;
      cachedCourse.format = course.format;
      cachedCourse.imageUrl = course.courseimage;
      
      if (course.startdate) {
        cachedCourse.startDate = new Date(course.startdate * 1000);
      }
      if (course.enddate) {
        cachedCourse.endDate = new Date(course.enddate * 1000);
      }
      
      // Add user to enrolled users if not already
      const existingEnrollment = cachedCourse.enrolledUsers.find(
        e => e.platformUserId?.toString() === user._id.toString()
      );
      
      if (!existingEnrollment) {
        // Determine user role from Moodle enrollment data
        // The role can be passed from course enrollment data or fetched separately
        const userRole = await this.determineUserRole(user, course.id);
        
        cachedCourse.enrolledUsers.push({
          moodleUserId: user.moodleId,
          platformUserId: user._id,
          role: userRole,
          enrolledAt: new Date()
        });
        
        // Send enrollment notification
        await NotificationService.createNotification({
          recipient: user._id,
          type: 'moodle_enrollment',
          source: 'moodle',
          title: 'Course Enrollment',
          message: `You have been enrolled in "${course.fullname}"`,
          relatedEntity: { entityType: 'course', entityId: course.id }
        });
      }
      
      await cachedCourse.save();
      
      // Create or update corresponding group
      await this.syncCourseGroup(course, user);
    }
  }

  /**
   * Create or sync a group for a Moodle course
   */
  async syncCourseGroup(course, user) {
    let group = await Group.findOne({ 'course.moodleCourseId': course.id });
    
    if (!group) {
      // Create new group for the course
      group = new Group({
        name: course.fullname,
        description: course.summary,
        type: 'course',
        category: 'academic',
        creator: user._id,
        course: {
          moodleCourseId: course.id,
          courseName: course.fullname,
          courseCode: course.shortname,
          autoSync: true
        },
        settings: {
          allowMemberPosts: true,
          requirePostApproval: false,
          allowMemberInvites: false,
          showMemberList: true
        }
      });
    }
    
    // Add user to group if not already a member
    if (!group.isMember(user._id)) {
      group.addMember(user._id, 'member');
    }
    
    await group.save();
    return group;
  }

  /**
   * Sync grades and send notifications for new grades
   */
  async syncGrades(user, grades) {
    const mapping = await UserMoodleMapping.findOneAndUpdate(
      { platformUserId: user._id },
      { moodleUserId: user.moodleId },
      { upsert: true, new: true }
    );

    for (const courseGrade of grades) {
      const existingCourseGrade = mapping.grades.find(
        g => g.moodleCourseId === courseGrade.courseId
      );

      for (const item of courseGrade.items || []) {
        if (item.grade !== null && item.grade !== undefined) {
          // Check if this is a new grade
          const existingItem = existingCourseGrade?.items?.find(
            i => i.itemId === item.id
          );

          const isNewGrade = !existingItem || 
            (existingItem.grade !== item.grade);

          if (isNewGrade && item.gradedAt) {
            // Send notification for new grade
            await NotificationService.createNotification({
              recipient: user._id,
              type: 'moodle_grade',
              source: 'moodle',
              priority: 'high',
              title: 'Grade Released',
              message: `Your grade for "${item.name}" in ${courseGrade.courseName} is now available: ${item.percentage || item.grade}`,
              data: {
                courseId: courseGrade.courseId,
                courseName: courseGrade.courseName,
                itemName: item.name,
                grade: item.grade,
                maxGrade: item.maxGrade,
                percentage: item.percentage
              },
              relatedEntity: { entityType: 'grade', entityId: item.id }
            });
          }
        }
      }
    }

    // Update stored grades
    mapping.grades = grades.map(g => ({
      moodleCourseId: g.courseId,
      courseName: g.courseName,
      items: g.items.map(i => ({
        itemId: i.id,
        itemName: i.name,
        itemType: i.type,
        grade: i.grade,
        maxGrade: i.maxGrade,
        percentage: i.percentage,
        feedback: i.feedback,
        gradedAt: i.gradedAt,
        lastSyncAt: new Date()
      })),
      courseTotal: g.courseTotal,
      courseTotalMax: g.courseTotalMax,
      lastSyncAt: new Date()
    }));
    
    mapping.lastGradesSync = new Date();
    await mapping.save();
  }

  /**
   * Sync calendar events
   */
  async syncCalendarEvents(user, events) {
    const mapping = await UserMoodleMapping.findOneAndUpdate(
      { platformUserId: user._id },
      { moodleUserId: user.moodleId },
      { upsert: true, new: true }
    );

    mapping.calendarEvents = events.map(e => ({
      moodleEventId: e.id,
      title: e.name,
      description: e.description,
      eventType: e.eventType,
      courseId: e.courseId,
      startTime: e.timeStart,
      endTime: e.duration ? new Date(e.timeStart.getTime() + e.duration * 1000) : null,
      lastSyncAt: new Date()
    }));
    
    mapping.lastCalendarSync = new Date();
    await mapping.save();
  }

  /**
   * Sync assignments and send deadline notifications
   */
  async syncAssignmentsAndNotify(user, moodleService) {
    const assignments = await moodleService.getAssignments(user.moodleId);
    const now = new Date();
    
    for (const assignment of assignments) {
      if (!assignment.dueDate) continue;
      
      const dueDate = new Date(assignment.dueDate);
      const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
      
      // Check for deadline notifications at different intervals
      const deadlineNotifications = [
        { hours: 24, message: '24 hours' },
        { hours: 48, message: '2 days' },
        { hours: 168, message: '1 week' }
      ];
      
      for (const deadline of deadlineNotifications) {
        if (hoursUntilDue > 0 && hoursUntilDue <= deadline.hours) {
          // Check if we already sent this notification
          const existingNotification = await Notification.findOne({
            recipient: user._id,
            type: 'moodle_deadline',
            'relatedEntity.entityId': assignment.id,
            'data.deadlineHours': deadline.hours,
            createdAt: { $gt: new Date(now - 24 * 60 * 60 * 1000) } // Within last 24h
          });
          
          if (!existingNotification) {
            await NotificationService.createNotification({
              recipient: user._id,
              type: 'moodle_deadline',
              source: 'moodle',
              priority: hoursUntilDue <= 24 ? 'urgent' : 'high',
              title: 'Assignment Deadline Approaching',
              message: `"${assignment.name}" in ${assignment.courseName} is due in ${deadline.message}`,
              data: {
                assignmentId: assignment.id,
                assignmentName: assignment.name,
                courseId: assignment.courseId,
                courseName: assignment.courseName,
                dueDate: assignment.dueDate,
                deadlineHours: deadline.hours
              },
              relatedEntity: { entityType: 'assignment', entityId: assignment.id }
            });
          }
          break; // Only send one notification per assignment
        }
      }
      
      // Check for overdue assignments
      if (hoursUntilDue < 0 && hoursUntilDue > -24) {
        const existingNotification = await Notification.findOne({
          recipient: user._id,
          type: 'moodle_deadline',
          'relatedEntity.entityId': assignment.id,
          'data.isOverdue': true,
          createdAt: { $gt: new Date(now - 24 * 60 * 60 * 1000) }
        });
        
        if (!existingNotification) {
          await NotificationService.createNotification({
            recipient: user._id,
            type: 'moodle_deadline',
            source: 'moodle',
            priority: 'urgent',
            title: 'Assignment Overdue',
            message: `"${assignment.name}" in ${assignment.courseName} is now overdue`,
            data: {
              assignmentId: assignment.id,
              assignmentName: assignment.name,
              courseId: assignment.courseId,
              courseName: assignment.courseName,
              dueDate: assignment.dueDate,
              isOverdue: true
            },
            relatedEntity: { entityType: 'assignment', entityId: assignment.id }
          });
        }
      }
    }
    
    // Update course assignments cache
    for (const assignment of assignments) {
      await MoodleCourse.findOneAndUpdate(
        { moodleCourseId: assignment.courseId },
        {
          $set: {
            [`assignments.$[elem].name`]: assignment.name,
            [`assignments.$[elem].description`]: assignment.description,
            [`assignments.$[elem].dueDate`]: assignment.dueDate,
            [`assignments.$[elem].maxGrade`]: assignment.maxGrade,
            [`assignments.$[elem].lastSyncAt`]: new Date()
          }
        },
        {
          arrayFilters: [{ 'elem.moodleAssignmentId': assignment.id }],
          upsert: false
        }
      );
    }
  }

  /**
   * Sync Moodle notifications to platform
   */
  async syncMoodleNotifications(user, moodleNotifications) {
    for (const moodleNotif of moodleNotifications) {
      // Check if already synced
      const exists = await Notification.findOne({
        recipient: user._id,
        source: 'moodle',
        'data.moodleNotificationId': moodleNotif.id
      });
      
      if (!exists && !moodleNotif.read) {
        let type = 'moodle_announcement';
        
        // Map Moodle notification types to platform types
        if (moodleNotif.component === 'mod_assign') {
          type = 'moodle_assignment';
        } else if (moodleNotif.component === 'mod_quiz') {
          type = 'moodle_quiz';
        } else if (moodleNotif.type === 'gradenotification') {
          type = 'moodle_grade';
        } else if (moodleNotif.component === 'mod_resource') {
          type = 'moodle_resource';
        }
        
        await NotificationService.createNotification({
          recipient: user._id,
          type,
          source: 'moodle',
          title: moodleNotif.subject || 'Moodle Notification',
          message: moodleNotif.smallMessage || moodleNotif.fullMessage,
          data: {
            moodleNotificationId: moodleNotif.id,
            contextUrl: moodleNotif.contextUrl,
            component: moodleNotif.component
          },
          actionUrl: moodleNotif.contextUrl
        });
      }
    }
  }

  /**
   * Handle webhook events from Moodle
   */
  async handleWebhookEvent(event, data) {
    const log = await this.startSyncLog('webhook', 'inbound');
    
    try {
      switch (event) {
        case 'course_created':
          await this.handleCourseCreated(data);
          break;
        case 'user_enrolled':
          await this.handleUserEnrolled(data);
          break;
        case 'user_unenrolled':
          await this.handleUserUnenrolled(data);
          break;
        case 'assignment_created':
          await this.handleAssignmentCreated(data);
          break;
        case 'grade_updated':
          await this.handleGradeUpdated(data);
          break;
        case 'resource_created':
          await this.handleResourceCreated(data);
          break;
        case 'announcement_posted':
          await this.handleAnnouncementPosted(data);
          break;
        default:
          console.log(`Unhandled Moodle webhook event: ${event}`);
      }
      
      await this.completeSyncLog(log, 'completed', { event, dataProcessed: true });
    } catch (error) {
      await this.completeSyncLog(log, 'failed', { event, error: error.message });
      throw error;
    }
  }

  /**
   * Handle user enrollment webhook
   */
  async handleUserEnrolled(data) {
    const { moodleUserId, courseId, role } = data;
    
    const user = await User.findOne({ moodleId: moodleUserId });
    if (!user) return;
    
    const course = await MoodleCourse.findOne({ moodleCourseId: courseId });
    if (!course) return;
    
    // Add to course group
    const group = await Group.findOne({ 'course.moodleCourseId': courseId });
    if (group && !group.isMember(user._id)) {
      group.addMember(user._id, role === 'teacher' ? 'moderator' : 'member');
      await group.save();
    }
    
    // Send notification
    await NotificationService.createNotification({
      recipient: user._id,
      type: 'moodle_enrollment',
      source: 'moodle',
      title: 'New Course Enrollment',
      message: `You have been enrolled in "${course.fullName}"`,
      relatedEntity: { entityType: 'course', entityId: courseId }
    });
  }

  /**
   * Handle user unenrollment webhook
   */
  async handleUserUnenrolled(data) {
    const { moodleUserId, courseId } = data;
    
    const user = await User.findOne({ moodleId: moodleUserId });
    if (!user) return;
    
    // Remove from course group
    const group = await Group.findOne({ 'course.moodleCourseId': courseId });
    if (group && group.isMember(user._id)) {
      group.removeMember(user._id);
      await group.save();
    }
  }

  /**
   * Handle new assignment webhook
   */
  async handleAssignmentCreated(data) {
    const { courseId, assignment } = data;
    
    const course = await MoodleCourse.findOne({ moodleCourseId: courseId });
    if (!course) return;
    
    // Add to course assignments
    course.assignments.push({
      moodleAssignmentId: assignment.id,
      name: assignment.name,
      description: assignment.description,
      dueDate: assignment.duedate ? new Date(assignment.duedate * 1000) : null,
      maxGrade: assignment.grade,
      lastSyncAt: new Date()
    });
    await course.save();
    
    // Notify enrolled users
    for (const enrollment of course.enrolledUsers) {
      if (enrollment.platformUserId) {
        await NotificationService.createNotification({
          recipient: enrollment.platformUserId,
          type: 'moodle_assignment',
          source: 'moodle',
          priority: 'high',
          title: 'New Assignment',
          message: `New assignment "${assignment.name}" posted in ${course.fullName}`,
          data: {
            courseId,
            assignmentId: assignment.id,
            assignmentName: assignment.name,
            dueDate: assignment.duedate ? new Date(assignment.duedate * 1000) : null
          },
          relatedEntity: { entityType: 'assignment', entityId: assignment.id }
        });
      }
    }
  }

  /**
   * Handle grade update webhook
   */
  async handleGradeUpdated(data) {
    const { moodleUserId, courseId, itemId, grade, maxGrade, itemName } = data;
    
    const user = await User.findOne({ moodleId: moodleUserId });
    if (!user) return;
    
    const course = await MoodleCourse.findOne({ moodleCourseId: courseId });
    
    await NotificationService.createNotification({
      recipient: user._id,
      type: 'moodle_grade',
      source: 'moodle',
      priority: 'high',
      title: 'Grade Released',
      message: `Your grade for "${itemName}" is now available`,
      data: {
        courseId,
        courseName: course?.fullName,
        itemId,
        itemName,
        grade,
        maxGrade,
        percentage: maxGrade ? `${((grade / maxGrade) * 100).toFixed(1)}%` : null
      },
      relatedEntity: { entityType: 'grade', entityId: itemId }
    });
  }

  /**
   * Handle new resource webhook
   */
  async handleResourceCreated(data) {
    const { courseId, resource } = data;
    
    const course = await MoodleCourse.findOne({ moodleCourseId: courseId });
    if (!course) return;
    
    // Notify enrolled users
    for (const enrollment of course.enrolledUsers) {
      if (enrollment.platformUserId) {
        await NotificationService.createNotification({
          recipient: enrollment.platformUserId,
          type: 'moodle_resource',
          source: 'moodle',
          title: 'New Resource Available',
          message: `New resource "${resource.name}" added to ${course.fullName}`,
          data: {
            courseId,
            resourceId: resource.id,
            resourceName: resource.name,
            resourceType: resource.type
          },
          relatedEntity: { entityType: 'resource', entityId: resource.id }
        });
      }
    }
  }

  /**
   * Handle course announcement webhook
   */
  async handleAnnouncementPosted(data) {
    const { courseId, subject, message, authorName } = data;
    
    const course = await MoodleCourse.findOne({ moodleCourseId: courseId });
    if (!course) return;
    
    // Notify all enrolled users
    for (const enrollment of course.enrolledUsers) {
      if (enrollment.platformUserId) {
        await NotificationService.createNotification({
          recipient: enrollment.platformUserId,
          type: 'moodle_announcement',
          source: 'moodle',
          priority: 'high',
          title: `Announcement: ${subject}`,
          message: message.substring(0, 200),
          data: {
            courseId,
            courseName: course.fullName,
            subject,
            authorName
          },
          relatedEntity: { entityType: 'announcement', entityId: courseId }
        });
      }
    }
  }

  /**
   * Helper: Start sync log
   */
  async startSyncLog(syncType, direction, entityId = null) {
    return MoodleSyncLog.create({
      syncType,
      direction,
      status: 'started',
      entityId,
      startedAt: new Date()
    });
  }

  /**
   * Helper: Complete sync log
   */
  async completeSyncLog(log, status, details = {}) {
    log.status = status;
    log.completedAt = new Date();
    log.duration = log.completedAt - log.startedAt;
    
    if (details.error) {
      log.errors.push({ message: details.error });
    }
    
    Object.assign(log, {
      recordsProcessed: details.recordsProcessed || 0,
      recordsCreated: details.recordsCreated || 0,
      recordsUpdated: details.recordsUpdated || 0
    });
    
    await log.save();
    return log;
  }

  /**
   * Run scheduled full sync for all users
   */
  async runScheduledSync() {
    const log = await this.startSyncLog('full', 'bidirectional');
    
    try {
      const users = await User.find({
        moodleId: { $exists: true },
        moodleToken: { $exists: true },
        isActive: true
      }).select('+moodleToken');
      
      let processed = 0;
      let errors = [];
      
      for (const user of users) {
        try {
          await this.syncUserData(user);
          processed++;
        } catch (error) {
          errors.push({ userId: user._id, error: error.message });
        }
      }
      
      await this.completeSyncLog(log, errors.length > 0 ? 'partial' : 'completed', {
        recordsProcessed: users.length,
        recordsUpdated: processed
      });
      
      if (errors.length > 0) {
        log.errors = errors;
        await log.save();
      }
      
      console.log(`Scheduled sync completed: ${processed}/${users.length} users synced`);
    } catch (error) {
      await this.completeSyncLog(log, 'failed', { error: error.message });
      console.error('Scheduled sync failed:', error);
    }
  }

  /**
   * Determine user role in a course from Moodle
   * Maps Moodle roles to platform roles
   */
  async determineUserRole(user, courseId) {
    try {
      const moodleService = new MoodleService(config.moodle.url, user.moodleToken);
      const enrolledUsers = await moodleService.callMoodleAPI(
        'core_enrol_get_enrolled_users',
        { courseid: courseId }
      );

      // Find this user in the enrolled users list
      const enrollment = enrolledUsers.find(e => e.id === user.moodleId);
      
      if (enrollment && enrollment.roles && enrollment.roles.length > 0) {
        // Map Moodle roles to platform roles
        // Moodle typically uses: editingteacher, teacher, student, manager
        const moodleRole = enrollment.roles[0].shortname?.toLowerCase();
        
        const roleMapping = {
          'editingteacher': 'instructor',
          'teacher': 'instructor',
          'manager': 'admin',
          'coursecreator': 'instructor',
          'student': 'student',
          'guest': 'student'
        };
        
        return roleMapping[moodleRole] || 'student';
      }
    } catch (error) {
      console.warn(`Could not determine role for user ${user._id} in course ${courseId}:`, error.message);
    }
    
    // Default to student if role detection fails
    return 'student';
  }
}

module.exports = MoodleSyncService;

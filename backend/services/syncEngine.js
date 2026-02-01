const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const moodleConnector = require('./moodleConnector');
const cron = require('node-cron');

class SyncEngine {
  constructor() {
    this.isRunning = false;
    this.syncQueue = [];
    this.syncHistory = [];
  }

  /**
   * Initialize sync scheduler
   */
  initScheduler() {
    const frequency = process.env.SYNC_FREQUENCY || 'hourly';
    
    let cronExpression;
    switch (frequency) {
      case 'realtime':
        // For real-time, we rely on webhooks
        console.log('Real-time sync via webhooks enabled');
        return;
      case 'hourly':
        cronExpression = '0 * * * *'; // Every hour
        break;
      case 'daily':
        cronExpression = '0 0 * * *'; // Daily at midnight
        break;
      default:
        console.log('Manual sync mode');
        return;
    }

    cron.schedule(cronExpression, () => {
      this.runFullSync();
    });

    console.log(`Sync scheduler initialized: ${frequency}`);
  }

  /**
   * Run full bidirectional sync
   */
  async runFullSync() {
    if (this.isRunning) {
      console.log('Sync already in progress');
      return;
    }

    this.isRunning = true;
    const syncLog = {
      startTime: new Date(),
      direction: process.env.SYNC_DIRECTION || 'bidirectional',
      status: 'in_progress',
      operations: []
    };

    try {
      console.log('Starting full sync...');

      // Sync from Moodle to Platform
      if (['bidirectional', 'moodle_only'].includes(syncLog.direction)) {
        await this.syncFromMoodle(syncLog);
      }

      // Sync from Platform to Moodle
      if (['bidirectional', 'platform_only'].includes(syncLog.direction)) {
        await this.syncToMoodle(syncLog);
      }

      syncLog.status = 'completed';
      syncLog.endTime = new Date();
      console.log('Full sync completed');
    } catch (error) {
      console.error('Sync error:', error);
      syncLog.status = 'failed';
      syncLog.error = error.message;
    } finally {
      this.isRunning = false;
      this.syncHistory.push(syncLog);
    }

    return syncLog;
  }

  /**
   * Sync data FROM Moodle TO Platform
   */
  async syncFromMoodle(syncLog) {
    console.log('Syncing from Moodle to Platform...');

    // Get all users with Moodle integration enabled
    const users = await User.find({
      'moodleUserId': { $exists: true },
      'syncSettings.enabled': true
    });

    for (const user of users) {
      try {
        // Sync user profile
        if (user.syncSettings.contentTypes.courses) {
          await this.syncUserCourses(user, syncLog);
        }

        if (user.syncSettings.contentTypes.assignments) {
          await this.syncUserAssignments(user, syncLog);
        }

        if (user.syncSettings.contentTypes.grades) {
          await this.syncUserGrades(user, syncLog);
        }

        user.lastMoodleSync = new Date();
        await user.save();
      } catch (error) {
        console.error(`Error syncing user ${user._id}:`, error.message);
        syncLog.operations.push({
          type: 'user_sync',
          userId: user._id,
          status: 'failed',
          error: error.message
        });
      }
    }
  }

  /**
   * Sync user courses from Moodle
   */
  async syncUserCourses(user, syncLog) {
    const moodleCourses = await moodleConnector.getUserCourses(user.moodleUserId);

    for (const moodleCourse of moodleCourses) {
      // Find or create course
      let course = await Course.findOne({ moodleCourseId: moodleCourse.id });

      if (!course) {
        course = new Course({
          name: moodleCourse.fullname,
          code: moodleCourse.shortname,
          moodleCourseId: moodleCourse.id,
          description: moodleCourse.summary || '',
          lastMoodleSync: new Date()
        });
        await course.save();

        syncLog.operations.push({
          type: 'course_created',
          courseId: course._id,
          moodleCourseId: moodleCourse.id,
          status: 'success'
        });
      }

      // Check if user is enrolled
      const isEnrolled = course.enrolledStudents.some(
        s => s.userId.toString() === user._id.toString()
      );

      if (!isEnrolled) {
        course.enrolledStudents.push({
          userId: user._id,
          enrolledAt: new Date()
        });
        await course.save();

        // Add to user's enrolled courses
        if (!user.enrolledCourses.some(c => c.courseId.toString() === course._id.toString())) {
          user.enrolledCourses.push({
            courseId: course._id,
            moodleCourseId: moodleCourse.id,
            enrolledAt: new Date()
          });
        }
      }
    }

    await user.save();
  }

  /**
   * Sync user assignments from Moodle
   */
  async syncUserAssignments(user, syncLog) {
    const courses = await Course.find({
      'enrolledStudents.userId': user._id,
      moodleCourseId: { $exists: true }
    });

    for (const course of courses) {
      try {
        const moodleAssignments = await moodleConnector.getCourseAssignments([
          course.moodleCourseId
        ]);

        if (moodleAssignments.courses && moodleAssignments.courses[0]) {
          const assignments = moodleAssignments.courses[0].assignments || [];

          for (const moodleAssign of assignments) {
            let assignment = await Assignment.findOne({
              moodleAssignmentId: moodleAssign.id
            });

            if (!assignment) {
              assignment = new Assignment({
                title: moodleAssign.name,
                description: moodleAssign.intro,
                course: course._id,
                moodleAssignmentId: moodleAssign.id,
                dueDate: new Date(moodleAssign.duedate * 1000),
                cutoffDate: new Date(moodleAssign.cutoffdate * 1000),
                lastMoodleSync: new Date()
              });
              await assignment.save();

              syncLog.operations.push({
                type: 'assignment_created',
                assignmentId: assignment._id,
                moodleAssignmentId: moodleAssign.id,
                status: 'success'
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error syncing assignments for course ${course._id}:`, error.message);
      }
    }
  }

  /**
   * Sync user grades from Moodle
   */
  async syncUserGrades(user, syncLog) {
    // Placeholder for grade sync
    // Implementation depends on grade storage structure
    console.log(`Syncing grades for user ${user._id}`);
  }

  /**
   * Sync data FROM Platform TO Moodle
   */
  async syncToMoodle(syncLog) {
    console.log('Syncing from Platform to Moodle...');

    // Find assignments with pending submissions
    const assignments = await Assignment.find({
      'submissions.syncedToMoodle': false,
      moodleAssignmentId: { $exists: true }
    });

    for (const assignment of assignments) {
      for (const submission of assignment.submissions) {
        if (!submission.syncedToMoodle && submission.submittedAt) {
          try {
            // Submit to Moodle
            await moodleConnector.submitAssignment(
              assignment.moodleAssignmentId,
              submission.student.moodleUserId,
              {
                onlinetext_editor: {
                  text: submission.content || '',
                  format: 1
                }
              }
            );

            submission.syncedToMoodle = true;
            await assignment.save();

            syncLog.operations.push({
              type: 'submission_synced',
              assignmentId: assignment._id,
              studentId: submission.student,
              status: 'success'
            });
          } catch (error) {
            console.error(`Error syncing submission:`, error.message);
            syncLog.operations.push({
              type: 'submission_synced',
              assignmentId: assignment._id,
              studentId: submission.student,
              status: 'failed',
              error: error.message
            });
          }
        }
      }
    }
  }

  /**
   * Handle webhook events from Moodle
   */
  async handleWebhook(event, data) {
    console.log(`Webhook received: ${event}`, data);

    switch (event) {
      case 'user_enrolled':
        await this.handleUserEnrolled(data);
        break;
      case 'assignment_created':
        await this.handleAssignmentCreated(data);
        break;
      case 'grade_updated':
        await this.handleGradeUpdated(data);
        break;
      default:
        console.log(`Unknown webhook event: ${event}`);
    }
  }

  async handleUserEnrolled(data) {
    // Sync new enrollment
    const user = await User.findOne({ moodleUserId: data.userid });
    if (user) {
      await this.syncUserCourses(user, { operations: [] });
    }
  }

  async handleAssignmentCreated(data) {
    // Sync new assignment
    const course = await Course.findOne({ moodleCourseId: data.courseid });
    if (course) {
      // Create assignment in platform
      console.log('New assignment detected:', data);
    }
  }

  async handleGradeUpdated(data) {
    // Update grade
    console.log('Grade updated:', data);
  }

  /**
   * Get sync status and history
   */
  getSyncStatus() {
    return {
      isRunning: this.isRunning,
      queueSize: this.syncQueue.length,
      lastSync: this.syncHistory[this.syncHistory.length - 1] || null,
      history: this.syncHistory.slice(-10) // Last 10 syncs
    };
  }
}

module.exports = new SyncEngine();

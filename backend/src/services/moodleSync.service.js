const User = require('../models/User');
const Course = require('../models/Course');
const Grade = require('../models/Grade');
const SyncLog = require('../models/SyncLog');
const moodleApi = require('./moodleApi.service');

/**
 * Moodle Sync Service
 * Handles two-way synchronization between the MERN LMS and Moodle
 */
class MoodleSyncService {
  
  // ============ USER SYNC ============

  /**
   * Sync user TO Moodle (Create or Update)
   */
  async syncUserToMoodle(userId, triggeredBy = 'system') {
    const syncLog = await SyncLog.create({
      syncType: 'user',
      direction: 'to_moodle',
      entityId: userId,
      entityModel: 'User',
      triggeredBy,
      status: 'in_progress'
    });

    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      let moodleUser;
      const changes = [];

      if (user.moodleId) {
        // Update existing Moodle user
        const existingMoodleUser = await moodleApi.getUserById(user.moodleId);
        if (existingMoodleUser) {
          // Track changes
          if (existingMoodleUser.email !== user.email) {
            changes.push({ field: 'email', oldValue: existingMoodleUser.email, newValue: user.email });
          }
          if (existingMoodleUser.firstname !== user.firstName) {
            changes.push({ field: 'firstName', oldValue: existingMoodleUser.firstname, newValue: user.firstName });
          }
          if (existingMoodleUser.lastname !== user.lastName) {
            changes.push({ field: 'lastName', oldValue: existingMoodleUser.lastname, newValue: user.lastName });
          }

          await moodleApi.updateUser(user.moodleId, {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          });
          moodleUser = { id: user.moodleId };
        }
      } else {
        // Check if user exists in Moodle by email
        const existingByEmail = await moodleApi.getUserByEmail(user.email);
        if (existingByEmail) {
          moodleUser = existingByEmail;
        } else {
          // Create new user in Moodle
          moodleUser = await moodleApi.createUser({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.email.split('@')[0]
          });
          changes.push({ field: 'moodleId', oldValue: null, newValue: moodleUser.id });
        }
      }

      // Update local user with Moodle data
      user.moodleId = moodleUser.id;
      user.syncedWithMoodle = true;
      user.lastMoodleSync = new Date();
      await user.save();

      // Update sync log
      syncLog.status = 'completed';
      syncLog.moodleId = moodleUser.id;
      syncLog.changes = changes;
      syncLog.completedAt = new Date();
      await syncLog.save();

      return { success: true, moodleUser, changes };
    } catch (error) {
      syncLog.status = 'failed';
      syncLog.errorMessage = error.message;
      syncLog.completedAt = new Date();
      await syncLog.save();
      throw error;
    }
  }

  /**
   * Sync user FROM Moodle (Import or Update local user)
   */
  async syncUserFromMoodle(moodleUserId, triggeredBy = 'system') {
    const syncLog = await SyncLog.create({
      syncType: 'user',
      direction: 'from_moodle',
      moodleId: moodleUserId,
      entityModel: 'User',
      triggeredBy,
      status: 'in_progress'
    });

    try {
      const moodleUser = await moodleApi.getUserById(moodleUserId);
      if (!moodleUser) throw new Error('Moodle user not found');

      const changes = [];
      let user = await User.findOne({ moodleId: moodleUserId });

      if (!user) {
        // Check by email
        user = await User.findOne({ email: moodleUser.email });
      }

      if (user) {
        // Update existing user
        if (user.firstName !== moodleUser.firstname) {
          changes.push({ field: 'firstName', oldValue: user.firstName, newValue: moodleUser.firstname });
          user.firstName = moodleUser.firstname;
        }
        if (user.lastName !== moodleUser.lastname) {
          changes.push({ field: 'lastName', oldValue: user.lastName, newValue: moodleUser.lastname });
          user.lastName = moodleUser.lastname;
        }
        if (user.email !== moodleUser.email) {
          changes.push({ field: 'email', oldValue: user.email, newValue: moodleUser.email });
          user.email = moodleUser.email;
        }
      } else {
        // Create new user from Moodle data
        user = new User({
          email: moodleUser.email,
          firstName: moodleUser.firstname,
          lastName: moodleUser.lastname,
          password: 'TempPassword123!', // User will need to reset
          role: 'student'
        });
        changes.push({ field: 'created', oldValue: null, newValue: true });
      }

      user.moodleId = moodleUserId;
      user.moodleUsername = moodleUser.username;
      user.syncedWithMoodle = true;
      user.lastMoodleSync = new Date();
      await user.save();

      syncLog.entityId = user._id;
      syncLog.status = 'completed';
      syncLog.changes = changes;
      syncLog.completedAt = new Date();
      await syncLog.save();

      return { success: true, user, changes };
    } catch (error) {
      syncLog.status = 'failed';
      syncLog.errorMessage = error.message;
      syncLog.completedAt = new Date();
      await syncLog.save();
      throw error;
    }
  }

  // ============ COURSE SYNC ============

  /**
   * Sync course TO Moodle
   */
  async syncCourseToMoodle(courseId, triggeredBy = 'system') {
    const syncLog = await SyncLog.create({
      syncType: 'course',
      direction: 'to_moodle',
      entityId: courseId,
      entityModel: 'Course',
      triggeredBy,
      status: 'in_progress'
    });

    try {
      const course = await Course.findById(courseId).populate('instructor');
      if (!course) throw new Error('Course not found');

      let moodleCourse;
      const changes = [];

      if (course.moodleId) {
        // Update existing Moodle course
        const existingCourse = await moodleApi.getCourseById(course.moodleId);
        if (existingCourse) {
          if (existingCourse.fullname !== course.title) {
            changes.push({ field: 'title', oldValue: existingCourse.fullname, newValue: course.title });
          }
          if (existingCourse.shortname !== course.shortName) {
            changes.push({ field: 'shortName', oldValue: existingCourse.shortname, newValue: course.shortName });
          }

          await moodleApi.updateCourse(course.moodleId, {
            title: course.title,
            shortName: course.shortName,
            description: course.description,
            isPublished: course.isPublished
          });
          moodleCourse = { id: course.moodleId };
        }
      } else {
        // Check if course exists in Moodle by shortname
        const existingByShortName = await moodleApi.getCourseByShortName(course.shortName);
        if (existingByShortName) {
          moodleCourse = existingByShortName;
        } else {
          // Create new course in Moodle
          moodleCourse = await moodleApi.createCourse({
            title: course.title,
            shortName: course.shortName,
            description: course.description,
            categoryId: course.moodleCategoryId,
            isPublished: course.isPublished,
            startDate: course.startDate,
            endDate: course.endDate
          });
          changes.push({ field: 'moodleId', oldValue: null, newValue: moodleCourse.id });
        }
      }

      // Update local course with Moodle data
      course.moodleId = moodleCourse.id;
      course.syncedWithMoodle = true;
      course.lastMoodleSync = new Date();
      await course.save();

      // Sync instructor as teacher if they have a Moodle account
      if (course.instructor && course.instructor.moodleId) {
        await moodleApi.enrollUser(course.instructor.moodleId, moodleCourse.id, 3); // 3 = teacher role
      }

      syncLog.status = 'completed';
      syncLog.moodleId = moodleCourse.id;
      syncLog.changes = changes;
      syncLog.completedAt = new Date();
      await syncLog.save();

      return { success: true, moodleCourse, changes };
    } catch (error) {
      syncLog.status = 'failed';
      syncLog.errorMessage = error.message;
      syncLog.completedAt = new Date();
      await syncLog.save();
      throw error;
    }
  }

  /**
   * Sync course FROM Moodle
   */
  async syncCourseFromMoodle(moodleCourseId, instructorId, triggeredBy = 'system') {
    const syncLog = await SyncLog.create({
      syncType: 'course',
      direction: 'from_moodle',
      moodleId: moodleCourseId,
      entityModel: 'Course',
      triggeredBy,
      status: 'in_progress'
    });

    try {
      const moodleCourse = await moodleApi.getCourseById(moodleCourseId);
      if (!moodleCourse) throw new Error('Moodle course not found');

      const changes = [];
      let course = await Course.findOne({ moodleId: moodleCourseId });

      if (!course) {
        // Check by shortname
        course = await Course.findOne({ shortName: moodleCourse.shortname });
      }

      if (course) {
        // Update existing course
        if (course.title !== moodleCourse.fullname) {
          changes.push({ field: 'title', oldValue: course.title, newValue: moodleCourse.fullname });
          course.title = moodleCourse.fullname;
        }
        if (course.description !== moodleCourse.summary) {
          changes.push({ field: 'description', oldValue: course.description, newValue: moodleCourse.summary });
          course.description = moodleCourse.summary;
        }
      } else {
        // Create new course from Moodle data
        course = new Course({
          title: moodleCourse.fullname,
          shortName: moodleCourse.shortname,
          description: moodleCourse.summary || '',
          instructor: instructorId,
          isPublished: moodleCourse.visible === 1
        });
        changes.push({ field: 'created', oldValue: null, newValue: true });
      }

      course.moodleId = moodleCourseId;
      course.moodleCategoryId = moodleCourse.categoryid;
      course.syncedWithMoodle = true;
      course.lastMoodleSync = new Date();
      await course.save();

      syncLog.entityId = course._id;
      syncLog.status = 'completed';
      syncLog.changes = changes;
      syncLog.completedAt = new Date();
      await syncLog.save();

      return { success: true, course, changes };
    } catch (error) {
      syncLog.status = 'failed';
      syncLog.errorMessage = error.message;
      syncLog.completedAt = new Date();
      await syncLog.save();
      throw error;
    }
  }

  // ============ ENROLLMENT SYNC ============

  /**
   * Sync enrollment TO Moodle
   */
  async syncEnrollmentToMoodle(userId, courseId, triggeredBy = 'system') {
    const syncLog = await SyncLog.create({
      syncType: 'enrollment',
      direction: 'to_moodle',
      entityId: userId,
      entityModel: 'User',
      triggeredBy,
      status: 'in_progress'
    });

    try {
      const user = await User.findById(userId);
      const course = await Course.findById(courseId);

      if (!user || !course) throw new Error('User or course not found');
      if (!user.moodleId) throw new Error('User not synced with Moodle');
      if (!course.moodleId) throw new Error('Course not synced with Moodle');

      // Find enrollment role
      const enrollment = user.enrolledCourses.find(
        e => e.course.toString() === courseId.toString()
      );
      const roleId = enrollment?.role === 'instructor' ? 3 : 5; // 3=teacher, 5=student

      await moodleApi.enrollUser(user.moodleId, course.moodleId, roleId);

      syncLog.status = 'completed';
      syncLog.moodleId = course.moodleId;
      syncLog.changes = [{ 
        field: 'enrollment', 
        oldValue: null, 
        newValue: { userId: user.moodleId, courseId: course.moodleId, roleId } 
      }];
      syncLog.completedAt = new Date();
      await syncLog.save();

      return { success: true };
    } catch (error) {
      syncLog.status = 'failed';
      syncLog.errorMessage = error.message;
      syncLog.completedAt = new Date();
      await syncLog.save();
      throw error;
    }
  }

  /**
   * Sync enrollments FROM Moodle for a course
   */
  async syncEnrollmentsFromMoodle(courseId, triggeredBy = 'system') {
    const syncLog = await SyncLog.create({
      syncType: 'enrollment',
      direction: 'from_moodle',
      entityId: courseId,
      entityModel: 'Course',
      triggeredBy,
      status: 'in_progress'
    });

    try {
      const course = await Course.findById(courseId);
      if (!course || !course.moodleId) throw new Error('Course not synced with Moodle');

      const enrolledUsers = await moodleApi.getEnrolledUsers(course.moodleId);
      const changes = [];

      for (const moodleUser of enrolledUsers) {
        // Find or create user
        let user = await User.findOne({ moodleId: moodleUser.id });
        if (!user) {
          user = await User.findOne({ email: moodleUser.email });
        }

        if (user) {
          // Check if already enrolled
          const existingEnrollment = user.enrolledCourses.find(
            e => e.course.toString() === courseId.toString()
          );

          if (!existingEnrollment) {
            // Determine role from Moodle roles
            const isTeacher = moodleUser.roles?.some(r => [1, 3, 4].includes(r.roleid));
            
            user.enrolledCourses.push({
              course: courseId,
              role: isTeacher ? 'instructor' : 'student',
              moodleEnrollmentId: moodleUser.id
            });
            await user.save();
            
            changes.push({ 
              field: 'enrollment', 
              oldValue: null, 
              newValue: { userId: user._id, moodleUserId: moodleUser.id } 
            });
          }
        }
      }

      // Update course enrollment count
      const enrollmentCount = await User.countDocuments({
        'enrolledCourses.course': courseId
      });
      course.enrollmentCount = enrollmentCount;
      await course.save();

      syncLog.status = 'completed';
      syncLog.changes = changes;
      syncLog.completedAt = new Date();
      await syncLog.save();

      return { success: true, syncedCount: changes.length };
    } catch (error) {
      syncLog.status = 'failed';
      syncLog.errorMessage = error.message;
      syncLog.completedAt = new Date();
      await syncLog.save();
      throw error;
    }
  }

  // ============ GRADE SYNC ============

  /**
   * Sync grades FROM Moodle for a user in a course
   */
  async syncGradesFromMoodle(userId, courseId, triggeredBy = 'system') {
    const syncLog = await SyncLog.create({
      syncType: 'grade',
      direction: 'from_moodle',
      entityId: userId,
      entityModel: 'User',
      triggeredBy,
      status: 'in_progress'
    });

    try {
      const user = await User.findById(userId);
      const course = await Course.findById(courseId);

      if (!user || !course) throw new Error('User or course not found');
      if (!user.moodleId || !course.moodleId) throw new Error('Not synced with Moodle');

      const gradesData = await moodleApi.getCourseGrades(course.moodleId, user.moodleId);
      const changes = [];

      // Process grade table from Moodle
      if (gradesData && gradesData.tables) {
        for (const table of gradesData.tables) {
          for (const row of table.tabledata || []) {
            if (row.grade) {
              // Parse grade value
              const gradeValue = parseFloat(row.grade.content) || 0;
              
              // Find or create grade record
              let grade = await Grade.findOne({
                user: userId,
                course: courseId,
                moodleGradeItemId: row.itemname?.id
              });

              if (!grade) {
                grade = new Grade({
                  user: userId,
                  course: courseId,
                  activityType: 'overall',
                  moodleGradeItemId: row.itemname?.id
                });
              }

              const oldGrade = grade.grade;
              grade.grade = gradeValue;
              grade.moodleRawGrade = gradeValue;
              grade.syncedWithMoodle = true;
              grade.lastMoodleSync = new Date();
              await grade.save();

              if (oldGrade !== gradeValue) {
                changes.push({ 
                  field: 'grade', 
                  oldValue: oldGrade, 
                  newValue: gradeValue 
                });
              }
            }
          }
        }
      }

      syncLog.status = 'completed';
      syncLog.changes = changes;
      syncLog.completedAt = new Date();
      await syncLog.save();

      return { success: true, gradesUpdated: changes.length };
    } catch (error) {
      syncLog.status = 'failed';
      syncLog.errorMessage = error.message;
      syncLog.completedAt = new Date();
      await syncLog.save();
      throw error;
    }
  }

  // ============ BULK SYNC ============

  /**
   * Full bidirectional sync for a course
   */
  async fullCourseSync(courseId, triggeredBy = 'system') {
    const results = {
      course: null,
      enrollments: null,
      grades: [],
      errors: []
    };

    try {
      // Sync course data
      results.course = await this.syncCourseToMoodle(courseId, triggeredBy);
    } catch (error) {
      results.errors.push({ type: 'course', error: error.message });
    }

    try {
      // Sync enrollments from Moodle
      results.enrollments = await this.syncEnrollmentsFromMoodle(courseId, triggeredBy);
    } catch (error) {
      results.errors.push({ type: 'enrollment', error: error.message });
    }

    // Sync grades for all enrolled users
    const course = await Course.findById(courseId);
    const enrolledUsers = await User.find({ 'enrolledCourses.course': courseId });

    for (const user of enrolledUsers) {
      try {
        if (user.moodleId && course.moodleId) {
          const gradeResult = await this.syncGradesFromMoodle(user._id, courseId, triggeredBy);
          results.grades.push({ userId: user._id, ...gradeResult });
        }
      } catch (error) {
        results.errors.push({ type: 'grade', userId: user._id, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get sync history
   */
  async getSyncHistory(filters = {}, limit = 50) {
    const query = {};
    if (filters.syncType) query.syncType = filters.syncType;
    if (filters.status) query.status = filters.status;
    if (filters.entityId) query.entityId = filters.entityId;

    return await SyncLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('entityId')
      .populate('initiatedByUser', 'firstName lastName email');
  }
}

module.exports = new MoodleSyncService();

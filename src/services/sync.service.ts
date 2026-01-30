import pool from '../config/database';
import moodleService from './moodle.service';
import { SyncLog } from '../types';

export class SyncService {
  /**
   * Log sync operation
   */
  private async logSync(
    entityType: string,
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    direction: 'lms_to_moodle' | 'moodle_to_lms',
    status: 'pending' | 'success' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    const query = `
      INSERT INTO sync_logs (entity_type, entity_id, operation, direction, status, error_message, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    const completedAt = status !== 'pending' ? new Date() : null;
    await pool.query(query, [
      entityType,
      entityId,
      operation,
      direction,
      status,
      errorMessage,
      completedAt,
    ]);
  }

  // ==================== User Sync ====================

  /**
   * Sync user from LMS to Moodle
   */
  async syncUserToMoodle(userId: string): Promise<void> {
    try {
      const userQuery = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (userQuery.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userQuery.rows[0];

      if (user.moodle_id) {
        // Update existing Moodle user
        await moodleService.updateUser({
          id: user.moodle_id,
          username: user.username,
          firstname: user.first_name,
          lastname: user.last_name,
          email: user.email,
        });
        await this.logSync('user', userId, 'update', 'lms_to_moodle', 'success');
      } else {
        // Create new Moodle user
        const moodleUser = await moodleService.createUser({
          username: user.username,
          firstname: user.first_name,
          lastname: user.last_name,
          email: user.email,
        });

        // Update LMS user with Moodle ID
        await pool.query(
          'UPDATE users SET moodle_id = $1, last_sync = NOW() WHERE id = $2',
          [moodleUser.id, userId]
        );

        await this.logSync('user', userId, 'create', 'lms_to_moodle', 'success');
      }
    } catch (error: any) {
      await this.logSync('user', userId, 'update', 'lms_to_moodle', 'failed', error.message);
      throw error;
    }
  }

  /**
   * Sync users from Moodle to LMS
   */
  async syncUsersFromMoodle(): Promise<void> {
    try {
      const moodleUsers = await moodleService.getUsers();

      for (const moodleUser of moodleUsers) {
        try {
          const existingUser = await pool.query(
            'SELECT id FROM users WHERE moodle_id = $1',
            [moodleUser.id]
          );

          if (existingUser.rows.length > 0) {
            // Update existing user
            await pool.query(
              `UPDATE users SET 
                username = $1, 
                first_name = $2, 
                last_name = $3, 
                email = $4,
                last_sync = NOW()
              WHERE moodle_id = $5`,
              [
                moodleUser.username,
                moodleUser.firstname,
                moodleUser.lastname,
                moodleUser.email,
                moodleUser.id,
              ]
            );
            await this.logSync('user', existingUser.rows[0].id, 'update', 'moodle_to_lms', 'success');
          } else {
            // Create new user (with default password that must be changed)
            const result = await pool.query(
              `INSERT INTO users (moodle_id, username, first_name, last_name, email, password_hash, last_sync)
               VALUES ($1, $2, $3, $4, $5, $6, NOW())
               RETURNING id`,
              [
                moodleUser.id,
                moodleUser.username,
                moodleUser.firstname,
                moodleUser.lastname,
                moodleUser.email,
                'needs_password_reset', // Placeholder
              ]
            );
            await this.logSync('user', result.rows[0].id, 'create', 'moodle_to_lms', 'success');
          }
        } catch (error: any) {
          console.error(`Error syncing user ${moodleUser.id}:`, error.message);
        }
      }
    } catch (error: any) {
      console.error('Error syncing users from Moodle:', error.message);
      throw error;
    }
  }

  // ==================== Course Sync ====================

  /**
   * Sync course from LMS to Moodle
   */
  async syncCourseToMoodle(courseId: string): Promise<void> {
    try {
      const courseQuery = await pool.query(
        'SELECT * FROM courses WHERE id = $1',
        [courseId]
      );

      if (courseQuery.rows.length === 0) {
        throw new Error('Course not found');
      }

      const course = courseQuery.rows[0];

      if (course.moodle_id) {
        // Update existing Moodle course
        await moodleService.updateCourse({
          id: course.moodle_id,
          fullname: course.name,
          shortname: course.name.substring(0, 50),
          summary: course.description,
        });
        await this.logSync('course', courseId, 'update', 'lms_to_moodle', 'success');
      } else {
        // Create new Moodle course
        const moodleCourse = await moodleService.createCourse({
          fullname: course.name,
          shortname: course.name.substring(0, 50),
          categoryid: 1,
          summary: course.description,
          startdate: course.start_date ? Math.floor(course.start_date.getTime() / 1000) : undefined,
          enddate: course.end_date ? Math.floor(course.end_date.getTime() / 1000) : undefined,
        });

        // Update LMS course with Moodle ID
        await pool.query(
          'UPDATE courses SET moodle_id = $1, last_sync = NOW() WHERE id = $2',
          [moodleCourse.id, courseId]
        );

        await this.logSync('course', courseId, 'create', 'lms_to_moodle', 'success');
      }
    } catch (error: any) {
      await this.logSync('course', courseId, 'update', 'lms_to_moodle', 'failed', error.message);
      throw error;
    }
  }

  /**
   * Sync courses from Moodle to LMS
   */
  async syncCoursesFromMoodle(): Promise<void> {
    try {
      const moodleCourses = await moodleService.getCourses();

      for (const moodleCourse of moodleCourses) {
        try {
          const existingCourse = await pool.query(
            'SELECT id FROM courses WHERE moodle_id = $1',
            [moodleCourse.id]
          );

          if (existingCourse.rows.length > 0) {
            // Update existing course
            await pool.query(
              `UPDATE courses SET 
                name = $1, 
                description = $2,
                last_sync = NOW()
              WHERE moodle_id = $3`,
              [moodleCourse.fullname, moodleCourse.summary, moodleCourse.id]
            );
            await this.logSync('course', existingCourse.rows[0].id, 'update', 'moodle_to_lms', 'success');
          } else {
            // Create new course
            const result = await pool.query(
              `INSERT INTO courses (moodle_id, name, description, status, last_sync)
               VALUES ($1, $2, $3, 'published', NOW())
               RETURNING id`,
              [moodleCourse.id, moodleCourse.fullname, moodleCourse.summary]
            );
            await this.logSync('course', result.rows[0].id, 'create', 'moodle_to_lms', 'success');
          }
        } catch (error: any) {
          console.error(`Error syncing course ${moodleCourse.id}:`, error.message);
        }
      }
    } catch (error: any) {
      console.error('Error syncing courses from Moodle:', error.message);
      throw error;
    }
  }

  // ==================== Enrollment Sync ====================

  /**
   * Sync enrollment from LMS to Moodle
   */
  async syncEnrollmentToMoodle(enrollmentId: string): Promise<void> {
    try {
      const enrollmentQuery = await pool.query(
        `SELECT e.*, u.moodle_id as user_moodle_id, c.moodle_id as course_moodle_id
         FROM enrollments e
         JOIN users u ON e.user_id = u.id
         JOIN courses c ON e.course_id = c.id
         WHERE e.id = $1`,
        [enrollmentId]
      );

      if (enrollmentQuery.rows.length === 0) {
        throw new Error('Enrollment not found');
      }

      const enrollment = enrollmentQuery.rows[0];

      if (!enrollment.user_moodle_id || !enrollment.course_moodle_id) {
        throw new Error('User or course not synced to Moodle');
      }

      // Enroll user in Moodle (roleId 5 is student by default)
      await moodleService.enrollUser(
        enrollment.user_moodle_id,
        enrollment.course_moodle_id,
        5
      );

      await pool.query(
        'UPDATE enrollments SET last_sync = NOW() WHERE id = $1',
        [enrollmentId]
      );

      await this.logSync('enrollment', enrollmentId, 'create', 'lms_to_moodle', 'success');
    } catch (error: any) {
      await this.logSync('enrollment', enrollmentId, 'create', 'lms_to_moodle', 'failed', error.message);
      throw error;
    }
  }

  /**
   * Sync enrollments from Moodle to LMS for a specific course
   */
  async syncEnrollmentsFromMoodle(courseId: string): Promise<void> {
    try {
      const courseQuery = await pool.query(
        'SELECT moodle_id FROM courses WHERE id = $1',
        [courseId]
      );

      if (courseQuery.rows.length === 0 || !courseQuery.rows[0].moodle_id) {
        throw new Error('Course not found or not synced');
      }

      const moodleCourseId = courseQuery.rows[0].moodle_id;
      const enrolledUsers = await moodleService.getEnrolledUsers(moodleCourseId);

      for (const moodleUser of enrolledUsers) {
        try {
          const userQuery = await pool.query(
            'SELECT id FROM users WHERE moodle_id = $1',
            [moodleUser.id]
          );

          if (userQuery.rows.length === 0) continue;

          const userId = userQuery.rows[0].id;

          // Check if enrollment exists
          const existingEnrollment = await pool.query(
            'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
          );

          if (existingEnrollment.rows.length === 0) {
            // Create new enrollment
            const result = await pool.query(
              `INSERT INTO enrollments (user_id, course_id, role_id, status, last_sync)
               VALUES ($1, $2, NULL, 'active', NOW())
               RETURNING id`,
              [userId, courseId]
            );
            await this.logSync('enrollment', result.rows[0].id, 'create', 'moodle_to_lms', 'success');
          }
        } catch (error: any) {
          console.error(`Error syncing enrollment for user ${moodleUser.id}:`, error.message);
        }
      }
    } catch (error: any) {
      console.error('Error syncing enrollments from Moodle:', error.message);
      throw error;
    }
  }

  // ==================== Full Sync ====================

  /**
   * Perform full bidirectional sync
   */
  async performFullSync(): Promise<{
    users: { imported: number; exported: number };
    courses: { imported: number; exported: number };
  }> {
    const results = {
      users: { imported: 0, exported: 0 },
      courses: { imported: 0, exported: 0 },
    };

    try {
      // Sync users from Moodle to LMS
      await this.syncUsersFromMoodle();
      
      // Sync courses from Moodle to LMS
      await this.syncCoursesFromMoodle();

      // Get sync statistics
      const userStats = await pool.query(
        `SELECT COUNT(*) as count FROM sync_logs 
         WHERE entity_type = 'user' AND status = 'success' 
         AND created_at > NOW() - INTERVAL '1 hour'`
      );

      const courseStats = await pool.query(
        `SELECT COUNT(*) as count FROM sync_logs 
         WHERE entity_type = 'course' AND status = 'success' 
         AND created_at > NOW() - INTERVAL '1 hour'`
      );

      results.users.imported = parseInt(userStats.rows[0].count) || 0;
      results.courses.imported = parseInt(courseStats.rows[0].count) || 0;

      return results;
    } catch (error: any) {
      console.error('Error performing full sync:', error.message);
      throw error;
    }
  }

  /**
   * Get sync logs
   */
  async getSyncLogs(limit = 100, entityType?: string): Promise<SyncLog[]> {
    let query = 'SELECT * FROM sync_logs';
    const params: any[] = [];

    if (entityType) {
      query += ' WHERE entity_type = $1';
      params.push(entityType);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    lastSync: Date | null;
    pendingCount: number;
    failedCount: number;
    successCount: number;
  }> {
    const lastSyncQuery = await pool.query(
      'SELECT MAX(created_at) as last_sync FROM sync_logs WHERE status = $1',
      ['success']
    );

    const statusCounts = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM sync_logs 
       WHERE created_at > NOW() - INTERVAL '24 hours'
       GROUP BY status`
    );

    const counts: Record<string, number> = {};
    statusCounts.rows.forEach(row => {
      counts[row.status] = parseInt(row.count);
    });

    return {
      lastSync: lastSyncQuery.rows[0]?.last_sync || null,
      pendingCount: counts.pending || 0,
      failedCount: counts.failed || 0,
      successCount: counts.success || 0,
    };
  }
}

export default new SyncService();

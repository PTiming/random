import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import syncService from '../services/sync.service';

export class CourseController {
  /**
   * Get all courses
   */
  async getCourses(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT id, name, description, moodle_id, category_id, 
               start_date, end_date, status, created_at, updated_at
        FROM courses
      `;
      const params: any[] = [];

      if (status) {
        query += ' WHERE status = $1';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);

      const result = await pool.query(query, params);

      const countQuery = status
        ? await pool.query('SELECT COUNT(*) FROM courses WHERE status = $1', [status])
        : await pool.query('SELECT COUNT(*) FROM courses');
      
      const total = parseInt(countQuery.rows[0].count);

      res.json({
        courses: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const query = `
        SELECT c.*,
               (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count
        FROM courses c
        WHERE c.id = $1
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Error fetching course:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Create new course
   */
  async createCourse(req: AuthRequest, res: Response) {
    try {
      const { name, description, categoryId, startDate, endDate, status = 'draft' } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Course name is required' });
      }

      const result = await pool.query(
        `INSERT INTO courses (name, description, category_id, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [name, description, categoryId, startDate, endDate, status]
      );

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error('Error creating course:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update course
   */
  async updateCourse(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, categoryId, startDate, endDate, status } = req.body;

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (name) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }
      if (categoryId) {
        updates.push(`category_id = $${paramCount++}`);
        values.push(categoryId);
      }
      if (startDate) {
        updates.push(`start_date = $${paramCount++}`);
        values.push(startDate);
      }
      if (endDate) {
        updates.push(`end_date = $${paramCount++}`);
        values.push(endDate);
      }
      if (status) {
        updates.push(`status = $${paramCount++}`);
        values.push(status);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);
      const query = `
        UPDATE courses 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating course:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Delete course
   */
  async deleteCourse(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM courses WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json({ message: 'Course deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting course:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Enroll user in course
   */
  async enrollUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { userId, roleId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Check if already enrolled
      const existing = await pool.query(
        'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, id]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'User already enrolled' });
      }

      const result = await pool.query(
        `INSERT INTO enrollments (user_id, course_id, role_id, status)
         VALUES ($1, $2, $3, 'active')
         RETURNING *`,
        [userId, id, roleId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error('Error enrolling user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get enrolled students
   */
  async getEnrolledStudents(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const query = `
        SELECT u.id, u.username, u.email, u.first_name, u.last_name,
               e.enrolled_at, e.status, r.name as role
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        LEFT JOIN roles r ON e.role_id = r.id
        WHERE e.course_id = $1
        ORDER BY e.enrolled_at DESC
      `;

      const result = await pool.query(query, [id]);

      res.json(result.rows);
    } catch (error: any) {
      console.error('Error fetching enrolled students:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Sync course to Moodle
   */
  async syncToMoodle(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await syncService.syncCourseToMoodle(id);

      res.json({ message: 'Course synced to Moodle successfully' });
    } catch (error: any) {
      console.error('Error syncing course to Moodle:', error);
      res.status(500).json({ error: error.message || 'Failed to sync course' });
    }
  }
}

export default new CourseController();

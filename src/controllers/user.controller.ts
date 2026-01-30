import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import syncService from '../services/sync.service';

export class UserController {
  /**
   * Get all users (with RBAC filtering)
   */
  async getUsers(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const query = `
        SELECT id, username, email, first_name, last_name, moodle_id, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await pool.query(query, [limit, offset]);

      const countQuery = await pool.query('SELECT COUNT(*) FROM users');
      const total = parseInt(countQuery.rows[0].count);

      res.json({
        users: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const query = `
        SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
               u.moodle_id, u.profile, u.preferences, u.created_at, u.updated_at,
               json_agg(json_build_object('id', r.id, 'name', r.name)) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE u.id = $1
        GROUP BY u.id
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Create new user
   */
  async createUser(req: AuthRequest, res: Response) {
    try {
      const { username, email, password, firstName, lastName, roles } = req.body;

      // Validate input
      if (!username || !email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if user exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, email, first_name, last_name`,
        [username, email, passwordHash, firstName, lastName]
      );

      const user = result.rows[0];

      // Assign roles if provided
      if (roles && Array.isArray(roles)) {
        for (const roleId of roles) {
          await pool.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
            [user.id, roleId]
          );
        }
      }

      res.status(201).json(user);
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update user
   */
  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, profile, preferences } = req.body;

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (firstName) {
        updates.push(`first_name = $${paramCount++}`);
        values.push(firstName);
      }
      if (lastName) {
        updates.push(`last_name = $${paramCount++}`);
        values.push(lastName);
      }
      if (email) {
        updates.push(`email = $${paramCount++}`);
        values.push(email);
      }
      if (profile) {
        updates.push(`profile = $${paramCount++}`);
        values.push(JSON.stringify(profile));
      }
      if (preferences) {
        updates.push(`preferences = $${paramCount++}`);
        values.push(JSON.stringify(preferences));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);
      const query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, username, email, first_name, last_name
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { roleId, contextId, contextType } = req.body;

      if (!roleId) {
        return res.status(400).json({ error: 'Role ID is required' });
      }

      // Check if assignment already exists
      const existing = await pool.query(
        `SELECT * FROM user_roles 
         WHERE user_id = $1 AND role_id = $2 AND COALESCE(context_id::text, '') = $3`,
        [id, roleId, contextId || '']
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Role already assigned' });
      }

      await pool.query(
        'INSERT INTO user_roles (user_id, role_id, context_id, context_type) VALUES ($1, $2, $3, $4)',
        [id, roleId, contextId, contextType]
      );

      res.json({ message: 'Role assigned successfully' });
    } catch (error: any) {
      console.error('Error assigning role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Sync user to Moodle
   */
  async syncToMoodle(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await syncService.syncUserToMoodle(id);

      res.json({ message: 'User synced to Moodle successfully' });
    } catch (error: any) {
      console.error('Error syncing user to Moodle:', error);
      res.status(500).json({ error: error.message || 'Failed to sync user' });
    }
  }
}

export default new UserController();

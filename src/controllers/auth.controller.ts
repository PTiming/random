import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { config } from '../config';

export class AuthController {
  /**
   * User login
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Get user from database
      const userQuery = await pool.query(
        'SELECT id, email, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (userQuery.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = userQuery.rows[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Get user roles
      const rolesQuery = await pool.query(
        `SELECT r.name FROM user_roles ur
         JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = $1`,
        [user.id]
      );

      const roles = rolesQuery.rows.map(r => r.name);

      // Generate tokens
      const token = jwt.sign(
        { id: user.id, email: user.email, roles } as object,
        config.jwt.secret
      );

      const refreshToken = jwt.sign(
        { id: user.id } as object,
        config.jwt.refreshSecret
      );

      res.json({
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          roles,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Refresh token
   */
  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;

      // Get user
      const userQuery = await pool.query(
        'SELECT id, email FROM users WHERE id = $1',
        [decoded.id]
      );

      if (userQuery.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = userQuery.rows[0];

      // Get roles
      const rolesQuery = await pool.query(
        `SELECT r.name FROM user_roles ur
         JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = $1`,
        [user.id]
      );

      const roles = rolesQuery.rows.map(r => r.name);

      // Generate new token
      const token = jwt.sign(
        { id: user.id, email: user.email, roles } as object,
        config.jwt.secret
      );

      res.json({ token });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  /**
   * Register new user
   */
  async register(req: Request, res: Response) {
    try {
      const { username, email, password, firstName, lastName } = req.body;

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
         RETURNING id, email, username`,
        [username, email, passwordHash, firstName, lastName]
      );

      const user = result.rows[0];

      // Assign default Student role
      const studentRole = await pool.query(
        "SELECT id FROM roles WHERE name = 'Student' LIMIT 1"
      );

      if (studentRole.rows.length > 0) {
        await pool.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
          [user.id, studentRole.rows[0].id]
        );
      }

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Logout
   */
  async logout(req: Request, res: Response) {
    // In a production system, you would invalidate the token here
    // For now, just return success
    res.json({ message: 'Logged out successfully' });
  }
}

export default new AuthController();

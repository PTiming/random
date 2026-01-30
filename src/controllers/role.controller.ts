import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';

export class RoleController {
  /**
   * Get all roles
   */
  async getRoles(req: AuthRequest, res: Response) {
    try {
      const query = `
        SELECT r.*, 
               (SELECT COUNT(*) FROM role_permissions WHERE role_id = r.id) as permission_count,
               (SELECT COUNT(*) FROM user_roles WHERE role_id = r.id) as user_count
        FROM roles r
        ORDER BY r.created_at DESC
      `;

      const result = await pool.query(query);

      res.json(result.rows);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const query = `
        SELECT r.*,
               json_agg(DISTINCT jsonb_build_object(
                 'id', p.id,
                 'resource', p.resource,
                 'action', p.action,
                 'context_level', p.context_level
               )) FILTER (WHERE p.id IS NOT NULL) as permissions
        FROM roles r
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        WHERE r.id = $1
        GROUP BY r.id
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Role not found' });
      }

      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Error fetching role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Create new role
   */
  async createRole(req: AuthRequest, res: Response) {
    try {
      const { name, description, parentRoleId, isSystemRole = false } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Role name is required' });
      }

      // Check if role name already exists
      const existing = await pool.query(
        'SELECT id FROM roles WHERE name = $1',
        [name]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Role name already exists' });
      }

      const result = await pool.query(
        `INSERT INTO roles (name, description, parent_role_id, is_system_role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, description, parentRoleId, isSystemRole]
      );

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error('Error creating role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update role
   */
  async updateRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, parentRoleId } = req.body;

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
      if (parentRoleId !== undefined) {
        updates.push(`parent_role_id = $${paramCount++}`);
        values.push(parentRoleId);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);
      const query = `
        UPDATE roles 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount} AND is_system_role = false
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Role not found or is a system role' });
      }

      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Error updating role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Delete role
   */
  async deleteRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM roles WHERE id = $1 AND is_system_role = false RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Role not found or is a system role' });
      }

      res.json({ message: 'Role deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
        return res.status(400).json({ error: 'Permission IDs array is required' });
      }

      // Delete existing permissions
      await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

      // Insert new permissions
      for (const permissionId of permissionIds) {
        await pool.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, permissionId]
        );
      }

      res.json({ message: 'Permissions assigned successfully' });
    } catch (error: any) {
      console.error('Error assigning permissions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all permissions
   */
  async getPermissions(req: AuthRequest, res: Response) {
    try {
      const query = 'SELECT * FROM permissions ORDER BY resource, action';
      const result = await pool.query(query);

      res.json(result.rows);
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new RoleController();

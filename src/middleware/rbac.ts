import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import pool from '../config/database';
import { ResourceType, Action } from '../types';

export class RBACMiddleware {
  /**
   * Check if user has permission for a resource and action
   */
  static async hasPermission(
    userId: string,
    resource: ResourceType,
    action: Action,
    contextId?: string
  ): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = $1
          AND p.resource = $2
          AND p.action = $3
          AND (ur.context_id IS NULL OR ur.context_id = $4)
      `;
      
      const result = await pool.query(query, [userId, resource, action, contextId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  static async hasRole(userId: string, roleNames: string[]): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1 AND r.name = ANY($2)
      `;
      
      const result = await pool.query(query, [userId, roleNames]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * Middleware factory to require specific permission
   */
  static requirePermission(resource: ResourceType, action: Action) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const contextId = req.params.courseId || req.params.id;
      const hasPermission = await RBACMiddleware.hasPermission(
        req.user.id,
        resource,
        action,
        contextId
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    };
  }

  /**
   * Middleware factory to require specific role
   */
  static requireRole(roles: string[]) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const hasRole = await RBACMiddleware.hasRole(req.user.id, roles);

      if (!hasRole) {
        return res.status(403).json({ error: 'Insufficient role' });
      }

      next();
    };
  }

  /**
   * Middleware to check if user is accessing their own resource
   */
  static requireSelfOrRole(roles: string[]) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = req.params.id || req.params.userId;
      
      // Check if accessing own resource
      if (userId === req.user.id) {
        return next();
      }

      // Check if has required role
      const hasRole = await RBACMiddleware.hasRole(req.user.id, roles);
      if (!hasRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    };
  }
}

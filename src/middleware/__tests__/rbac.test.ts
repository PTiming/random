import { RBACMiddleware } from '../middleware/rbac';
import pool from '../config/database';
import { ResourceType, Action } from '../types';

// Mock the database
jest.mock('../config/database');

describe('RBAC Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', async () => {
      const mockQuery = jest.fn().mockResolvedValue({
        rows: [{ count: '1' }],
      });
      (pool.query as jest.Mock) = mockQuery;

      const result = await RBACMiddleware.hasPermission(
        'user-id',
        ResourceType.COURSE,
        Action.READ
      );

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['user-id', ResourceType.COURSE, Action.READ, undefined]
      );
    });

    it('should return false when user does not have permission', async () => {
      const mockQuery = jest.fn().mockResolvedValue({
        rows: [{ count: '0' }],
      });
      (pool.query as jest.Mock) = mockQuery;

      const result = await RBACMiddleware.hasPermission(
        'user-id',
        ResourceType.COURSE,
        Action.DELETE
      );

      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      const mockQuery = jest.fn().mockRejectedValue(new Error('DB error'));
      (pool.query as jest.Mock) = mockQuery;

      const result = await RBACMiddleware.hasPermission(
        'user-id',
        ResourceType.COURSE,
        Action.READ
      );

      expect(result).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has role', async () => {
      const mockQuery = jest.fn().mockResolvedValue({
        rows: [{ count: '1' }],
      });
      (pool.query as jest.Mock) = mockQuery;

      const result = await RBACMiddleware.hasRole('user-id', ['Admin']);

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['user-id', ['Admin']]
      );
    });

    it('should return false when user does not have role', async () => {
      const mockQuery = jest.fn().mockResolvedValue({
        rows: [{ count: '0' }],
      });
      (pool.query as jest.Mock) = mockQuery;

      const result = await RBACMiddleware.hasRole('user-id', ['Admin']);

      expect(result).toBe(false);
    });
  });

  describe('requireRole middleware', () => {
    it('should call next() when user has required role', async () => {
      const mockQuery = jest.fn().mockResolvedValue({
        rows: [{ count: '1' }],
      });
      (pool.query as jest.Mock) = mockQuery;

      const req: any = {
        user: { id: 'user-id' },
      };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const middleware = RBACMiddleware.requireRole(['Admin']);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have required role', async () => {
      const mockQuery = jest.fn().mockResolvedValue({
        rows: [{ count: '0' }],
      });
      (pool.query as jest.Mock) = mockQuery;

      const req: any = {
        user: { id: 'user-id' },
      };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const middleware = RBACMiddleware.requireRole(['Admin']);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient role' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      const req: any = {};
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const middleware = RBACMiddleware.requireRole(['Admin']);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });
});

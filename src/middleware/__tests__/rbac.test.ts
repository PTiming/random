import { ResourceType, Action } from '../../types';

// Mock the database module first
const mockQuery = jest.fn();
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    query: (...args: any[]) => mockQuery(...args),
  },
}));

// Import after mocking
import { RBACMiddleware } from '../rbac';

describe('RBAC Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', async () => {
      mockQuery.mockResolvedValue({
        rows: [{ count: '1' }],
      });

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
      mockQuery.mockResolvedValue({
        rows: [{ count: '0' }],
      });

      const result = await RBACMiddleware.hasPermission(
        'user-id',
        ResourceType.COURSE,
        Action.DELETE
      );

      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      mockQuery.mockRejectedValue(new Error('DB error'));

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
      mockQuery.mockResolvedValue({
        rows: [{ count: '1' }],
      });

      const result = await RBACMiddleware.hasRole('user-id', ['Admin']);

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['user-id', ['Admin']]
      );
    });

    it('should return false when user does not have role', async () => {
      mockQuery.mockResolvedValue({
        rows: [{ count: '0' }],
      });

      const result = await RBACMiddleware.hasRole('user-id', ['Admin']);

      expect(result).toBe(false);
    });
  });

  describe('requireRole middleware', () => {
    it('should call next() when user has required role', async () => {
      mockQuery.mockResolvedValue({
        rows: [{ count: '1' }],
      });

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
      mockQuery.mockResolvedValue({
        rows: [{ count: '0' }],
      });

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

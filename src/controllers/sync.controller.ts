import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import syncService from '../services/sync.service';

export class SyncController {
  /**
   * Trigger full sync
   */
  async triggerFullSync(req: AuthRequest, res: Response) {
    try {
      const results = await syncService.performFullSync();

      res.json({
        message: 'Full sync completed',
        results,
      });
    } catch (error: any) {
      console.error('Error triggering full sync:', error);
      res.status(500).json({ error: error.message || 'Failed to sync' });
    }
  }

  /**
   * Trigger user sync from Moodle
   */
  async syncUsers(req: AuthRequest, res: Response) {
    try {
      await syncService.syncUsersFromMoodle();

      res.json({ message: 'Users synced from Moodle successfully' });
    } catch (error: any) {
      console.error('Error syncing users:', error);
      res.status(500).json({ error: error.message || 'Failed to sync users' });
    }
  }

  /**
   * Trigger course sync from Moodle
   */
  async syncCourses(req: AuthRequest, res: Response) {
    try {
      await syncService.syncCoursesFromMoodle();

      res.json({ message: 'Courses synced from Moodle successfully' });
    } catch (error: any) {
      console.error('Error syncing courses:', error);
      res.status(500).json({ error: error.message || 'Failed to sync courses' });
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(req: AuthRequest, res: Response) {
    try {
      const status = await syncService.getSyncStatus();

      res.json(status);
    } catch (error: any) {
      console.error('Error fetching sync status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get sync logs
   */
  async getSyncLogs(req: AuthRequest, res: Response) {
    try {
      const { limit = 100, entityType } = req.query;

      const logs = await syncService.getSyncLogs(
        Number(limit),
        entityType as string | undefined
      );

      res.json(logs);
    } catch (error: any) {
      console.error('Error fetching sync logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new SyncController();

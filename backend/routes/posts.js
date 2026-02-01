const express = require('express');
const router = express.Router();
const {
  createPost,
  getNewsFeed,
  toggleLike,
  addComment,
  syncToMoodle
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.post('/', protect, apiLimiter, createPost);
router.get('/feed', protect, apiLimiter, getNewsFeed);
router.put('/:id/like', protect, apiLimiter, toggleLike);
router.post('/:id/comment', protect, apiLimiter, addComment);
router.post('/:id/sync-to-moodle', protect, apiLimiter, syncToMoodle);

module.exports = router;

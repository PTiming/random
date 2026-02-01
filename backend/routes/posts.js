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

router.post('/', protect, createPost);
router.get('/feed', protect, getNewsFeed);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.post('/:id/sync-to-moodle', protect, syncToMoodle);

module.exports = router;

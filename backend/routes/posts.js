const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  getUserPosts,
  getCoursePosts,
  searchPosts
} = require('../controllers/postController');

// Public routes
router.get('/search', searchPosts);
router.get('/', optionalAuth, getPosts);
router.get('/:id', getPost);
router.get('/user/:userId', optionalAuth, getUserPosts);

// Protected routes
router.post('/', protect, upload.array('images', 5), createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);
router.get('/course/:courseId', protect, getCoursePosts);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getUsers,
  getUser,
  updateProfile,
  updateAvatar,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers
} = require('../controllers/userController');

// Public routes
router.get('/', getUsers);
router.get('/search', searchUsers);
router.get('/:id', getUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Protected routes
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);

module.exports = router;

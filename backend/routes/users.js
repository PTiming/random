const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, optionalAuth } = require('../middleware/auth');

// Search users
router.get('/search', auth, userController.searchUsers);

// Get suggested users
router.get('/suggested', auth, userController.getSuggestedUsers);

// Get user profile
router.get('/:id', optionalAuth, userController.getUserProfile);

// Update profile
router.put('/profile', auth, userController.updateProfile);

// Get user's posts
router.get('/:id/posts', optionalAuth, userController.getUserPosts);

// Get user's friends
router.get('/:id/friends', optionalAuth, userController.getUserFriends);

// Follow user
router.post('/:id/follow', auth, userController.followUser);

// Unfollow user
router.delete('/:id/follow', auth, userController.unfollowUser);

// Deactivate account
router.delete('/account', auth, userController.deactivateAccount);

module.exports = router;

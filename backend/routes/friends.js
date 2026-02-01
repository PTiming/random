const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { auth } = require('../middleware/auth');

// Get friends list
router.get('/', auth, friendController.getFriendsList);

// Get pending friend requests
router.get('/requests', auth, friendController.getPendingRequests);

// Get sent friend requests
router.get('/requests/sent', auth, friendController.getSentRequests);

// Get mutual friends
router.get('/mutual/:id', auth, friendController.getMutualFriends);

// Send friend request
router.post('/request/:id', auth, friendController.sendFriendRequest);

// Accept friend request
router.post('/accept/:id', auth, friendController.acceptFriendRequest);

// Reject friend request
router.post('/reject/:id', auth, friendController.rejectFriendRequest);

// Cancel friend request
router.delete('/request/:id', auth, friendController.cancelFriendRequest);

// Remove friend
router.delete('/:id', auth, friendController.removeFriend);

module.exports = router;

const User = require('../models/User');
const Notification = require('../models/Notification');

// Send friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.userId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.userId);

    // Check if already friends
    if (currentUser.friends.includes(id)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Check if request already sent
    const existingRequest = currentUser.sentFriendRequests.find(
      req => req.to.toString() === id && req.status === 'pending'
    );
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if there's a pending request from the target user
    const incomingRequest = currentUser.friendRequests.find(
      req => req.from.toString() === id && req.status === 'pending'
    );
    if (incomingRequest) {
      return res.status(400).json({ 
        message: 'This user has already sent you a friend request',
        hasPendingRequest: true
      });
    }

    // Add to current user's sent requests
    currentUser.sentFriendRequests.push({ to: id, status: 'pending' });
    await currentUser.save();

    // Add to target user's friend requests
    targetUser.friendRequests.push({ from: req.userId, status: 'pending' });
    await targetUser.save();

    // Create notification
    const notification = new Notification({
      recipient: id,
      sender: req.userId,
      type: 'friend_request',
      message: 'sent you a friend request',
      link: `/profile/${req.userId}`
    });
    await notification.save();

    // Emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(id).emit('notification', notification);
      io.to(id).emit('friendRequest', { from: req.userId });
    }

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Error sending friend request', error: error.message });
  }
};

// Accept friend request
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { id } = req.params; // ID of the user who sent the request

    const currentUser = await User.findById(req.userId);
    const requestingUser = await User.findById(id);

    if (!requestingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the friend request
    const requestIndex = currentUser.friendRequests.findIndex(
      req => req.from.toString() === id && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Update request status
    currentUser.friendRequests[requestIndex].status = 'accepted';
    
    // Update the sender's sent request status
    const sentRequestIndex = requestingUser.sentFriendRequests.findIndex(
      req => req.to.toString() === req.userId && req.status === 'pending'
    );
    if (sentRequestIndex > -1) {
      requestingUser.sentFriendRequests[sentRequestIndex].status = 'accepted';
    }

    // Add to friends lists
    if (!currentUser.friends.includes(id)) {
      currentUser.friends.push(id);
    }
    if (!requestingUser.friends.includes(req.userId)) {
      requestingUser.friends.push(req.userId);
    }

    await Promise.all([currentUser.save(), requestingUser.save()]);

    // Create notification for the requesting user
    const notification = new Notification({
      recipient: id,
      sender: req.userId,
      type: 'friend_accepted',
      message: 'accepted your friend request',
      link: `/profile/${req.userId}`
    });
    await notification.save();

    // Emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(id).emit('notification', notification);
      io.to(id).emit('friendRequestAccepted', { from: req.userId });
    }

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Error accepting friend request', error: error.message });
  }
};

// Reject friend request
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const currentUser = await User.findById(req.userId);
    const requestingUser = await User.findById(id);

    if (!requestingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find and update the friend request
    const requestIndex = currentUser.friendRequests.findIndex(
      req => req.from.toString() === id && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    currentUser.friendRequests[requestIndex].status = 'rejected';

    // Update sender's sent request
    const sentRequestIndex = requestingUser.sentFriendRequests.findIndex(
      req => req.to.toString() === req.userId && req.status === 'pending'
    );
    if (sentRequestIndex > -1) {
      requestingUser.sentFriendRequests[sentRequestIndex].status = 'rejected';
    }

    await Promise.all([currentUser.save(), requestingUser.save()]);

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Error rejecting friend request', error: error.message });
  }
};

// Cancel friend request
exports.cancelFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const currentUser = await User.findById(req.userId);
    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from current user's sent requests
    currentUser.sentFriendRequests = currentUser.sentFriendRequests.filter(
      req => !(req.to.toString() === id && req.status === 'pending')
    );

    // Remove from target user's friend requests
    targetUser.friendRequests = targetUser.friendRequests.filter(
      req => !(req.from.toString() === req.userId && req.status === 'pending')
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ message: 'Friend request cancelled' });
  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({ message: 'Error cancelling friend request', error: error.message });
  }
};

// Remove friend
exports.removeFriend = async (req, res) => {
  try {
    const { id } = req.params;

    const currentUser = await User.findById(req.userId);
    const friendUser = await User.findById(id);

    if (!friendUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if actually friends
    if (!currentUser.friends.includes(id)) {
      return res.status(400).json({ message: 'Not friends with this user' });
    }

    // Remove from both users' friends lists
    currentUser.friends = currentUser.friends.filter(
      friendId => friendId.toString() !== id
    );
    friendUser.friends = friendUser.friends.filter(
      friendId => friendId.toString() !== req.userId
    );

    await Promise.all([currentUser.save(), friendUser.save()]);

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Error removing friend', error: error.message });
  }
};

// Get pending friend requests
exports.getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friendRequests.from', 'username firstName lastName avatar');

    const pendingRequests = user.friendRequests.filter(
      req => req.status === 'pending'
    );

    res.json(pendingRequests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Error fetching friend requests', error: error.message });
  }
};

// Get sent friend requests
exports.getSentRequests = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('sentFriendRequests.to', 'username firstName lastName avatar');

    const sentRequests = user.sentFriendRequests.filter(
      req => req.status === 'pending'
    );

    res.json(sentRequests);
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Error fetching sent requests', error: error.message });
  }
};

// Get friends list
exports.getFriendsList = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends', 'username firstName lastName avatar bio isOnline lastSeen');

    res.json(user.friends);
  } catch (error) {
    console.error('Get friends list error:', error);
    res.status(500).json({ message: 'Error fetching friends', error: error.message });
  }
};

// Get mutual friends
exports.getMutualFriends = async (req, res) => {
  try {
    const { id } = req.params;

    const currentUser = await User.findById(req.userId);
    const otherUser = await User.findById(id);

    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const mutualFriendIds = currentUser.friends.filter(
      friendId => otherUser.friends.includes(friendId.toString())
    );

    const mutualFriends = await User.find({
      _id: { $in: mutualFriendIds }
    }).select('username firstName lastName avatar');

    res.json(mutualFriends);
  } catch (error) {
    console.error('Get mutual friends error:', error);
    res.status(500).json({ message: 'Error fetching mutual friends', error: error.message });
  }
};

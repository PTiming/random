const User = require('../models/User');
const Post = require('../models/Post');

// Get user profile by ID or username
exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by ID first, then by username
    let user = await User.findById(id)
      .select('-password -moodleToken')
      .populate('friends', 'username firstName lastName avatar');
    
    if (!user) {
      user = await User.findOne({ username: id })
        .select('-password -moodleToken')
        .populate('friends', 'username firstName lastName avatar');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's post count
    const postCount = await Post.countDocuments({ author: user._id, isActive: true });

    res.json({
      ...user.toJSON(),
      postCount,
      friendsCount: user.friends.length,
      followersCount: user.followers.length,
      followingCount: user.following.length
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'bio', 'location', 'website', 'dateOfBirth', 'avatar'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -moodleToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchRegex = new RegExp(query, 'i');

    const users = await User.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex }
          ]
        }
      ]
    })
      .select('username firstName lastName avatar bio')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments({
      $and: [
        { isActive: true },
        {
          $or: [
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex }
          ]
        }
      ]
    });

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ author: id, isActive: true })
      .populate('author', 'username firstName lastName avatar')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username firstName lastName avatar' }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments({ author: id, isActive: true });

    res.json({
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Error fetching user posts', error: error.message });
  }
};

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.userId);

    // Check if already following
    if (currentUser.following.includes(id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following/followers
    currentUser.following.push(id);
    userToFollow.followers.push(req.userId);

    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToUnfollow = await User.findById(id);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.userId);

    // Check if actually following
    if (!currentUser.following.includes(id)) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    // Remove from following/followers
    currentUser.following = currentUser.following.filter(
      userId => userId.toString() !== id
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      userId => userId.toString() !== req.userId
    );

    await Promise.all([currentUser.save(), userToUnfollow.save()]);

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Error unfollowing user', error: error.message });
  }
};

// Get suggested users
exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    
    // Get users who are friends of friends but not current user's friends
    const suggestedUsers = await User.find({
      _id: { 
        $ne: req.userId,
        $nin: [...currentUser.friends, ...currentUser.following]
      },
      isActive: true
    })
      .select('username firstName lastName avatar bio')
      .limit(10);

    res.json(suggestedUsers);
  } catch (error) {
    console.error('Get suggested users error:', error);
    res.status(500).json({ message: 'Error getting suggested users', error: error.message });
  }
};

// Get user's friends
exports.getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('friends', 'username firstName lastName avatar bio isOnline lastSeen');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.friends);
  } catch (error) {
    console.error('Get user friends error:', error);
    res.status(500).json({ message: 'Error fetching friends', error: error.message });
  }
};

// Deactivate account
exports.deactivateAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: 'Error deactivating account', error: error.message });
  }
};

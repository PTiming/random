const User = require('../models/User');
const Post = require('../models/Post');

// Global search - search users, posts, and hashtags
exports.globalSearch = async (req, res) => {
  try {
    const { query, type = 'all', page = 1, limit = 10 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchQuery = query.trim();
    const searchRegex = new RegExp(searchQuery, 'i');
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const results = {};

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        isActive: true,
        $or: [
          { username: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { bio: searchRegex }
        ]
      })
        .select('username firstName lastName avatar bio')
        .limit(type === 'all' ? 5 : parseInt(limit))
        .skip(type === 'users' ? skip : 0);

      const userCount = await User.countDocuments({
        isActive: true,
        $or: [
          { username: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
          { bio: searchRegex }
        ]
      });

      results.users = {
        items: users,
        total: userCount
      };
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        isActive: true,
        $or: [
          { content: searchRegex },
          { tags: searchRegex },
          { moodleCourseName: searchRegex }
        ]
      })
        .populate('author', 'username firstName lastName avatar')
        .sort({ createdAt: -1 })
        .limit(type === 'all' ? 5 : parseInt(limit))
        .skip(type === 'posts' ? skip : 0);

      const postCount = await Post.countDocuments({
        isActive: true,
        $or: [
          { content: searchRegex },
          { tags: searchRegex },
          { moodleCourseName: searchRegex }
        ]
      });

      results.posts = {
        items: posts,
        total: postCount
      };
    }

    // Search hashtags
    if (type === 'all' || type === 'hashtags') {
      // Find all unique hashtags that match the query
      const hashtagSearch = searchQuery.startsWith('#') 
        ? searchQuery.substring(1) 
        : searchQuery;
      
      const hashtagRegex = new RegExp(hashtagSearch, 'i');
      
      const hashtagAggregation = await Post.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$tags' },
        { $match: { tags: hashtagRegex } },
        { $group: { 
          _id: '$tags', 
          count: { $sum: 1 },
          lastUsed: { $max: '$createdAt' }
        }},
        { $sort: { count: -1 } },
        { $limit: type === 'all' ? 10 : parseInt(limit) }
      ]);

      results.hashtags = {
        items: hashtagAggregation.map(h => ({
          tag: h._id,
          count: h.count,
          lastUsed: h.lastUsed
        })),
        total: hashtagAggregation.length
      };
    }

    res.json({
      query: searchQuery,
      results,
      type
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ message: 'Error performing search', error: error.message });
  }
};

// Search suggestions (autocomplete)
exports.searchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchQuery = query.trim();
    const searchRegex = new RegExp(`^${searchQuery}`, 'i');

    // Get user suggestions
    const userSuggestions = await User.find({
      isActive: true,
      $or: [
        { username: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    })
      .select('username firstName lastName avatar')
      .limit(5);

    // Get hashtag suggestions
    const hashtagAggregation = await Post.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      { $match: { tags: searchRegex } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const suggestions = [
      ...userSuggestions.map(u => ({
        type: 'user',
        id: u._id,
        text: `${u.firstName} ${u.lastName}`,
        username: u.username,
        avatar: u.avatar
      })),
      ...hashtagAggregation.map(h => ({
        type: 'hashtag',
        text: `#${h._id}`,
        tag: h._id,
        count: h.count
      }))
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ message: 'Error fetching suggestions', error: error.message });
  }
};

// Search posts by hashtag
exports.searchByHashtag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const hashtag = tag.startsWith('#') ? tag.substring(1) : tag;

    const posts = await Post.find({
      isActive: true,
      tags: { $regex: new RegExp(`^${hashtag}$`, 'i') }
    })
      .populate('author', 'username firstName lastName avatar')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username firstName lastName avatar' }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments({
      isActive: true,
      tags: { $regex: new RegExp(`^${hashtag}$`, 'i') }
    });

    res.json({
      hashtag,
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Search by hashtag error:', error);
    res.status(500).json({ message: 'Error searching by hashtag', error: error.message });
  }
};

// Get trending hashtags
exports.getTrendingHashtags = async (req, res) => {
  try {
    const { limit = 10, days = 7 } = req.query;

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - parseInt(days));

    const trending = await Post.aggregate([
      { 
        $match: { 
          isActive: true,
          createdAt: { $gte: sinceDate }
        } 
      },
      { $unwind: '$tags' },
      { 
        $group: { 
          _id: '$tags', 
          count: { $sum: 1 },
          posts: { $push: '$_id' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      trending: trending.map(t => ({
        tag: t._id,
        count: t.count,
        postCount: t.posts.length
      })),
      period: `${days} days`
    });
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    res.status(500).json({ message: 'Error fetching trending hashtags', error: error.message });
  }
};

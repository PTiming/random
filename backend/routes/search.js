const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { auth, optionalAuth } = require('../middleware/auth');

// Global search (users, posts, hashtags)
router.get('/', optionalAuth, searchController.globalSearch);

// Search suggestions (autocomplete)
router.get('/suggestions', optionalAuth, searchController.searchSuggestions);

// Search by hashtag
router.get('/hashtag/:tag', optionalAuth, searchController.searchByHashtag);

// Get trending hashtags
router.get('/trending', optionalAuth, searchController.getTrendingHashtags);

module.exports = router;

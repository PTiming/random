const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const { protect, restrictTo } = require('../middleware/auth');

// Get all polls
router.get('/', protect, async (req, res) => {
  try {
    const { course, active } = req.query;
    const query = {};

    if (course) query.course = course;
    
    if (active === 'true') {
      query.isClosed = false;
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gte: new Date() } }
      ];
    }

    const polls = await Poll.find(query)
      .populate('creator', 'firstName lastName avatar role')
      .sort({ createdAt: -1 });

    // Calculate vote counts (hide voters if anonymous)
    const pollsWithCounts = polls.map(poll => {
      const pollObj = poll.toObject();
      pollObj.options = pollObj.options.map(opt => ({
        _id: opt._id,
        text: opt.text,
        voteCount: opt.votes.length,
        voters: poll.isAnonymous ? [] : opt.votes,
        hasVoted: opt.votes.some(v => v.toString() === req.user._id.toString())
      }));
      pollObj.totalVotes = pollObj.options.reduce((sum, opt) => sum + opt.voteCount, 0);
      pollObj.userHasVoted = pollObj.options.some(opt => opt.hasVoted);
      return pollObj;
    });

    res.json(pollsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create poll (teachers and admins only)
router.post('/', protect, restrictTo('teacher', 'admin'), async (req, res) => {
  try {
    const { question, options, allowMultiple, isAnonymous, course, expiresAt } = req.body;

    if (!options || options.length < 2) {
      return res.status(400).json({ message: 'At least 2 options required' });
    }

    const poll = await Poll.create({
      creator: req.user._id,
      question,
      options: options.map(text => ({ text, votes: [] })),
      allowMultiple,
      isAnonymous,
      course,
      expiresAt
    });

    await poll.populate('creator', 'firstName lastName avatar role');

    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on poll
router.post('/:id/vote', protect, async (req, res) => {
  try {
    const { optionIds } = req.body; // Array of option IDs
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.isClosed) {
      return res.status(400).json({ message: 'Poll is closed' });
    }

    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return res.status(400).json({ message: 'Poll has expired' });
    }

    // Check if user already voted
    const hasVoted = poll.options.some(opt => 
      opt.votes.some(v => v.toString() === req.user._id.toString())
    );

    if (hasVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Validate options
    if (!poll.allowMultiple && optionIds.length > 1) {
      return res.status(400).json({ message: 'Only one vote allowed' });
    }

    // Add votes
    optionIds.forEach(optId => {
      const option = poll.options.id(optId);
      if (option) {
        option.votes.push(req.user._id);
      }
    });

    await poll.save();

    // Return updated poll with counts
    const updatedPoll = poll.toObject();
    updatedPoll.options = updatedPoll.options.map(opt => ({
      _id: opt._id,
      text: opt.text,
      voteCount: opt.votes.length,
      voters: poll.isAnonymous ? [] : opt.votes,
      hasVoted: opt.votes.some(v => v.toString() === req.user._id.toString())
    }));
    updatedPoll.totalVotes = updatedPoll.options.reduce((sum, opt) => sum + opt.voteCount, 0);
    updatedPoll.userHasVoted = true;

    res.json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Close poll
router.put('/:id/close', protect, restrictTo('teacher', 'admin'), async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    poll.isClosed = true;
    await poll.save();

    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete poll
router.delete('/:id', protect, restrictTo('teacher', 'admin'), async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await poll.deleteOne();
    res.json({ message: 'Poll deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

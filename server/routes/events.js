const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

// Get all events
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, eventType, course, studyGroup } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }
    if (eventType) query.eventType = eventType;
    if (course) query.course = course;
    if (studyGroup) query.studyGroup = studyGroup;

    // Show public events or events user created/is attending
    query.$or = [
      { isPublic: true },
      { creator: req.user._id },
      { 'attendees.user': req.user._id }
    ];

    const events = await Event.find(query)
      .populate('creator', 'firstName lastName avatar')
      .populate('attendees.user', 'firstName lastName avatar')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my events (created or attending)
router.get('/my-events', protect, async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { creator: req.user._id },
        { 'attendees.user': req.user._id }
      ]
    })
      .populate('creator', 'firstName lastName avatar')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/', protect, async (req, res) => {
  try {
    const {
      title, description, eventType, startDate, endDate,
      location, isOnline, meetingLink, course, studyGroup,
      maxAttendees, isPublic, reminders
    } = req.body;

    const event = await Event.create({
      creator: req.user._id,
      title,
      description,
      eventType,
      startDate,
      endDate,
      location,
      isOnline,
      meetingLink,
      course,
      studyGroup,
      maxAttendees,
      isPublic,
      reminders,
      attendees: [{ user: req.user._id, status: 'going' }]
    });

    await event.populate('creator', 'firstName lastName avatar');

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RSVP to event
router.post('/:id/rsvp', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'going', 'maybe', 'not_going'
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check max attendees
    if (status === 'going' && event.maxAttendees) {
      const goingCount = event.attendees.filter(a => a.status === 'going').length;
      if (goingCount >= event.maxAttendees) {
        return res.status(400).json({ message: 'Event is full' });
      }
    }

    // Update or add RSVP
    const existingIndex = event.attendees.findIndex(
      a => a.user.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      event.attendees[existingIndex].status = status;
      event.attendees[existingIndex].respondedAt = new Date();
    } else {
      event.attendees.push({
        user: req.user._id,
        status,
        respondedAt: new Date()
      });
    }

    await event.save();
    await event.populate('attendees.user', 'firstName lastName avatar');

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event
router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('creator', 'firstName lastName avatar');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const MoodleService = require('../services/moodleService');

// Connect Moodle account
exports.connectMoodle = async (req, res) => {
  try {
    const { moodleUrl, username, password } = req.body;

    if (!moodleUrl || !username || !password) {
      return res.status(400).json({ message: 'Moodle URL, username, and password are required' });
    }

    const moodleService = new MoodleService(moodleUrl);
    const authResult = await moodleService.authenticateUser(username, password);

    if (!authResult.success) {
      return res.status(401).json({ message: 'Moodle authentication failed', error: authResult.error });
    }

    // Get user info from Moodle
    moodleService.token = authResult.token;
    const userInfo = await moodleService.getUserInfo();

    // Update user with Moodle connection
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        moodleToken: authResult.token,
        moodleUserId: userInfo.userid,
        moodleUsername: username,
        moodleConnected: true
      },
      { new: true }
    ).select('-password -moodleToken');

    res.json({
      message: 'Moodle account connected successfully',
      user,
      moodleInfo: {
        userId: userInfo.userid,
        username: userInfo.username,
        fullName: userInfo.fullname,
        siteName: userInfo.sitename
      }
    });
  } catch (error) {
    console.error('Connect Moodle error:', error);
    res.status(500).json({ message: 'Error connecting Moodle account', error: error.message });
  }
};

// Disconnect Moodle account
exports.disconnectMoodle = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        moodleToken: null,
        moodleUserId: null,
        moodleUsername: null,
        moodleConnected: false
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'Moodle account disconnected', user });
  } catch (error) {
    console.error('Disconnect Moodle error:', error);
    res.status(500).json({ message: 'Error disconnecting Moodle account', error: error.message });
  }
};

// Get Moodle connection status
exports.getMoodleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.moodleConnected || !user.moodleToken) {
      return res.json({ connected: false });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    
    try {
      const userInfo = await moodleService.getUserInfo();
      res.json({
        connected: true,
        moodleInfo: {
          userId: userInfo.userid,
          username: userInfo.username,
          fullName: userInfo.fullname,
          siteName: userInfo.sitename,
          siteUrl: userInfo.siteurl
        }
      });
    } catch (moodleError) {
      // Token might be invalid
      res.json({ connected: false, error: 'Moodle session expired' });
    }
  } catch (error) {
    console.error('Get Moodle status error:', error);
    res.status(500).json({ message: 'Error checking Moodle status', error: error.message });
  }
};

// Get user's Moodle courses
exports.getCourses = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const courses = await moodleService.getUserCourses(user.moodleUserId);

    res.json({ courses });
  } catch (error) {
    console.error('Get Moodle courses error:', error);
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

// Get course content
exports.getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const content = await moodleService.getCourseContent(courseId);

    res.json({ content });
  } catch (error) {
    console.error('Get course content error:', error);
    res.status(500).json({ message: 'Error fetching course content', error: error.message });
  }
};

// Get user's grades
exports.getGrades = async (req, res) => {
  try {
    const { courseId } = req.query;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);

    if (courseId) {
      const grades = await moodleService.getUserGrades(courseId, user.moodleUserId);
      res.json({ grades });
    } else {
      const grades = await moodleService.getUserOverviewGrades();
      res.json({ grades });
    }
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ message: 'Error fetching grades', error: error.message });
  }
};

// Get assignments
exports.getAssignments = async (req, res) => {
  try {
    const { courseIds } = req.query;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    
    // Get all courses if no specific courseIds provided
    let courses;
    if (courseIds) {
      courses = courseIds.split(',').map(id => parseInt(id));
    } else {
      const userCourses = await moodleService.getUserCourses(user.moodleUserId);
      courses = userCourses.map(c => c.id);
    }

    const assignments = await moodleService.getCourseAssignments(courses);

    res.json({ assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

// Get calendar events/deadlines
exports.getCalendarEvents = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const events = await moodleService.getUpcomingEvents(20);

    res.json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// Get course participants (classmates)
exports.getCourseParticipants = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const participants = await moodleService.getCourseParticipants(courseId);

    // Find users on our platform who are also in this course
    const moodleUserIds = participants.map(p => p.id.toString());
    const platformUsers = await User.find({
      moodleUserId: { $in: moodleUserIds },
      _id: { $ne: req.userId }
    }).select('username firstName lastName avatar moodleUserId');

    res.json({
      moodleParticipants: participants,
      platformUsers: platformUsers
    });
  } catch (error) {
    console.error('Get course participants error:', error);
    res.status(500).json({ message: 'Error fetching participants', error: error.message });
  }
};

// Share course/achievement to feed
exports.shareCoursePost = async (req, res) => {
  try {
    const { courseId, courseName, content, postType } = req.body;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const post = new Post({
      author: req.userId,
      content: content || `Shared from ${courseName}`,
      postType: postType || 'moodle_course',
      moodleCourseId: courseId,
      moodleCourseName: courseName,
      visibility: 'public'
    });

    await post.save();
    await post.populate('author', 'username firstName lastName avatar');

    // Emit to socket
    const io = req.app.get('io');
    if (io) {
      io.emit('newPost', post);
    }

    res.status(201).json({ message: 'Course post shared successfully', post });
  } catch (error) {
    console.error('Share course post error:', error);
    res.status(500).json({ message: 'Error sharing course post', error: error.message });
  }
};

// Get Moodle notifications
exports.getMoodleNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const notifications = await moodleService.getNotifications(30);

    res.json({ notifications });
  } catch (error) {
    console.error('Get Moodle notifications error:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Search courses
exports.searchCourses = async (req, res) => {
  try {
    const { query } = req.query;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const results = await moodleService.searchCourses(query);

    res.json({ results });
  } catch (error) {
    console.error('Search courses error:', error);
    res.status(500).json({ message: 'Error searching courses', error: error.message });
  }
};

// Sync grade achievement (create post for new grades)
exports.syncGradeAchievement = async (req, res) => {
  try {
    const { courseId, courseName, activityName, grade, maxGrade } = req.body;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    // Create achievement post
    const percentage = ((grade / maxGrade) * 100).toFixed(1);
    const post = new Post({
      author: req.userId,
      content: `🎉 Achievement unlocked! Scored ${grade}/${maxGrade} (${percentage}%) on "${activityName}" in ${courseName}`,
      postType: 'moodle_achievement',
      moodleCourseId: courseId,
      moodleCourseName: courseName,
      moodleActivityType: 'assignment',
      visibility: 'friends'
    });

    await post.save();
    await post.populate('author', 'username firstName lastName avatar');

    res.status(201).json({ message: 'Achievement shared', post });
  } catch (error) {
    console.error('Sync grade achievement error:', error);
    res.status(500).json({ message: 'Error syncing achievement', error: error.message });
  }
};

// ==========================================
// TWO-WAY DATA SYNC - WRITE OPERATIONS
// ==========================================

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { text, submitForGrading } = req.body;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    
    // Save the submission
    const saveResult = await moodleService.submitAssignment(assignmentId, text);

    // Optionally submit for grading
    let gradingResult = null;
    if (submitForGrading) {
      gradingResult = await moodleService.submitAssignmentForGrading(assignmentId);
    }

    res.json({
      message: 'Assignment submitted successfully',
      saveResult,
      gradingResult,
      submittedForGrading: submitForGrading
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Error submitting assignment', error: error.message });
  }
};

// Get assignment submission status
exports.getAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const status = await moodleService.getAssignmentSubmissionStatus(assignmentId, user.moodleUserId);

    res.json({ status });
  } catch (error) {
    console.error('Get assignment status error:', error);
    res.status(500).json({ message: 'Error getting assignment status', error: error.message });
  }
};

// Create forum discussion
exports.createForumDiscussion = async (req, res) => {
  try {
    const { forumId } = req.params;
    const { subject, message, subscribe, groupId } = req.body;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const result = await moodleService.createForumDiscussion(forumId, subject, message, {
      subscribe,
      groupId
    });

    res.status(201).json({
      message: 'Forum discussion created successfully',
      discussion: result
    });
  } catch (error) {
    console.error('Create forum discussion error:', error);
    res.status(500).json({ message: 'Error creating forum discussion', error: error.message });
  }
};

// Reply to forum post
exports.replyToForumPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { subject, message } = req.body;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const result = await moodleService.replyToForumPost(postId, subject, message);

    res.status(201).json({
      message: 'Reply posted successfully',
      post: result
    });
  } catch (error) {
    console.error('Reply to forum post error:', error);
    res.status(500).json({ message: 'Error replying to forum post', error: error.message });
  }
};

// Send message to Moodle user
exports.sendMoodleMessage = async (req, res) => {
  try {
    const { toUserId, text } = req.body;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const result = await moodleService.sendInstantMessage(toUserId, text);

    res.json({
      message: 'Message sent successfully',
      result
    });
  } catch (error) {
    console.error('Send Moodle message error:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Create calendar event
exports.createCalendarEvent = async (req, res) => {
  try {
    const { name, description, courseId, timeStart, duration, eventType } = req.body;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const result = await moodleService.createCalendarEvent({
      name,
      description,
      courseId: courseId || 0,
      timeStart: Math.floor(new Date(timeStart).getTime() / 1000),
      duration: duration || 0,
      eventType: eventType || 'user'
    });

    res.status(201).json({
      message: 'Calendar event created successfully',
      event: result
    });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ message: 'Error creating calendar event', error: error.message });
  }
};

// Delete calendar event
exports.deleteCalendarEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const result = await moodleService.deleteCalendarEvent(eventId);

    res.json({
      message: 'Calendar event deleted successfully',
      result
    });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ message: 'Error deleting calendar event', error: error.message });
  }
};

// Mark notifications as read
exports.markNotificationsRead = async (req, res) => {
  try {
    const { notificationId, markAll } = req.body;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    
    let result;
    if (markAll) {
      result = await moodleService.markAllNotificationsAsRead(user.moodleUserId);
    } else if (notificationId) {
      result = await moodleService.markNotificationAsRead(notificationId);
    } else {
      return res.status(400).json({ message: 'Either notificationId or markAll is required' });
    }

    res.json({
      message: markAll ? 'All notifications marked as read' : 'Notification marked as read',
      result
    });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
  }
};

// Self-enroll in course
exports.selfEnroll = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { password } = req.body;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const result = await moodleService.selfEnrollInCourse(courseId, password);

    res.json({
      message: 'Successfully enrolled in course',
      result
    });
  } catch (error) {
    console.error('Self-enroll error:', error);
    res.status(500).json({ message: 'Error enrolling in course', error: error.message });
  }
};

// Complete activity manually
exports.completeActivity = async (req, res) => {
  try {
    const { cmid } = req.params;
    const { completed } = req.body;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const result = await moodleService.completeActivity(cmid, completed !== false);

    res.json({
      message: completed !== false ? 'Activity marked as complete' : 'Activity marked as incomplete',
      result
    });
  } catch (error) {
    console.error('Complete activity error:', error);
    res.status(500).json({ message: 'Error updating activity completion', error: error.message });
  }
};

// Get course completion status
exports.getCourseCompletion = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const status = await moodleService.getCourseCompletionStatus(courseId, user.moodleUserId);

    res.json({ completion: status });
  } catch (error) {
    console.error('Get course completion error:', error);
    res.status(500).json({ message: 'Error getting course completion', error: error.message });
  }
};

// Get forum discussions for a course
exports.getForumDiscussions = async (req, res) => {
  try {
    const { forumId } = req.params;
    const { page, perPage } = req.query;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const discussions = await moodleService.getForumDiscussions(
      forumId,
      parseInt(page) || 0,
      parseInt(perPage) || 10
    );

    res.json({ discussions });
  } catch (error) {
    console.error('Get forum discussions error:', error);
    res.status(500).json({ message: 'Error getting forum discussions', error: error.message });
  }
};

// Mark Moodle messages as read
exports.markMoodleMessagesRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const user = await User.findById(req.userId);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(401).json({ message: 'Moodle account not connected' });
    }

    const moodleService = new MoodleService(process.env.MOODLE_URL, user.moodleToken);
    const result = await moodleService.markMessagesAsRead(user.moodleUserId, conversationId);

    res.json({
      message: 'Messages marked as read',
      result
    });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ message: 'Error marking messages as read', error: error.message });
  }
};

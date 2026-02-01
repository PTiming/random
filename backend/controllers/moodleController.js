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

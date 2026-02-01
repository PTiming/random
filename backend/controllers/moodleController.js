const User = require('../models/User');
const Course = require('../models/Course');
const MoodleService = require('../services/moodleService');

// @desc    Connect user to Moodle account
// @route   POST /api/moodle/connect
// @access  Private
exports.connectMoodle = async (req, res) => {
  try {
    const { username, password, moodleUrl } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide Moodle username and password'
      });
    }

    // Create Moodle service instance
    const moodleService = new MoodleService(moodleUrl);

    // Authenticate with Moodle
    const authResult = await moodleService.authenticateUser(username, password);

    if (!authResult.token) {
      return res.status(401).json({
        success: false,
        error: 'Failed to authenticate with Moodle'
      });
    }

    // Set the user token
    moodleService.setUserToken(authResult.token);

    // Get user info from Moodle
    const siteInfo = await moodleService.getSiteInfo();

    // Update user with Moodle info
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        moodleUserId: siteInfo.userid.toString(),
        moodleToken: authResult.token,
        moodleConnected: true
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Successfully connected to Moodle',
      moodleUser: {
        id: siteInfo.userid,
        username: siteInfo.username,
        fullname: siteInfo.fullname,
        sitename: siteInfo.sitename
      }
    });
  } catch (error) {
    console.error('Connect Moodle error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to connect to Moodle'
    });
  }
};

// @desc    Disconnect user from Moodle
// @route   DELETE /api/moodle/disconnect
// @access  Private
exports.disconnectMoodle = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      moodleUserId: '',
      moodleToken: '',
      moodleConnected: false
    });

    res.json({
      success: true,
      message: 'Successfully disconnected from Moodle'
    });
  } catch (error) {
    console.error('Disconnect Moodle error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Sync courses from Moodle
// @route   POST /api/moodle/sync/courses
// @access  Private
exports.syncCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(400).json({
        success: false,
        error: 'Please connect your Moodle account first'
      });
    }

    // Create Moodle service with user's token
    const moodleService = new MoodleService();
    moodleService.setUserToken(user.moodleToken);

    // Get user's courses from Moodle
    const moodleCourses = await moodleService.getUserCourses(user.moodleUserId);

    const syncedCourses = [];

    for (const moodleCourse of moodleCourses) {
      // Check if course already exists in our DB
      let course = await Course.findOne({ moodleCourseId: moodleCourse.id.toString() });

      if (course) {
        // Update existing course
        course.title = moodleCourse.fullname;
        course.shortName = moodleCourse.shortname;
        course.description = moodleCourse.summary || '';
        course.category = moodleCourse.categoryname || '';
        course.startDate = moodleCourse.startdate ? new Date(moodleCourse.startdate * 1000) : null;
        course.endDate = moodleCourse.enddate ? new Date(moodleCourse.enddate * 1000) : null;
        course.lastSyncedAt = new Date();

        // Check if user is already enrolled
        const existingEnrollment = course.enrolledUsers.find(
          e => e.user.toString() === user._id.toString()
        );

        if (!existingEnrollment) {
          course.enrolledUsers.push({
            user: user._id,
            moodleEnrollmentId: moodleCourse.enrolledusercount?.toString(),
            role: 'student',
            progress: moodleCourse.progress || 0
          });
        } else {
          // Update progress
          existingEnrollment.progress = moodleCourse.progress || existingEnrollment.progress;
        }

        await course.save();
      } else {
        // Create new course
        course = await Course.create({
          moodleCourseId: moodleCourse.id.toString(),
          title: moodleCourse.fullname,
          shortName: moodleCourse.shortname,
          description: moodleCourse.summary || '',
          category: moodleCourse.categoryname || '',
          startDate: moodleCourse.startdate ? new Date(moodleCourse.startdate * 1000) : null,
          endDate: moodleCourse.enddate ? new Date(moodleCourse.enddate * 1000) : null,
          enrolledUsers: [{
            user: user._id,
            role: 'student',
            progress: moodleCourse.progress || 0
          }]
        });
      }

      // Add course to user's enrolled courses if not already there
      if (!user.enrolledCourses.includes(course._id)) {
        user.enrolledCourses.push(course._id);
      }

      syncedCourses.push({
        _id: course._id,
        title: course.title,
        shortName: course.shortName,
        moodleCourseId: course.moodleCourseId
      });
    }

    await user.save();

    res.json({
      success: true,
      message: `Synced ${syncedCourses.length} courses from Moodle`,
      courses: syncedCourses
    });
  } catch (error) {
    console.error('Sync courses error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync courses'
    });
  }
};

// @desc    Sync course content from Moodle
// @route   POST /api/moodle/sync/course/:courseId/content
// @access  Private
exports.syncCourseContent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(400).json({
        success: false,
        error: 'Please connect your Moodle account first'
      });
    }

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Create Moodle service with user's token
    const moodleService = new MoodleService();
    moodleService.setUserToken(user.moodleToken);

    // Get course content from Moodle
    const contents = await moodleService.getCourseContents(course.moodleCourseId);

    // Map Moodle sections to our schema
    course.sections = contents.map((section, index) => ({
      moodleSectionId: section.id?.toString(),
      name: section.name,
      summary: section.summary || '',
      sequence: index,
      visible: section.visible !== 0,
      modules: (section.modules || []).map(mod => ({
        moodleModuleId: mod.id?.toString(),
        name: mod.name,
        modname: mod.modname,
        url: mod.url || '',
        visible: mod.visible !== 0
      }))
    }));

    course.lastSyncedAt = new Date();
    await course.save();

    res.json({
      success: true,
      message: 'Course content synced successfully',
      sections: course.sections
    });
  } catch (error) {
    console.error('Sync course content error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync course content'
    });
  }
};

// @desc    Get grades from Moodle
// @route   GET /api/moodle/grades/:courseId
// @access  Private
exports.getCourseGrades = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(400).json({
        success: false,
        error: 'Please connect your Moodle account first'
      });
    }

    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Create Moodle service with user's token
    const moodleService = new MoodleService();
    moodleService.setUserToken(user.moodleToken);

    // Get grades from Moodle
    const grades = await moodleService.getCourseGrades(
      course.moodleCourseId,
      user.moodleUserId
    );

    res.json({
      success: true,
      grades
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get grades'
    });
  }
};

// @desc    Get Moodle connection status
// @route   GET /api/moodle/status
// @access  Private
exports.getMoodleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.moodleConnected) {
      return res.json({
        success: true,
        connected: false
      });
    }

    // Try to get site info to verify connection is still valid
    const moodleService = new MoodleService();
    moodleService.setUserToken(user.moodleToken);

    try {
      const siteInfo = await moodleService.getSiteInfo();
      return res.json({
        success: true,
        connected: true,
        moodleUser: {
          id: siteInfo.userid,
          username: siteInfo.username,
          fullname: siteInfo.fullname,
          sitename: siteInfo.sitename
        }
      });
    } catch (moodleError) {
      // Token might be expired
      return res.json({
        success: true,
        connected: false,
        error: 'Moodle token expired. Please reconnect.'
      });
    }
  } catch (error) {
    console.error('Get Moodle status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get upcoming assignments from Moodle
// @route   GET /api/moodle/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.moodleConnected || !user.moodleToken) {
      return res.status(400).json({
        success: false,
        error: 'Please connect your Moodle account first'
      });
    }

    // Get user's course IDs
    const courses = await Course.find({
      'enrolledUsers.user': user._id
    }).select('moodleCourseId');

    if (courses.length === 0) {
      return res.json({
        success: true,
        assignments: []
      });
    }

    const moodleService = new MoodleService();
    moodleService.setUserToken(user.moodleToken);

    const courseIds = courses.map(c => c.moodleCourseId);
    const assignments = await moodleService.getAssignments(courseIds);

    res.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get assignments'
    });
  }
};

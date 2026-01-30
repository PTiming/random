const express = require('express');
const router = express.Router();
const axios = require('axios');
const MoodleData = require('../models/MoodleData');
const User = require('../models/User');
const auth = require('../middleware/auth');

const MOODLE_URL = process.env.MOODLE_URL || 'https://your-moodle-site.com';
const MOODLE_TOKEN = process.env.MOODLE_TOKEN || 'your_moodle_token_here';

// Helper function to call Moodle Web Services
async function callMoodleAPI(functionName, params = {}) {
  try {
    const response = await axios.get(`${MOODLE_URL}/webservice/rest/server.php`, {
      params: {
        wstoken: MOODLE_TOKEN,
        wsfunction: functionName,
        moodlewsrestformat: 'json',
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error('Moodle API Error:', error.message);
    throw new Error('Failed to connect to Moodle');
  }
}

// Link Moodle account
router.post('/link-account', auth, async (req, res) => {
  try {
    const { moodleUserId } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { moodleUserId },
      { new: true }
    ).select('-password');
    
    res.json({ message: 'Moodle account linked successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's Moodle courses
router.get('/courses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.moodleUserId) {
      return res.status(400).json({ message: 'Moodle account not linked' });
    }

    // Call Moodle API to get enrolled courses
    const courses = await callMoodleAPI('core_enrol_get_users_courses', {
      userid: user.moodleUserId
    });
    
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get course details
router.get('/courses/:courseId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.moodleUserId) {
      return res.status(400).json({ message: 'Moodle account not linked' });
    }

    // Call Moodle API to get course contents
    const courseContents = await callMoodleAPI('core_course_get_contents', {
      courseid: req.params.courseId
    });
    
    res.json(courseContents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get user's grades from Moodle
router.get('/grades/:courseId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.moodleUserId) {
      return res.status(400).json({ message: 'Moodle account not linked' });
    }

    // Call Moodle API to get grades
    const grades = await callMoodleAPI('gradereport_user_get_grade_items', {
      courseid: req.params.courseId,
      userid: user.moodleUserId
    });
    
    res.json(grades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get assignments
router.get('/assignments/:courseId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.moodleUserId) {
      return res.status(400).json({ message: 'Moodle account not linked' });
    }

    // Call Moodle API to get assignments
    const assignments = await callMoodleAPI('mod_assign_get_assignments', {
      courseids: [req.params.courseId]
    });
    
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Sync Moodle data to database
router.post('/sync/:courseId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.moodleUserId) {
      return res.status(400).json({ message: 'Moodle account not linked' });
    }

    const courseId = req.params.courseId;

    // Get course info
    const courses = await callMoodleAPI('core_enrol_get_users_courses', {
      userid: user.moodleUserId
    });
    const course = courses.find(c => c.id.toString() === courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get grades
    let grades = [];
    try {
      const gradeData = await callMoodleAPI('gradereport_user_get_grade_items', {
        courseid: courseId,
        userid: user.moodleUserId
      });
      if (gradeData.usergrades && gradeData.usergrades[0]) {
        grades = gradeData.usergrades[0].gradeitems.map(item => ({
          activityName: item.itemname,
          grade: item.graderaw,
          maxGrade: item.grademax,
          date: new Date(item.gradedategraded * 1000)
        }));
      }
    } catch (err) {
      console.error('Error fetching grades:', err.message);
    }

    // Get assignments
    let assignments = [];
    try {
      const assignData = await callMoodleAPI('mod_assign_get_assignments', {
        courseids: [courseId]
      });
      if (assignData.courses && assignData.courses[0]) {
        assignments = assignData.courses[0].assignments.map(assign => ({
          id: assign.id,
          name: assign.name,
          dueDate: new Date(assign.duedate * 1000),
          status: 'pending'
        }));
      }
    } catch (err) {
      console.error('Error fetching assignments:', err.message);
    }

    // Save to database
    const moodleData = await MoodleData.findOneAndUpdate(
      { user: req.userId, courseId },
      {
        user: req.userId,
        courseId,
        courseName: course.fullname || course.shortname,
        enrollmentData: course,
        grades,
        assignments,
        lastSync: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Data synced successfully', data: moodleData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get synced Moodle data from database
router.get('/data/:courseId', auth, async (req, res) => {
  try {
    const moodleData = await MoodleData.findOne({
      user: req.userId,
      courseId: req.params.courseId
    });
    
    if (!moodleData) {
      return res.status(404).json({ message: 'No synced data found. Please sync first.' });
    }
    
    res.json(moodleData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all synced Moodle data for user
router.get('/data', auth, async (req, res) => {
  try {
    const moodleData = await MoodleData.find({ user: req.userId })
      .sort({ lastSync: -1 });
    
    res.json(moodleData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send data to Moodle (create forum post)
router.post('/send-forum-post', auth, async (req, res) => {
  try {
    const { forumId, subject, message } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user.moodleUserId) {
      return res.status(400).json({ message: 'Moodle account not linked' });
    }

    // Send forum post to Moodle
    const result = await callMoodleAPI('mod_forum_add_discussion', {
      forumid: forumId,
      subject,
      message,
      options: JSON.stringify([{ name: 'discussionsubscribe', value: true }])
    });
    
    res.json({ message: 'Forum post sent to Moodle', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;

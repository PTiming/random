const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Mock Moodle data - In production, this would call the actual Moodle API
const mockCourses = [
  {
    id: '1',
    moodleId: 'CS101',
    name: 'Introduction to Computer Science',
    shortName: 'CS101',
    instructor: 'Dr. Smith',
    enrolled: 45,
    progress: 75
  },
  {
    id: '2',
    moodleId: 'MATH201',
    name: 'Calculus II',
    shortName: 'MATH201',
    instructor: 'Prof. Johnson',
    enrolled: 32,
    progress: 60
  }
];

// @route   GET /api/moodle/courses
// @desc    Get user's Moodle courses
// @access  Private
router.get('/courses', protect, async (req, res) => {
  try {
    // In production: Call Moodle Web Service
    // const moodleToken = req.user.moodleToken;
    // const response = await axios.get(`${MOODLE_URL}/webservice/rest/server.php`, {
    //   params: {
    //     wstoken: moodleToken,
    //     wsfunction: 'core_enrol_get_users_courses',
    //     moodlewsrestformat: 'json',
    //     userid: req.user.moodleUserId
    //   }
    // });
    
    res.json(mockCourses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses from Moodle' });
  }
});

// @route   GET /api/moodle/courses/:courseId/assignments
// @desc    Get assignments for a course
// @access  Private
router.get('/courses/:courseId/assignments', protect, async (req, res) => {
  try {
    const mockAssignments = [
      {
        id: 'a1',
        title: 'Lab 1: Hello World',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        status: 'submitted',
        grade: 95
      },
      {
        id: 'a2',
        title: 'Lab 2: Variables',
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        status: 'pending',
        grade: null
      }
    ];
    
    res.json(mockAssignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments' });
  }
});

// @route   GET /api/moodle/courses/:courseId/grades
// @desc    Get grades for a course
// @access  Private
router.get('/courses/:courseId/grades', protect, async (req, res) => {
  try {
    const mockGrades = {
      current: 92,
      assignments: 95,
      quizzes: 88,
      participation: 100
    };
    
    res.json(mockGrades);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching grades' });
  }
});

// @route   POST /api/moodle/sync
// @desc    Sync data with Moodle (two-way)
// @access  Private
router.post('/sync', protect, async (req, res) => {
  try {
    // In production, this would:
    // 1. Fetch latest data from Moodle
    // 2. Update local database
    // 3. Push any local changes to Moodle
    
    const syncResult = {
      success: true,
      coursesUpdated: 4,
      gradesUpdated: 12,
      assignmentsUpdated: 8,
      syncedAt: new Date().toISOString()
    };
    
    res.json(syncResult);
  } catch (error) {
    res.status(500).json({ message: 'Error syncing with Moodle' });
  }
});

// @route   POST /api/moodle/submit-assignment
// @desc    Submit assignment to Moodle
// @access  Private
router.post('/submit-assignment', protect, async (req, res) => {
  try {
    const { assignmentId, submission } = req.body;
    
    // In production: Call Moodle's mod_assign_save_submission
    // const response = await axios.post(`${MOODLE_URL}/webservice/rest/server.php`, null, {
    //   params: {
    //     wstoken: req.user.moodleToken,
    //     wsfunction: 'mod_assign_save_submission',
    //     moodlewsrestformat: 'json',
    //     assignmentid: assignmentId,
    //     ...submission
    //   }
    // });
    
    res.json({ 
      success: true, 
      message: 'Assignment submitted successfully',
      submittedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting assignment' });
  }
});

// @route   POST /api/moodle/post-to-forum
// @desc    Post to Moodle forum (two-way sync)
// @access  Private
router.post('/post-to-forum', protect, async (req, res) => {
  try {
    const { forumId, subject, message } = req.body;
    
    // In production: Call Moodle's mod_forum_add_discussion
    
    res.json({ 
      success: true, 
      message: 'Posted to forum successfully',
      postId: Date.now().toString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error posting to forum' });
  }
});

// @route   GET /api/moodle/auth/url
// @desc    Get Moodle OAuth URL
// @access  Public
router.get('/auth/url', (req, res) => {
  const moodleUrl = process.env.MOODLE_URL || 'https://moodle.example.com';
  const clientId = process.env.MOODLE_CLIENT_ID || 'your-client-id';
  const redirectUri = process.env.MOODLE_REDIRECT_URI || 'http://localhost:5173/moodle/callback';
  
  const authUrl = `${moodleUrl}/admin/oauth2callback.php?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=user_info`;
  
  res.json({ authUrl });
});

// @route   POST /api/moodle/auth/callback
// @desc    Handle Moodle OAuth callback
// @access  Private
router.post('/auth/callback', protect, async (req, res) => {
  try {
    const { code } = req.body;
    
    // In production: Exchange code for token
    // const tokenResponse = await axios.post(`${MOODLE_URL}/login/token.php`, {
    //   grant_type: 'authorization_code',
    //   code,
    //   client_id: process.env.MOODLE_CLIENT_ID,
    //   client_secret: process.env.MOODLE_CLIENT_SECRET,
    //   redirect_uri: process.env.MOODLE_REDIRECT_URI
    // });
    
    // Update user with Moodle token
    req.user.moodleLinked = true;
    await req.user.save();
    
    res.json({ 
      success: true, 
      message: 'Moodle account linked successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error linking Moodle account' });
  }
});

// @route   DELETE /api/moodle/auth/unlink
// @desc    Unlink Moodle account
// @access  Private
router.delete('/auth/unlink', protect, async (req, res) => {
  try {
    req.user.moodleLinked = false;
    req.user.moodleToken = null;
    req.user.moodleUserId = null;
    await req.user.save();
    
    res.json({ 
      success: true, 
      message: 'Moodle account unlinked' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error unlinking Moodle account' });
  }
});

module.exports = router;

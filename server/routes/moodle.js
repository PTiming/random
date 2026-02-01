const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth } = require('../middleware/auth');

const MOODLE_URL = process.env.MOODLE_URL || 'https://your-moodle-instance.com';
const MOODLE_TOKEN = process.env.MOODLE_TOKEN || 'your_moodle_token';

// Get Moodle courses
router.get('/courses', auth, async (req, res) => {
  try {
    const response = await axios.get(`${MOODLE_URL}/webservice/rest/server.php`, {
      params: {
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_course_get_courses',
        moodlewsrestformat: 'json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching Moodle courses', 
      error: error.message 
    });
  }
});

// Get Moodle user info
router.get('/user/:userid', auth, async (req, res) => {
  try {
    const response = await axios.get(`${MOODLE_URL}/webservice/rest/server.php`, {
      params: {
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_user_get_users_by_field',
        field: 'id',
        'values[0]': req.params.userid,
        moodlewsrestformat: 'json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching Moodle user', 
      error: error.message 
    });
  }
});

// Sync course with Moodle
router.post('/sync/course/:id', auth, async (req, res) => {
  try {
    const { moodleCourseId } = req.body;
    
    const response = await axios.get(`${MOODLE_URL}/webservice/rest/server.php`, {
      params: {
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_course_get_courses',
        'options[ids][0]': moodleCourseId,
        moodlewsrestformat: 'json'
      }
    });
    
    res.json({ 
      message: 'Course synced with Moodle', 
      data: response.data 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error syncing with Moodle', 
      error: error.message 
    });
  }
});

module.exports = router;

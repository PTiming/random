const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// @route   GET /api/moodle/courses
// @desc    Get courses from Moodle
// @access  Private
router.get('/courses', auth, async (req, res) => {
  try {
    const moodleUrl = process.env.MOODLE_URL;
    const token = process.env.MOODLE_TOKEN;

    if (!moodleUrl || !token) {
      return res.status(500).json({ msg: 'Moodle configuration not found' });
    }

    const response = await axios.get(`${moodleUrl}/webservice/rest/server.php`, {
      params: {
        wstoken: token,
        wsfunction: 'core_course_get_courses',
        moodlewsrestformat: 'json'
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error fetching Moodle courses', error: err.message });
  }
});

// @route   GET /api/moodle/user/:userId
// @desc    Get user info from Moodle
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const moodleUrl = process.env.MOODLE_URL;
    const token = process.env.MOODLE_TOKEN;

    if (!moodleUrl || !token) {
      return res.status(500).json({ msg: 'Moodle configuration not found' });
    }

    const response = await axios.get(`${moodleUrl}/webservice/rest/server.php`, {
      params: {
        wstoken: token,
        wsfunction: 'core_user_get_users_by_field',
        moodlewsrestformat: 'json',
        field: 'id',
        'values[0]': req.params.userId
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error fetching Moodle user', error: err.message });
  }
});

// @route   GET /api/moodle/assignments/:courseId
// @desc    Get assignments from Moodle course
// @access  Private
router.get('/assignments/:courseId', auth, async (req, res) => {
  try {
    const moodleUrl = process.env.MOODLE_URL;
    const token = process.env.MOODLE_TOKEN;

    if (!moodleUrl || !token) {
      return res.status(500).json({ msg: 'Moodle configuration not found' });
    }

    const response = await axios.get(`${moodleUrl}/webservice/rest/server.php`, {
      params: {
        wstoken: token,
        wsfunction: 'mod_assign_get_assignments',
        moodlewsrestformat: 'json',
        'courseids[0]': req.params.courseId
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error fetching Moodle assignments', error: err.message });
  }
});

module.exports = router;

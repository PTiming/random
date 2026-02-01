import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './Courses.css';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/user/enrolled');
      setCourses(res.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCourses = async () => {
    if (!user?.moodleConnected) {
      setError('Please connect your Moodle account first');
      return;
    }

    setSyncing(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/moodle/sync/courses');
      setSuccess(res.data.message);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sync courses');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-dark"></div>
      </div>
    );
  }

  return (
    <div className="page-container-wide">
      <div className="courses-header">
        <div>
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">View and manage your enrolled courses</p>
        </div>
        <div className="courses-actions">
          {!user?.moodleConnected ? (
            <Link to="/moodle/connect" className="btn btn-primary">
              🔗 Connect Moodle
            </Link>
          ) : (
            <button
              onClick={handleSyncCourses}
              className="btn btn-primary"
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <span className="spinner"></span> Syncing...
                </>
              ) : (
                '🔄 Sync Courses'
              )}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {courses.length > 0 ? (
        <div className="courses-grid">
          {courses.map(course => (
            <Link
              to={`/courses/${course._id}`}
              key={course._id}
              className="course-card card"
            >
              <div className="course-image">
                {course.image ? (
                  <img src={course.image} alt={course.title} />
                ) : (
                  <div className="course-image-placeholder">📚</div>
                )}
              </div>
              <div className="course-info">
                <h3 className="course-title">{course.title}</h3>
                {course.shortName && (
                  <span className="course-code">{course.shortName}</span>
                )}
                <p className="course-description">
                  {course.description?.substring(0, 100) || 'No description available'}
                  {course.description?.length > 100 && '...'}
                </p>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{course.progress || 0}% Complete</span>
                </div>
                {course.grade !== null && course.grade !== undefined && (
                  <div className="course-grade">
                    Grade: <strong>{course.grade}%</strong>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <div className="empty-state-icon">📖</div>
          <h3 className="empty-state-title">No courses yet</h3>
          <p>
            {user?.moodleConnected 
              ? 'Sync your courses from Moodle to get started.'
              : 'Connect your Moodle account to see your enrolled courses.'}
          </p>
          {!user?.moodleConnected && (
            <Link to="/moodle/connect" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Connect Moodle
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Courses;

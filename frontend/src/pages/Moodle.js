import React, { useState, useEffect } from 'react';
import { moodleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiBook, FiCalendar, FiAward, FiUsers, FiLink, FiUnlink, FiBell, FiChevronRight } from 'react-icons/fi';
import './Moodle.css';

const Moodle = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Connection form
  const [connectionForm, setConnectionForm] = useState({
    moodleUrl: '',
    username: '',
    password: ''
  });

  // Data states
  const [moodleStatus, setMoodleStatus] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (user?.moodleConnected) {
      checkMoodleStatus();
    }
  }, [user?.moodleConnected]);

  useEffect(() => {
    if (moodleStatus?.connected) {
      fetchTabData();
    }
  }, [activeTab, moodleStatus?.connected]);

  const checkMoodleStatus = async () => {
    try {
      const response = await moodleAPI.getStatus();
      setMoodleStatus(response.data);
    } catch (err) {
      console.error('Error checking Moodle status:', err);
    }
  };

  const fetchTabData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeTab) {
        case 'courses':
          const coursesRes = await moodleAPI.getCourses();
          setCourses(coursesRes.data.courses || []);
          break;
        case 'assignments':
          const assignmentsRes = await moodleAPI.getAssignments();
          setAssignments(assignmentsRes.data.assignments?.courses || []);
          break;
        case 'grades':
          const gradesRes = await moodleAPI.getGrades();
          setGrades(gradesRes.data.grades?.grades || []);
          break;
        case 'calendar':
          const eventsRes = await moodleAPI.getCalendarEvents();
          setEvents(eventsRes.data.events?.events || []);
          break;
        default:
          break;
      }
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await moodleAPI.connect(connectionForm);
      setMoodleStatus({ connected: true, ...response.data.moodleInfo });
      updateUser({ moodleConnected: true });
      setSuccess('Successfully connected to Moodle!');
      setConnectionForm({ moodleUrl: '', username: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to Moodle');
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Moodle account?')) return;

    try {
      await moodleAPI.disconnect();
      setMoodleStatus(null);
      updateUser({ moodleConnected: false });
      setCourses([]);
      setAssignments([]);
      setGrades([]);
      setEvents([]);
      setSuccess('Moodle account disconnected');
    } catch (err) {
      setError('Failed to disconnect Moodle account');
    }
  };

  const renderConnectionForm = () => (
    <div className="moodle-connect">
      <div className="connect-icon">📚</div>
      <h2>Connect to Moodle</h2>
      <p>Link your Moodle account to sync courses, assignments, and grades with your social feed.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleConnect} className="connect-form">
        <div className="form-group">
          <label className="form-label">Moodle URL</label>
          <input
            type="url"
            className="form-input"
            placeholder="https://moodle.yourschool.edu"
            value={connectionForm.moodleUrl}
            onChange={(e) => setConnectionForm({ ...connectionForm, moodleUrl: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-input"
            placeholder="Your Moodle username"
            value={connectionForm.username}
            onChange={(e) => setConnectionForm({ ...connectionForm, username: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="Your Moodle password"
            value={connectionForm.password}
            onChange={(e) => setConnectionForm({ ...connectionForm, password: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Connecting...' : 'Connect to Moodle'}
        </button>
      </form>
    </div>
  );

  const renderConnectedView = () => (
    <div className="moodle-dashboard">
      {/* Status Header */}
      <div className="moodle-header">
        <div className="moodle-info">
          <FiBook className="moodle-icon" />
          <div>
            <h2>Moodle Connected</h2>
            <p>{moodleStatus?.siteName || 'Connected to Moodle LMS'}</p>
            {moodleStatus?.username && <span className="moodle-user">@{moodleStatus.username}</span>}
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handleDisconnect}>
          <FiUnlink /> Disconnect
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <FiBook /> Courses
        </button>
        <button
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <FiCalendar /> Assignments
        </button>
        <button
          className={`tab ${activeTab === 'grades' ? 'active' : ''}`}
          onClick={() => setActiveTab('grades')}
        >
          <FiAward /> Grades
        </button>
        <button
          className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <FiBell /> Upcoming
        </button>
      </div>

      {/* Content */}
      <div className="moodle-content">
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="courses-list">
                {courses.length > 0 ? (
                  courses.map(course => (
                    <div key={course.id} className="course-card">
                      <div className="course-info">
                        <h3>{course.fullname || course.shortname}</h3>
                        <p>{course.shortname}</p>
                        {course.summary && (
                          <div className="course-summary" dangerouslySetInnerHTML={{ __html: course.summary }} />
                        )}
                      </div>
                      <div className="course-actions">
                        <button className="btn btn-secondary btn-sm">
                          View <FiChevronRight />
                        </button>
                        <button className="btn btn-primary btn-sm">
                          Share to Feed
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No courses found</h3>
                    <p>You're not enrolled in any courses yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
              <div className="assignments-list">
                {assignments.length > 0 ? (
                  assignments.map(course => (
                    <div key={course.id} className="assignment-group">
                      <h3 className="group-title">{course.fullname}</h3>
                      {course.assignments?.map(assignment => (
                        <div key={assignment.id} className="assignment-card">
                          <div className="assignment-info">
                            <h4>{assignment.name}</h4>
                            {assignment.duedate && (
                              <p className="due-date">
                                Due: {new Date(assignment.duedate * 1000).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <button className="btn btn-secondary btn-sm">
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No assignments</h3>
                    <p>You don't have any pending assignments.</p>
                  </div>
                )}
              </div>
            )}

            {/* Grades Tab */}
            {activeTab === 'grades' && (
              <div className="grades-list">
                {grades.length > 0 ? (
                  grades.map((grade, index) => (
                    <div key={index} className="grade-card">
                      <div className="grade-info">
                        <h4>{grade.itemname || 'Grade Item'}</h4>
                        <p>{grade.coursename}</p>
                      </div>
                      <div className="grade-score">
                        <span className="score">{grade.grade || '-'}</span>
                        {grade.grademax && <span className="max">/ {grade.grademax}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No grades yet</h3>
                    <p>Your grades will appear here once available.</p>
                  </div>
                )}
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="events-list">
                {events.length > 0 ? (
                  events.map(event => (
                    <div key={event.id} className="event-card">
                      <div className="event-date">
                        <span className="day">{new Date(event.timestart * 1000).getDate()}</span>
                        <span className="month">{new Date(event.timestart * 1000).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div className="event-info">
                        <h4>{event.name}</h4>
                        <p>{event.coursename || 'General'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No upcoming events</h3>
                    <p>You're all caught up!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="moodle-page">
      {moodleStatus?.connected ? renderConnectedView() : renderConnectionForm()}
    </div>
  );
};

export default Moodle;

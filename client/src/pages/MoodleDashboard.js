import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { moodleAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format, formatDistanceToNow, isBefore, addDays } from 'date-fns';
import { 
  FiBook, FiClipboard, FiAward, FiCalendar, FiRefreshCw,
  FiFile, FiClock, FiAlertTriangle, FiCheckCircle, FiExternalLink
} from 'react-icons/fi';
import './MoodleDashboard.css';

const MoodleDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const isConnected = user?.moodleId;

  useEffect(() => {
    if (isConnected) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isConnected]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesRes, assignmentsRes, gradesRes, calendarRes] = await Promise.all([
        moodleAPI.getCourses().catch(() => ({ data: { data: { courses: [] } } })),
        moodleAPI.getAssignments().catch(() => ({ data: { data: { assignments: [] } } })),
        moodleAPI.getGrades().catch(() => ({ data: { data: { grades: [] } } })),
        moodleAPI.getCalendar().catch(() => ({ data: { data: { events: [] } } }))
      ]);

      setCourses(coursesRes.data.data.courses || []);
      setAssignments(assignmentsRes.data.data.assignments || []);
      setGrades(gradesRes.data.data.grades || []);
      setCalendar(calendarRes.data.data.events || []);
    } catch (err) {
      setError('Failed to load Moodle data. Please try syncing again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await moodleAPI.sync();
      await fetchData();
    } catch (err) {
      setError('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const getDeadlineStatus = (dueDate) => {
    if (!dueDate) return 'none';
    const due = new Date(dueDate);
    const now = new Date();
    if (isBefore(due, now)) return 'overdue';
    if (isBefore(due, addDays(now, 1))) return 'urgent';
    if (isBefore(due, addDays(now, 3))) return 'soon';
    return 'normal';
  };

  const upcomingDeadlines = assignments
    .filter(a => a.dueDate && new Date(a.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  if (!isConnected) {
    return (
      <div className="moodle-page">
        <div className="moodle-connect-card card">
          <div className="connect-icon">📚</div>
          <h2>Connect Your Moodle Account</h2>
          <p>
            Link your Moodle account to view courses, assignments, grades, and sync
            deadlines directly to your feed.
          </p>
          <Link to="/settings" className="btn btn-primary btn-lg">
            <FiExternalLink /> Connect Moodle
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="moodle-page">
      <div className="moodle-header">
        <div>
          <h1>Moodle Dashboard</h1>
          <p className="text-muted">
            Last synced: {user?.lastMoodleSync 
              ? formatDistanceToNow(new Date(user.lastMoodleSync), { addSuffix: true })
              : 'Never'}
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleSync}
          disabled={syncing}
        >
          <FiRefreshCw className={syncing ? 'spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <FiAlertTriangle /> {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="moodle-stats">
        <div className="stat-card">
          <FiBook className="stat-icon" />
          <div>
            <span className="stat-value">{courses.length}</span>
            <span className="stat-label">Courses</span>
          </div>
        </div>
        <div className="stat-card">
          <FiClipboard className="stat-icon" />
          <div>
            <span className="stat-value">{assignments.length}</span>
            <span className="stat-label">Assignments</span>
          </div>
        </div>
        <div className="stat-card urgent">
          <FiClock className="stat-icon" />
          <div>
            <span className="stat-value">
              {upcomingDeadlines.filter(a => getDeadlineStatus(a.dueDate) === 'urgent').length}
            </span>
            <span className="stat-label">Due Soon</span>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="card deadlines-card">
          <h3><FiClock /> Upcoming Deadlines</h3>
          <div className="deadlines-list">
            {upcomingDeadlines.map(assignment => {
              const status = getDeadlineStatus(assignment.dueDate);
              return (
                <div key={assignment.id} className={`deadline-item ${status}`}>
                  <div className="deadline-info">
                    <span className="deadline-course">{assignment.courseName}</span>
                    <span className="deadline-name">{assignment.name}</span>
                  </div>
                  <div className="deadline-date">
                    {status === 'urgent' && <FiAlertTriangle />}
                    {format(new Date(assignment.dueDate), 'MMM d, h:mm a')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="moodle-tabs">
        {[
          { key: 'courses', icon: FiBook, label: 'Courses' },
          { key: 'assignments', icon: FiClipboard, label: 'Assignments' },
          { key: 'grades', icon: FiAward, label: 'Grades' },
          { key: 'calendar', icon: FiCalendar, label: 'Calendar' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="moodle-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading Moodle data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'courses' && (
              <div className="courses-grid">
                {courses.length === 0 ? (
                  <div className="empty-state">
                    <p>No courses found</p>
                  </div>
                ) : (
                  courses.map(course => (
                    <div key={course.id} className="course-card card">
                      <div className="course-header">
                        {course.courseimage ? (
                          <img src={course.courseimage} alt="" className="course-image" />
                        ) : (
                          <div className="course-image-placeholder">
                            <FiBook />
                          </div>
                        )}
                      </div>
                      <div className="course-body">
                        <h4>{course.fullname || course.shortname}</h4>
                        <p className="course-code">{course.shortname}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="assignments-list">
                {assignments.length === 0 ? (
                  <div className="empty-state">
                    <p>No assignments found</p>
                  </div>
                ) : (
                  assignments.map(assignment => {
                    const status = getDeadlineStatus(assignment.dueDate);
                    return (
                      <div key={assignment.id} className={`assignment-card card ${status}`}>
                        <div className="assignment-icon">
                          <FiFile />
                        </div>
                        <div className="assignment-info">
                          <h4>{assignment.name}</h4>
                          <p className="course-name">{assignment.courseName}</p>
                          {assignment.dueDate && (
                            <p className={`due-date ${status}`}>
                              {status === 'overdue' && <FiAlertTriangle />}
                              Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy h:mm a')}
                            </p>
                          )}
                        </div>
                        {assignment.maxGrade && (
                          <div className="assignment-grade">
                            <span className="max-grade">{assignment.maxGrade} pts</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'grades' && (
              <div className="grades-list">
                {grades.length === 0 ? (
                  <div className="empty-state">
                    <p>No grades available</p>
                  </div>
                ) : (
                  grades.map(courseGrade => (
                    <div key={courseGrade.courseId} className="grade-course card">
                      <div className="grade-course-header">
                        <h4>{courseGrade.courseName}</h4>
                        {courseGrade.courseTotal && (
                          <span className="course-total">
                            {courseGrade.courseTotal} / {courseGrade.courseTotalMax}
                          </span>
                        )}
                      </div>
                      <div className="grade-items">
                        {courseGrade.items?.map(item => (
                          <div key={item.id} className="grade-item">
                            <span className="item-name">{item.name}</span>
                            <span className="item-grade">
                              {item.grade !== null 
                                ? `${item.grade} / ${item.maxGrade}`
                                : '-'
                              }
                              {item.percentage && (
                                <span className="item-percentage">({item.percentage})</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="calendar-list">
                {calendar.length === 0 ? (
                  <div className="empty-state">
                    <p>No upcoming events</p>
                  </div>
                ) : (
                  calendar.map(event => (
                    <div key={event.id} className="calendar-event card">
                      <div className="event-date">
                        <span className="event-day">{format(new Date(event.timeStart), 'd')}</span>
                        <span className="event-month">{format(new Date(event.timeStart), 'MMM')}</span>
                      </div>
                      <div className="event-info">
                        <h4>{event.name}</h4>
                        <p className="event-type">{event.eventType}</p>
                        <p className="event-time">
                          {format(new Date(event.timeStart), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MoodleDashboard;

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { coursesAPI, gradesAPI, usersAPI } from '../services/api';

export function Dashboard() {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const { isConnected, lastSync } = useSocket();
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (isAdmin()) {
        // Admin dashboard data
        const usersRes = await usersAPI.getAll({ limit: 1 });
        const coursesRes = await coursesAPI.getAll({ limit: 1 });
        setStats({
          totalUsers: usersRes.data.data.pagination.total,
          totalCourses: coursesRes.data.data.pagination.total
        });
      } else if (isTeacher()) {
        // Teacher dashboard data
        const coursesRes = await coursesAPI.getTeacherCourses({ limit: 100 });
        const courses = coursesRes.data.data.courses;
        const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0);
        setStats({
          totalCourses: courses.length,
          totalStudents,
          publishedCourses: courses.filter(c => c.isPublished).length
        });
        setRecentActivity(courses.slice(0, 5));
      } else if (isStudent()) {
        // Student dashboard data
        const enrolledRes = await coursesAPI.getEnrolledCourses();
        const gradesRes = await gradesAPI.getMyGrades();
        setStats({
          enrolledCourses: enrolledRes.data.data.enrolledCourses?.length || 0,
          averageGrade: gradesRes.data.data.stats?.averagePercentage?.toFixed(1) || 'N/A',
          totalGrades: gradesRes.data.data.stats?.totalGrades || 0
        });
        setRecentActivity(enrolledRes.data.data.enrolledCourses?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="main-content">Loading dashboard...</div>;
  }

  return (
    <div className="main-content">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p style={{ color: '#64748b' }}>
          {isAdmin() && 'Administrator Dashboard'}
          {isTeacher() && 'Teacher Dashboard'}
          {isStudent() && 'Student Dashboard'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {isAdmin() && (
          <>
            <div className="stat-card">
              <div className="stat-value">{stats.totalUsers || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalCourses || 0}</div>
              <div className="stat-label">Total Courses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                <span className={`sync-indicator ${isConnected ? 'connected' : 'disconnected'}`} style={{ display: 'inline-block', marginRight: '8px' }} />
                {isConnected ? 'Online' : 'Offline'}
              </div>
              <div className="stat-label">System Status</div>
            </div>
          </>
        )}

        {isTeacher() && (
          <>
            <div className="stat-card">
              <div className="stat-value">{stats.totalCourses || 0}</div>
              <div className="stat-label">My Courses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.publishedCourses || 0}</div>
              <div className="stat-label">Published</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalStudents || 0}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </>
        )}

        {isStudent() && (
          <>
            <div className="stat-card">
              <div className="stat-value">{stats.enrolledCourses || 0}</div>
              <div className="stat-label">Enrolled Courses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.averageGrade}%</div>
              <div className="stat-label">Average Grade</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalGrades || 0}</div>
              <div className="stat-label">Graded Items</div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="card-title">Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {isAdmin() && (
            <>
              <a href="/admin/users" className="btn btn-primary">Manage Users</a>
              <a href="/courses" className="btn btn-secondary">View Courses</a>
            </>
          )}
          {isTeacher() && (
            <>
              <a href="/courses/create" className="btn btn-primary">Create Course</a>
              <a href="/courses/manage" className="btn btn-secondary">Manage Courses</a>
            </>
          )}
          {isStudent() && (
            <>
              <a href="/courses" className="btn btn-primary">Browse Courses</a>
              <a href="/grades" className="btn btn-secondary">View Grades</a>
            </>
          )}
        </div>
      </div>

      {/* Sync Status */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h2 className="card-title">Real-time Sync Status</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className={`sync-indicator ${isConnected ? 'connected' : 'disconnected'}`} style={{ width: '12px', height: '12px' }} />
          <span>{isConnected ? 'Connected - Two-way sync active' : 'Disconnected - Reconnecting...'}</span>
        </div>
        {lastSync && (
          <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
            Last synced: {lastSync.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

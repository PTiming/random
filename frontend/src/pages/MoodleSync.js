import React, { useState, useEffect } from 'react';
import { moodleAPI, courseAPI } from '../services/api';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#333'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '1.5rem'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statusCard: {
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  connected: {
    backgroundColor: '#e8f5e9',
    border: '1px solid #4caf50'
  },
  disconnected: {
    backgroundColor: '#ffebee',
    border: '1px solid #f44336'
  },
  button: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginRight: '0.5rem',
    marginBottom: '0.5rem'
  },
  primaryBtn: {
    backgroundColor: '#1a73e8',
    color: 'white'
  },
  secondaryBtn: {
    backgroundColor: '#f5f5f5',
    color: '#333'
  },
  successBtn: {
    backgroundColor: '#4caf50',
    color: 'white'
  },
  courseList: {
    maxHeight: '400px',
    overflowY: 'auto'
  },
  courseItem: {
    padding: '1rem',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  historyItem: {
    padding: '0.75rem',
    borderBottom: '1px solid #eee',
    fontSize: '0.9rem'
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    marginLeft: '0.5rem'
  },
  successBadge: { backgroundColor: '#4caf50', color: 'white' },
  failedBadge: { backgroundColor: '#f44336', color: 'white' },
  pendingBadge: { backgroundColor: '#ff9800', color: 'white' },
  moodleBadge: { backgroundColor: '#f90', color: 'white' },
  loading: {
    textAlign: 'center',
    padding: '1rem',
    color: '#666'
  }
};

function MoodleSync() {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [moodleCourses, setMoodleCourses] = useState([]);
  const [localCourses, setLocalCourses] = useState([]);
  const [syncHistory, setSyncHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkConnection();
    fetchData();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await moodleAPI.testConnection();
      setConnectionStatus({ connected: true, ...response.data.data });
    } catch (err) {
      setConnectionStatus({ connected: false, error: err.response?.data?.message || 'Connection failed' });
    }
  };

  const fetchData = async () => {
    try {
      const [moodleRes, localRes, historyRes] = await Promise.all([
        moodleAPI.getMoodleCourses().catch(() => ({ data: { data: [] } })),
        courseAPI.getCourses(),
        moodleAPI.getSyncHistory({ limit: 20 })
      ]);

      setMoodleCourses(moodleRes.data.data || []);
      setLocalCourses(localRes.data.data.courses || []);
      setSyncHistory(historyRes.data.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportCourse = async (moodleCourseId) => {
    try {
      setSyncing(true);
      await moodleAPI.importCourse(moodleCourseId);
      alert('Course imported successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Import failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncCourse = async (courseId) => {
    try {
      setSyncing(true);
      await courseAPI.syncWithMoodle(courseId, 'bidirectional');
      alert('Course synced successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleFullSync = async () => {
    try {
      setSyncing(true);
      await moodleAPI.fullSync();
      alert('Full sync completed!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Full sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return styles.successBadge;
      case 'failed': return styles.failedBadge;
      default: return styles.pendingBadge;
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading Moodle integration data...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔄 Moodle Integration</h1>

      {/* Connection Status */}
      <div style={{ ...styles.statusCard, ...(connectionStatus?.connected ? styles.connected : styles.disconnected) }}>
        <strong>{connectionStatus?.connected ? '✓ Connected to Moodle' : '✗ Not connected to Moodle'}</strong>
        {connectionStatus?.connected ? (
          <p style={{ marginTop: '0.5rem' }}>
            URL: {connectionStatus.moodleUrl} | Courses: {connectionStatus.coursesCount}
          </p>
        ) : (
          <p style={{ marginTop: '0.5rem' }}>{connectionStatus?.error}</p>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={checkConnection} 
          style={{ ...styles.button, ...styles.secondaryBtn }}
          disabled={syncing}
        >
          Test Connection
        </button>
        <button 
          onClick={handleFullSync} 
          style={{ ...styles.button, ...styles.successBtn }}
          disabled={syncing || !connectionStatus?.connected}
        >
          {syncing ? 'Syncing...' : 'Full Sync All Courses'}
        </button>
      </div>

      <div style={styles.grid}>
        {/* Moodle Courses */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.moodleBadge}>Moodle</span> Courses ({moodleCourses.length})
          </h2>
          <div style={styles.courseList}>
            {moodleCourses.length === 0 ? (
              <p style={{ color: '#666' }}>No Moodle courses available</p>
            ) : (
              moodleCourses.map(course => (
                <div key={course.id} style={styles.courseItem}>
                  <div>
                    <strong>{course.fullname}</strong>
                    <br />
                    <small style={{ color: '#666' }}>{course.shortname} | ID: {course.id}</small>
                  </div>
                  <button
                    onClick={() => handleImportCourse(course.id)}
                    style={{ ...styles.button, ...styles.primaryBtn }}
                    disabled={syncing}
                  >
                    Import
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Local Courses */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Local Courses ({localCourses.length})</h2>
          <div style={styles.courseList}>
            {localCourses.length === 0 ? (
              <p style={{ color: '#666' }}>No local courses yet</p>
            ) : (
              localCourses.map(course => (
                <div key={course._id} style={styles.courseItem}>
                  <div>
                    <strong>{course.title}</strong>
                    {course.syncedWithMoodle && (
                      <span style={{ ...styles.badge, ...styles.moodleBadge }}>Synced</span>
                    )}
                    <br />
                    <small style={{ color: '#666' }}>
                      {course.shortName} 
                      {course.moodleId && ` | Moodle ID: ${course.moodleId}`}
                    </small>
                  </div>
                  <button
                    onClick={() => handleSyncCourse(course._id)}
                    style={{ ...styles.button, ...styles.primaryBtn }}
                    disabled={syncing}
                  >
                    Sync
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sync History */}
        <div style={{ ...styles.section, gridColumn: 'span 2' }}>
          <h2 style={styles.sectionTitle}>Recent Sync History</h2>
          <div style={styles.courseList}>
            {syncHistory.length === 0 ? (
              <p style={{ color: '#666' }}>No sync history yet</p>
            ) : (
              syncHistory.map(log => (
                <div key={log._id} style={styles.historyItem}>
                  <span style={{ ...styles.badge, ...getStatusBadge(log.status) }}>
                    {log.status}
                  </span>
                  <strong style={{ marginLeft: '0.5rem' }}>{log.syncType}</strong>
                  <span style={{ marginLeft: '0.5rem', color: '#666' }}>
                    {log.direction} | {new Date(log.createdAt).toLocaleString()}
                  </span>
                  {log.errorMessage && (
                    <p style={{ color: '#f44336', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                      {log.errorMessage}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoodleSync;

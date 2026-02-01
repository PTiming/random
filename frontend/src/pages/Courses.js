import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    color: '#333'
  },
  createBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    textDecoration: 'none',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  cardHeader: {
    backgroundColor: '#1a73e8',
    color: 'white',
    padding: '1.5rem'
  },
  cardTitle: {
    fontSize: '1.25rem',
    marginBottom: '0.5rem'
  },
  cardShortName: {
    opacity: 0.9,
    fontSize: '0.9rem'
  },
  cardBody: {
    padding: '1.5rem'
  },
  cardDesc: {
    color: '#666',
    marginBottom: '1rem',
    lineHeight: '1.5'
  },
  cardMeta: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    color: '#888'
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    marginLeft: '0.5rem'
  },
  moodleBadge: {
    backgroundColor: '#f90',
    color: 'white'
  },
  publishedBadge: {
    backgroundColor: '#4caf50',
    color: 'white'
  },
  draftBadge: {
    backgroundColor: '#9e9e9e',
    color: 'white'
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  actionBtn: {
    flex: 1,
    padding: '0.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  enrollBtn: {
    backgroundColor: '#1a73e8',
    color: 'white'
  },
  viewBtn: {
    backgroundColor: '#f5f5f5',
    color: '#333'
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  }
};

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getCourses({ published: true });
      setCourses(response.data.data.courses);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      await courseAPI.enrollInCourse(courseId);
      alert('Successfully enrolled in course!');
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading courses...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Available Courses</h1>
        {isAuthenticated && (user?.role === 'instructor' || user?.role === 'admin') && (
          <Link to="/courses/new" style={styles.createBtn}>
            Create Course
          </Link>
        )}
      </div>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      {courses.length === 0 ? (
        <div style={styles.empty}>
          <h3>No courses available yet</h3>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Check back later for new courses.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {courses.map(course => (
            <div key={course._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  {course.title}
                  {course.syncedWithMoodle && (
                    <span style={{ ...styles.badge, ...styles.moodleBadge }}>Moodle</span>
                  )}
                </h3>
                <p style={styles.cardShortName}>{course.shortName}</p>
              </div>
              <div style={styles.cardBody}>
                <p style={styles.cardDesc}>
                  {course.description?.substring(0, 150) || 'No description available'}
                  {course.description?.length > 150 && '...'}
                </p>
                <div style={styles.cardMeta}>
                  <span>👤 {course.instructor?.firstName} {course.instructor?.lastName}</span>
                  <span>📚 {course.category}</span>
                </div>
                <div style={styles.cardMeta}>
                  <span>👥 {course.enrollmentCount || 0} enrolled</span>
                  <span style={{ ...styles.badge, ...(course.isPublished ? styles.publishedBadge : styles.draftBadge) }}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div style={styles.cardActions}>
                  <Link 
                    to={`/courses/${course._id}`} 
                    style={{ ...styles.actionBtn, ...styles.viewBtn, textDecoration: 'none', textAlign: 'center' }}
                  >
                    View Details
                  </Link>
                  {isAuthenticated && user?.role === 'student' && (
                    <button 
                      onClick={() => handleEnroll(course._id)} 
                      style={{ ...styles.actionBtn, ...styles.enrollBtn }}
                    >
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;

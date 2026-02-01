import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  },
  hero: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    marginBottom: '2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    color: '#333'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '2rem'
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem'
  },
  feature: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem'
  },
  featureTitle: {
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
    color: '#333'
  },
  featureDesc: {
    color: '#666',
    lineHeight: '1.6'
  },
  button: {
    display: 'inline-block',
    padding: '0.75rem 2rem',
    backgroundColor: '#1a73e8',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    marginTop: '1rem'
  },
  moodleBadge: {
    display: 'inline-block',
    backgroundColor: '#f90',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    marginLeft: '0.5rem'
  }
};

function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>
          MERN LMS 
          <span style={styles.moodleBadge}>+ Moodle</span>
        </h1>
        <p style={styles.subtitle}>
          A modern Learning Management System with two-way Moodle integration.
          Seamlessly sync courses, users, enrollments, and grades between systems.
        </p>
        {isAuthenticated ? (
          <div>
            <p style={{ marginBottom: '1rem', color: '#333' }}>
              Welcome back, {user?.firstName}!
            </p>
            <Link to="/courses" style={styles.button}>
              Browse Courses
            </Link>
          </div>
        ) : (
          <div>
            <Link to="/register" style={styles.button}>
              Get Started
            </Link>
            <Link to="/login" style={{ ...styles.button, backgroundColor: '#fff', color: '#1a73e8', border: '1px solid #1a73e8', marginLeft: '1rem' }}>
              Login
            </Link>
          </div>
        )}
      </div>

      <div style={styles.features}>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>📚</div>
          <h3 style={styles.featureTitle}>Course Management</h3>
          <p style={styles.featureDesc}>
            Create, manage, and organize courses with modules and activities. 
            Sync courses bi-directionally with Moodle.
          </p>
        </div>

        <div style={styles.feature}>
          <div style={styles.featureIcon}>👥</div>
          <h3 style={styles.featureTitle}>User Management</h3>
          <p style={styles.featureDesc}>
            Manage students, instructors, and admins. Automatic user sync 
            between MERN LMS and Moodle.
          </p>
        </div>

        <div style={styles.feature}>
          <div style={styles.featureIcon}>📝</div>
          <h3 style={styles.featureTitle}>Enrollment Sync</h3>
          <p style={styles.featureDesc}>
            Enroll users in courses and automatically sync enrollments 
            with Moodle in both directions.
          </p>
        </div>

        <div style={styles.feature}>
          <div style={styles.featureIcon}>📊</div>
          <h3 style={styles.featureTitle}>Grade Sync</h3>
          <p style={styles.featureDesc}>
            View and manage grades. Sync grades from Moodle to keep 
            student progress up to date.
          </p>
        </div>

        <div style={styles.feature}>
          <div style={styles.featureIcon}>🔄</div>
          <h3 style={styles.featureTitle}>Two-Way Data Sync</h3>
          <p style={styles.featureDesc}>
            Real-time webhook support for automatic sync when changes 
            occur in Moodle. Manual sync also available.
          </p>
        </div>

        <div style={styles.feature}>
          <div style={styles.featureIcon}>🔒</div>
          <h3 style={styles.featureTitle}>Secure Authentication</h3>
          <p style={styles.featureDesc}>
            JWT-based authentication with role-based access control 
            for students, instructors, and admins.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="home-authenticated">
        <div className="page-container">
          <div className="welcome-card card">
            <h2>Welcome back! 👋</h2>
            <p>Check out your feed or explore your courses.</p>
            <div className="welcome-actions">
              <Link to="/feed" className="btn btn-primary">
                Go to Feed
              </Link>
              <Link to="/courses" className="btn btn-secondary">
                My Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Connect, Learn, and Grow Together
          </h1>
          <p className="hero-subtitle">
            A social network integrated with Moodle for students and educators.
            Share knowledge, collaborate on courses, and build your learning community.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-illustration">
            <div className="illustration-card">📚 Learn</div>
            <div className="illustration-card">👥 Connect</div>
            <div className="illustration-card">🎓 Grow</div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Why SocialMoodle?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Moodle Integration</h3>
            <p>Connect your Moodle account to sync courses, grades, and assignments automatically.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Social Features</h3>
            <p>Post updates, comment, like, and follow classmates. Build your learning network.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Course Discussions</h3>
            <p>Discuss course materials, ask questions, and collaborate with your peers.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>View your course progress, grades, and upcoming assignments in one place.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of students and educators on SocialMoodle.</p>
        <Link to="/register" className="btn btn-success btn-lg">
          Create Free Account
        </Link>
      </div>
    </div>
  );
};

export default Home;

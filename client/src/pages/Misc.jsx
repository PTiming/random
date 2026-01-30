import { Link } from 'react-router-dom';

export function Unauthorized() {
  return (
    <div className="main-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Access Denied</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        You don't have permission to access this page.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="main-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  );
}

export function Home() {
  return (
    <div className="main-content">
      <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓 Learning Management System</h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2rem' }}>
          A modern LMS with Role-Based Access Control
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Login
          </Link>
          <Link to="/register" className="btn btn-outline" style={{ padding: '0.75rem 2rem' }}>
            Register
          </Link>
        </div>
        
        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '900px', margin: '4rem auto' }}>
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem' }}>👨‍💼 Admin</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Full system control, user management, and role assignments
            </p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem' }}>👩‍🏫 Teacher</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Create courses, manage content, and grade students
            </p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem' }}>👨‍🎓 Student</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Enroll in courses, submit assignments, and track grades
            </p>
          </div>
        </div>
        
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <h3 style={{ marginBottom: '1rem' }}>🔄 Two-Way Data Sync</h3>
          <p style={{ color: '#64748b' }}>
            Real-time synchronization using Socket.io ensures all users see updates instantly.
            Changes made by teachers are immediately reflected for students, and vice versa.
          </p>
        </div>
      </div>
    </div>
  );
}

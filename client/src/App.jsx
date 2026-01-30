import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import { Home, Unauthorized, NotFound } from './pages/Misc';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
        
        {/* Protected Routes - All Users */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Admin Only Routes */}
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        
        {/* Teacher Routes */}
        <Route path="/courses/manage" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <TeacherCoursesPlaceholder />
          </ProtectedRoute>
        } />
        <Route path="/courses/create" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <CreateCoursePlaceholder />
          </ProtectedRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/courses" element={
          <ProtectedRoute allowedRoles={['student']}>
            <BrowseCoursesPlaceholder />
          </ProtectedRoute>
        } />
        <Route path="/my-courses" element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyCoursesPlaceholder />
          </ProtectedRoute>
        } />
        <Route path="/grades" element={
          <ProtectedRoute allowedRoles={['student']}>
            <GradesPlaceholder />
          </ProtectedRoute>
        } />
        
        {/* Error Pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

// Placeholder components for demonstration
function TeacherCoursesPlaceholder() {
  return (
    <div className="main-content">
      <h1>Manage Courses</h1>
      <p style={{ color: '#64748b' }}>Teacher's course management interface</p>
      <div className="card" style={{ marginTop: '1rem' }}>
        <p>Course management features:</p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Create new courses</li>
          <li>Edit course content</li>
          <li>Manage enrollments</li>
          <li>Grade assignments</li>
        </ul>
      </div>
    </div>
  );
}

function CreateCoursePlaceholder() {
  return (
    <div className="main-content">
      <h1>Create Course</h1>
      <div className="card" style={{ marginTop: '1rem' }}>
        <p>Course creation form would go here</p>
      </div>
    </div>
  );
}

function BrowseCoursesPlaceholder() {
  return (
    <div className="main-content">
      <h1>Browse Courses</h1>
      <p style={{ color: '#64748b' }}>Discover and enroll in courses</p>
      <div className="card" style={{ marginTop: '1rem' }}>
        <p>Available courses would be listed here</p>
      </div>
    </div>
  );
}

function MyCoursesPlaceholder() {
  return (
    <div className="main-content">
      <h1>My Courses</h1>
      <p style={{ color: '#64748b' }}>Your enrolled courses</p>
      <div className="card" style={{ marginTop: '1rem' }}>
        <p>Enrolled courses would be shown here</p>
      </div>
    </div>
  );
}

function GradesPlaceholder() {
  return (
    <div className="main-content">
      <h1>My Grades</h1>
      <p style={{ color: '#64748b' }}>View your grades and progress</p>
      <div className="card" style={{ marginTop: '1rem' }}>
        <p>Grade information would be displayed here</p>
      </div>
    </div>
  );
}

export default App;

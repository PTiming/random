import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import Groups from './pages/Groups';

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Public Route - redirect to feed if already logged in
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/feed" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><Register /></PublicRoute>
      } />
      <Route path="/feed" element={
        <ProtectedRoute><Feed /></ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute><Messages /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      <Route path="/profile/:userId" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      <Route path="/courses" element={
        <ProtectedRoute><Courses /></ProtectedRoute>
      } />
      <Route path="/groups" element={
        <ProtectedRoute><Groups /></ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

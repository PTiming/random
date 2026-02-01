import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Settings from './pages/Settings';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
          <Route path="/courses/:id" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Home from './components/layout/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Feed from './components/posts/Feed';
import Profile from './components/profile/Profile';
import EditProfile from './components/profile/EditProfile';
import Courses from './components/courses/Courses';
import CourseDetail from './components/courses/CourseDetail';
import MoodleConnect from './components/courses/MoodleConnect';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/feed" element={
                <PrivateRoute>
                  <Feed />
                </PrivateRoute>
              } />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/profile/edit" element={
                <PrivateRoute>
                  <EditProfile />
                </PrivateRoute>
              } />
              <Route path="/courses" element={
                <PrivateRoute>
                  <Courses />
                </PrivateRoute>
              } />
              <Route path="/courses/:id" element={
                <PrivateRoute>
                  <CourseDetail />
                </PrivateRoute>
              } />
              <Route path="/moodle/connect" element={
                <PrivateRoute>
                  <MoodleConnect />
                </PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

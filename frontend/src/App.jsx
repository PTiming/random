import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import Messages from './pages/Messages';
import Groups from './pages/Groups';
import Navbar from './components/Navbar';
import { checkAuth } from './store/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Feed /> : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/courses" element={isAuthenticated ? <Courses /> : <Navigate to="/login" />} />
        <Route path="/messages" element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} />
        <Route path="/groups" element={isAuthenticated ? <Groups /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;

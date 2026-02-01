import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import './Navbar.css';

function Navbar() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          MERN Social Network
        </Link>
        <div className="navbar-menu">
          <Link to="/" className="navbar-item">Feed</Link>
          <Link to="/courses" className="navbar-item">Courses</Link>
          <Link to="/groups" className="navbar-item">Groups</Link>
          <Link to="/messages" className="navbar-item">Messages</Link>
          <Link to={`/profile/${user?._id}`} className="navbar-item">Profile</Link>
          <button onClick={handleLogout} className="navbar-item btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

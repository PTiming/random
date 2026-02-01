import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          MERN Social Network
        </div>
        <div className="navbar-user">
          <span>{user?.name}</span>
          <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          <button onClick={logout} className="btn btn-primary">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useMessageStore } from '../store/messageStore';
import { Home, Bell, MessageCircle, User, LogOut } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuthStore();
  const { unreadCount: notifCount } = useNotificationStore();
  const { unreadCount: msgCount } = useMessageStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          SocialNet
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            <Home size={20} />
            <span>Home</span>
          </Link>

          <Link to="/notifications" className="nav-link">
            <div className="icon-badge">
              <Bell size={20} />
              {notifCount > 0 && <span className="badge">{notifCount}</span>}
            </div>
            <span>Notifications</span>
          </Link>

          <Link to="/messages" className="nav-link">
            <div className="icon-badge">
              <MessageCircle size={20} />
              {msgCount > 0 && <span className="badge">{msgCount}</span>}
            </div>
            <span>Messages</span>
          </Link>

          <Link to={`/profile/${user?._id}`} className="nav-link">
            <User size={20} />
            <span>Profile</span>
          </Link>

          <button onClick={handleLogout} className="nav-link logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

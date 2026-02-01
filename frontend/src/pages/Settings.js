import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, authAPI } from '../services/api';
import { FiUser, FiLock, FiBell, FiShield, FiTrash2 } from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await usersAPI.updateProfile(profileForm);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
    setLoading(false);
  };

  const handleDeactivateAccount = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      return;
    }

    try {
      await usersAPI.deactivateAccount();
      logout();
    } catch (err) {
      setError('Failed to deactivate account');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-sidebar">
        <h2>Settings</h2>
        <nav className="settings-nav">
          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FiUser /> Profile
          </button>
          <button
            className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <FiLock /> Password
          </button>
          <button
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FiBell /> Notifications
          </button>
          <button
            className={`nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <FiShield /> Privacy
          </button>
          <button
            className={`nav-item danger ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <FiTrash2 /> Account
          </button>
        </nav>
      </div>

      <div className="settings-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="settings-section">
            <h3>Profile Information</h3>
            <p className="section-description">
              Update your profile information that others see.
            </p>

            <form onSubmit={handleProfileUpdate}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-input form-textarea"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="City, Country"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://yourwebsite.com"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Password Settings */}
        {activeTab === 'password' && (
          <div className="settings-section">
            <h3>Change Password</h3>
            <p className="section-description">
              Update your password to keep your account secure.
            </p>

            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h3>Notification Preferences</h3>
            <p className="section-description">
              Choose what notifications you want to receive.
            </p>

            <div className="notification-options">
              <label className="toggle-option">
                <span className="option-info">
                  <strong>Email Notifications</strong>
                  <span>Receive email updates about your activity</span>
                </span>
                <input type="checkbox" defaultChecked />
              </label>

              <label className="toggle-option">
                <span className="option-info">
                  <strong>Friend Requests</strong>
                  <span>Notify when someone sends you a friend request</span>
                </span>
                <input type="checkbox" defaultChecked />
              </label>

              <label className="toggle-option">
                <span className="option-info">
                  <strong>Post Interactions</strong>
                  <span>Notify when someone likes or comments on your posts</span>
                </span>
                <input type="checkbox" defaultChecked />
              </label>

              <label className="toggle-option">
                <span className="option-info">
                  <strong>Messages</strong>
                  <span>Notify when you receive new messages</span>
                </span>
                <input type="checkbox" defaultChecked />
              </label>

              <label className="toggle-option">
                <span className="option-info">
                  <strong>Moodle Updates</strong>
                  <span>Notify about grades, assignments, and course updates</span>
                </span>
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {activeTab === 'privacy' && (
          <div className="settings-section">
            <h3>Privacy Settings</h3>
            <p className="section-description">
              Control who can see your information.
            </p>

            <div className="privacy-options">
              <div className="form-group">
                <label className="form-label">Profile Visibility</label>
                <select className="form-input">
                  <option value="public">Public - Anyone can see</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private - Only me</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Who can send me friend requests</label>
                <select className="form-input">
                  <option value="everyone">Everyone</option>
                  <option value="friends_of_friends">Friends of Friends</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Who can message me</label>
                <select className="form-input">
                  <option value="everyone">Everyone</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary">Save Privacy Settings</button>
          </div>
        )}

        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="settings-section">
            <h3>Account Management</h3>
            <p className="section-description">
              Manage your account settings.
            </p>

            <div className="danger-zone">
              <h4>Danger Zone</h4>
              <p>
                Deactivating your account will hide your profile, posts, and all activity.
                You can reactivate by logging in again.
              </p>
              <button
                className="btn btn-danger"
                onClick={handleDeactivateAccount}
              >
                <FiTrash2 /> Deactivate Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

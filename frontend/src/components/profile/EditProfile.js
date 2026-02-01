import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/helpers';
import api from '../../utils/api';
import './Profile.css';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put('/users/profile', formData);
      updateUser(res.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataObj = new FormData();
    formDataObj.append('avatar', file);

    try {
      const res = await api.put('/users/avatar', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(res.data.user);
      setSuccess('Avatar updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update avatar');
    }
  };

  return (
    <div className="page-container">
      <div className="edit-profile">
        <h1 className="page-title">Edit Profile</h1>

        <div className="edit-profile-card card">
          <div className="avatar-section">
            <img
              src={getAvatarUrl(user?.avatar, user?.name)}
              alt={user?.name}
              className="avatar avatar-xl"
            />
            <label className="btn btn-secondary btn-sm">
              Change Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <form onSubmit={handleSubmit} className="edit-form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
                placeholder="Where are you from?"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="form-input"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <span className="spinner"></span> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

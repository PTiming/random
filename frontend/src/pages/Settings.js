import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './Settings.css';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [syncSettings, setSyncSettings] = useState({
    enabled: user?.syncSettings?.enabled || true,
    direction: user?.syncSettings?.direction || 'bidirectional',
    courses: user?.syncSettings?.contentTypes?.courses || true,
    assignments: user?.syncSettings?.contentTypes?.assignments || true,
    grades: user?.syncSettings?.contentTypes?.grades || true,
    calendar: user?.syncSettings?.contentTypes?.calendar || true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: Implement save functionality
    alert('Settings saved! (Implementation pending)');
  };

  return (
    <div className="container">
      <h1>Settings</h1>

      <div className="card">
        <h2>Moodle Integration</h2>
        {user?.moodleUserId ? (
          <div className="moodle-status connected">
            <p>✅ Connected to Moodle</p>
            <p>User ID: {user.moodleUserId}</p>
          </div>
        ) : (
          <div className="moodle-status disconnected">
            <p>❌ Not connected to Moodle</p>
            <button className="btn btn-primary">Connect Moodle Account</button>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Synchronization Settings</h2>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={syncSettings.enabled}
                onChange={(e) => setSyncSettings({...syncSettings, enabled: e.target.checked})}
              />
              Enable automatic synchronization
            </label>
          </div>

          <div className="form-group">
            <label>Sync Direction</label>
            <select 
              value={syncSettings.direction}
              onChange={(e) => setSyncSettings({...syncSettings, direction: e.target.value})}
            >
              <option value="bidirectional">Bidirectional (Both ways)</option>
              <option value="moodle_only">Moodle → Platform only</option>
              <option value="platform_only">Platform → Moodle only</option>
            </select>
          </div>

          <div className="form-group">
            <h3>Content Types to Sync</h3>
            <label>
              <input
                type="checkbox"
                checked={syncSettings.courses}
                onChange={(e) => setSyncSettings({...syncSettings, courses: e.target.checked})}
              />
              Courses
            </label>
            <label>
              <input
                type="checkbox"
                checked={syncSettings.assignments}
                onChange={(e) => setSyncSettings({...syncSettings, assignments: e.target.checked})}
              />
              Assignments
            </label>
            <label>
              <input
                type="checkbox"
                checked={syncSettings.grades}
                onChange={(e) => setSyncSettings({...syncSettings, grades: e.target.checked})}
              />
              Grades
            </label>
            <label>
              <input
                type="checkbox"
                checked={syncSettings.calendar}
                onChange={(e) => setSyncSettings({...syncSettings, calendar: e.target.checked})}
              />
              Calendar Events
            </label>
          </div>

          <button type="submit" className="btn btn-primary">
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;

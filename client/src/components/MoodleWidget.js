import React, { useState, useEffect } from 'react';
import { getMoodleData, syncMoodleData, linkMoodleAccount } from '../services/api';

function MoodleWidget() {
  const [moodleData, setMoodleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [moodleUserId, setMoodleUserId] = useState('');

  useEffect(() => {
    fetchMoodleData();
  }, []);

  const fetchMoodleData = async () => {
    try {
      const { data } = await getMoodleData();
      setMoodleData(data);
    } catch (err) {
      console.error('Error fetching Moodle data:', err);
    }
  };

  const handleLinkAccount = async (e) => {
    e.preventDefault();
    try {
      await linkMoodleAccount(moodleUserId);
      setShowLinkForm(false);
      setMoodleUserId('');
      alert('Moodle account linked successfully!');
    } catch (err) {
      console.error('Error linking Moodle account:', err);
      alert('Failed to link Moodle account');
    }
  };

  const handleSync = async (courseId) => {
    setLoading(true);
    try {
      await syncMoodleData(courseId);
      await fetchMoodleData();
      alert('Data synced successfully!');
    } catch (err) {
      console.error('Error syncing data:', err);
      alert('Failed to sync data. Make sure Moodle account is linked.');
    }
    setLoading(false);
  };

  return (
    <div className="widget">
      <div className="widget-title">Moodle Courses</div>
      
      {showLinkForm ? (
        <form onSubmit={handleLinkAccount}>
          <input
            type="text"
            placeholder="Enter Moodle User ID"
            className="auth-input"
            style={{ marginBottom: '8px' }}
            value={moodleUserId}
            onChange={(e) => setMoodleUserId(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            Link Account
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ backgroundColor: '#65676b', marginTop: '8px' }}
            onClick={() => setShowLinkForm(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          {moodleData.length === 0 ? (
            <div>
              <p style={{ fontSize: '13px', color: '#65676b', marginBottom: '8px' }}>
                No courses synced yet
              </p>
              <button className="btn-primary" onClick={() => setShowLinkForm(true)}>
                Link Moodle Account
              </button>
            </div>
          ) : (
            <>
              {moodleData.map((course) => (
                <div key={course._id} className="moodle-course">
                  <div className="moodle-course-name">{course.courseName}</div>
                  <div className="moodle-course-info">
                    {course.grades?.length || 0} grades • 
                    {course.assignments?.length || 0} assignments
                  </div>
                  <div className="moodle-course-info">
                    Last sync: {new Date(course.lastSync).toLocaleDateString()}
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => handleSync(course.courseId)}
                    disabled={loading}
                    style={{ fontSize: '13px', padding: '6px 12px', marginTop: '6px' }}
                  >
                    {loading ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              ))}
              <button
                className="btn-primary"
                style={{ fontSize: '13px', marginTop: '8px' }}
                onClick={() => setShowLinkForm(true)}
              >
                Sync New Course
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default MoodleWidget;

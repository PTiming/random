import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCourses, syncFromMoodle } from '../redux/slices/courseSlice';
import { toast } from 'react-toastify';
import './Courses.css';

const Courses = () => {
  const dispatch = useDispatch();
  const { courses, isLoading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getCourses(true));
  }, [dispatch]);

  const handleSync = async () => {
    try {
      await dispatch(syncFromMoodle()).unwrap();
      toast.success('Courses synced successfully!');
      dispatch(getCourses(true));
    } catch (error) {
      toast.error(error || 'Failed to sync courses');
    }
  };

  return (
    <div className="container">
      <div className="courses-header">
        <h1>My Courses</h1>
        {user?.moodleUserId && (
          <button 
            onClick={handleSync} 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Syncing...' : '🔄 Sync from Moodle'}
          </button>
        )}
      </div>

      {isLoading ? (
        <p>Loading courses...</p>
      ) : courses && courses.length > 0 ? (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course._id} className="card course-card">
              <div className="course-header">
                <h3>{course.name}</h3>
                {course.moodleCourseId && (
                  <span className="moodle-badge">Moodle</span>
                )}
              </div>
              <p className="course-code">{course.code}</p>
              <p className="course-description">
                {course.description?.substring(0, 150)}
                {course.description?.length > 150 ? '...' : ''}
              </p>
              <div className="course-footer">
                <span className="student-count">
                  👥 {course.enrolledStudents?.length || 0} students
                </span>
                <a href={`/courses/${course._id}`} className="btn btn-secondary">
                  View Course
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <h3>No courses yet</h3>
          <p>
            {user?.moodleUserId 
              ? 'Click "Sync from Moodle" to import your courses'
              : 'Link your Moodle account in Settings to sync courses'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;

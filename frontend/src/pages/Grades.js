import React, { useState, useEffect } from 'react';
import { gradeAPI } from '../services/api';

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#333'
  },
  courseSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
    overflow: 'hidden'
  },
  courseHeader: {
    backgroundColor: '#1a73e8',
    color: 'white',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  courseName: {
    fontSize: '1.2rem',
    fontWeight: '500'
  },
  overallGrade: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  gradeTable: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '1rem',
    borderBottom: '1px solid #eee',
    color: '#666',
    fontWeight: '500'
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #eee'
  },
  gradeCell: {
    fontWeight: '500'
  },
  gradeA: { color: '#4caf50' },
  gradeB: { color: '#2196f3' },
  gradeC: { color: '#ff9800' },
  gradeD: { color: '#f44336' },
  syncBadge: {
    display: 'inline-block',
    backgroundColor: '#f90',
    color: 'white',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    marginLeft: '0.5rem'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666'
  }
};

function Grades() {
  const [gradesByCourse, setGradesByCourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await gradeAPI.getMyGrades();
      setGradesByCourse(response.data.data);
    } catch (err) {
      setError('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return styles.gradeA;
    if (percentage >= 80) return styles.gradeB;
    if (percentage >= 70) return styles.gradeC;
    return styles.gradeD;
  };

  const calculateOverall = (grades) => {
    if (!grades || grades.length === 0) return null;
    const total = grades.reduce((sum, g) => sum + (g.percentage || 0), 0);
    return (total / grades.length).toFixed(1);
  };

  if (loading) {
    return <div style={styles.loading}>Loading grades...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Grades</h1>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      {gradesByCourse.length === 0 ? (
        <div style={styles.empty}>
          <h3>No grades available</h3>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Your grades will appear here once you're enrolled in courses and have completed activities.
          </p>
        </div>
      ) : (
        gradesByCourse.map(({ course, grades }) => {
          const overall = calculateOverall(grades);
          return (
            <div key={course._id} style={styles.courseSection}>
              <div style={styles.courseHeader}>
                <div>
                  <span style={styles.courseName}>{course.title}</span>
                  <span style={{ opacity: 0.8, marginLeft: '0.5rem' }}>({course.shortName})</span>
                </div>
                {overall && (
                  <span style={styles.overallGrade}>{overall}%</span>
                )}
              </div>
              <table style={styles.gradeTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Activity</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Grade</th>
                    <th style={styles.th}>Percentage</th>
                    <th style={styles.th}>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map(grade => (
                    <tr key={grade._id}>
                      <td style={styles.td}>
                        {grade.activityType === 'overall' ? 'Course Total' : `Activity ${grade.activityId}`}
                        {grade.syncedWithMoodle && (
                          <span style={styles.syncBadge}>Moodle</span>
                        )}
                      </td>
                      <td style={styles.td}>{grade.activityType}</td>
                      <td style={{ ...styles.td, ...styles.gradeCell }}>
                        {grade.grade} / {grade.maxGrade}
                      </td>
                      <td style={{ ...styles.td, ...styles.gradeCell, ...getGradeColor(grade.percentage) }}>
                        {grade.percentage?.toFixed(1)}%
                      </td>
                      <td style={styles.td}>{grade.feedback || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}

export default Grades;

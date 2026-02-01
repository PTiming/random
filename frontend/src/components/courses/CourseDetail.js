import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import PostCard from '../posts/PostCard';
import CreatePost from '../posts/CreatePost';
import './Courses.css';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [syncingContent, setSyncingContent] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchCoursePosts();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.course);
      setSections(res.data.course.sections || []);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursePosts = async () => {
    try {
      const res = await api.get(`/posts/course/${id}`);
      setPosts(res.data.posts);
    } catch (error) {
      console.error('Error fetching course posts:', error);
    }
  };

  const handleSyncContent = async () => {
    setSyncingContent(true);
    try {
      const res = await api.post(`/moodle/sync/course/${id}/content`);
      setSections(res.data.sections);
    } catch (error) {
      console.error('Error syncing content:', error);
    } finally {
      setSyncingContent(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-dark"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page-container">
        <div className="empty-state card">
          <h3>Course not found</h3>
          <Link to="/courses" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <div className="course-detail-header">
        <Link to="/courses" className="back-link">← Back to Courses</Link>
        <div className="course-detail-info">
          <h1>{course.title}</h1>
          {course.shortName && <span className="course-code">{course.shortName}</span>}
          {course.description && <p>{course.description}</p>}
          {course.instructorName && (
            <span className="instructor">Instructor: {course.instructorName}</span>
          )}
        </div>
      </div>

      <div className="course-detail-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            📚 Content
          </button>
          <button
            className={`tab ${activeTab === 'discussion' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussion')}
          >
            💬 Discussion
          </button>
          <button
            className={`tab ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            👥 Participants
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'content' && (
            <div className="course-content">
              <div className="content-header">
                <h2>Course Content</h2>
                <button
                  onClick={handleSyncContent}
                  className="btn btn-secondary btn-sm"
                  disabled={syncingContent}
                >
                  {syncingContent ? 'Syncing...' : '🔄 Sync from Moodle'}
                </button>
              </div>

              {sections.length > 0 ? (
                <div className="sections-list">
                  {sections.map((section, index) => (
                    <div key={section.moodleSectionId || index} className="section-card card">
                      <div className="section-header">
                        <h3>{section.name || `Section ${index + 1}`}</h3>
                      </div>
                      {section.summary && (
                        <div 
                          className="section-summary"
                          dangerouslySetInnerHTML={{ __html: section.summary }}
                        />
                      )}
                      {section.modules && section.modules.length > 0 && (
                        <div className="modules-list">
                          {section.modules.map((module, mIndex) => (
                            <div key={module.moodleModuleId || mIndex} className="module-item">
                              <span className="module-icon">
                                {getModuleIcon(module.modname)}
                              </span>
                              {module.url ? (
                                <a href={module.url} target="_blank" rel="noopener noreferrer">
                                  {module.name}
                                </a>
                              ) : (
                                <span>{module.name}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No content available. Try syncing from Moodle.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'discussion' && (
            <div className="course-discussion">
              <CreatePost onPostCreated={handlePostCreated} courseId={id} />
              
              <div className="posts-list">
                {posts.length > 0 ? (
                  posts.map(post => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onDelete={handlePostDeleted}
                      onUpdate={handlePostUpdated}
                    />
                  ))
                ) : (
                  <div className="empty-state card">
                    <div className="empty-state-icon">💬</div>
                    <h3 className="empty-state-title">No discussions yet</h3>
                    <p>Start a discussion about this course!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="course-participants">
              <h2>Enrolled Students</h2>
              {course.enrolledUsers && course.enrolledUsers.length > 0 ? (
                <div className="participants-list">
                  {course.enrolledUsers.map((enrollment, index) => (
                    <Link
                      key={enrollment.user?._id || index}
                      to={`/profile/${enrollment.user?._id}`}
                      className="participant-item card"
                    >
                      <img
                        src={enrollment.user?.avatar || `https://ui-avatars.com/api/?name=${enrollment.user?.name}`}
                        alt={enrollment.user?.name}
                        className="avatar"
                      />
                      <div className="participant-info">
                        <span className="participant-name">{enrollment.user?.name}</span>
                        <span className="participant-role">{enrollment.role}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No participants to show.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get module icon based on type
const getModuleIcon = (modname) => {
  const icons = {
    forum: '💬',
    assign: '📝',
    quiz: '❓',
    resource: '📄',
    url: '🔗',
    page: '📃',
    book: '📖',
    folder: '📁',
    label: '🏷️',
    choice: '✅',
    feedback: '📊',
    lesson: '📚',
    workshop: '🔧',
    glossary: '📓',
    wiki: '📰',
    chat: '💭',
    survey: '📋',
    scorm: '🎓',
    lti: '🔌',
    data: '🗃️'
  };
  return icons[modname] || '📄';
};

export default CourseDetail;

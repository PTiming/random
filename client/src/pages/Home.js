import React, { useState, useEffect } from 'react';
import { getPosts } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import MoodleWidget from '../components/MoodleWidget';

function Home({ user, setUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await getPosts();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div className="main-container">
        <Sidebar user={user} />
        
        <div className="feed">
          <CreatePost user={user} onPostCreated={fetchPosts} />
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#65676b' }}>
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '8px', color: '#050505' }}>No posts yet</h3>
              <p style={{ color: '#65676b' }}>Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post) => (
              <Post key={post._id} post={post} onUpdate={fetchPosts} />
            ))
          )}
        </div>

        <div className="right-sidebar">
          <MoodleWidget />
        </div>
      </div>
    </>
  );
}

export default Home;

import { useEffect } from 'react';
import { usePostStore } from '../store/postStore';
import { useNotificationStore } from '../store/notificationStore';
import { useMessageStore } from '../store/messageStore';
import { getSocket } from '../utils/socket';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

function Home() {
  const { posts, loading, fetchPosts, addNewPost, addComment } = usePostStore();
  const { addNotification, fetchNotifications } = useNotificationStore();
  const { fetchUnreadCount } = useMessageStore();

  useEffect(() => {
    fetchPosts();
    fetchNotifications();
    fetchUnreadCount();

    // Set up socket listeners
    const socket = getSocket();
    if (socket) {
      socket.on('newPost', (post) => {
        addNewPost(post);
      });

      socket.on('newComment', ({ postId, comment }) => {
        addComment(postId, comment);
      });

      socket.on('notification', (notification) => {
        addNotification(notification);
      });

      return () => {
        socket.off('newPost');
        socket.off('newComment');
        socket.off('notification');
      };
    }
  }, []);

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <div className="feed-container">
          <CreatePost />
          
          {loading && posts.length === 0 ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <Post key={post._id} post={post} />
              ))}
              {posts.length === 0 && (
                <div className="empty-state">
                  <p>No posts yet. Be the first to post!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;

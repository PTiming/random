import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await api.get('/api/bookmarks');
      setBookmarks(response.data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (postId) => {
    try {
      await api.delete(`/api/bookmarks/${postId}`);
      setBookmarks(bookmarks.filter(b => b._id !== postId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">🔖 Bookmarks</h1>
          <p className="mt-2 text-yellow-100">Posts you've saved for later</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
              🔖
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{bookmarks.length}</p>
              <p className="text-sm text-gray-500">Saved posts</p>
            </div>
          </div>
        </div>

        {/* Bookmarked Posts */}
        <div className="space-y-4">
          {bookmarks.map(post => (
            <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="p-5">
                {/* Author */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {post.author?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{post.author?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBookmark(post._id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1"
                  >
                    <span>🗑️</span> Remove
                  </button>
                </div>

                {/* Content */}
                <p className="text-gray-800 mb-4">{post.content}</p>

                {/* Image */}
                {post.image && (
                  <div className="rounded-lg overflow-hidden mb-4">
                    <img src={post.image} alt="" className="w-full object-cover max-h-80" />
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span>❤️</span> {post.likes?.length || 0} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <span>💬</span> {post.comments?.length || 0} comments
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {bookmarks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔖</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookmarks yet</h3>
            <p className="text-gray-500">Save posts from your feed to view them here</p>
          </div>
        )}
      </div>
    </div>
  );
}

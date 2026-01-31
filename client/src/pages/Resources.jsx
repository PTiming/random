import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Resources() {
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filter, setFilter] = useState({ category: '', verified: false, search: '' });
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileType: 'pdf',
    category: 'notes',
    tags: ''
  });

  useEffect(() => {
    fetchResources();
  }, [filter.category, filter.verified]);

  const fetchResources = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.verified) params.append('verified', 'true');
      if (filter.search) params.append('search', filter.search);
      
      const response = await api.get(`/api/resources?${params}`);
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const resourceData = {
        ...newResource,
        tags: newResource.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      
      await api.post('/api/resources', resourceData);
      setShowUploadModal(false);
      setNewResource({
        title: '', description: '', fileUrl: '', fileType: 'pdf', category: 'notes', tags: ''
      });
      fetchResources();
    } catch (error) {
      console.error('Error uploading resource:', error);
    }
  };

  const handleDownload = async (resource) => {
    try {
      const response = await api.post(`/api/resources/${resource._id}/download`);
      window.open(response.data.fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  const handleVerify = async (resourceId) => {
    try {
      await api.put(`/api/resources/${resourceId}/verify`);
      fetchResources();
    } catch (error) {
      console.error('Error verifying:', error);
    }
  };

  const getFileIcon = (fileType) => {
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      ppt: '📊',
      pptx: '📊',
      xls: '📈',
      xlsx: '📈',
      image: '🖼️',
      video: '🎥',
      other: '📁'
    };
    return icons[fileType] || '📁';
  };

  const getCategoryColor = (category) => {
    const colors = {
      notes: 'bg-blue-100 text-blue-800',
      slides: 'bg-purple-100 text-purple-800',
      assignment: 'bg-orange-100 text-orange-800',
      past_exam: 'bg-red-100 text-red-800',
      textbook: 'bg-green-100 text-green-800',
      video: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">📚 Resource Library</h1>
          <p className="mt-2 text-green-100">Share and download study materials</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div className="flex flex-wrap gap-2">
            <select
              value={filter.category}
              onChange={e => setFilter({...filter, category: e.target.value})}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              <option value="notes">📝 Notes</option>
              <option value="slides">📊 Slides</option>
              <option value="assignment">📋 Assignments</option>
              <option value="past_exam">📄 Past Exams</option>
              <option value="textbook">📚 Textbooks</option>
              <option value="video">🎥 Videos</option>
            </select>

            <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={filter.verified}
                onChange={e => setFilter({...filter, verified: e.target.checked})}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Verified Only</span>
            </label>

            <input
              type="text"
              placeholder="Search resources..."
              value={filter.search}
              onChange={e => setFilter({...filter, search: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && fetchResources()}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-64"
            />
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
          >
            <span>⬆️</span> Upload Resource
          </button>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <div key={resource._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="p-5">
                {/* File Icon & Type */}
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{getFileIcon(resource.fileType)}</div>
                  <div className="flex items-center gap-2">
                    {resource.isVerified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                        ✓ Verified
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(resource.category)}`}>
                      {resource.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                {resource.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{resource.description}</p>
                )}

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <span>⬇️</span> {resource.downloads} downloads
                  </span>
                  <span className="flex items-center gap-1">
                    <span>📅</span> {new Date(resource.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Uploader */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-green-600">
                      {resource.uploader?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{resource.uploader?.name}</p>
                      <p className="text-xs text-gray-500">{resource.uploader?.role}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {(user?.role === 'teacher' || user?.role === 'admin') && !resource.isVerified && (
                      <button
                        onClick={() => handleVerify(resource._id)}
                        className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                      >
                        ✓ Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(resource)}
                      className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {resources.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No resources found</h3>
            <p className="text-gray-500">Be the first to share study materials!</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upload Resource</h2>
                <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ×
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newResource.title}
                    onChange={e => setNewResource({...newResource, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Resource title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newResource.description}
                    onChange={e => setNewResource({...newResource, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="3"
                    placeholder="What is this resource about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File URL *</label>
                  <input
                    type="url"
                    required
                    value={newResource.fileUrl}
                    onChange={e => setNewResource({...newResource, fileUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://drive.google.com/... or direct link"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload to Google Drive, Dropbox, etc. and paste the link</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                    <select
                      value={newResource.fileType}
                      onChange={e => setNewResource({...newResource, fileType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="pdf">📄 PDF</option>
                      <option value="doc">📝 Word Doc</option>
                      <option value="ppt">📊 PowerPoint</option>
                      <option value="xls">📈 Excel</option>
                      <option value="image">🖼️ Image</option>
                      <option value="video">🎥 Video</option>
                      <option value="other">📁 Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newResource.category}
                      onChange={e => setNewResource({...newResource, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="notes">📝 Notes</option>
                      <option value="slides">📊 Slides</option>
                      <option value="assignment">📋 Assignment</option>
                      <option value="past_exam">📄 Past Exam</option>
                      <option value="textbook">📚 Textbook</option>
                      <option value="video">🎥 Video</option>
                      <option value="other">📁 Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newResource.tags}
                    onChange={e => setNewResource({...newResource, tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="calculus, midterm, chapter5"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

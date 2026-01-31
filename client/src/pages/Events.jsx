import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Events() {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, my-events, upcoming
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'study_session',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    isOnline: false,
    meetingLink: '',
    maxAttendees: '',
    isPublic: true
  });

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const endpoint = filter === 'my-events' ? '/api/events/my-events' : '/api/events';
      const response = await api.get(endpoint);
      let data = response.data;
      
      if (filter === 'upcoming') {
        data = data.filter(e => new Date(e.startDate) >= new Date());
      }
      
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...newEvent,
        startDate: new Date(`${newEvent.startDate}T${newEvent.startTime}`),
        endDate: newEvent.endDate ? new Date(`${newEvent.endDate}T${newEvent.endTime}`) : null,
        maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : null
      };
      
      await api.post('/api/events', eventData);
      setShowCreateModal(false);
      setNewEvent({
        title: '', description: '', eventType: 'study_session',
        startDate: '', startTime: '', endDate: '', endTime: '',
        location: '', isOnline: false, meetingLink: '', maxAttendees: '', isPublic: true
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleRSVP = async (eventId, status) => {
    try {
      await api.post(`/api/events/${eventId}/rsvp`, { status });
      fetchEvents();
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      study_session: '📚',
      exam: '📝',
      deadline: '⏰',
      meeting: '👥',
      workshop: '🔧',
      other: '📅'
    };
    return icons[type] || '📅';
  };

  const getEventTypeColor = (type) => {
    const colors = {
      study_session: 'bg-blue-100 text-blue-800',
      exam: 'bg-red-100 text-red-800',
      deadline: 'bg-orange-100 text-orange-800',
      meeting: 'bg-purple-100 text-purple-800',
      workshop: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getUserRSVPStatus = (event) => {
    const attendee = event.attendees?.find(a => a.user?._id === user?._id);
    return attendee?.status;
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">📅 Events & Calendar</h1>
          <p className="mt-2 text-indigo-100">Study sessions, exams, deadlines, and more</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Actions Bar */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter('my-events')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'my-events' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Events
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'upcoming' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Upcoming
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <span>+</span> Create Event
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              {/* Event Header */}
              <div className={`p-4 ${getEventTypeColor(event.eventType)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{getEventTypeIcon(event.eventType)}</span>
                  <span className="text-xs font-semibold uppercase">{event.eventType.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Event Body */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                {event.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>🗓️</span>
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                  )}
                  
                  {event.isOnline && event.meetingLink && (
                    <div className="flex items-center gap-2">
                      <span>🔗</span>
                      <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        Join Online
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>
                      {event.attendees?.filter(a => a.status === 'going').length || 0} going
                      {event.maxAttendees && ` / ${event.maxAttendees} max`}
                    </span>
                  </div>
                </div>

                {/* Creator */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                      {event.creator?.name?.[0] || 'U'}
                    </div>
                    <span className="text-sm text-gray-600">{event.creator?.name}</span>
                  </div>

                  {/* RSVP Buttons */}
                  <div className="flex gap-1">
                    {['going', 'maybe', 'not_going'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleRSVP(event._id, status)}
                        className={`px-2 py-1 text-xs rounded transition ${
                          getUserRSVPStatus(event) === status
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status === 'going' ? '✓' : status === 'maybe' ? '?' : '✗'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
            <p className="text-gray-500">Create an event to get started!</p>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create Event</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                    placeholder="Event details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    value={newEvent.eventType}
                    onChange={e => setNewEvent({...newEvent, eventType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="study_session">📚 Study Session</option>
                    <option value="exam">📝 Exam</option>
                    <option value="deadline">⏰ Deadline</option>
                    <option value="meeting">👥 Meeting</option>
                    <option value="workshop">🔧 Workshop</option>
                    <option value="other">📅 Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={newEvent.startDate}
                      onChange={e => setNewEvent({...newEvent, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={newEvent.startTime}
                      onChange={e => setNewEvent({...newEvent, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Room 101 / Library / Online"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newEvent.isOnline}
                      onChange={e => setNewEvent({...newEvent, isOnline: e.target.checked})}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Online Event</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newEvent.isPublic}
                      onChange={e => setNewEvent({...newEvent, isPublic: e.target.checked})}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Public</span>
                  </label>
                </div>

                {newEvent.isOnline && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                    <input
                      type="url"
                      value={newEvent.meetingLink}
                      onChange={e => setNewEvent({...newEvent, meetingLink: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="https://zoom.us/..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees (optional)</label>
                  <input
                    type="number"
                    value={newEvent.maxAttendees}
                    onChange={e => setNewEvent({...newEvent, maxAttendees: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Create Event
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

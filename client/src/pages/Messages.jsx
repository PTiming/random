import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Search, Send, Phone, Video, 
  MoreVertical, Image, Paperclip, Smile, 
  Check, CheckCheck, Users, Plus, GraduationCap,
  Mic, Star, Pin
} from 'lucide-react';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const conversations = [
    {
      id: 1,
      type: 'direct',
      name: 'Dr. Sarah Johnson',
      avatar: '👩‍🏫',
      lastMessage: 'Thanks for submitting your assignment!',
      time: '2m ago',
      unread: 0,
      online: true,
      role: 'Teacher',
      pinned: true,
    },
    {
      id: 2,
      type: 'group',
      name: 'CS101 Study Group',
      avatar: '📚',
      lastMessage: 'Alex: Can someone explain recursion?',
      time: '15m ago',
      unread: 5,
      online: true,
      members: 12,
    },
    {
      id: 3,
      type: 'direct',
      name: 'Alex Chen',
      avatar: '👨‍🎓',
      lastMessage: 'See you at the library at 3pm!',
      time: '1h ago',
      unread: 0,
      online: false,
      role: 'Student',
    },
    {
      id: 4,
      type: 'group',
      name: 'Math 201 Help',
      avatar: '🧮',
      lastMessage: 'Maria: Great explanation!',
      time: '2h ago',
      unread: 2,
      online: true,
      members: 8,
    },
    {
      id: 5,
      type: 'direct',
      name: 'Maria Garcia',
      avatar: '👩‍🎓',
      lastMessage: 'You sent: Thanks for the notes!',
      time: '3h ago',
      unread: 0,
      online: true,
      role: 'Student',
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'them',
      content: 'Hello! I reviewed your Binary Trees assignment',
      time: '10:30 AM',
      status: 'read',
    },
    {
      id: 2,
      sender: 'them',
      content: 'Great work on the implementation! You scored 92/100 🎉',
      time: '10:31 AM',
      status: 'read',
    },
    {
      id: 3,
      sender: 'me',
      content: 'Thank you so much Dr. Johnson! I had a question about the bonus section.',
      time: '10:45 AM',
      status: 'read',
    },
    {
      id: 4,
      sender: 'them',
      content: 'Sure, what would you like to know?',
      time: '10:47 AM',
      status: 'read',
    },
    {
      id: 5,
      sender: 'me',
      content: 'For the AVL tree rotation, should I handle both left-left and right-right cases?',
      time: '10:50 AM',
      status: 'read',
    },
    {
      id: 6,
      sender: 'them',
      content: 'Yes! You should handle all 4 cases: LL, RR, LR, and RL rotations. I can share some resources if you need them. 📖',
      time: '10:52 AM',
      status: 'read',
    },
    {
      id: 7,
      sender: 'me',
      content: 'That would be really helpful! Thank you!',
      time: '10:55 AM',
      status: 'delivered',
    },
    {
      id: 8,
      sender: 'them',
      content: 'Thanks for submitting your assignment!',
      time: '11:00 AM',
      status: 'read',
    },
  ];

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'all') return true;
    if (activeTab === 'groups') return conv.type === 'group';
    if (activeTab === 'teachers') return conv.role === 'Teacher';
    return true;
  });

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shrink-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/feed" className="p-2 rounded-xl hover:bg-gray-100 transition-all">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Messages
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Conversation List */}
        <div className="w-80 bg-white border-r border-gray-200/50 flex flex-col">
          {/* Search & New Chat */}
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <button className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 btn-glow transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex p-2 gap-1 border-b">
            {['all', 'groups', 'teachers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab === 'all' ? 'All Chats' : tab === 'groups' ? 'Groups' : 'Teachers'}
              </button>
            ))}
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={`w-full p-4 flex items-center gap-3 transition-all relative ${
                  selectedChat === conv.id 
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600' 
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                {conv.pinned && (
                  <Pin className="absolute top-2 right-2 w-3 h-3 text-orange-500" />
                )}
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ring-2 ring-white shadow ${
                    conv.type === 'group' 
                      ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                      : conv.role === 'Teacher'
                      ? 'bg-gradient-to-br from-purple-100 to-pink-100'
                      : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                  }`}>
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white pulse-online"></div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 truncate flex items-center gap-1">
                      {conv.name}
                      {conv.type === 'group' && <Users className="w-3.5 h-3.5 text-gray-400" />}
                      {conv.role === 'Teacher' && <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />}
                    </span>
                    <span className="text-xs text-gray-500">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="ml-2 w-5 h-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-xs text-white flex items-center justify-center font-medium shadow">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ring-2 ring-white shadow ${
                  selectedConversation?.role === 'Teacher'
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100'
                    : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                }`}>
                  {selectedConversation?.avatar}
                </div>
                {selectedConversation?.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white pulse-online"></div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {selectedConversation?.name}
                  {selectedConversation?.role === 'Teacher' && (
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                      Teacher
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  {selectedConversation?.type === 'group' 
                    ? `${selectedConversation.members} members` 
                    : selectedConversation?.online 
                    ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Online
                      </>
                    )
                    : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2.5 rounded-xl hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition-all">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-xl hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition-all">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {/* Date separator */}
            <div className="flex items-center justify-center">
              <span className="px-4 py-1.5 bg-white rounded-full text-xs text-gray-500 shadow-sm">
                Today
              </span>
            </div>

            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} message-bubble`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {msg.sender !== 'me' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-sm mr-2 mt-auto shadow">
                    👩‍🏫
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    msg.sender === 'me'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    msg.sender === 'me' ? 'text-indigo-200' : 'text-gray-400'
                  }`}>
                    <span className="text-xs">{msg.time}</span>
                    {msg.sender === 'me' && (
                      msg.status === 'read' 
                        ? <CheckCheck className="w-4 h-4 text-green-300" />
                        : <Check className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            <div className="flex items-center gap-2 message-bubble">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-sm shadow">
                👩‍🏫
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="typing-indicator flex gap-1">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all">
                <Image className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full px-5 py-3.5 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white pr-12 transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all">
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <button className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all">
                <Mic className="w-5 h-5" />
              </button>
              <button className="p-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 btn-glow transition-all">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

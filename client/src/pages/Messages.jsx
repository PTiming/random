import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Search, Send, Phone, Video, 
  MoreVertical, Image, Paperclip, Smile, 
  Check, CheckCheck, Users, Plus, GraduationCap
} from 'lucide-react';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');

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
      content: 'Great work on the implementation! You scored 92/100',
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
      content: 'Yes! You should handle all 4 cases: LL, RR, LR, and RL rotations. I can share some resources if you need them.',
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

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/feed" className="p-2 rounded-xl hover:bg-gray-100">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Messages</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full">
        {/* Conversation List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search & New Chat */}
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button className="flex-1 py-3 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">
              All Chats
            </button>
            <button className="flex-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
              Groups
            </button>
            <button className="flex-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
              Teachers
            </button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  selectedChat === conv.id ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                    conv.type === 'group' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 truncate flex items-center gap-1">
                      {conv.name}
                      {conv.type === 'group' && <Users className="w-3 h-3 text-gray-400" />}
                    </span>
                    <span className="text-xs text-gray-500">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="ml-2 w-5 h-5 bg-indigo-600 rounded-full text-xs text-white flex items-center justify-center">
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
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                  {selectedConversation?.avatar}
                </div>
                {selectedConversation?.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedConversation?.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedConversation?.type === 'group' 
                    ? `${selectedConversation.members} members` 
                    : selectedConversation?.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl hover:bg-gray-100">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-100">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-100">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.sender === 'me'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    msg.sender === 'me' ? 'text-indigo-200' : 'text-gray-400'
                  }`}>
                    <span className="text-xs">{msg.time}</span>
                    {msg.sender === 'me' && (
                      msg.status === 'read' 
                        ? <CheckCheck className="w-4 h-4" />
                        : <Check className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-gray-100">
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-100">
                <Image className="w-5 h-5 text-gray-500" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-200">
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <button className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
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

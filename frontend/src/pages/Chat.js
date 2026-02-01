import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import NotificationDropdown from '../components/NotificationDropdown';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Chat() {
  const { user, setChats, socket } = useChat();
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch chats on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(`${API_URL}/api/chats`, config);
        setChats(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    if (user) {
      fetchChats();
      if (socket) {
        socket.emit('user online', user._id);
      }
    }
  }, [user, setChats, socket]);

  return (
    <div className="chat-container">
      <Sidebar 
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />
      <ChatArea />
      {showNotifications && (
        <NotificationDropdown 
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}

export default Chat;

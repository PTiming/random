import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Chat from './pages/Chat';
import { useChat } from './context/ChatContext';

function App() {
  const { user } = useChat();

  return (
    <div className="app">
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/chat" /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/chat" /> : <Login />} 
        />
        <Route 
          path="/chat" 
          element={user ? <Chat /> : <Navigate to="/login" />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/" />} 
        />
      </Routes>
    </div>
  );
}

export default App;

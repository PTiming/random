# MERN Chat Application

A full-featured real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) with Socket.io for real-time messaging and notifications.

## Features

- 👤 **Simple Username Login** - Just enter a username to start chatting
- 💬 **Real-time Messaging** - Instant message delivery using Socket.io
- 👥 **One-on-One Chats** - Private conversations between users
- 👨‍👩‍👧‍👦 **Group Chats** - Create and manage group conversations
- 🔔 **Real-time Notifications** - Get notified of new messages instantly
- 🟢 **Online Status** - See who's online
- ⌨️ **Typing Indicators** - See when someone is typing
- 🔍 **User Search** - Find and chat with other users
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- Socket.io for real-time communication
- Simple user identification (no passwords)

### Frontend
- React.js
- React Router for navigation
- Socket.io-client
- Axios for API calls
- React Icons

## Project Structure

```
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js   # User join & search
│   │   ├── chatController.js   # Chat management
│   │   ├── messageController.js # Message handling
│   │   └── notificationController.js # Notification management
│   ├── middleware/
│   │   └── authMiddleware.js   # User identification middleware
│   ├── models/
│   │   ├── User.js            # User model (username only)
│   │   ├── Chat.js            # Chat model
│   │   ├── Message.js         # Message model
│   │   └── Notification.js    # Notification model
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── messageRoutes.js
│   │   └── notificationRoutes.js
│   ├── server.js              # Express server & Socket.io setup
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js      # Chat list & user search
│   │   │   ├── ChatArea.js     # Message display & input
│   │   │   └── NotificationDropdown.js
│   │   ├── context/
│   │   │   └── ChatContext.js  # Global state management
│   │   ├── pages/
│   │   │   ├── Login.js        # Username entry page
│   │   │   └── Chat.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mern-chat
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file for custom API URL:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```
   The app will open on http://localhost:3000

## API Endpoints

### Users
- `POST /api/users/join` - Join chat with username (creates user if not exists)
- `GET /api/users` - Search users (protected with X-User-Id header)
- `GET /api/users/profile` - Get user profile (protected)

### Chats
- `POST /api/chats` - Create/access one-on-one chat (protected)
- `GET /api/chats` - Get all chats for user (protected)
- `POST /api/chats/group` - Create group chat (protected)
- `PUT /api/chats/rename` - Rename group (protected)
- `PUT /api/chats/groupadd` - Add user to group (protected)
- `PUT /api/chats/groupremove` - Remove user from group (protected)

### Messages
- `POST /api/messages` - Send a message (protected)
- `GET /api/messages/:chatId` - Get messages for a chat (protected)

### Notifications
- `GET /api/notifications` - Get all notifications (protected)
- `POST /api/notifications` - Create notification (protected)
- `PUT /api/notifications/:id` - Mark as read (protected)
- `PUT /api/notifications/chat/:chatId` - Mark chat notifications as read (protected)
- `DELETE /api/notifications/:id` - Delete notification (protected)
- `GET /api/notifications/unread/count` - Get unread count (protected)

## Authentication

This app uses a simple username-based identification system:
- Users join by entering a username (no password required)
- If the username exists, the existing user is returned
- If the username doesn't exist, a new user is created
- Protected routes require an `X-User-Id` header with the user's MongoDB ObjectId

## Socket.io Events

### Client to Server
- `setup` - Initialize user connection
- `join chat` - Join a chat room
- `leave chat` - Leave a chat room
- `new message` - Send a new message
- `typing` - User is typing
- `stop typing` - User stopped typing
- `user online` - User came online
- `user offline` - User went offline

### Server to Client
- `connected` - Socket connected successfully
- `message received` - New message received
- `notification received` - New notification
- `typing` - Someone is typing
- `stop typing` - Someone stopped typing
- `user status` - User online/offline status changed

## Screenshots

The application includes:
- Simple username entry page
- Chat sidebar with search and notifications
- Real-time messaging interface
- Group chat creation modal
- Notification dropdown with badge count

## License

MIT License
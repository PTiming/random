# MERN Social Network

A full-stack social network application built with MongoDB, Express, React, and Node.js (MERN stack) featuring real-time notifications, messaging, and comments.

## Features

- **User Authentication**: Register, login, and profile management
- **Posts**: Create, edit, delete, and like posts
- **Comments**: Comment on posts with real-time updates
- **Real-time Messaging**: Private messaging between users with Socket.io
- **Real-time Notifications**: Get instant notifications for likes, comments, follows, and messages
- **User Profiles**: View profiles, follow/unfollow users
- **Search**: Search for users

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- Socket.io for real-time features
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React 18 with Vite
- React Router v6
- Zustand for state management
- Socket.io-client
- Axios for API calls
- Lucide React for icons

## Project Structure

```
├── server/                 # Backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose models
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── posts.js
│   │   ├── comments.js
│   │   ├── messages.js
│   │   └── notifications.js
│   ├── socket/            # Socket.io handlers
│   └── server.js          # Entry point
│
└── client/                 # Frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── pages/         # Page components
    │   ├── store/         # Zustand stores
    │   ├── utils/         # API and socket utilities
    │   ├── App.jsx
    │   └── App.css
    └── index.html
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/social-network.git
cd social-network
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Configure environment variables:

**Server (.env)**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social_network
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLIENT_URL=http://localhost:5173
```

**Client (.env)**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Start the server:
```bash
cd server
npm run dev
```

7. Start the client (in a new terminal):
```bash
cd client
npm run dev
```

8. Open http://localhost:5173 in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/:id` - Get user by ID
- `POST /api/auth/:id/follow` - Follow/unfollow user
- `GET /api/auth/search/:query` - Search users

### Posts
- `GET /api/posts` - Get all posts (paginated)
- `POST /api/posts` - Create a post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `GET /api/posts/user/:userId` - Get user's posts

### Comments
- `POST /api/comments/:postId` - Create comment
- `GET /api/comments/:postId` - Get comments for post
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like/unlike comment

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:userId` - Get conversation
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/unread` - Get unread count

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count
- `DELETE /api/notifications/:id` - Delete notification

## Real-time Events (Socket.io)

### Client Events (emit)
- `join` - Join user's room
- `joinConversation` - Join a conversation room
- `leaveConversation` - Leave a conversation room
- `sendMessage` - Send a message
- `typing` - Typing indicator
- `stopTyping` - Stop typing indicator

### Server Events (listen)
- `newPost` - New post created
- `newComment` - New comment added
- `newMessage` - New message received
- `notification` - New notification
- `userOnline` - User online status change
- `userTyping` - User is typing
- `userStopTyping` - User stopped typing

## License

MIT
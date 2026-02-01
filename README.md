# EduConnect - MERN Social Network with Moodle Integration

A full-featured social networking platform built with the MERN stack (MongoDB, Express.js, React, Node.js) that integrates with Moodle LMS to provide a seamless learning and social experience.

## 🌟 Features

### Social Networking
- **User Authentication**: Secure JWT-based registration and login
- **User Profiles**: Customizable profiles with avatars, bios, and personal info
- **News Feed**: Real-time feed showing posts from friends and followed users
- **Posts**: Create, edit, delete posts with images and tags
- **Comments & Likes**: Interactive engagement on posts (real-time updates)
- **Friend System**: Send/accept/reject friend requests with real-time notifications
- **Following**: Follow users without friending
- **Direct Messaging**: Real-time chat with Socket.io
- **Notifications**: Real-time notifications for all activities (likes, comments, follows, friend requests)
- **Global Search**: Search users, posts, and hashtags with autocomplete suggestions
- **Trending Hashtags**: Discover popular topics

### Moodle Integration (Two-Way Sync)

#### Read Operations (From Moodle)
- **Account Linking**: Connect your Moodle account
- **Course Sync**: View enrolled courses from Moodle
- **Assignment Tracking**: See pending assignments and deadlines
- **Grade Access**: View your grades across all courses
- **Calendar Integration**: Upcoming events and deadlines
- **Forum Discussions**: View course forum discussions
- **Course Participants**: Find classmates from Moodle courses
- **Notifications**: Get Moodle notifications

#### Write Operations (To Moodle)
- **Assignment Submission**: Submit assignments directly from the platform
- **Forum Posting**: Create and reply to forum discussions
- **Messaging**: Send messages to Moodle users
- **Calendar Events**: Create personal calendar events
- **Self-Enrollment**: Enroll in courses with self-enrollment enabled
- **Activity Completion**: Mark activities as complete
- **Notification Management**: Mark notifications as read

### Real-Time Features
- **Live Comments**: See comments appear in real-time on posts
- **Live Likes**: Watch like counts update instantly
- **Live Notifications**: Get notified instantly for all activities
- **Online Status**: See who's online in real-time
- **Typing Indicators**: Know when someone is typing in chat
- **Live Messages**: Real-time chat experience

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

### Frontend
- **React 18** - UI library
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **Socket.io-client** - Real-time updates
- **React Icons** - Icon library
- **date-fns** - Date formatting

## 📁 Project Structure

```
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── friendController.js
│   │   ├── messageController.js
│   │   ├── moodleController.js
│   │   ├── notificationController.js
│   │   └── searchController.js
│   ├── middleware/      # Auth & validation middleware
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── routes/          # API routes
│   ├── services/        # External service integrations
│   │   └── moodleService.js  # Two-way Moodle sync
│   └── server.js        # Entry point with Socket.io
│
├── frontend/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # Reusable components
│       │   ├── Layout/  # Navbar, Sidebar
│       │   ├── Post/    # Post components
│       │   └── Common/  # Shared components
│       ├── context/     # React Context providers
│       │   ├── AuthContext.js
│       │   └── SocketContext.js  # Real-time state
│       ├── pages/       # Page components
│       │   ├── Home.js
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Profile.js
│       │   ├── Friends.js
│       │   ├── Messages.js
│       │   ├── Moodle.js
│       │   ├── Settings.js
│       │   ├── Search.js
│       │   └── Notifications.js
│       ├── services/    # API services
│       └── styles/      # Global styles
│
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Node.js (v18 or higher)
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

3. Create `.env` file based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/social_moodle
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:3000
MOODLE_URL=https://your-moodle-instance.com
MOODLE_TOKEN=your_moodle_token
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/change-password` | Change password |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users/search` | Search users |
| POST | `/api/users/:id/follow` | Follow user |
| DELETE | `/api/users/:id/follow` | Unfollow user |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/feed` | Get news feed |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/:id` | Get single post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/like` | Like/unlike post |
| POST | `/api/posts/:id/comments` | Add comment |

### Friends
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/friends` | Get friends list |
| GET | `/api/friends/requests` | Get friend requests |
| POST | `/api/friends/request/:id` | Send friend request |
| POST | `/api/friends/accept/:id` | Accept request |
| POST | `/api/friends/reject/:id` | Reject request |
| DELETE | `/api/friends/:id` | Remove friend |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get conversations |
| GET | `/api/messages/conversation/:userId` | Get chat |
| POST | `/api/messages` | Send message |

### Moodle Integration

#### Read Operations (From Moodle)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/moodle/status` | Get connection status |
| POST | `/api/moodle/connect` | Connect Moodle account |
| DELETE | `/api/moodle/disconnect` | Disconnect Moodle |
| GET | `/api/moodle/courses` | Get enrolled courses |
| GET | `/api/moodle/courses/:id` | Get course content |
| GET | `/api/moodle/courses/:id/participants` | Get course participants |
| GET | `/api/moodle/courses/:id/completion` | Get completion status |
| GET | `/api/moodle/grades` | Get grades |
| GET | `/api/moodle/assignments` | Get assignments |
| GET | `/api/moodle/assignments/:id/status` | Get submission status |
| GET | `/api/moodle/calendar` | Get calendar events |
| GET | `/api/moodle/notifications` | Get Moodle notifications |
| GET | `/api/moodle/forums/:id/discussions` | Get forum discussions |

#### Write Operations (To Moodle)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/moodle/assignments/:id/submit` | Submit assignment |
| POST | `/api/moodle/forums/:id/discussion` | Create forum discussion |
| POST | `/api/moodle/forums/posts/:id/reply` | Reply to forum post |
| POST | `/api/moodle/messages` | Send Moodle message |
| PUT | `/api/moodle/messages/read` | Mark messages read |
| POST | `/api/moodle/calendar/events` | Create calendar event |
| DELETE | `/api/moodle/calendar/events/:id` | Delete calendar event |
| PUT | `/api/moodle/notifications/read` | Mark notifications read |
| POST | `/api/moodle/courses/:id/enroll` | Self-enroll in course |
| POST | `/api/moodle/activities/:id/complete` | Mark activity complete |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/unread/count` | Get unread count |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read/all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |
| DELETE | `/api/notifications` | Delete all |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Global search |
| GET | `/api/search/suggestions` | Autocomplete |
| GET | `/api/search/hashtag/:tag` | Search by hashtag |
| GET | `/api/search/trending` | Get trending hashtags |

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Protected routes
- CORS configuration
- Rate limiting ready

## 🎨 UI Features

- Responsive design
- Modern gradient aesthetics
- Real-time updates
- Loading states
- Empty states
- Error handling
- Toast notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Moodle for their comprehensive Web Services API
- React community for amazing tools
- Socket.io for real-time capabilities
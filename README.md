# MERN Social Network with Moodle Integration

A full-stack educational social networking platform built on the MERN stack (MongoDB, Express.js, React, Node.js) that seamlessly integrates with Moodle LMS (Learning Management System).

## 🎯 Project Overview

This platform bridges the gap between traditional e-learning and social collaboration, creating an engaging environment where students, educators, and institutions can connect, share knowledge, and enhance the learning experience beyond the classroom.

## ✨ Key Features

### Social Networking Core
- **User Profiles**: Academic profiles displaying courses, achievements, skills, and activity
- **News Feed**: Algorithmic feed showing posts from connections, enrolled courses, and followed topics
- **Connections**: Friend/follow system with academic networking capabilities
- **Messaging**: Real-time direct and group messaging with Socket.io
- **Groups**: Public/private groups for study sessions, project collaboration
- **Posts & Interactions**: Rich media posts with comments, reactions, sharing, and tagging

### Two-Way Moodle Integration

#### Data Flow: Moodle → Social Platform
- **Single Sign-On (SSO)**: Authenticate using Moodle credentials
- **Course Sync**: Automatic import of enrolled courses
- **User Profile Import**: Pull user data, roles, and profile information
- **Assignment & Deadline Sync**: Import assignments, quizzes, and due dates
- **Grade Retrieval**: Display grades synced from Moodle gradebook
- **Calendar Import**: Pull Moodle events into unified calendar view

#### Data Flow: Social Platform → Moodle
- **Discussion Posts to Forums**: Publish selected posts to Moodle course forums
- **Assignment Submissions**: Submit assignments through the platform, synced to Moodle
- **Calendar Events**: Create events that sync to Moodle calendar
- **User Profile Updates**: Profile changes reflect in Moodle

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js with Redux for state management |
| **Backend** | Node.js with Express.js REST API |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT tokens + Moodle OAuth2/Web Services |
| **Real-time** | Socket.io for live messaging and notifications |
| **Moodle Integration** | Moodle Web Services API with bidirectional sync |

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Moodle instance with Web Services enabled
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/PTiming/random.git
cd random
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mern-moodle
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
MOODLE_URL=https://your-moodle-instance.com
MOODLE_WS_TOKEN=your-moodle-web-service-token
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Start MongoDB

```bash
# Make sure MongoDB is running
mongod
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
random/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/          # MongoDB models
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Post.js
│   │   ├── Group.js
│   │   └── Message.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── courses.js
│   │   ├── posts.js
│   │   ├── messages.js
│   │   ├── groups.js
│   │   └── moodle.js
│   ├── services/        # Business logic
│   │   └── moodleService.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── server.js        # Express server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   │   ├── Navbar.jsx
    │   │   ├── PostCreate.jsx
    │   │   └── PostCard.jsx
    │   ├── pages/       # Page components
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Feed.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Courses.jsx
    │   │   ├── Messages.jsx
    │   │   └── Groups.jsx
    │   ├── services/    # API services
    │   │   ├── api.js
    │   │   └── socket.js
    │   ├── store/       # Redux store
    │   │   ├── store.js
    │   │   ├── authSlice.js
    │   │   └── postsSlice.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🔐 User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Full social features, view grades, join course communities, submit assignments |
| **Instructor** | All student features + create announcements, moderate course groups, push content to Moodle |
| **Admin** | Platform management, user moderation, Moodle connection configuration |
| **Institution Admin** | Multi-tenant management, branding customization, compliance settings |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with local credentials
- `POST /api/auth/moodle-login` - Login with Moodle SSO
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/me` - Update profile
- `POST /api/users/:id/connect` - Add connection
- `DELETE /api/users/:id/connect` - Remove connection
- `GET /api/users` - Search users

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Instructor/Admin)
- `POST /api/courses/:id/enroll` - Enroll in course
- `DELETE /api/courses/:id/enroll` - Unenroll from course

### Posts
- `GET /api/posts/feed` - Get news feed
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment
- `POST /api/posts/:id/react` - Add reaction

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/user/:userId` - Get messages with user
- `POST /api/messages` - Send message
- `PATCH /api/messages/:id/read` - Mark as read

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group
- `POST /api/groups/:id/join` - Join group
- `DELETE /api/groups/:id/leave` - Leave group

### Moodle Integration
- `POST /api/moodle/sync/user` - Sync user from Moodle
- `POST /api/moodle/sync/course/:moodleCourseId` - Sync course
- `GET /api/moodle/courses` - Get user's Moodle courses
- `GET /api/moodle/grades/:courseId` - Get grades
- `GET /api/moodle/calendar` - Get calendar events
- `POST /api/moodle/assignment/:assignmentId/submit` - Submit assignment

## 🔧 Configuration

### Moodle Setup

1. **Enable Web Services** in Moodle:
   - Site administration → Advanced features → Enable web services
   
2. **Create Web Service**:
   - Site administration → Server → Web services → Manage services
   - Add a new service and enable required functions

3. **Generate Token**:
   - Site administration → Server → Web services → Manage tokens
   - Create token for the service

4. **Required Moodle Functions**:
   - core_user_get_users_by_field
   - core_enrol_get_users_courses
   - core_course_get_courses
   - core_enrol_get_enrolled_users
   - mod_assign_get_assignments
   - gradereport_user_get_grade_items
   - mod_forum_get_forum_discussions
   - mod_forum_add_discussion
   - core_calendar_get_calendar_events
   - core_calendar_create_calendar_events

### Sync Settings

Users can configure synchronization in their profile:
- **Sync Frequency**: Real-time, hourly, daily, manual
- **Sync Direction**: Moodle-only, Platform-only, Bidirectional
- **Auto-sync**: Enable/disable automatic synchronization

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
NODE_ENV=production npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-domain.com
MOODLE_URL=https://your-moodle-instance.com
MOODLE_WS_TOKEN=your-production-token
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🛣️ Roadmap

- [ ] Mobile apps (React Native)
- [ ] Video conferencing integration
- [ ] AI-powered study recommendations
- [ ] Learning analytics dashboard
- [ ] Integration with Canvas, Blackboard
- [ ] Plagiarism detection
- [ ] Progressive Web App (PWA) support

## 📞 Support

For support, email support@example.com or join our Slack channel.

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Moodle community for comprehensive API documentation
- All contributors who have helped shape this project
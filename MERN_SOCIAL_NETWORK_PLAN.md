# MERN Social Network with Moodle Integration - Project Plan

## 1. Project Overview

A social networking platform built with the MERN stack (MongoDB, Express.js, React, Node.js) that integrates with Moodle LMS (Learning Management System) to provide a collaborative learning environment for students and educators.

### Vision
Create a seamless bridge between social interaction and academic learning, allowing users to connect, share knowledge, and access their Moodle courses within a unified platform.

---

## 2. Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18+ | UI Library |
| Redux Toolkit | State Management |
| React Router v6 | Client-side Routing |
| Axios | HTTP Client |
| Socket.io-client | Real-time Communication |
| Material-UI / Tailwind CSS | UI Components & Styling |
| React Query | Server State Management |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 18+ | Runtime Environment |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| Socket.io | Real-time Server |
| JWT | Authentication |
| Passport.js | OAuth & Auth Strategies |
| Bull | Job Queue (for notifications) |
| Redis | Caching & Session Store |

### Moodle Integration
| Technology | Purpose |
|------------|---------|
| Moodle Web Services API | Course & User Data |
| OAuth 2.0 | Moodle Authentication |
| LTI (Learning Tools Interoperability) | Deep Integration |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local Development |
| Jest | Testing |
| ESLint & Prettier | Code Quality |
| GitHub Actions | CI/CD |

---

## 3. Core Features

### 3.1 User Management
- [ ] User registration (email/password)
- [ ] OAuth login (Google, GitHub)
- [ ] Moodle SSO (Single Sign-On) integration
- [ ] User profiles with customizable avatars
- [ ] Role-based access control (Student, Instructor, Admin)
- [ ] Email verification
- [ ] Password reset functionality

### 3.2 Social Features
- [ ] News feed with posts (text, images, links)
- [ ] Like, comment, and share functionality
- [ ] Follow/unfollow users
- [ ] Friend requests and connections
- [ ] User mentions (@username)
- [ ] Hashtag support and trending topics
- [ ] Content bookmarking

### 3.3 Messaging & Communication
- [ ] Real-time private messaging (1-to-1)
- [ ] Group chats
- [ ] Online/offline status indicators
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Push notifications

### 3.4 Groups & Communities
- [ ] Create public/private groups
- [ ] Group posts and discussions
- [ ] Group admin and moderation tools
- [ ] Course-linked groups (auto-created from Moodle)
- [ ] Group events and announcements

### 3.5 Moodle Integration Features
- [ ] Sync enrolled courses from Moodle
- [ ] Display course deadlines and assignments
- [ ] Course activity feed integration
- [ ] Grade notifications
- [ ] Discussion forum sync
- [ ] Resource sharing from Moodle courses
- [ ] Study group creation for courses
- [ ] Quiz/assignment reminders

### 3.6 Notifications
- [ ] In-app notifications
- [ ] Email notifications (configurable)
- [ ] Push notifications (web/mobile)
- [ ] Moodle event notifications (deadlines, grades)

### 3.7 Search & Discovery
- [ ] User search
- [ ] Post search
- [ ] Group search
- [ ] Course search
- [ ] Advanced filters

### 3.8 Admin Dashboard
- [ ] User management
- [ ] Content moderation
- [ ] Analytics and reporting
- [ ] System configuration
- [ ] Moodle connection settings

---

## 4. Database Schema Design

### 4.1 User Schema
```javascript
const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  avatar: { type: String },
  bio: { type: String, maxLength: 500 },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  
  // Moodle Integration
  moodleUserId: { type: String },
  moodleToken: { type: String },
  moodleConnected: { type: Boolean, default: false },
  
  // Social
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  // Settings
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    moodleAlerts: { type: Boolean, default: true }
  },
  
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastActive: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 4.2 Post Schema
```javascript
const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, maxLength: 5000 },
  media: [{
    type: { type: String, enum: ['image', 'video', 'link'] },
    url: String,
    thumbnail: String
  }],
  
  // Engagement
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  shares: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  // Visibility
  visibility: { type: String, enum: ['public', 'friends', 'private', 'group'], default: 'public' },
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  
  // Moodle Reference
  moodleCourseId: { type: String },
  moodleActivityType: { type: String },
  
  hashtags: [String],
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  isEdited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 4.3 Group Schema
```javascript
const GroupSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String },
  privacy: { type: String, enum: ['public', 'private', 'secret'], default: 'public' },
  
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  pendingRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  // Moodle Course Link
  moodleCourseId: { type: String },
  moodleCourseName: { type: String },
  isMoodleSynced: { type: Boolean, default: false },
  
  rules: [String],
  tags: [String],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 4.4 Message Schema
```javascript
const MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  media: [{
    type: { type: String },
    url: String
  }],
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const ConversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: false },
  groupName: String,
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 4.5 MoodleCourse Schema (Cached)
```javascript
const MoodleCourseSchema = new Schema({
  moodleId: { type: String, required: true, unique: true },
  shortName: { type: String },
  fullName: { type: String },
  summary: { type: String },
  category: { type: String },
  
  enrolledUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  linkedGroup: { type: Schema.Types.ObjectId, ref: 'Group' },
  
  assignments: [{
    moodleId: String,
    name: String,
    dueDate: Date,
    description: String
  }],
  
  lastSynced: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
```

---

## 5. API Endpoints

### 5.1 Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
POST   /api/auth/refresh-token     - Refresh JWT token
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
GET    /api/auth/verify/:token     - Verify email
GET    /api/auth/moodle            - Initiate Moodle OAuth
GET    /api/auth/moodle/callback   - Moodle OAuth callback
```

### 5.2 Users
```
GET    /api/users                  - Get all users (paginated)
GET    /api/users/:id              - Get user by ID
GET    /api/users/:id/profile      - Get user profile
PUT    /api/users/:id              - Update user
DELETE /api/users/:id              - Delete user
POST   /api/users/:id/follow       - Follow user
POST   /api/users/:id/unfollow     - Unfollow user
GET    /api/users/:id/followers    - Get followers
GET    /api/users/:id/following    - Get following
POST   /api/users/:id/friend-request - Send friend request
```

### 5.3 Posts
```
GET    /api/posts                  - Get feed posts
POST   /api/posts                  - Create post
GET    /api/posts/:id              - Get post by ID
PUT    /api/posts/:id              - Update post
DELETE /api/posts/:id              - Delete post
POST   /api/posts/:id/like         - Like post
POST   /api/posts/:id/unlike       - Unlike post
POST   /api/posts/:id/share        - Share post
GET    /api/posts/:id/comments     - Get post comments
POST   /api/posts/:id/comments     - Add comment
```

### 5.4 Groups
```
GET    /api/groups                 - Get all groups
POST   /api/groups                 - Create group
GET    /api/groups/:id             - Get group by ID
PUT    /api/groups/:id             - Update group
DELETE /api/groups/:id             - Delete group
POST   /api/groups/:id/join        - Join group
POST   /api/groups/:id/leave       - Leave group
GET    /api/groups/:id/members     - Get group members
GET    /api/groups/:id/posts       - Get group posts
POST   /api/groups/:id/posts       - Create group post
```

### 5.5 Messages
```
GET    /api/conversations          - Get user conversations
POST   /api/conversations          - Create conversation
GET    /api/conversations/:id      - Get conversation
GET    /api/conversations/:id/messages - Get messages
POST   /api/conversations/:id/messages - Send message
PUT    /api/messages/:id/read      - Mark as read
```

### 5.6 Moodle Integration
```
GET    /api/moodle/connect         - Connect Moodle account
DELETE /api/moodle/disconnect      - Disconnect Moodle
GET    /api/moodle/courses         - Get enrolled courses
GET    /api/moodle/courses/:id     - Get course details
GET    /api/moodle/assignments     - Get all assignments
GET    /api/moodle/deadlines       - Get upcoming deadlines
POST   /api/moodle/sync            - Force sync with Moodle
GET    /api/moodle/grades          - Get grades overview
```

### 5.7 Notifications
```
GET    /api/notifications          - Get notifications
PUT    /api/notifications/:id/read - Mark as read
PUT    /api/notifications/read-all - Mark all as read
DELETE /api/notifications/:id      - Delete notification
```

### 5.8 Search
```
GET    /api/search/users           - Search users
GET    /api/search/posts           - Search posts
GET    /api/search/groups          - Search groups
GET    /api/search/hashtags        - Search hashtags
GET    /api/search/all             - Global search
```

---

## 6. Moodle Integration Architecture

### 6.1 Integration Methods

#### Web Services API
Moodle provides REST/JSON web services that we'll use for:
- User authentication and SSO
- Course enrollment data
- Assignment and deadline information
- Grade retrieval
- Discussion forum sync

#### Required Moodle Web Services Functions
```
core_webservice_get_site_info
core_user_get_users_by_field
core_enrol_get_users_courses
core_course_get_courses
mod_assign_get_assignments
mod_assign_get_grades
mod_forum_get_forums
mod_forum_get_forum_discussions
gradereport_user_get_grades_table
```

### 6.2 Authentication Flow
```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Backend │────▶│  Moodle  │
│  (React) │     │ (Node.js)│     │   LMS    │
└──────────┘     └──────────┘     └──────────┘
     │                │                 │
     │ 1. Click      │                 │
     │   "Connect    │                 │
     │    Moodle"    │                 │
     │──────────────▶│                 │
     │               │ 2. Redirect to  │
     │               │    Moodle OAuth │
     │               │────────────────▶│
     │               │                 │
     │               │ 3. User Login   │
     │               │◀────────────────│
     │               │                 │
     │               │ 4. Auth Code    │
     │◀──────────────│◀────────────────│
     │               │                 │
     │               │ 5. Exchange for │
     │               │    Token        │
     │               │────────────────▶│
     │               │                 │
     │               │ 6. Access Token │
     │               │◀────────────────│
     │               │                 │
     │ 7. Connected  │                 │
     │◀──────────────│                 │
```

### 6.3 Sync Strategy
- **Real-time**: Webhook-based for grade updates (if supported)
- **Scheduled**: Cron jobs for course sync (every 6 hours)
- **On-demand**: User-triggered sync for immediate updates
- **Cached**: Local MongoDB cache for performance

---

## 7. Project Structure

```
mern-social-moodle/
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Images, fonts
│   │   ├── components/        # Reusable components
│   │   │   ├── common/
│   │   │   ├── feed/
│   │   │   ├── messaging/
│   │   │   ├── moodle/
│   │   │   └── profile/
│   │   ├── features/          # Redux slices
│   │   │   ├── auth/
│   │   │   ├── posts/
│   │   │   ├── users/
│   │   │   ├── groups/
│   │   │   ├── messages/
│   │   │   └── moodle/
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── utils/             # Helper functions
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                     # Node.js Backend
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   │   ├── auth/
│   │   │   ├── moodle/        # Moodle integration
│   │   │   └── notification/
│   │   ├── utils/             # Utilities
│   │   ├── validators/        # Input validation
│   │   └── app.js
│   ├── tests/                 # Tests
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 8. Development Phases

### Phase 1: Foundation (Weeks 1-3)
- [x] Project setup and architecture design
- [ ] Database schema implementation
- [ ] User authentication (JWT, OAuth)
- [ ] Basic API structure
- [ ] React app scaffolding
- [ ] Redux store setup

### Phase 2: Core Social Features (Weeks 4-6)
- [ ] User profiles
- [ ] News feed
- [ ] Posts (CRUD)
- [ ] Likes and comments
- [ ] Follow system
- [ ] Basic search

### Phase 3: Messaging & Groups (Weeks 7-9)
- [ ] Real-time messaging with Socket.io
- [ ] Conversations UI
- [ ] Group creation and management
- [ ] Group posts
- [ ] Notifications system

### Phase 4: Moodle Integration (Weeks 10-12)
- [ ] Moodle OAuth setup
- [ ] Course sync service
- [ ] Assignment/deadline display
- [ ] Grade notifications
- [ ] Course-linked groups
- [ ] Moodle activity feed

### Phase 5: Polish & Launch (Weeks 13-14)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Security audit
- [ ] Testing and bug fixes
- [ ] Documentation
- [ ] Deployment setup

---

## 9. Environment Configuration

### Required Environment Variables
```env
# Server
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social_moodle
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Moodle Integration
MOODLE_URL=https://your-moodle-instance.com
MOODLE_TOKEN=your_moodle_web_service_token
MOODLE_CLIENT_ID=your_oauth_client_id
MOODLE_CLIENT_SECRET=your_oauth_client_secret

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email Service
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@socialnetwork.com

# File Upload
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Client
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 10. Security Considerations

### Authentication & Authorization
- JWT with refresh tokens
- Password hashing with bcrypt (12 salt rounds)
- Rate limiting on authentication endpoints
- Account lockout after failed attempts

### Data Protection
- Input validation and sanitization
- XSS prevention
- CSRF protection
- SQL injection prevention (parameterized queries)
- Secure HTTP headers (helmet.js)

### Moodle Security
- Secure token storage (encrypted at rest)
- Token refresh mechanism
- Minimal scope permissions
- Audit logging for Moodle API calls

### API Security
- CORS configuration
- Request rate limiting
- API versioning
- Input size limits

---

## 11. Testing Strategy

### Unit Tests
- Model validation
- Service logic
- Utility functions
- React components

### Integration Tests
- API endpoints
- Database operations
- Moodle API integration
- Authentication flows

### E2E Tests
- User registration/login
- Post creation flow
- Messaging flow
- Moodle connection flow

### Tools
- Jest (unit/integration)
- React Testing Library
- Supertest (API testing)
- Cypress (E2E)

---

## 12. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Load Balancer                         │
│                         (Nginx/AWS ALB)                      │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │    │   Backend    │    │   Socket     │
│   (React)    │    │   (Node.js)  │    │   Server     │
│   CDN/S3     │    │   Container  │    │   Container  │
└──────────────┘    └──────────────┘    └──────────────┘
                             │                    │
                    ┌────────┴────────┬───────────┘
                    │                 │
                    ▼                 ▼
           ┌──────────────┐  ┌──────────────┐
           │   MongoDB    │  │    Redis     │
           │   Atlas      │  │   Cluster    │
           └──────────────┘  └──────────────┘
                    │
                    ▼
           ┌──────────────┐
           │    Moodle    │
           │     LMS      │
           └──────────────┘
```

### Recommended Services
- **Hosting**: AWS, DigitalOcean, or Vercel (frontend)
- **Database**: MongoDB Atlas
- **Cache**: Redis Labs or AWS ElastiCache
- **CDN**: Cloudflare or AWS CloudFront
- **File Storage**: AWS S3 or Cloudinary
- **CI/CD**: GitHub Actions

---

## 13. Estimated Timeline & Resources

| Phase | Duration | Resources |
|-------|----------|-----------|
| Phase 1: Foundation | 3 weeks | 2 Full-stack developers |
| Phase 2: Social Features | 3 weeks | 2 Full-stack developers |
| Phase 3: Messaging & Groups | 3 weeks | 2 Full-stack developers |
| Phase 4: Moodle Integration | 3 weeks | 2 Full-stack + 1 Integration specialist |
| Phase 5: Polish & Launch | 2 weeks | Full team |

**Total Estimated Duration**: 14 weeks (3.5 months)

---

## 14. Future Enhancements

- Mobile applications (React Native)
- Video calling integration
- AI-powered content recommendations
- Advanced analytics dashboard
- Multi-language support (i18n)
- Gamification features (badges, points)
- File sharing and collaboration tools
- Calendar integration
- Third-party LMS support (Canvas, Blackboard)

---

## 15. Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- npm or yarn
- Access to a Moodle instance with Web Services enabled

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd mern-social-moodle

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-30 | Planning Team | Initial planning document |

---

*This document serves as a comprehensive planning guide for the MERN Social Network with Moodle Integration project. It should be updated as requirements evolve and development progresses.*

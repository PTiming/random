# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Frontend (Port 3000)                  │   │
│  │  • Redux State Management                                │   │
│  │  • React Router for Navigation                           │   │
│  │  • Socket.io Client for Real-time Features              │   │
│  │  • Axios for HTTP Requests                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Express.js Backend (Port 5000)                │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Routes Layer (REST API Endpoints)                 │  │   │
│  │  │  • /api/auth    • /api/posts                       │  │   │
│  │  │  • /api/courses • /api/groups                      │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Controllers (Business Logic)                      │  │   │
│  │  │  • authController  • postController                │  │   │
│  │  │  • courseController                                │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Middleware                                        │  │   │
│  │  │  • Authentication (JWT)                            │  │   │
│  │  │  • Authorization (RBAC)                            │  │   │
│  │  │  • Error Handling                                  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Services                                          │  │   │
│  │  │  • Moodle Connector                                │  │   │
│  │  │  • Sync Engine                                     │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Socket.io Server                            │   │
│  │  • Real-time Messaging                                   │   │
│  │  • Live Notifications                                    │   │
│  │  • Typing Indicators                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MongoDB Database                            │   │
│  │  Collections:                                            │   │
│  │  • users        • courses      • posts                   │   │
│  │  • groups       • messages     • assignments             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATION                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Moodle LMS Instance                         │   │
│  │  • Web Services API (REST)                               │   │
│  │  • OAuth2 Authentication                                 │   │
│  │  • Webhooks (optional)                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Authentication Flow

#### Standard Login
```
User → Frontend → POST /api/auth/login → Backend
                                         ↓
                              Validate credentials
                                         ↓
                              Generate JWT Token
                                         ↓
                              Return user + token
                                         ↓
Frontend ← Store in localStorage ← Backend
```

#### Moodle SSO Login
```
User → Moodle → Authenticate → Get Token
                                    ↓
Frontend → POST /api/auth/moodle → Backend
                                    ↓
                         Verify with Moodle API
                                    ↓
                         Find/Create User in DB
                                    ↓
                         Generate JWT Token
                                    ↓
Frontend ← Return user + token ← Backend
```

### 2. Bidirectional Sync Flow

#### Moodle → Platform Sync
```
Sync Engine (Scheduled/Manual)
    ↓
Query Moodle API
    ↓
Get Courses/Assignments/Grades
    ↓
Compare with MongoDB Data
    ↓
Identify Changes
    ↓
Update/Create Records in MongoDB
    ↓
Log Sync Operations
```

#### Platform → Moodle Sync
```
User Action (Post/Submit Assignment)
    ↓
Save to MongoDB
    ↓
Mark for Sync
    ↓
Sync Engine Detects Pending Items
    ↓
Call Moodle API (Create Forum Post/Submit Assignment)
    ↓
Update Moodle IDs in MongoDB
    ↓
Mark as Synced
```

#### Webhook-based Real-time Sync
```
Moodle Event (New Assignment/Grade)
    ↓
Webhook Trigger → POST /api/webhooks/moodle
    ↓
Sync Engine Handles Event
    ↓
Update MongoDB Immediately
    ↓
Notify Connected Users via Socket.io
```

### 3. Real-time Messaging Flow

```
User A Types Message → Frontend
                          ↓
                    emit('send_message')
                          ↓
                    Socket.io Server
                          ↓
                    Save to MongoDB
                          ↓
         Broadcast to conversation room
                          ↓
    User B ← emit('new_message') ← Socket.io
```

## Database Schema

### User Schema
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  moodleUserId: Number,
  moodleToken: String,
  firstName: String,
  lastName: String,
  role: Enum['student', 'instructor', 'admin'],
  enrolledCourses: [{
    courseId: ObjectId,
    moodleCourseId: Number,
    enrolledAt: Date
  }],
  syncSettings: {
    enabled: Boolean,
    direction: Enum,
    contentTypes: Object
  },
  timestamps: true
}
```

### Course Schema
```javascript
{
  _id: ObjectId,
  name: String,
  code: String,
  moodleCourseId: Number,
  instructor: ObjectId (ref: User),
  enrolledStudents: [{
    userId: ObjectId,
    enrolledAt: Date
  }],
  resources: Array,
  lastMoodleSync: Date,
  timestamps: true
}
```

### Post Schema
```javascript
{
  _id: ObjectId,
  author: ObjectId (ref: User),
  content: String,
  course: ObjectId (ref: Course),
  moodleForumId: Number,
  moodlePostId: Number,
  syncedToMoodle: Boolean,
  likes: [{ user: ObjectId, createdAt: Date }],
  comments: [{ user: ObjectId, content: String }],
  timestamps: true
}
```

## API Architecture

### RESTful Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/moodle` - Login with Moodle SSO
- `GET /api/auth/me` - Get current user (Protected)

#### Posts
- `GET /api/posts/feed` - Get news feed (Protected)
- `POST /api/posts` - Create post (Protected)
- `PUT /api/posts/:id/like` - Like/unlike post (Protected)
- `POST /api/posts/:id/comment` - Add comment (Protected)
- `POST /api/posts/:id/sync-to-moodle` - Sync to Moodle (Protected)

#### Courses
- `GET /api/courses` - Get all courses (Protected)
- `GET /api/courses/:id` - Get course details (Protected)
- `POST /api/courses/sync-from-moodle` - Sync courses (Protected)

### WebSocket Events

#### Client → Server
- `join` - Join user's personal room
- `join_conversation` - Join a conversation room
- `send_message` - Send a message
- `typing` - Typing indicator

#### Server → Client
- `new_message` - New message received
- `user_typing` - User is typing
- `notification` - New notification

## Security Architecture

### Authentication & Authorization

1. **JWT-based Authentication**
   - Token stored in localStorage
   - Sent in Authorization header: `Bearer <token>`
   - Token contains user ID and role
   - Validated by auth middleware

2. **Role-Based Access Control (RBAC)**
   ```javascript
   Student → Can view, create posts, enroll
   Instructor → Student + moderate, grade
   Admin → Instructor + user management, sync config
   ```

3. **Password Security**
   - Bcrypt hashing (10 rounds)
   - No plain-text storage
   - Password validation on registration

4. **Moodle Integration Security**
   - Tokens stored encrypted
   - Separate auth tokens for each integration
   - Token rotation capability

### Data Security

1. **Input Validation**
   - Sanitize all user inputs
   - Mongoose schema validation
   - Express validator middleware

2. **CORS Configuration**
   - Whitelist allowed origins
   - Credentials support for cookies
   - Restricted methods

3. **Rate Limiting**
   - API endpoint throttling
   - Login attempt limits
   - Sync operation queuing

## Scalability Considerations

### Horizontal Scaling

1. **Stateless Backend**
   - JWT tokens (no session storage)
   - MongoDB for persistent data
   - Can run multiple backend instances

2. **Load Balancing**
   - Nginx/HAProxy for distribution
   - Round-robin or least-connections
   - Health check endpoints

3. **Database Scaling**
   - MongoDB replica sets
   - Read replicas for queries
   - Sharding for large datasets

### Vertical Scaling

1. **Caching Layer**
   - Redis for frequently accessed data
   - Course data caching
   - User session caching

2. **CDN Integration**
   - Static asset delivery
   - Media file hosting
   - Reduced server load

## Technology Choices Rationale

### MERN Stack
- **MongoDB**: Flexible schema for evolving social features
- **Express.js**: Lightweight, fast, extensive middleware
- **React**: Component-based UI, excellent ecosystem
- **Node.js**: JavaScript everywhere, event-driven for real-time

### Socket.io
- Real-time bidirectional communication
- Fallback mechanisms for older browsers
- Room-based broadcasting

### Redux
- Centralized state management
- Predictable state updates
- DevTools for debugging

### Mongoose
- Schema validation
- Middleware hooks
- Population for relationships

## Performance Optimizations

1. **Database Indexing**
   ```javascript
   // User lookups
   userSchema.index({ email: 1 });
   userSchema.index({ moodleUserId: 1 });
   
   // Course queries
   courseSchema.index({ moodleCourseId: 1 });
   
   // Post feed
   postSchema.index({ createdAt: -1 });
   ```

2. **Pagination**
   - Limit results per page
   - Cursor-based for large datasets
   - Lazy loading on frontend

3. **Aggregation Pipelines**
   - Complex queries in MongoDB
   - Reduce application-level processing
   - Better performance than multiple queries

4. **Connection Pooling**
   - MongoDB connection pool
   - Reuse connections
   - Reduced latency

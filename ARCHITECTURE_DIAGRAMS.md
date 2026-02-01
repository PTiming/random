# Technical Architecture Diagrams Reference

This document provides text-based representations of key architecture diagrams you should create for your presentation slides.

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Single Page Application                │  │
│  │                                                            │  │
│  │  ├─ Components (Posts, Profile, Feed, Course)            │  │
│  │  ├─ Redux State Management                               │  │
│  │  ├─ React Router (Navigation)                            │  │
│  │  ├─ Socket.io Client (Real-time)                         │  │
│  │  └─ Axios HTTP Client                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↕                                  │
│                         HTTPS / WSS                             │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION TIER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Express.js API Server                     │    │
│  │                                                         │    │
│  │  ├─ Authentication Middleware (JWT)                    │    │
│  │  ├─ RESTful API Routes                                 │    │
│  │  ├─ Business Logic Controllers                         │    │
│  │  ├─ Socket.io Server (Real-time)                       │    │
│  │  └─ Moodle Integration Service                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                              ↕                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           Moodle Web Services API Client               │    │
│  │           (OAuth 2.0, REST API)                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                              ↕                                  │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                          DATA TIER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   MongoDB    │  │    Redis     │  │   File Storage       │  │
│  │  (Primary    │  │  (Sessions & │  │   (S3 / Local)       │  │
│  │   Database)  │  │   Caching)   │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                 ┌────────────────────────┐                      │
│                 │   Moodle LMS Server    │                      │
│                 │                        │                      │
│                 │  • OAuth 2.0 Provider  │                      │
│                 │  • Web Services API    │                      │
│                 │  • Course Data         │                      │
│                 │  • User Management     │                      │
│                 └────────────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Moodle Integration Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW (OAuth 2.0)                   │
└──────────────────────────────────────────────────────────────────────┘

User                 Social Network         Moodle LMS
 │                         │                      │
 │  1. Click "Login       │                      │
 │     with Moodle"       │                      │
 ├────────────────────────>│                      │
 │                         │                      │
 │                         │  2. Redirect to      │
 │                         │     Moodle OAuth     │
 │                         ├─────────────────────>│
 │                         │                      │
 │  3. Moodle Login Page   │                      │
 │<────────────────────────┼──────────────────────┤
 │                         │                      │
 │  4. Enter Credentials   │                      │
 ├─────────────────────────┼─────────────────────>│
 │                         │                      │
 │                         │  5. Authorization    │
 │                         │     Code             │
 │                         │<─────────────────────┤
 │                         │                      │
 │  6. Redirect with Code  │                      │
 │<────────────────────────┤                      │
 │                         │                      │
 │  7. Exchange Code       │  8. Request Token    │
 │                         ├─────────────────────>│
 │                         │                      │
 │                         │  9. Access Token +   │
 │                         │     Refresh Token    │
 │                         │<─────────────────────┤
 │                         │                      │
 │                         │  10. Request User    │
 │                         │      Profile         │
 │                         ├─────────────────────>│
 │                         │                      │
 │                         │  11. User Data       │
 │                         │<─────────────────────┤
 │                         │                      │
 │  12. JWT Token +        │                      │
 │      Session Created    │                      │
 │<────────────────────────┤                      │
 │                         │                      │
 │  13. Access Dashboard   │                      │
 │<────────────────────────┤                      │
 │                         │                      │
```

---

## 3. Data Synchronization Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                 DATA SYNCHRONIZATION FLOW                      │
└────────────────────────────────────────────────────────────────┘

Social Network DB                    Moodle Database
┌─────────────────┐                 ┌──────────────────┐
│                 │                 │                  │
│  Users          │◄────Sync────────│  mdl_user        │
│  Courses        │◄────Sync────────│  mdl_course      │
│  Enrollments    │◄────Sync────────│  mdl_enrol       │
│  Assignments    │◄────Sync────────│  mdl_assign      │
│  Grades (RO)    │◄────Read────────│  mdl_grade       │
│                 │                 │                  │
└─────────────────┘                 └──────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────────────────────────────────────────┐
│          Synchronization Service                    │
│                                                      │
│  1. Initial Sync (Full Data Load)                   │
│     ├─ Fetch all users from Moodle                  │
│     ├─ Fetch all courses                            │
│     ├─ Fetch enrollments                            │
│     └─ Store in MongoDB                             │
│                                                      │
│  2. Real-time Sync (Webhooks)                       │
│     ├─ User created/updated → Update local DB       │
│     ├─ Course created → Create course group         │
│     ├─ Enrollment changed → Update memberships      │
│     └─ Assignment created → Create notification     │
│                                                      │
│  3. Scheduled Sync (Cron Jobs)                      │
│     ├─ Daily: Full user sync                        │
│     ├─ Hourly: Course and enrollment sync           │
│     └─ Every 15 min: Assignment and grade sync      │
│                                                      │
│  4. Conflict Resolution                             │
│     ├─ Moodle is source of truth for academic data  │
│     ├─ Social network owns social data              │
│     └─ Last-write-wins for shared fields            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 4. Database Schema Design

```
┌──────────────────────────────────────────────────────────────────┐
│                     MongoDB Collections                          │
└──────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║                        USERS COLLECTION                        ║
╠═══════════════════════════════════════════════════════════════╣
║  {                                                             ║
║    _id: ObjectId,                                             ║
║    moodleId: String (indexed),                                ║
║    email: String (unique, indexed),                           ║
║    username: String (unique),                                 ║
║    password: String (hashed),                                 ║
║    profile: {                                                 ║
║      firstName: String,                                       ║
║      lastName: String,                                        ║
║      avatar: String,                                          ║
║      bio: String,                                             ║
║      department: String                                       ║
║    },                                                         ║
║    privacy: {                                                 ║
║      profileVisibility: String,                               ║
║      postVisibility: String                                   ║
║    },                                                         ║
║    createdAt: Date,                                           ║
║    updatedAt: Date                                            ║
║  }                                                            ║
╚═══════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════╗
║                        POSTS COLLECTION                        ║
╠═══════════════════════════════════════════════════════════════╣
║  {                                                             ║
║    _id: ObjectId,                                             ║
║    author: ObjectId (ref: Users),                             ║
║    content: String,                                           ║
║    media: [{                                                  ║
║      type: String,                                            ║
║      url: String                                              ║
║    }],                                                        ║
║    hashtags: [String],                                        ║
║    mentions: [ObjectId] (ref: Users),                         ║
║    courseId: ObjectId (ref: Courses),                         ║
║    visibility: String,                                        ║
║    likes: [ObjectId] (ref: Users),                            ║
║    likeCount: Number,                                         ║
║    commentCount: Number,                                      ║
║    createdAt: Date (indexed),                                 ║
║    updatedAt: Date                                            ║
║  }                                                            ║
╚═══════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════╗
║                      COMMENTS COLLECTION                       ║
╠═══════════════════════════════════════════════════════════════╣
║  {                                                             ║
║    _id: ObjectId,                                             ║
║    postId: ObjectId (ref: Posts, indexed),                    ║
║    author: ObjectId (ref: Users),                             ║
║    content: String,                                           ║
║    parentComment: ObjectId (ref: Comments),                   ║
║    likes: [ObjectId] (ref: Users),                            ║
║    createdAt: Date,                                           ║
║    updatedAt: Date                                            ║
║  }                                                            ║
╚═══════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════╗
║                     FRIENDSHIPS COLLECTION                     ║
╠═══════════════════════════════════════════════════════════════╣
║  {                                                             ║
║    _id: ObjectId,                                             ║
║    user1: ObjectId (ref: Users, indexed),                     ║
║    user2: ObjectId (ref: Users, indexed),                     ║
║    status: String, // pending, accepted, blocked              ║
║    initiator: ObjectId (ref: Users),                          ║
║    createdAt: Date,                                           ║
║    updatedAt: Date                                            ║
║  }                                                            ║
╚═══════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════╗
║                      COURSES COLLECTION                        ║
╠═══════════════════════════════════════════════════════════════╣
║  {                                                             ║
║    _id: ObjectId,                                             ║
║    moodleCourseId: Number (unique, indexed),                  ║
║    shortName: String,                                         ║
║    fullName: String,                                          ║
║    description: String,                                       ║
║    category: String,                                          ║
║    enrolledStudents: [ObjectId] (ref: Users),                 ║
║    instructors: [ObjectId] (ref: Users),                      ║
║    startDate: Date,                                           ║
║    endDate: Date,                                             ║
║    lastSyncedAt: Date,                                        ║
║    createdAt: Date                                            ║
║  }                                                            ║
╚═══════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════╗
║                    NOTIFICATIONS COLLECTION                    ║
╠═══════════════════════════════════════════════════════════════╣
║  {                                                             ║
║    _id: ObjectId,                                             ║
║    recipient: ObjectId (ref: Users, indexed),                 ║
║    sender: ObjectId (ref: Users),                             ║
║    type: String, // like, comment, friend_request, etc.       ║
║    relatedPost: ObjectId (ref: Posts),                        ║
║    relatedComment: ObjectId (ref: Comments),                  ║
║    message: String,                                           ║
║    read: Boolean (indexed),                                   ║
║    createdAt: Date (indexed)                                  ║
║  }                                                            ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 5. API Endpoint Structure

```
┌──────────────────────────────────────────────────────────────────┐
│                      RESTful API Endpoints                       │
└──────────────────────────────────────────────────────────────────┘

BASE URL: https://api.socialnetwork.edu

╔══════════════════════════════════════════════════════════════╗
║                    AUTHENTICATION ROUTES                      ║
╠══════════════════════════════════════════════════════════════╣
║  POST   /api/auth/register                                   ║
║  POST   /api/auth/login                                      ║
║  POST   /api/auth/logout                                     ║
║  POST   /api/auth/refresh-token                              ║
║  GET    /api/auth/moodle/login                               ║
║  GET    /api/auth/moodle/callback                            ║
║  POST   /api/auth/verify-email                               ║
║  POST   /api/auth/forgot-password                            ║
║  POST   /api/auth/reset-password                             ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                        USER ROUTES                            ║
╠══════════════════════════════════════════════════════════════╣
║  GET    /api/users/:id                                       ║
║  PUT    /api/users/:id                                       ║
║  DELETE /api/users/:id                                       ║
║  GET    /api/users/:id/posts                                 ║
║  GET    /api/users/:id/friends                               ║
║  GET    /api/users/search?q={query}                          ║
║  POST   /api/users/:id/avatar                                ║
║  PUT    /api/users/:id/privacy                               ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                        POST ROUTES                            ║
╠══════════════════════════════════════════════════════════════╣
║  GET    /api/posts                  (feed)                   ║
║  POST   /api/posts                  (create)                 ║
║  GET    /api/posts/:id                                       ║
║  PUT    /api/posts/:id                                       ║
║  DELETE /api/posts/:id                                       ║
║  POST   /api/posts/:id/like                                  ║
║  DELETE /api/posts/:id/like                                  ║
║  POST   /api/posts/:id/comments                              ║
║  GET    /api/posts/:id/comments                              ║
║  POST   /api/posts/:id/share                                 ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                      COMMENT ROUTES                           ║
╠══════════════════════════════════════════════════════════════╣
║  GET    /api/comments/:id                                    ║
║  PUT    /api/comments/:id                                    ║
║  DELETE /api/comments/:id                                    ║
║  POST   /api/comments/:id/like                               ║
║  POST   /api/comments/:id/reply                              ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                    FRIENDSHIP ROUTES                          ║
╠══════════════════════════════════════════════════════════════╣
║  POST   /api/friends/request                                 ║
║  POST   /api/friends/accept/:id                              ║
║  POST   /api/friends/reject/:id                              ║
║  DELETE /api/friends/:id                                     ║
║  GET    /api/friends/requests                                ║
║  GET    /api/friends/suggestions                             ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                       COURSE ROUTES                           ║
╠══════════════════════════════════════════════════════════════╣
║  GET    /api/courses                                         ║
║  GET    /api/courses/:id                                     ║
║  GET    /api/courses/:id/students                            ║
║  GET    /api/courses/:id/posts                               ║
║  GET    /api/courses/:id/assignments                         ║
║  POST   /api/courses/sync                                    ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                   NOTIFICATION ROUTES                         ║
╠══════════════════════════════════════════════════════════════╣
║  GET    /api/notifications                                   ║
║  PUT    /api/notifications/:id/read                          ║
║  PUT    /api/notifications/read-all                          ║
║  DELETE /api/notifications/:id                               ║
║  GET    /api/notifications/unread-count                      ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                      MOODLE ROUTES                            ║
╠══════════════════════════════════════════════════════════════╣
║  POST   /api/moodle/sync/users                               ║
║  POST   /api/moodle/sync/courses                             ║
║  POST   /api/moodle/sync/enrollments                         ║
║  GET    /api/moodle/calendar                                 ║
║  GET    /api/moodle/assignments/:courseId                    ║
║  POST   /api/moodle/webhook                                  ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 6. Real-Time Communication Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│              Socket.io Real-Time Architecture                    │
└──────────────────────────────────────────────────────────────────┘

Client Browser                     Server                    Redis
┌─────────────┐                 ┌──────────┐              ┌────────┐
│             │                 │          │              │        │
│  Socket.io  │◄───WebSocket───►│Socket.io │◄───Pub/Sub──►│ Redis  │
│   Client    │                 │  Server  │              │Adapter │
│             │                 │          │              │        │
└─────────────┘                 └──────────┘              └────────┘
                                     │
                                     │
                         ┌───────────┼───────────┐
                         │           │           │
                    ┌────▼────┐ ┌───▼────┐ ┌───▼────┐
                    │ Server  │ │ Server │ │ Server │
                    │    1    │ │    2   │ │    3   │
                    └─────────┘ └────────┘ └────────┘
                    (Horizontal Scaling with Redis)


Socket.io Namespaces and Rooms:

/notifications
  ├─ room: user_{userId}           (Personal notifications)
  └─ room: course_{courseId}       (Course notifications)

/feed
  ├─ room: user_{userId}           (Personal feed updates)
  └─ room: course_{courseId}       (Course feed updates)

/chat
  ├─ room: conversation_{convId}   (Direct messages)
  └─ room: group_{groupId}         (Group chats)


Event Types:

Client → Server:
  • join_room
  • leave_room
  • send_message
  • typing_start
  • typing_stop

Server → Client:
  • new_notification
  • new_post
  • new_comment
  • new_like
  • friend_online
  • friend_offline
  • assignment_reminder
```

---

## 7. Security Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Security Layers                               │
└──────────────────────────────────────────────────────────────────┘

Layer 1: Network Security
┌────────────────────────────────────────────────┐
│  • HTTPS/TLS Encryption                        │
│  • Firewall Rules                              │
│  • DDoS Protection                             │
│  • Rate Limiting (100 req/15min per IP)        │
└────────────────────────────────────────────────┘
                    ↓
Layer 2: Application Security
┌────────────────────────────────────────────────┐
│  • Helmet.js Security Headers                  │
│  • CORS Configuration                          │
│  • Content Security Policy                     │
│  • XSS Protection                              │
│  • SQL/NoSQL Injection Prevention              │
└────────────────────────────────────────────────┘
                    ↓
Layer 3: Authentication
┌────────────────────────────────────────────────┐
│  • OAuth 2.0 (Moodle Integration)              │
│  • JWT Tokens (Access + Refresh)               │
│  • Bcrypt Password Hashing (10 rounds)         │
│  • Session Management                          │
│  • Two-Factor Authentication (Future)          │
└────────────────────────────────────────────────┘
                    ↓
Layer 4: Authorization
┌────────────────────────────────────────────────┐
│  • Role-Based Access Control (RBAC)            │
│  • Resource-Level Permissions                  │
│  • Privacy Settings Enforcement                │
│  • Middleware Validation                       │
└────────────────────────────────────────────────┘
                    ↓
Layer 5: Data Security
┌────────────────────────────────────────────────┐
│  • Encryption at Rest                          │
│  • Encryption in Transit                       │
│  • Input Validation & Sanitization             │
│  • Output Encoding                             │
│  • Secure File Upload Handling                 │
└────────────────────────────────────────────────┘
                    ↓
Layer 6: Monitoring & Logging
┌────────────────────────────────────────────────┐
│  • Security Event Logging                      │
│  • Failed Login Attempt Tracking               │
│  • Suspicious Activity Detection               │
│  • Audit Trails                                │
└────────────────────────────────────────────────┘
```

---

## 8. Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   Production Deployment                          │
└──────────────────────────────────────────────────────────────────┘

                         Internet
                            │
                            ▼
                   ┌────────────────┐
                   │  Load Balancer │
                   │    (Nginx)     │
                   └────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         ┌────▼────┐   ┌───▼────┐   ┌───▼────┐
         │ Server  │   │ Server │   │ Server │
         │    1    │   │    2   │   │    3   │
         │         │   │        │   │        │
         │ Node.js │   │Node.js │   │Node.js │
         │ Express │   │Express │   │Express │
         │Socket.io│   │Socket.io   │Socket.io
         └────┬────┘   └───┬────┘   └───┬────┘
              │            │            │
              └────────────┼────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────▼────┐  ┌───▼────┐  ┌───▼────┐
         │ MongoDB │  │ Redis  │  │   S3   │
         │ Replica │  │Cluster │  │ Storage│
         │   Set   │  │        │  │        │
         └─────────┘  └────────┘  └────────┘

Container Orchestration (Docker + Kubernetes):

┌─────────────────────────────────────────────┐
│              Kubernetes Cluster             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        Frontend Deployment          │   │
│  │  ├─ React App (3 replicas)          │   │
│  │  └─ Nginx Serving Static Files      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        Backend Deployment           │   │
│  │  ├─ API Server (5 replicas)         │   │
│  │  └─ Auto-scaling (CPU > 70%)        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        Socket.io Deployment         │   │
│  │  ├─ WebSocket Server (3 replicas)   │   │
│  │  └─ Redis Adapter for Sync          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         StatefulSet                 │   │
│  │  ├─ MongoDB (3-node replica set)    │   │
│  │  └─ Redis (cluster mode)            │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘

CI/CD Pipeline:

Developer → Git Push → GitHub
                         │
                         ▼
              ┌──────────────────┐
              │  GitHub Actions  │
              │                  │
              │  1. Run Tests    │
              │  2. Build Docker │
              │  3. Push to ECR  │
              │  4. Deploy to K8s│
              └──────────────────┘
                         │
                         ▼
                  Production K8s
```

---

## Notes for Creating Visual Diagrams

When creating actual diagrams for your presentation:

1. **Tools to Use**:
   - Draw.io (diagrams.net) - Free and powerful
   - Lucidchart - Professional diagrams
   - Microsoft Visio - Enterprise standard
   - PowerPoint SmartArt - Quick and integrated

2. **Design Tips**:
   - Use consistent colors (e.g., blue for frontend, green for backend, orange for database)
   - Keep fonts large enough (min 18pt)
   - Use icons where appropriate
   - Avoid clutter - simplify complex diagrams
   - Add legends if using multiple colors/shapes

3. **Animation**:
   - Consider animating data flow in PowerPoint
   - Show step-by-step process with builds
   - Highlight current focus area

4. **Consistency**:
   - Use the same shapes for same concepts across diagrams
   - Maintain color scheme throughout
   - Use arrows consistently (solid for sync, dashed for async)

Good luck with your presentation!

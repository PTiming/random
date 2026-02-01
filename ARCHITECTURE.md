# Architecture Overview

## System Architecture

The MERN Social Network with Moodle Integration follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  (React.js + Redux + Socket.io Client)                  │
│  - User Interface                                        │
│  - State Management                                      │
│  - Real-time Communication                               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ HTTP/WebSocket
                  │
┌─────────────────▼───────────────────────────────────────┐
│                   Backend Layer                          │
│  (Node.js + Express.js + Socket.io)                     │
│  - REST API                                              │
│  - Authentication & Authorization                        │
│  - Business Logic                                        │
│  - Real-time Event Handling                              │
└─────────────────┬───────────────┬───────────────────────┘
                  │               │
         ┌────────▼──────┐   ┌───▼──────────────┐
         │   MongoDB     │   │  Moodle LMS      │
         │   Database    │   │  (External)      │
         │               │   │  Web Services    │
         └───────────────┘   └──────────────────┘
```

## Component Details

### Frontend (React Application)

**Technology**: React.js with Vite build tool

**Key Components**:
- **Pages**: Login, Register, Feed, Profile, Courses, Messages, Groups
- **Components**: Navbar, PostCard, PostCreate
- **State Management**: Redux Toolkit with slices for auth and posts
- **Services**: API client (axios) and Socket.io client

**Data Flow**:
1. User interacts with UI components
2. Components dispatch Redux actions
3. Actions make API calls via axios
4. Response updates Redux state
5. UI re-renders based on state changes

### Backend (Express Server)

**Technology**: Node.js with Express.js framework

**Architecture Layers**:

1. **Routes Layer** (`/routes`)
   - Endpoint definitions
   - Request validation
   - Route-level middleware

2. **Middleware Layer** (`/middleware`)
   - Authentication (JWT verification)
   - Role-based access control
   - Error handling

3. **Controller/Business Logic**
   - Request handling
   - Data processing
   - Response formatting

4. **Services Layer** (`/services`)
   - Moodle API integration
   - External API communications
   - Complex business logic

5. **Models Layer** (`/models`)
   - MongoDB schema definitions
   - Data validation rules
   - Virtual properties and methods

### Database (MongoDB)

**Collections**:

1. **users**
   - User profiles
   - Authentication data
   - Moodle integration fields
   - Preferences and settings

2. **courses**
   - Course information
   - Enrollment data
   - Assignments and resources
   - Moodle sync metadata

3. **posts**
   - User-generated content
   - Social interactions (likes, comments, shares)
   - Course/group associations
   - Moodle forum sync data

4. **groups**
   - Study group information
   - Membership data
   - Group resources

5. **messages**
   - Direct and group messages
   - Read receipts
   - File attachments

**Indexing Strategy**:
- User lookup by email, username, moodleId
- Course queries by instructor and enrolled students
- Post queries by author, course, timestamp
- Message queries by sender/recipient pairs

### Moodle Integration Service

**Communication Methods**:

1. **REST API Calls**
   - Synchronous data retrieval
   - User authentication
   - Data submission

2. **Webhook Listeners** (Future)
   - Real-time event notifications
   - Automatic sync triggers

**Key Functions**:

- `authenticateUser()`: Moodle SSO authentication
- `syncUserFromMoodle()`: Pull user data from Moodle
- `syncCourseFromMoodle()`: Import course information
- `getUserCourses()`: Fetch enrolled courses
- `getUserGrades()`: Retrieve grade data
- `submitAssignment()`: Push assignment submissions
- `createForumDiscussion()`: Post to Moodle forums

**Sync Engine**:

```javascript
┌─────────────────────────────────────────────────┐
│           Synchronization Engine                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐    ┌───────────────┐        │
│  │   Moodle     │◄──►│   Platform    │        │
│  │   Database   │    │   Database    │        │
│  └──────────────┘    └───────────────┘        │
│         │                     │                │
│         └─────────┬───────────┘                │
│                   │                            │
│          ┌────────▼────────┐                   │
│          │  Sync Manager   │                   │
│          │  - Scheduling   │                   │
│          │  - Conflict     │                   │
│          │    Resolution   │                   │
│          │  - Queue Mgmt   │                   │
│          └─────────────────┘                   │
└─────────────────────────────────────────────────┘
```

## Real-time Communication

**Socket.io Implementation**:

```javascript
Client                    Server
  │                         │
  ├─── connect ────────────►│
  │                         │
  │◄─── authenticated ──────┤
  │                         │
  ├─── join-room ──────────►│
  │                         │
  ├─── send-message ───────►│
  │                         │
  │                    ┌────┴────┐
  │                    │ Emit to │
  │                    │  Room   │
  │                    └────┬────┘
  │                         │
  │◄─── new-message ────────┤
  │                         │
```

**Events**:
- `connection`: Client connects to server
- `join-room`: User joins a chat room
- `send-message`: User sends a message
- `new-message`: Broadcast message to room
- `disconnect`: Client disconnects

## Security Architecture

### Authentication Flow

```
1. User Login Request
   ├─► Local Auth: Email + Password → Verify → Generate JWT
   └─► Moodle SSO: Username + Password → Moodle Auth → Generate JWT

2. Token Storage
   └─► JWT stored in localStorage (client)
       └─► Included in Authorization header for API requests

3. Token Verification
   └─► Middleware extracts token → Verify signature → Attach user to request
```

### Authorization

**Role-Based Access Control (RBAC)**:
- Students: Read/write posts, join courses, view grades
- Instructors: All student permissions + moderate, create courses
- Admins: All permissions + user management, system configuration

**Middleware Chain**:
```javascript
Request → auth middleware → checkRole(['instructor', 'admin']) → Route Handler
```

## Data Models

### User Model Relationships

```
User
├── courses (ref: Course[])
├── connections (ref: User[])
├── groups (ref: Group[])
├── followers (ref: User[])
└── following (ref: User[])
```

### Course Model Relationships

```
Course
├── instructor (ref: User)
├── additionalInstructors (ref: User[])
├── enrolledStudents (ref: User[])
├── posts (ref: Post[])
└── groups (ref: Group[])
```

## API Design Principles

1. **RESTful Conventions**
   - GET for retrieval
   - POST for creation
   - PATCH for updates
   - DELETE for removal

2. **Consistent Response Format**
   ```json
   {
     "data": {},
     "error": null,
     "message": "Success"
   }
   ```

3. **Pagination**
   - Query params: `page`, `limit`
   - Response includes: `page`, `hasMore`

4. **Error Handling**
   - Centralized error handler
   - Consistent error codes
   - Descriptive error messages

## Scalability Considerations

### Current Architecture
- Monolithic backend
- Single MongoDB instance
- Stateful Socket.io server

### Future Improvements
1. **Microservices**
   - Separate Moodle sync service
   - Independent messaging service
   - API gateway pattern

2. **Database Scaling**
   - MongoDB replica sets
   - Read replicas for queries
   - Sharding for large datasets

3. **Caching Layer**
   - Redis for session storage
   - Cache frequently accessed data
   - Reduce database load

4. **Load Balancing**
   - Multiple backend instances
   - Socket.io with Redis adapter
   - CDN for static assets

## Development Workflow

```
1. Feature Development
   ├─► Create feature branch
   ├─► Implement changes
   ├─► Write tests
   └─► Create pull request

2. Code Review
   ├─► Automated tests
   ├─► Code quality checks
   └─► Manual review

3. Deployment
   ├─► Merge to main
   ├─► Build frontend
   ├─► Deploy to staging
   └─► Deploy to production
```

## Monitoring & Logging

**Current Implementation**:
- Console logging for errors
- Basic request logging

**Recommended Additions**:
- Winston or Bunyan for structured logging
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Analytics (Google Analytics, Mixpanel)

## Configuration Management

**Environment-based Configuration**:
- `.env.development`
- `.env.staging`
- `.env.production`

**Key Configuration Areas**:
- Database connections
- API keys and secrets
- Feature flags
- Sync settings
- CORS policies

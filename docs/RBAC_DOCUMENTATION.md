# RBAC System Documentation

## Role-Based Access Control (RBAC) for LMS

This document describes the Role-Based Access Control system implemented in the LMS with MERN stack.

## Table of Contents

1. [Roles Overview](#roles-overview)
2. [Permissions Matrix](#permissions-matrix)
3. [API Endpoints by Role](#api-endpoints-by-role)
4. [Two-Way Data Synchronization](#two-way-data-synchronization)
5. [Implementation Details](#implementation-details)

---

## Roles Overview

### 1. Admin (Administrator)

**Purpose**: Full system control and management

**Capabilities**:
- Create, read, update, delete all users
- Assign and change user roles
- Access all courses (published and unpublished)
- View system-wide analytics
- Manage grades for any course
- Full access to all features

### 2. Teacher (Instructor)

**Purpose**: Course creation and student management

**Capabilities**:
- Create and manage own courses
- Add/edit course content
- View enrolled students
- Grade student submissions
- Access teaching analytics
- Cannot modify users or assign roles

### 3. Student

**Purpose**: Learning and course participation

**Capabilities**:
- Browse published courses
- Enroll/unenroll from courses
- Submit assignments
- View own grades
- Track progress
- Cannot access teacher or admin features

---

## Permissions Matrix

| Permission | Admin | Teacher | Student |
|------------|:-----:|:-------:|:-------:|
| **User Management** |
| Create users | ✅ | ❌ | ❌ |
| View all users | ✅ | ❌ | ❌ |
| Update users | ✅ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ |
| Change roles | ✅ | ❌ | ❌ |
| **Course Management** |
| Create courses | ✅ | ✅ | ❌ |
| View all courses | ✅ | ✅ | Published only |
| Update courses | ✅ | Own only | ❌ |
| Delete courses | ✅ | Own only | ❌ |
| Publish courses | ✅ | ✅ | ❌ |
| **Enrollment** |
| Enroll students | ✅ | ❌ | Self only |
| View enrollments | ✅ | Own courses | Self only |
| Manage enrollments | ✅ | ❌ | ❌ |
| **Grades** |
| Create grades | ✅ | Own courses | ❌ |
| View all grades | ✅ | Own courses | ❌ |
| View own grades | ✅ | ✅ | ✅ |
| Update grades | ✅ | Own courses | ❌ |
| Delete grades | ✅ | ❌ | ❌ |
| **Content** |
| Create content | ✅ | ✅ | ❌ |
| Update content | ✅ | Own only | ❌ |
| Delete content | ✅ | Own only | ❌ |
| View content | ✅ | ✅ | Enrolled courses |

---

## API Endpoints by Role

### Authentication (Public)
```
POST /api/auth/register     - Register new student account
POST /api/auth/login        - Login and receive JWT token
```

### Authenticated User (All Roles)
```
GET  /api/auth/me           - Get current user profile
PUT  /api/auth/profile      - Update own profile
PUT  /api/auth/password     - Change password
```

### Admin Only
```
GET    /api/users           - List all users
POST   /api/users           - Create user with any role
PUT    /api/users/:id       - Update any user
DELETE /api/users/:id       - Delete user
PUT    /api/users/:id/role  - Change user role
DELETE /api/grades/:id      - Delete any grade
```

### Teacher + Admin
```
GET    /api/users/role/:role           - Get users by role
POST   /api/courses                     - Create course
PUT    /api/courses/:id                 - Update course
DELETE /api/courses/:id                 - Delete course
GET    /api/courses/teacher/my-courses - List teacher's courses
POST   /api/grades                      - Create grade
PUT    /api/grades/:id                  - Update grade
GET    /api/grades/student/:studentId  - View student grades
GET    /api/grades/course/:courseId    - View course grades
```

### Student Only
```
GET    /api/courses                    - Browse published courses
POST   /api/courses/:id/enroll         - Enroll in course
DELETE /api/courses/:id/enroll         - Unenroll from course
GET    /api/courses/student/enrolled   - List enrolled courses
GET    /api/grades/my-grades           - View own grades
```

---

## Two-Way Data Synchronization

### Overview

The system uses Socket.io for real-time, two-way data synchronization between server and clients.

### Architecture

```
┌─────────────┐     WebSocket     ┌─────────────┐
│   Client    │◄──────────────────►│   Server    │
│  (React)    │                    │  (Node.js)  │
└─────────────┘                    └─────────────┘
       │                                  │
       │                                  │
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│   Redux/    │                    │  MongoDB    │
│   State     │                    │             │
└─────────────┘                    └─────────────┘
```

### Socket Events

#### Client → Server
```javascript
// Join a course room for real-time updates
socket.emit('join:course', courseId);

// Leave a course room
socket.emit('leave:course', courseId);

// Request data sync
socket.emit('sync:request', { type: 'courses', lastSyncVersion: 0 });

// Notify of data update
socket.emit('data:update', { type: 'grade', action: 'create', data: {...} });
```

#### Server → Client
```javascript
// Sync response with updated data
socket.on('sync:response', ({ type, data }) => { ... });

// Real-time data change notification
socket.on('data:changed', ({ type, action, data }) => { ... });

// System notification
socket.on('notification', (notification) => { ... });
```

### Sync Types

| Type | Description | Recipients |
|------|-------------|------------|
| Course | Course updates | All enrolled users, teachers |
| Grade | Grade changes | Specific student, course teachers |
| Enrollment | Enrollment changes | Student, course teacher |
| Assignment | Assignment updates | All course members |

### Room-Based Broadcasting

```javascript
// User-specific room
`user:${userId}`

// Role-specific room
`role:admin`
`role:teacher`
`role:student`

// Course-specific room
`course:${courseId}`
```

---

## Implementation Details

### Backend Middleware

#### Authentication Middleware
```javascript
// server/middleware/auth.js
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
};
```

#### RBAC Middleware
```javascript
// server/middleware/rbac.js
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
```

### Frontend Protection

#### Protected Route Component
```jsx
// client/src/components/ProtectedRoute.jsx
export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}
```

#### Role-Based Component
```jsx
// Conditional rendering based on role
<AdminOnly>
  <AdminDashboard />
</AdminOnly>

<TeacherOrAdmin>
  <CourseManagement />
</TeacherOrAdmin>

<StudentOnly>
  <EnrollButton />
</StudentOnly>
```

### Data Models with Sync Support

```javascript
// Sync status tracking in MongoDB schemas
syncStatus: {
  lastSynced: Date,
  syncVersion: {
    type: Number,
    default: 0
  }
}

// Pre-save hook to increment sync version
schema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.syncStatus.syncVersion += 1;
    this.syncStatus.lastSynced = new Date();
  }
  next();
});
```

---

## Security Considerations

1. **JWT Authentication**: All protected routes require valid JWT tokens
2. **Role Verification**: Server-side role checks on every request
3. **Resource Ownership**: Teachers can only modify their own courses
4. **Input Validation**: All inputs validated using express-validator
5. **Password Hashing**: Bcrypt for secure password storage
6. **Socket Authentication**: JWT verification for WebSocket connections

### Production Security Enhancements

For production deployment, implement these additional security measures:

1. **Rate Limiting**: Add express-rate-limit middleware to prevent brute force attacks
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

2. **API Gateway**: Use Kong, AWS API Gateway, or similar for:
   - Rate limiting
   - Request throttling
   - IP whitelisting/blacklisting

3. **HTTPS**: Always use HTTPS in production

4. **Environment Variables**: Never commit secrets to source control

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+

### Installation

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Configuration

Create `server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/lms_rbac
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Running

```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```

### Default Admin Account

To create the first admin account, register as a student then use MongoDB to update the role:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

## Testing RBAC

### Test Scenarios

1. **Admin Flow**:
   - Login as admin
   - Create teacher and student accounts
   - View all users and courses

2. **Teacher Flow**:
   - Login as teacher
   - Create a course
   - Grade student submissions

3. **Student Flow**:
   - Login as student
   - Browse and enroll in courses
   - View grades

### API Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Get users (admin only)
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create course (teacher/admin)
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Course","description":"A test course","category":"programming"}'
```

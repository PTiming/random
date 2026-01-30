# LMS API Functions Reference

This document lists all the functions available in the Learning Management System.

---

## 📋 Table of Contents

1. [Authentication Functions](#authentication-functions)
2. [User Management Functions](#user-management-functions)
3. [Course Management Functions](#course-management-functions)
4. [Grade Management Functions](#grade-management-functions)
5. [Real-time Socket Events](#real-time-socket-events)

---

## 🔐 Authentication Functions

| Function | Route | Method | Access | Description |
|----------|-------|--------|--------|-------------|
| `register` | `/api/auth/register` | POST | Public | Register a new student account |
| `login` | `/api/auth/login` | POST | Public | Login and receive JWT token |
| `getMe` | `/api/auth/me` | GET | Private | Get current logged-in user profile |
| `updateProfile` | `/api/auth/profile` | PUT | Private | Update user profile (name, avatar, bio) |
| `changePassword` | `/api/auth/password` | PUT | Private | Change user password |

### Request/Response Examples

#### Register
```javascript
// POST /api/auth/register
// Request
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "user": { "id", "firstName", "lastName", "email", "role" },
    "token": "jwt_token_here"
  }
}
```

#### Login
```javascript
// POST /api/auth/login
// Request
{
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { "id", "firstName", "lastName", "email", "role" },
    "token": "jwt_token_here"
  }
}
```

---

## 👥 User Management Functions

| Function | Route | Method | Access | Description |
|----------|-------|--------|--------|-------------|
| `getAllUsers` | `/api/users` | GET | Admin | Get all users with pagination & filters |
| `getUserById` | `/api/users/:id` | GET | Admin/Self | Get specific user by ID |
| `createUser` | `/api/users` | POST | Admin | Create new user with any role |
| `updateUser` | `/api/users/:id` | PUT | Admin | Update user information |
| `deleteUser` | `/api/users/:id` | DELETE | Admin | Delete a user |
| `changeUserRole` | `/api/users/:id/role` | PUT | Admin | Change user role (admin/teacher/student) |
| `getUsersByRole` | `/api/users/role/:role` | GET | Admin/Teacher | Get users filtered by role |

### Query Parameters for getAllUsers
- `role` - Filter by role (admin, teacher, student)
- `isActive` - Filter by active status (true/false)
- `search` - Search by name or email
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

---

## 📚 Course Management Functions

| Function | Route | Method | Access | Description |
|----------|-------|--------|--------|-------------|
| `getAllCourses` | `/api/courses` | GET | Public/Private | Get all courses (published for students) |
| `getCourseById` | `/api/courses/:id` | GET | Public/Private | Get course details |
| `createCourse` | `/api/courses` | POST | Teacher/Admin | Create a new course |
| `updateCourse` | `/api/courses/:id` | PUT | Teacher(owner)/Admin | Update course |
| `deleteCourse` | `/api/courses/:id` | DELETE | Teacher(owner)/Admin | Delete course |
| `enrollInCourse` | `/api/courses/:id/enroll` | POST | Student | Enroll in a course |
| `unenrollFromCourse` | `/api/courses/:id/enroll` | DELETE | Student | Unenroll from course |
| `getTeacherCourses` | `/api/courses/teacher/my-courses` | GET | Teacher | Get teacher's own courses |
| `getEnrolledCourses` | `/api/courses/student/enrolled` | GET | Student | Get student's enrolled courses |

### Course Categories
- `programming`
- `design`
- `business`
- `science`
- `language`
- `other`

### Course Levels
- `beginner`
- `intermediate`
- `advanced`

### Create Course Example
```javascript
// POST /api/courses
{
  "title": "Introduction to JavaScript",
  "description": "Learn JavaScript from scratch",
  "shortDescription": "JS basics",
  "category": "programming",
  "level": "beginner",
  "enrollmentLimit": 50,
  "startDate": "2024-02-01",
  "endDate": "2024-04-01",
  "tags": ["javascript", "web", "frontend"]
}
```

---

## 📊 Grade Management Functions

| Function | Route | Method | Access | Description |
|----------|-------|--------|--------|-------------|
| `getMyGrades` | `/api/grades/my-grades` | GET | Student | Get own grades |
| `getStudentGrades` | `/api/grades/student/:studentId` | GET | Teacher/Admin | Get grades for specific student |
| `getCourseGrades` | `/api/grades/course/:courseId` | GET | Teacher(owner)/Admin | Get all grades for a course |
| `createGrade` | `/api/grades` | POST | Teacher/Admin | Create or update a grade |
| `updateGrade` | `/api/grades/:id` | PUT | Teacher/Admin | Update existing grade |
| `deleteGrade` | `/api/grades/:id` | DELETE | Admin | Delete a grade |

### Grade Types
- `assignment`
- `quiz`
- `exam`
- `participation`
- `final`

### Create Grade Example
```javascript
// POST /api/grades
{
  "student": "student_id",
  "course": "course_id",
  "assignment": "assignment_id",
  "score": 85,
  "maxScore": 100,
  "feedback": "Great work!",
  "gradeType": "assignment"
}
```

---

## 🔌 Real-time Socket Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join:course` | `courseId` | Join a course room for updates |
| `leave:course` | `courseId` | Leave a course room |
| `sync:request` | `{ type, lastSyncVersion }` | Request data synchronization |
| `data:update` | `{ type, action, data }` | Notify server of data change |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `sync:response` | `{ type, data }` | Sync data response |
| `data:changed` | `{ type, action, data }` | Notification of data change |
| `notification` | `{ message, type }` | System notification |

### Socket Authentication
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

---

## 🔒 Role-Based Access Summary

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all functions |
| **Teacher** | Create/manage own courses, grade students, view student info |
| **Student** | Enroll in courses, view own grades, update own profile |

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful.",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description.",
  "error": "Detailed error (dev mode only)"
}
```

---

## 🚀 Quick Start

1. **Health Check**: `GET /api/health`
2. **API Info**: `GET /api`

### Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"password123"}'

# Get Profile (with token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Courses
curl http://localhost:5000/api/courses
```

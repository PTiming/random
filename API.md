# API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register New User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

**POST** `/auth/login`

Authenticate with local credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "student",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Moodle SSO Login

**POST** `/auth/moodle-login`

Authenticate using Moodle credentials.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "moodlepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "moodleId": "123"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "moodleToken": "abc123def456"
}
```

### Logout

**POST** `/auth/logout`

🔒 Requires authentication

Invalidate current session token.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User

**GET** `/auth/me`

🔒 Requires authentication

Get authenticated user's profile.

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "courses": [...],
    "connections": [...]
  }
}
```

---

## User Endpoints

### Get User Profile

**GET** `/users/:id`

🔒 Requires authentication

Get a user's public profile.

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Computer Science student",
    "profilePicture": "https://...",
    "institution": "University Name",
    "courses": [...],
    "connections": [...],
    "groups": [...]
  }
}
```

### Update Profile

**PATCH** `/users/me`

🔒 Requires authentication

Update authenticated user's profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "skills": ["JavaScript", "React", "Node.js"]
}
```

**Allowed Fields:** `firstName`, `lastName`, `bio`, `profilePicture`, `institution`, `department`, `skills`

### Add Connection

**POST** `/users/:id/connect`

🔒 Requires authentication

Connect with another user.

**Response:**
```json
{
  "message": "Connected successfully"
}
```

### Remove Connection

**DELETE** `/users/:id/connect`

🔒 Requires authentication

Remove a connection.

**Response:**
```json
{
  "message": "Disconnected successfully"
}
```

### Search Users

**GET** `/users?query=john&role=student`

🔒 Requires authentication

Search for users.

**Query Parameters:**
- `query` (string): Search term
- `role` (string): Filter by role
- `institution` (string): Filter by institution

**Response:**
```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student"
    }
  ]
}
```

---

## Course Endpoints

### Get All Courses

**GET** `/courses`

🔒 Requires authentication

Get list of active courses.

**Response:**
```json
{
  "courses": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Introduction to Computer Science",
      "code": "CS101",
      "instructor": {...},
      "enrolledStudents": [...]
    }
  ]
}
```

### Get Course Details

**GET** `/courses/:id`

🔒 Requires authentication

Get detailed course information.

**Response:**
```json
{
  "course": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Introduction to Computer Science",
    "code": "CS101",
    "description": "Fundamentals of programming...",
    "instructor": {...},
    "enrolledStudents": [...],
    "posts": [...],
    "assignments": [...],
    "events": [...]
  }
}
```

### Create Course

**POST** `/courses`

🔒 Requires authentication (Instructor/Admin only)

Create a new course.

**Request Body:**
```json
{
  "name": "Advanced Web Development",
  "code": "CS301",
  "description": "Advanced concepts in web development",
  "startDate": "2024-01-15",
  "endDate": "2024-05-15"
}
```

### Enroll in Course

**POST** `/courses/:id/enroll`

🔒 Requires authentication

Enroll in a course.

**Response:**
```json
{
  "message": "Enrolled successfully",
  "course": {...}
}
```

### Unenroll from Course

**DELETE** `/courses/:id/enroll`

🔒 Requires authentication

Leave a course.

**Response:**
```json
{
  "message": "Unenrolled successfully"
}
```

---

## Post Endpoints

### Get News Feed

**GET** `/posts/feed?page=1&limit=20`

🔒 Requires authentication

Get personalized news feed.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Posts per page (default: 20)

**Response:**
```json
{
  "posts": [
    {
      "id": "507f1f77bcf86cd799439013",
      "author": {...},
      "content": "Hello world!",
      "course": {...},
      "likes": [...],
      "comments": [...],
      "syncedToMoodle": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "page": 1,
  "hasMore": true
}
```

### Create Post

**POST** `/posts`

🔒 Requires authentication

Create a new post.

**Request Body:**
```json
{
  "content": "This is my post content",
  "course": "507f1f77bcf86cd799439012",
  "visibility": "public",
  "type": "post",
  "syncToMoodle": true
}
```

**Fields:**
- `content` (string, required): Post content
- `course` (ObjectId): Associated course
- `group` (ObjectId): Associated group
- `visibility` (string): `public`, `connections`, `course`, `group`, `private`
- `type` (string): `post`, `question`, `announcement`, `resource`
- `syncToMoodle` (boolean): Sync to Moodle forum

**Response:**
```json
{
  "post": {
    "id": "507f1f77bcf86cd799439013",
    "author": {...},
    "content": "This is my post content",
    "course": {...},
    "syncedToMoodle": true,
    "moodlePostId": "456",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Post

**GET** `/posts/:id`

🔒 Requires authentication

Get single post with details.

### Like/Unlike Post

**POST** `/posts/:id/like`

🔒 Requires authentication

Toggle like on a post.

**Response:**
```json
{
  "post": {...},
  "liked": true
}
```

### Add Comment

**POST** `/posts/:id/comment`

🔒 Requires authentication

Add a comment to a post.

**Request Body:**
```json
{
  "content": "Great post!"
}
```

### Add Reaction

**POST** `/posts/:id/react`

🔒 Requires authentication

Add or update reaction to a post.

**Request Body:**
```json
{
  "type": "helpful"
}
```

**Reaction Types:** `like`, `love`, `helpful`, `insightful`, `confused`

---

## Message Endpoints

### Get Conversations

**GET** `/messages/conversations`

🔒 Requires authentication

Get list of recent conversations.

**Response:**
```json
{
  "conversations": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "lastMessage": {
        "sender": {...},
        "content": "Hello!",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    }
  ]
}
```

### Get Messages with User

**GET** `/messages/user/:userId`

🔒 Requires authentication

Get message history with a specific user.

**Response:**
```json
{
  "messages": [
    {
      "id": "507f1f77bcf86cd799439015",
      "sender": {...},
      "recipient": {...},
      "content": "Hello!",
      "messageType": "text",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Send Message

**POST** `/messages`

🔒 Requires authentication

Send a new message.

**Request Body:**
```json
{
  "conversationType": "direct",
  "recipient": "507f1f77bcf86cd799439011",
  "content": "Hello!",
  "messageType": "text"
}
```

**Response:**
```json
{
  "message": {
    "id": "507f1f77bcf86cd799439015",
    "sender": {...},
    "recipient": {...},
    "content": "Hello!",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Mark as Read

**PATCH** `/messages/:id/read`

🔒 Requires authentication

Mark a message as read.

---

## Group Endpoints

### Get All Groups

**GET** `/groups?type=study&course=507f1f77bcf86cd799439012`

🔒 Requires authentication

Get list of groups.

**Query Parameters:**
- `type` (string): Filter by type
- `course` (ObjectId): Filter by course

### Create Group

**POST** `/groups`

🔒 Requires authentication

Create a new group.

**Request Body:**
```json
{
  "name": "CS101 Study Group",
  "description": "Study group for CS101",
  "type": "study",
  "course": "507f1f77bcf86cd799439012",
  "visibility": "public",
  "joinPolicy": "request"
}
```

### Join Group

**POST** `/groups/:id/join`

🔒 Requires authentication

Join or request to join a group.

**Response:**
```json
{
  "message": "Joined group successfully"
}
```
or
```json
{
  "message": "Join request sent"
}
```

### Leave Group

**DELETE** `/groups/:id/leave`

🔒 Requires authentication

Leave a group.

---

## Moodle Integration Endpoints

### Sync User Data

**POST** `/moodle/sync/user`

🔒 Requires authentication

Sync user data from Moodle.

**Response:**
```json
{
  "message": "User synced successfully",
  "user": {...},
  "courses": [...]
}
```

### Sync Course

**POST** `/moodle/sync/course/:moodleCourseId`

🔒 Requires authentication (Instructor/Admin only)

Import course from Moodle.

**Response:**
```json
{
  "message": "Course synced successfully",
  "course": {...},
  "enrollments": [...],
  "assignments": [...]
}
```

### Get Moodle Courses

**GET** `/moodle/courses`

🔒 Requires authentication

Get user's courses from Moodle.

**Response:**
```json
{
  "courses": [...]
}
```

### Get Grades

**GET** `/moodle/grades/:courseId`

🔒 Requires authentication

Get user's grades for a course from Moodle.

**Response:**
```json
{
  "grades": [...]
}
```

### Get Calendar Events

**GET** `/moodle/calendar?start=2024-01-01&end=2024-01-31`

🔒 Requires authentication

Get calendar events from Moodle.

**Query Parameters:**
- `start` (date): Start date
- `end` (date): End date

**Response:**
```json
{
  "events": [...]
}
```

### Submit Assignment

**POST** `/moodle/assignment/:assignmentId/submit`

🔒 Requires authentication

Submit assignment to Moodle.

**Request Body:**
```json
{
  "submissionText": "My assignment submission...",
  "fileUrl": "https://..."
}
```

**Response:**
```json
{
  "message": "Assignment submitted successfully",
  "result": {...}
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Error Examples

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**400 Validation Error:**
```json
{
  "error": "Validation Error",
  "details": [
    "Email is required",
    "Password must be at least 6 characters"
  ]
}
```

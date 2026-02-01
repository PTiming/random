# Moodle Integration Flow Diagram

## User Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Login Request (username/password)
       │
       ▼
┌─────────────────────────────────────────┐
│     Frontend (React)                    │
│  - Login.jsx component                  │
│  - authSlice.loginWithMoodle()         │
└──────┬──────────────────────────────────┘
       │ 2. POST /api/auth/moodle-login
       │
       ▼
┌─────────────────────────────────────────┐
│     Backend (Express)                   │
│  - auth.js route                        │
└──────┬──────────────────────────────────┘
       │ 3. Authenticate with Moodle
       │
       ▼
┌─────────────────────────────────────────┐
│   Moodle Web Services API               │
│  - /login/token.php                     │
└──────┬──────────────────────────────────┘
       │ 4. Return Moodle token + user ID
       │
       ▼
┌─────────────────────────────────────────┐
│     Backend (Express)                   │
│  - Create/Update local user             │
│  - Generate JWT token                   │
│  - Store user in MongoDB                │
└──────┬──────────────────────────────────┘
       │ 5. Return JWT + user data
       │
       ▼
┌─────────────────────────────────────────┐
│     Frontend (React)                    │
│  - Store JWT in localStorage            │
│  - Update Redux state                   │
│  - Redirect to Feed                     │
└─────────────────────────────────────────┘
```

## Data Synchronization Flow

### From Moodle to Platform

```
┌────────────┐
│   Moodle   │
└──────┬─────┘
       │
       │ Trigger Sync (Manual/Scheduled/Webhook)
       │
       ▼
┌──────────────────────────────────────────┐
│   Moodle Service                         │
│  - moodleService.syncUserFromMoodle()    │
│  - moodleService.syncCourseFromMoodle()  │
└──────┬───────────────────────────────────┘
       │
       │ Web Services API Call
       │
       ▼
┌──────────────────────────────────────────┐
│   Moodle REST API                        │
│  - core_user_get_users_by_field          │
│  - core_enrol_get_users_courses          │
│  - core_course_get_courses               │
│  - mod_assign_get_assignments            │
│  - gradereport_user_get_grade_items      │
└──────┬───────────────────────────────────┘
       │
       │ Return Data
       │
       ▼
┌──────────────────────────────────────────┐
│   Moodle Service                         │
│  - Parse response                        │
│  - Transform data                        │
└──────┬───────────────────────────────────┘
       │
       │ Save/Update
       │
       ▼
┌──────────────────────────────────────────┐
│   MongoDB                                │
│  - Update User document                  │
│  - Update Course document                │
│  - Store lastMoodleSync timestamp        │
└──────────────────────────────────────────┘
```

### From Platform to Moodle

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ Create Post with "Sync to Moodle" enabled
       │
       ▼
┌──────────────────────────────────────────┐
│   Frontend                               │
│  - PostCreate.jsx                        │
└──────┬───────────────────────────────────┘
       │ POST /api/posts {syncToMoodle: true}
       │
       ▼
┌──────────────────────────────────────────┐
│   Backend - posts.js route               │
│  1. Create post in MongoDB               │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│   Moodle Service                         │
│  - moodleService.createForumDiscussion() │
└──────┬───────────────────────────────────┘
       │ Web Services API Call
       │
       ▼
┌──────────────────────────────────────────┐
│   Moodle REST API                        │
│  - mod_forum_add_discussion              │
└──────┬───────────────────────────────────┘
       │ Return discussion ID
       │
       ▼
┌──────────────────────────────────────────┐
│   Backend                                │
│  - Update post with moodlePostId         │
│  - Set syncedToMoodle = true             │
│  - Save to MongoDB                       │
└──────┬───────────────────────────────────┘
       │
       │ Return success
       │
       ▼
┌──────────────────────────────────────────┐
│   Frontend                               │
│  - Show success message                  │
│  - Update UI with synced badge           │
└──────────────────────────────────────────┘
```

## Real-time Messaging Flow

```
User A                      Server                      User B
  │                           │                           │
  │ 1. Connect                │                           │
  ├──────────────────────────►│                           │
  │                           │                           │
  │                           │ 2. Connect                │
  │                           │◄──────────────────────────┤
  │                           │                           │
  │ 3. join-room("room-123")  │                           │
  ├──────────────────────────►│                           │
  │                           │                           │
  │                           │ 4. join-room("room-123")  │
  │                           │◄──────────────────────────┤
  │                           │                           │
  │ 5. send-message           │                           │
  ├──────────────────────────►│                           │
  │                           │                           │
  │                           │ 6. Save to MongoDB        │
  │                           │                           │
  │                           │ 7. Emit new-message       │
  │                           ├──────────────────────────►│
  │◄──────────────────────────┤                           │
  │ 8. Receive new-message    │                           │
  │                           │                           │
```

## Course Enrollment Flow

```
┌─────────────┐
│   Student   │
└──────┬──────┘
       │ 1. Browse courses
       │
       ▼
┌──────────────────────────────────────────┐
│   Frontend - Courses.jsx                 │
│  - Display available courses             │
└──────┬───────────────────────────────────┘
       │ 2. Click "Enroll"
       │
       ▼
┌──────────────────────────────────────────┐
│   Backend - POST /api/courses/:id/enroll │
│  1. Verify user authentication           │
│  2. Check if already enrolled            │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│   MongoDB                                │
│  1. Add student to course.enrolledStudents│
│  2. Add course to user.courses           │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│   Moodle Service (if auto-sync enabled) │
│  - Optionally sync enrollment to Moodle  │
└──────┬───────────────────────────────────┘
       │
       │ Return success
       │
       ▼
┌──────────────────────────────────────────┐
│   Frontend                               │
│  - Update UI                             │
│  - Show success message                  │
│  - Display course in "My Courses"        │
└──────────────────────────────────────────┘
```

## Data Models Relationships

```
┌─────────────────┐
│      User       │
│─────────────────│
│ _id             │
│ username        │◄──────────┐
│ email           │           │
│ moodleId        │           │
│ courses[]       │──┐        │
│ connections[]   │──┼────────┘
│ groups[]        │──┼────┐
│ followers[]     │  │    │
│ following[]     │  │    │
└─────────────────┘  │    │
                     │    │
         ┌───────────┘    │
         │                │
         ▼                │
┌─────────────────┐       │
│     Course      │       │
│─────────────────│       │
│ _id             │       │
│ name            │       │
│ moodleId        │       │
│ instructor      │───────┘
│ enrolledStudents│
│ posts[]         │──┐
│ groups[]        │──┼────┐
│ assignments[]   │  │    │
└─────────────────┘  │    │
                     │    │
         ┌───────────┘    │
         │                │
         ▼                │
┌─────────────────┐       │
│      Post       │       │
│─────────────────│       │
│ _id             │       │
│ author          │───────┘
│ content         │
│ course          │
│ group           │
│ likes[]         │
│ comments[]      │
│ moodlePostId    │
│ syncedToMoodle  │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│     Group       │
│─────────────────│
│ _id             │
│ name            │
│ creator         │
│ members[]       │
│ course          │
│ posts[]         │
└─────────────────┘
```

## Tech Stack Interaction

```
┌───────────────────────────────────────────────────────────┐
│                    Client Browser                         │
├───────────────────────────────────────────────────────────┤
│  React Components                                         │
│  ├─ Pages (Login, Feed, Courses, etc.)                   │
│  ├─ Components (Navbar, PostCard, etc.)                  │
│  └─ Styles (CSS)                                          │
├───────────────────────────────────────────────────────────┤
│  Redux Store                                              │
│  ├─ authSlice (user, token, isAuthenticated)            │
│  └─ postsSlice (posts, loading, error)                  │
├───────────────────────────────────────────────────────────┤
│  Services                                                 │
│  ├─ API Service (Axios with JWT interceptor)            │
│  └─ Socket Service (Socket.io client)                   │
└────────────────┬──────────────────────────────────────────┘
                 │
                 │ HTTP/WebSocket
                 │
┌────────────────▼──────────────────────────────────────────┐
│                    Backend Server                         │
├───────────────────────────────────────────────────────────┤
│  Express.js + Socket.io                                   │
│  ├─ Routes (auth, users, courses, posts, etc.)          │
│  ├─ Middleware (auth, errorHandler)                     │
│  ├─ Controllers (request handlers)                       │
│  └─ Services (moodleService)                            │
└────────┬────────────────────┬─────────────────────────────┘
         │                    │
         │                    │
         ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│    MongoDB       │  │  Moodle LMS      │
│  ─────────────── │  │  ─────────────── │
│  Collections:    │  │  External API    │
│  - users         │  │  - Web Services  │
│  - courses       │  │  - REST/XMLRPC   │
│  - posts         │  │  - OAuth2        │
│  - groups        │  │                  │
│  - messages      │  │                  │
└──────────────────┘  └──────────────────┘
```

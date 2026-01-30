# MERN Social Network - Complete Planning Document

## 📋 Project Overview

A full-stack social networking application built with the MERN stack (MongoDB, Express.js, React, Node.js) that integrates with Moodle LMS to combine social features with educational content.

---

## 🎯 Core Features & Functions

### 1. User Authentication & Management

#### Functions:
- **User Registration**
  - Input: username, email, password
  - Validation: unique email/username, min password length (6 chars)
  - Security: bcrypt password hashing (10 salt rounds)
  - Output: JWT token + user profile

- **User Login**
  - Input: email, password
  - Validation: credential verification
  - Output: JWT token (7-day expiry) + user session

- **Get Current User**
  - Input: JWT token (in Authorization header)
  - Output: User profile without password

- **Update User Profile**
  - Input: bio, avatar URL
  - Output: Updated user profile

#### Data Model - User:
```javascript
{
  username: String (required, unique, min: 3 chars),
  email: String (required, unique, lowercase),
  password: String (hashed, required, min: 6 chars),
  avatar: String (default: placeholder),
  bio: String (max: 500 chars),
  moodleUserId: String (nullable),
  followers: [ObjectId] (ref: User),
  following: [ObjectId] (ref: User),
  createdAt: Date (auto-generated)
}
```

---

### 2. Social Network Functions

#### A. Post Management

**Create Post**
- Input: content (required, max 1000 chars), image URL (optional)
- Process: Link to authenticated user
- Output: New post with user details populated

**Get All Posts**
- Input: None (authentication required)
- Process: Fetch all posts, populate user & comment details
- Sort: Most recent first
- Limit: 50 posts per request
- Output: Array of posts with nested data

**Get Single Post**
- Input: Post ID
- Output: Post with full details

**Delete Post**
- Input: Post ID
- Validation: User must be post owner
- Process: Remove post from database
- Output: Success message

#### Data Model - Post:
```javascript
{
  user: ObjectId (ref: User, required),
  content: String (required, max: 1000 chars),
  image: String (optional),
  likes: [ObjectId] (ref: User),
  comments: [{
    user: ObjectId (ref: User),
    text: String (required),
    createdAt: Date
  }],
  createdAt: Date (auto-generated)
}
```

#### B. Post Interactions

**Like/Unlike Post**
- Input: Post ID
- Process: Toggle like status for current user
- Logic: 
  - If user already liked → remove from likes array
  - If user hasn't liked → add to likes array
- Output: Updated post with new like count

**Add Comment**
- Input: Post ID, comment text
- Process: Append comment to post's comments array
- Output: Updated post with new comment

**View Post Statistics**
- Computed: Like count, comment count
- Display: "X Likes, Y Comments"

#### C. Social Connections

**Follow/Unfollow User**
- Input: Target user ID
- Validation: Cannot follow self
- Process:
  - Add/remove from current user's "following" list
  - Add/remove from target user's "followers" list
- Output: Follow status (true/false)

**Search Users**
- Input: Search query string
- Search fields: username, email
- Match: Case-insensitive partial match
- Limit: 10 results
- Output: Array of matching users (without passwords)

**Get User Profile**
- Input: User ID
- Output: User details with followers/following lists populated

---

### 3. Moodle LMS Integration

#### A. Account Linking

**Link Moodle Account**
- Input: Moodle User ID
- Process: Store Moodle ID in user profile
- Output: Updated user profile

#### B. Course Data Retrieval

**Get Enrolled Courses**
- Prerequisites: Moodle account linked
- API Call: `core_enrol_get_users_courses`
- Parameters: userid (from user's moodleUserId)
- Output: Array of course objects
  ```javascript
  [{
    id: Number,
    fullname: String,
    shortname: String,
    enrolledusercoun: Number,
    ...
  }]
  ```

**Get Course Details**
- Input: Course ID
- API Call: `core_course_get_contents`
- Output: Course sections, modules, activities

**Get Course Grades**
- Input: Course ID
- API Call: `gradereport_user_get_grade_items`
- Output: Array of grade items
  ```javascript
  {
    usergrades: [{
      gradeitems: [{
        itemname: String,
        graderaw: Number,
        grademax: Number,
        gradedategraded: Timestamp
      }]
    }]
  }
  ```

**Get Course Assignments**
- Input: Course ID
- API Call: `mod_assign_get_assignments`
- Output: Array of assignments with due dates and status

#### C. Data Synchronization

**Sync Course Data to Database**
- Input: Course ID
- Process:
  1. Fetch course info from Moodle
  2. Fetch grades for the course
  3. Fetch assignments for the course
  4. Transform data to local format
  5. Upsert to MoodleData collection
- Output: Synced data object with lastSync timestamp

**Get Synced Data**
- Input: Course ID (optional)
- If Course ID provided: Return specific course data
- If no ID: Return all synced courses for user
- Output: MoodleData document(s)

#### D. Send Data to Moodle

**Send Forum Post**
- Input: Forum ID, subject, message
- API Call: `mod_forum_add_discussion`
- Output: Created discussion ID and details

#### Data Model - MoodleData:
```javascript
{
  user: ObjectId (ref: User, required),
  courseId: String (required),
  courseName: String (required),
  enrollmentData: Object (full course object),
  grades: [{
    activityName: String,
    grade: Number,
    maxGrade: Number,
    date: Date
  }],
  assignments: [{
    id: String,
    name: String,
    dueDate: Date,
    status: String
  }],
  lastSync: Date (auto-updated)
}
```

---

## 🏗️ Technical Architecture

### Backend Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── User.js              # User schema
│   ├── Post.js              # Post schema
│   └── MoodleData.js        # Moodle data schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── posts.js             # Post CRUD & interactions
│   ├── users.js             # User profiles & social
│   └── moodle.js            # Moodle integration
├── middleware/
│   └── auth.js              # JWT verification
└── index.js                 # Express app entry point
```

### Frontend Structure

```
client/src/
├── components/
│   ├── Navbar.js            # Top navigation bar
│   ├── Sidebar.js           # Left sidebar navigation
│   ├── CreatePost.js        # Post creation modal
│   ├── Post.js              # Individual post component
│   └── MoodleWidget.js      # Moodle courses widget
├── pages/
│   ├── Login.js             # Login page
│   ├── Register.js          # Registration page
│   └── Home.js              # Main feed page
├── services/
│   └── api.js               # Axios API client
├── index.css                # Global styles (Facebook-like)
├── App.js                   # Router & auth logic
└── index.js                 # React entry point
```

---

## 🔄 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login user |
| GET | `/me` | Yes | Get current user |

### Posts (`/api/posts`)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | Yes | Get all posts (feed) |
| GET | `/:id` | Yes | Get single post |
| POST | `/` | Yes | Create new post |
| PUT | `/:id/like` | Yes | Toggle like on post |
| POST | `/:id/comment` | Yes | Add comment to post |
| DELETE | `/:id` | Yes | Delete post (owner only) |

### Users (`/api/users`)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/:id` | Yes | Get user profile |
| PUT | `/profile` | Yes | Update own profile |
| PUT | `/:id/follow` | Yes | Toggle follow status |
| GET | `/search/:query` | Yes | Search users |

### Moodle Integration (`/api/moodle`)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/link-account` | Yes | Link Moodle user ID |
| GET | `/courses` | Yes | Get enrolled courses from Moodle |
| GET | `/courses/:courseId` | Yes | Get course details from Moodle |
| GET | `/grades/:courseId` | Yes | Get course grades from Moodle |
| GET | `/assignments/:courseId` | Yes | Get course assignments |
| POST | `/sync/:courseId` | Yes | Sync course data to database |
| GET | `/data` | Yes | Get all synced Moodle data |
| GET | `/data/:courseId` | Yes | Get synced data for course |
| POST | `/send-forum-post` | Yes | Post to Moodle forum |

---

## 🔐 Security Implementation

### Authentication Flow
1. User submits credentials (register/login)
2. Server validates input
3. For registration: Hash password with bcrypt (salt rounds: 10)
4. For login: Compare hashed password
5. Generate JWT with user ID payload
6. Token expiry: 7 days
7. Client stores token in localStorage
8. Client includes token in Authorization header for protected routes

### Authorization Middleware
```javascript
// Executed before protected routes
1. Extract token from "Authorization: Bearer <token>" header
2. Verify token with JWT secret
3. Decode user ID from token
4. Attach userId to request object
5. Continue to route handler
// If token invalid/missing: Return 401 Unauthorized
```

### Password Security
- Minimum length: 6 characters (configurable)
- Hashing algorithm: bcrypt
- Salt rounds: 10
- Passwords never sent in responses (excluded in queries)

---

## 🎨 UI/UX Design Plan

### Design System
- **Color Palette**: 
  - Primary: #1877f2 (Facebook blue)
  - Background: #f0f2f5 (Light gray)
  - Text: #050505 (Near black)
  - Secondary text: #65676b (Gray)
  - Borders: #ced0d4 (Light gray)
  - Success: #42b72a (Green)
  - Error: #c41e3a (Red)

- **Typography**:
  - Font family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'
  - Base size: 15px
  - Headings: 17px-24px
  - Weight: 400 (normal), 600 (semi-bold)

- **Layout**:
  - Max width: 1440px
  - 3-column layout (sidebar | feed | widgets)
  - Responsive breakpoints: 900px, 1100px

### Page Layouts

#### Login/Register Page
- Split layout: Brand message (left) + Form (right)
- Large logo and tagline
- Clean white card for form
- Primary action button
- Link to alternate action (login ↔ register)

#### Main Feed Page
- Fixed navbar (top)
- Sticky sidebars (left & right)
- Scrollable center feed
- Components:
  - Navbar: Logo, search, nav icons, profile
  - Left sidebar: User shortcuts, navigation links
  - Feed: Create post + post list
  - Right sidebar: Moodle widget, contacts

#### Post Component
- Header: Avatar, username, timestamp
- Content: Text + optional image
- Stats: Like count, comment count
- Actions: Like, Comment, Share buttons
- Comments section: Expandable list
- Comment input: Inline text field

---

## 📊 Data Flow Diagrams

### User Registration Flow
```
User Input → Client Validation → API Request
→ Server Validation → Check Existing User
→ Hash Password → Create User Document
→ Generate JWT → Return Token + User Data
→ Store Token → Redirect to Feed
```

### Post Creation Flow
```
User Click "What's on your mind?" → Open Modal
→ User Types Content → Click "Post"
→ Send POST /api/posts with content + token
→ Verify Auth → Create Post Document
→ Return New Post → Update Feed State
→ Close Modal → Show Post in Feed
```

### Like Post Flow
```
User Click Like Button → Send PUT /posts/:id/like
→ Check if User in likes[] → Toggle Status
→ Return Updated Post → Update UI State
→ Change Button Color + Count
```

### Moodle Sync Flow
```
User Enters Moodle User ID → Link Account
→ User Clicks "Sync Course" → Show Course List
→ User Selects Course → POST /moodle/sync/:courseId
→ Call Moodle API (courses, grades, assignments)
→ Transform Data → Upsert to MoodleData
→ Return Success → Update Widget Display
```

---

## 🧪 Testing Strategy

### Unit Tests
- User model validation
- Post model validation
- Password hashing/verification
- JWT generation/verification
- API helper functions

### Integration Tests
- Auth endpoints (register, login)
- Post CRUD operations
- Like/comment functionality
- Moodle API calls (with mocks)

### E2E Tests
- Complete user registration flow
- Login → Create post → Like → Comment
- Profile update
- Moodle account linking and sync

---

## 🚀 Deployment Plan

### Development Environment
- Backend: `npm run server` (nodemon on port 5000)
- Frontend: `cd client && npm start` (port 3000)
- Database: Local MongoDB instance

### Production Deployment

#### Backend
- Platform: Heroku / AWS / DigitalOcean
- Database: MongoDB Atlas
- Environment Variables:
  - `MONGODB_URI`: Atlas connection string
  - `JWT_SECRET`: Secure random string
  - `MOODLE_URL`: Production Moodle instance
  - `MOODLE_TOKEN`: Production web service token

#### Frontend
- Build: `cd client && npm run build`
- Platform: Netlify / Vercel / GitHub Pages
- Environment Variables:
  - `REACT_APP_API_URL`: Backend API URL

#### CI/CD Pipeline
1. Push to main branch
2. Run tests
3. Build frontend
4. Deploy backend to hosting platform
5. Deploy frontend to static hosting
6. Update environment variables

---

## 📈 Future Enhancements

### Phase 2 Features
- Real-time notifications (WebSockets)
- Private messaging between users
- Photo/video upload (with cloud storage)
- Groups and communities
- Events and calendar
- Stories (24-hour posts)

### Moodle Enhancements
- Two-way sync (push grades/assignments)
- Quiz integration
- Course enrollment from social network
- Peer collaboration tools
- Study groups linked to courses

### Performance Optimizations
- Pagination for posts and comments
- Image optimization and lazy loading
- Caching frequently accessed data (Redis)
- Database indexing for search queries
- CDN for static assets

---

## 🛠️ Technology Choices - Rationale

### Why MongoDB?
- Flexible schema for evolving social features
- Document model matches nested data (posts with comments)
- Easy scaling for growing user base
- Native JSON support for Moodle API responses

### Why React?
- Component-based architecture for reusable UI
- Virtual DOM for efficient updates
- Large ecosystem and community
- Hooks for clean state management

### Why Express?
- Minimalist and flexible
- Middleware pattern for auth and validation
- Large ecosystem of packages
- Well-documented and stable

### Why JWT?
- Stateless authentication (no server-side sessions)
- Scalable across multiple servers
- Secure token-based system
- Easy to implement and verify

---

## 📝 Development Checklist

- [x] Set up project structure
- [x] Configure MongoDB connection
- [x] Create data models (User, Post, MoodleData)
- [x] Implement authentication (register, login, JWT)
- [x] Build post CRUD endpoints
- [x] Add like/comment functionality
- [x] Implement user follow system
- [x] Create Moodle API integration
- [x] Build sync functionality
- [x] Design React component structure
- [x] Create authentication pages (Login, Register)
- [x] Build main feed layout
- [x] Implement post creation modal
- [x] Add post interaction UI
- [x] Create Moodle widget
- [x] Style with Facebook-like CSS
- [x] Add responsive design
- [x] Write documentation (README, QUICKSTART)
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Deploy to production
- [ ] Monitor and optimize performance

---

## 📞 API Usage Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### Create Post
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "content": "Hello Social Network!"
  }'
```

### Sync Moodle Course
```bash
curl -X POST http://localhost:5000/api/moodle/sync/12345 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

This planning document outlines the complete architecture and functionality of the MERN Social Network with Moodle integration.

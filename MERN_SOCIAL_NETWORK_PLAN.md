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
  bio: { type: String, maxlength: 500 },
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
  content: { type: String, maxlength: 5000 },
  media: [{
    mediaType: { type: String, enum: ['image', 'video', 'link'] },
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
    mediaType: { type: String },
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
DELETE /api/users/:id/follow       - Unfollow user
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
DELETE /api/posts/:id/like         - Unlike post
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

## 7. Role-Based Access Control (RBAC)

### 7.1 Role Definitions

The platform implements a hierarchical RBAC system with three primary roles:

#### Student Role
```javascript
const StudentPermissions = {
  // Profile
  canEditOwnProfile: true,
  canDeleteOwnAccount: true,
  
  // Social Features
  canCreatePost: true,
  canEditOwnPost: true,
  canDeleteOwnPost: true,
  canLikePost: true,
  canCommentOnPost: true,
  canSharePost: true,
  canFollowUsers: true,
  canSendFriendRequest: true,
  canSendMessages: true,
  
  // Groups
  canJoinPublicGroups: true,
  canRequestPrivateGroupJoin: true,
  canLeaveGroups: true,
  canCreateStudyGroups: true,
  canPostInJoinedGroups: true,
  
  // Moodle
  canViewOwnCourses: true,
  canViewOwnGrades: true,
  canViewOwnAssignments: true,
  canSyncOwnMoodleData: true,
  canSubmitToMoodle: true,           // Two-way sync
  canPostToMoodleForum: true,        // Two-way sync
  
  // Restrictions
  canModerateContent: false,
  canManageUsers: false,
  canAccessAdminPanel: false,
  canViewAllGrades: false,
  canCreateAnnouncements: false
};
```

#### Instructor Role
```javascript
const InstructorPermissions = {
  // Inherits all Student permissions, plus:
  ...StudentPermissions,
  
  // Enhanced Profile
  canVerifyAsInstructor: true,
  canDisplayCredentials: true,
  
  // Course Management
  canCreateCourseGroups: true,
  canManageCourseGroups: true,
  canViewEnrolledStudents: true,
  canPostAnnouncements: true,
  canPinGroupPosts: true,
  canRemoveMembersFromOwnGroups: true,
  
  // Moodle - Two-way Sync
  canViewCourseGrades: true,
  canUpdateMoodleGrades: true,       // Two-way sync
  canCreateMoodleAssignments: true,  // Two-way sync
  canPostMoodleAnnouncements: true,  // Two-way sync
  canSyncCourseContent: true,        // Two-way sync
  canManageMoodleForums: true,       // Two-way sync
  
  // Moderation (Limited)
  canModerateCourseContent: true,
  canReportUsers: true,
  canHideInappropriateContent: true,
  
  // Restrictions
  canManageAllUsers: false,
  canAccessFullAdminPanel: false,
  canModifySystemSettings: false
};
```

#### Admin Role
```javascript
const AdminPermissions = {
  // Full access to all features
  ...InstructorPermissions,
  
  // User Management
  canViewAllUsers: true,
  canEditAnyUser: true,
  canDeleteAnyUser: true,
  canBanUsers: true,
  canUnbanUsers: true,
  canAssignRoles: true,
  canVerifyInstructors: true,
  
  // Content Moderation
  canModerateAllContent: true,
  canDeleteAnyPost: true,
  canDeleteAnyComment: true,
  canDeleteAnyGroup: true,
  canViewReportedContent: true,
  canResolveReports: true,
  
  // System Administration
  canAccessAdminPanel: true,
  canConfigureSystem: true,
  canViewAnalytics: true,
  canManageMoodleConnection: true,
  canConfigureSyncSettings: true,
  canViewAuditLogs: true,
  
  // Moodle Admin
  canSyncAllCourses: true,
  canMapMoodleRoles: true,
  canConfigureWebhooks: true,
  canManageAPIKeys: true
};
```

### 7.2 Permission Matrix

| Feature | Student | Instructor | Admin |
|---------|---------|------------|-------|
| **Profile & Account** ||||
| Edit own profile | ✅ | ✅ | ✅ |
| View any profile | ✅ | ✅ | ✅ |
| Edit any profile | ❌ | ❌ | ✅ |
| Delete any account | ❌ | ❌ | ✅ |
| Assign roles | ❌ | ❌ | ✅ |
| **Posts & Content** ||||
| Create posts | ✅ | ✅ | ✅ |
| Edit own posts | ✅ | ✅ | ✅ |
| Delete any post | ❌ | Course only | ✅ |
| Pin posts | ❌ | Own groups | ✅ |
| Create announcements | ❌ | ✅ | ✅ |
| **Groups** ||||
| Join public groups | ✅ | ✅ | ✅ |
| Create study groups | ✅ | ✅ | ✅ |
| Create course groups | ❌ | ✅ | ✅ |
| Delete any group | ❌ | ❌ | ✅ |
| Manage group members | Own groups | Course groups | ✅ |
| **Moodle Integration** ||||
| View own courses | ✅ | ✅ | ✅ |
| View own grades | ✅ | ✅ | ✅ |
| View course grades | ❌ | ✅ | ✅ |
| Sync to Moodle (submit) | ✅ | ✅ | ✅ |
| Update Moodle grades | ❌ | ✅ | ✅ |
| Create Moodle content | ❌ | ✅ | ✅ |
| Manage Moodle connection | ❌ | ❌ | ✅ |
| **Moderation** ||||
| Report content | ✅ | ✅ | ✅ |
| Hide content | ❌ | Course only | ✅ |
| Ban users | ❌ | ❌ | ✅ |
| View reports | ❌ | ❌ | ✅ |
| **Admin Panel** ||||
| View analytics | ❌ | Limited | ✅ |
| System settings | ❌ | ❌ | ✅ |
| Audit logs | ❌ | ❌ | ✅ |

### 7.3 Role Schema Enhancement

```javascript
const RoleSchema = new Schema({
  name: { 
    type: String, 
    enum: ['student', 'instructor', 'admin'], 
    required: true 
  },
  displayName: { type: String },
  description: { type: String },
  permissions: [{
    resource: String,     // e.g., 'posts', 'users', 'groups', 'moodle'
    actions: [String]     // e.g., ['create', 'read', 'update', 'delete']
  }],
  hierarchy: { type: Number, default: 0 },  // 0=student, 1=instructor, 2=admin
  moodleRoleMapping: { type: String },       // Moodle role ID for sync
  createdAt: { type: Date, default: Date.now }
});

// Enhanced User Schema with Role Reference
const UserSchema = new Schema({
  // ... existing fields ...
  
  role: { 
    type: String, 
    enum: ['student', 'instructor', 'admin'], 
    default: 'student' 
  },
  roleRef: { type: Schema.Types.ObjectId, ref: 'Role' },
  
  // Moodle Role Sync
  moodleRole: { type: String },              // Role in Moodle
  moodleRoleSyncedAt: { type: Date },
  
  // Instructor-specific
  instructorVerified: { type: Boolean, default: false },
  instructorDepartment: { type: String },
  instructorCourses: [{ type: String }],     // Moodle course IDs
  
  // Admin-specific
  adminLevel: { type: String, enum: ['super', 'moderator', 'support'] },
  adminPermissions: [String]                  // Custom permission overrides
});
```

### 7.4 RBAC Middleware

```javascript
// middleware/rbac.js

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const role = await Role.findOne({ name: user.role });
      
      // Check if role has permission for resource and action
      const permission = role.permissions.find(p => p.resource === resource);
      
      if (!permission || !permission.actions.includes(action)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions'
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Requires ${allowedRoles.join(' or ')} role`
      });
    }
    next();
  };
};

const requireMinRole = (minRole) => {
  const hierarchy = { student: 0, instructor: 1, admin: 2 };
  return (req, res, next) => {
    if (hierarchy[req.user.role] < hierarchy[minRole]) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Requires ${minRole} or higher`
      });
    }
    next();
  };
};

// Resource ownership check
const checkOwnership = (model, paramField = 'id') => {
  return async (req, res, next) => {
    const resource = await model.findById(req.params[paramField]);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Admins can access anything
    if (req.user.role === 'admin') {
      req.resource = resource;
      return next();
    }
    
    // Check ownership
    const ownerId = resource.author || resource.creator || resource.user;
    if (ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: Not owner' });
    }
    
    req.resource = resource;
    next();
  };
};

module.exports = { checkPermission, requireRole, requireMinRole, checkOwnership };
```

### 7.5 Role-Specific API Endpoints

```
# Admin-only endpoints
GET    /api/admin/users                   - List all users with filters
PUT    /api/admin/users/:id/role          - Change user role
POST   /api/admin/users/:id/ban           - Ban user
DELETE /api/admin/users/:id/ban           - Unban user
GET    /api/admin/reports                 - View all reports
PUT    /api/admin/reports/:id/resolve     - Resolve report
GET    /api/admin/analytics               - System analytics
GET    /api/admin/audit-logs              - View audit logs
PUT    /api/admin/settings                - Update system settings
POST   /api/admin/moodle/sync-all         - Trigger full Moodle sync

# Instructor-only endpoints  
GET    /api/instructor/courses            - Get instructor's courses
GET    /api/instructor/courses/:id/students - View enrolled students
POST   /api/instructor/courses/:id/announcements - Create announcement
PUT    /api/instructor/courses/:id/grades - Update grades (→ Moodle)
POST   /api/instructor/groups/:id/pin/:postId - Pin post in group
DELETE /api/instructor/groups/:id/members/:userId - Remove member
GET    /api/instructor/analytics          - Course analytics

# Enhanced user endpoints with role checks
PUT    /api/users/:id/verify-instructor   - Request instructor verification (Admin approves)
GET    /api/users/instructors             - List verified instructors
```

---

## 8. Two-Way Moodle Synchronization

### 8.1 Bidirectional Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TWO-WAY MOODLE SYNCHRONIZATION                        │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐                              ┌──────────────────┐
│   Social Network │                              │    Moodle LMS    │
│      (MERN)      │                              │                  │
├──────────────────┤                              ├──────────────────┤
│                  │                              │                  │
│  ┌────────────┐  │   ──── INBOUND SYNC ────▶   │  ┌────────────┐  │
│  │   Users    │◀─┼──────────────────────────────┼──│   Users    │  │
│  └────────────┘  │                              │  └────────────┘  │
│                  │   ◀─── OUTBOUND SYNC ────   │                  │
│  ┌────────────┐  │                              │  ┌────────────┐  │
│  │  Courses   │◀─┼──────────────────────────────┼──│  Courses   │  │
│  └────────────┘  │                              │  └────────────┘  │
│                  │                              │                  │
│  ┌────────────┐  │   ◀──── BIDIRECTIONAL ────▶ │  ┌────────────┐  │
│  │   Posts    │◀─┼──────────────────────────────┼──│   Forums   │  │
│  └────────────┘  │                              │  └────────────┘  │
│                  │                              │                  │
│  ┌────────────┐  │   ◀──── BIDIRECTIONAL ────▶ │  ┌────────────┐  │
│  │   Grades   │◀─┼──────────────────────────────┼──│   Grades   │  │
│  └────────────┘  │                              │  └────────────┘  │
│                  │                              │                  │
│  ┌────────────┐  │   ───── OUTBOUND ─────────▶ │  ┌────────────┐  │
│  │Submissions │──┼──────────────────────────────┼─▶│Assignments │  │
│  └────────────┘  │                              │  └────────────┘  │
│                  │                              │                  │
└──────────────────┘                              └──────────────────┘
        │                                                  │
        │              ┌────────────────┐                  │
        └─────────────▶│   Sync Queue   │◀─────────────────┘
                       │    (Redis)     │
                       └────────────────┘
                              │
                       ┌──────┴──────┐
                       │  Sync Jobs  │
                       │   (Bull)    │
                       └─────────────┘
```

### 8.2 Sync Operations Overview

| Data Type | Direction | Trigger | Frequency |
|-----------|-----------|---------|-----------|
| User Roles | Moodle → Social | Webhook/Scheduled | Real-time + 6 hours |
| Course Enrollment | Moodle → Social | Webhook/Scheduled | Real-time + 6 hours |
| Assignments | Moodle → Social | Scheduled | Every 6 hours |
| Deadlines | Moodle → Social | Scheduled | Every hour |
| Grades (View) | Moodle → Social | On-demand | User request |
| Grades (Update) | Social → Moodle | Instructor action | Real-time |
| Forum Posts | Bidirectional | User action | Real-time |
| Submissions | Social → Moodle | Student action | Real-time |
| Announcements | Social → Moodle | Instructor action | Real-time |
| Resources | Moodle → Social | Scheduled | Every 6 hours |

### 8.3 Outbound Sync (Social → Moodle)

#### Required Moodle Web Services for Write Operations
```
# Grade Management
mod_assign_save_grade              - Update assignment grades
core_grades_update_grades          - Update gradebook grades

# Forum Integration  
mod_forum_add_discussion           - Create new forum discussion
mod_forum_add_discussion_post      - Add reply to discussion

# Assignment Submissions
mod_assign_save_submission         - Submit assignment
mod_assign_submit_for_grading      - Mark submission for grading

# Messaging
core_message_send_instant_messages - Send messages to users

# Course Content (Admin/Instructor)
core_course_create_courses         - Create new courses
core_course_update_courses         - Update course settings
mod_resource_view_resource         - Track resource views

# User Management (Admin)
core_user_create_users             - Create new users
core_user_update_users             - Update user profiles
```

#### Outbound Sync Service
```javascript
// services/moodle/outboundSync.js

class MoodleOutboundSync {
  constructor(moodleClient) {
    this.client = moodleClient;
  }

  /**
   * Sync grade from Social Network to Moodle
   * Called when instructor updates grade in our platform
   */
  async syncGradeToMoodle(userId, assignmentId, grade, feedback) {
    try {
      // Get Moodle IDs
      const user = await User.findById(userId);
      const assignment = await MoodleAssignment.findOne({ localId: assignmentId });
      
      if (!user.moodleUserId || !assignment.moodleId) {
        throw new Error('Missing Moodle mapping');
      }

      // Call Moodle API
      const result = await this.client.call('mod_assign_save_grade', {
        assignmentid: assignment.moodleId,
        userid: user.moodleUserId,
        grade: grade,
        attemptnumber: -1,
        addattempt: 0,
        workflowstate: 'graded',
        plugindata: {
          assignfeedbackcomments_editor: {
            text: feedback,
            format: 1
          }
        }
      });

      // Log sync event
      await SyncLog.create({
        direction: 'outbound',
        type: 'grade',
        localId: assignmentId,
        moodleId: assignment.moodleId,
        status: 'success',
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      await SyncLog.create({
        direction: 'outbound',
        type: 'grade',
        localId: assignmentId,
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Post discussion to Moodle forum
   * Syncs social network posts to corresponding Moodle forum
   */
  async syncPostToMoodleForum(postId) {
    const post = await Post.findById(postId).populate('author');
    const group = await Group.findById(post.group);
    
    if (!group.moodleCourseId || !group.moodleForumId) {
      return null; // No Moodle forum linked
    }

    const result = await this.client.call('mod_forum_add_discussion', {
      forumid: group.moodleForumId,
      subject: post.title || `Post by ${post.author.username}`,
      message: post.content,
      messageformat: 1
    });

    // Store Moodle discussion ID for future sync
    post.moodleDiscussionId = result.discussionid;
    await post.save();

    return result;
  }

  /**
   * Submit assignment to Moodle
   * Students can submit from Social Network
   */
  async submitAssignmentToMoodle(userId, assignmentId, submissionData) {
    const user = await User.findById(userId);
    const assignment = await MoodleAssignment.findOne({ localId: assignmentId });

    // Upload files if any
    let fileItemId = 0;
    if (submissionData.files && submissionData.files.length > 0) {
      fileItemId = await this.uploadFilesToMoodle(submissionData.files);
    }

    // Save submission
    const result = await this.client.call('mod_assign_save_submission', {
      assignmentid: assignment.moodleId,
      plugindata: {
        onlinetext_editor: {
          text: submissionData.text || '',
          format: 1,
          itemid: 0
        },
        files_filemanager: fileItemId
      }
    });

    // Mark for grading
    await this.client.call('mod_assign_submit_for_grading', {
      assignmentid: assignment.moodleId,
      acceptsubmissionstatement: true
    });

    return result;
  }

  /**
   * Create announcement in Moodle
   * Instructor posts announcement that syncs to Moodle
   */
  async syncAnnouncementToMoodle(announcementId) {
    const announcement = await Announcement.findById(announcementId)
      .populate('course')
      .populate('author');

    if (!announcement.course.moodleForumId) {
      return null;
    }

    // Post to Moodle's announcement forum
    const result = await this.client.call('mod_forum_add_discussion', {
      forumid: announcement.course.moodleAnnouncementForumId,
      subject: announcement.title,
      message: announcement.content,
      messageformat: 1,
      options: [
        { name: 'discussionpinned', value: announcement.pinned ? 1 : 0 }
      ]
    });

    announcement.moodleDiscussionId = result.discussionid;
    await announcement.save();

    return result;
  }
}

module.exports = MoodleOutboundSync;
```

### 8.4 Inbound Sync (Moodle → Social)

#### Inbound Sync Service
```javascript
// services/moodle/inboundSync.js

class MoodleInboundSync {
  constructor(moodleClient) {
    this.client = moodleClient;
  }

  /**
   * Sync user roles from Moodle
   * Updates local user roles based on Moodle roles
   */
  async syncUserRolesFromMoodle(userId) {
    const user = await User.findById(userId);
    
    if (!user.moodleUserId) {
      return null;
    }

    // Get user's courses and roles from Moodle
    const courses = await this.client.call('core_enrol_get_users_courses', {
      userid: user.moodleUserId
    });

    // Determine highest role
    let highestRole = 'student';
    
    for (const course of courses) {
      // Get user's role in this course
      const enrolledUsers = await this.client.call('core_enrol_get_enrolled_users', {
        courseid: course.id,
        options: [{ name: 'userids', value: user.moodleUserId }]
      });

      if (enrolledUsers.length > 0) {
        const userEnrollment = enrolledUsers[0];
        const roles = userEnrollment.roles || [];
        
        for (const role of roles) {
          if (role.shortname === 'editingteacher' || role.shortname === 'teacher') {
            highestRole = 'instructor';
          }
          if (role.shortname === 'manager' || role.shortname === 'admin') {
            highestRole = 'admin';
          }
        }
      }
    }

    // Update local role if changed
    if (user.role !== highestRole) {
      user.role = highestRole;
      user.moodleRole = highestRole;
      user.moodleRoleSyncedAt = new Date();
      await user.save();

      // Emit role change event
      EventEmitter.emit('user:roleChanged', {
        userId: user.id,
        oldRole: user.role,
        newRole: highestRole,
        source: 'moodle'
      });
    }

    return { role: highestRole, synced: true };
  }

  /**
   * Sync course enrollment from Moodle
   */
  async syncCourseEnrollment(userId) {
    const user = await User.findById(userId);
    const courses = await this.client.call('core_enrol_get_users_courses', {
      userid: user.moodleUserId
    });

    const syncedCourses = [];

    for (const moodleCourse of courses) {
      // Find or create local course record
      let course = await MoodleCourse.findOne({ moodleId: moodleCourse.id.toString() });
      
      if (!course) {
        course = await MoodleCourse.create({
          moodleId: moodleCourse.id.toString(),
          shortName: moodleCourse.shortname,
          fullName: moodleCourse.fullname,
          summary: moodleCourse.summary,
          enrolledUsers: [user._id]
        });

        // Auto-create linked group
        const group = await Group.create({
          name: moodleCourse.fullname,
          description: moodleCourse.summary,
          privacy: 'private',
          creator: user._id,
          members: [user._id],
          moodleCourseId: moodleCourse.id.toString(),
          moodleCourseName: moodleCourse.fullname,
          isMoodleSynced: true
        });

        course.linkedGroup = group._id;
        await course.save();
      } else {
        // Add user to course if not already enrolled
        if (!course.enrolledUsers.includes(user._id)) {
          course.enrolledUsers.push(user._id);
          await course.save();
        }

        // Add to linked group
        if (course.linkedGroup) {
          const group = await Group.findById(course.linkedGroup);
          if (!group.members.includes(user._id)) {
            group.members.push(user._id);
            await group.save();
          }
        }
      }

      syncedCourses.push(course);
    }

    return syncedCourses;
  }

  /**
   * Sync forum discussions from Moodle to Social Network posts
   */
  async syncForumDiscussions(courseId) {
    const course = await MoodleCourse.findOne({ moodleId: courseId });
    
    // Get forums for course
    const forums = await this.client.call('mod_forum_get_forums_by_courses', {
      courseids: [parseInt(courseId)]
    });

    for (const forum of forums) {
      // Get discussions
      const discussions = await this.client.call('mod_forum_get_forum_discussions', {
        forumid: forum.id,
        sortby: 'timemodified',
        sortdirection: 'DESC',
        page: 0,
        perpage: 50
      });

      for (const discussion of discussions.discussions) {
        // Check if already synced
        let post = await Post.findOne({ moodleDiscussionId: discussion.id.toString() });
        
        if (!post) {
          // Find local user
          const author = await User.findOne({ moodleUserId: discussion.userid.toString() });
          
          if (author) {
            post = await Post.create({
              author: author._id,
              content: discussion.message,
              group: course.linkedGroup,
              moodleCourseId: courseId,
              moodleDiscussionId: discussion.id.toString(),
              moodleActivityType: 'forum',
              visibility: 'group',
              createdAt: new Date(discussion.created * 1000)
            });
          }
        } else {
          // Update if modified
          if (new Date(discussion.timemodified * 1000) > post.updatedAt) {
            post.content = discussion.message;
            post.updatedAt = new Date(discussion.timemodified * 1000);
            post.isEdited = true;
            await post.save();
          }
        }
      }
    }
  }

  /**
   * Sync grades from Moodle
   */
  async syncGrades(userId, courseId) {
    const user = await User.findById(userId);
    
    const grades = await this.client.call('gradereport_user_get_grades_table', {
      courseid: parseInt(courseId),
      userid: parseInt(user.moodleUserId)
    });

    // Store grades locally for quick access
    const gradeRecords = [];
    
    for (const table of grades.tables) {
      for (const row of table.tabledata) {
        if (row.grade) {
          gradeRecords.push({
            userId: user._id,
            courseId: courseId,
            itemName: row.itemname?.content || 'Unknown',
            grade: row.grade?.content || 'N/A',
            percentage: row.percentage?.content || 'N/A',
            syncedAt: new Date()
          });
        }
      }
    }

    // Update local grade cache
    await GradeCache.deleteMany({ userId: user._id, courseId });
    await GradeCache.insertMany(gradeRecords);

    return gradeRecords;
  }
}

module.exports = MoodleInboundSync;
```

### 8.5 Sync Conflict Resolution

```javascript
// services/moodle/conflictResolver.js

class SyncConflictResolver {
  /**
   * Resolve conflicts when same data is modified in both systems
   */
  static async resolveConflict(localData, moodleData, options = {}) {
    const strategy = options.strategy || 'moodle_wins';
    
    const conflict = {
      localData,
      moodleData,
      localModified: new Date(localData.updatedAt),
      moodleModified: new Date(moodleData.timemodified * 1000),
      resolvedBy: strategy,
      resolvedAt: new Date()
    };

    switch (strategy) {
      case 'moodle_wins':
        // Moodle is source of truth
        conflict.winner = 'moodle';
        conflict.result = moodleData;
        break;

      case 'local_wins':
        // Local changes take precedence
        conflict.winner = 'local';
        conflict.result = localData;
        break;

      case 'latest_wins':
        // Most recent modification wins
        if (conflict.localModified > conflict.moodleModified) {
          conflict.winner = 'local';
          conflict.result = localData;
        } else {
          conflict.winner = 'moodle';
          conflict.result = moodleData;
        }
        break;

      case 'merge':
        // Attempt to merge non-conflicting fields
        conflict.winner = 'merged';
        conflict.result = await this.mergeData(localData, moodleData);
        break;

      case 'manual':
        // Flag for manual review
        conflict.winner = 'pending';
        conflict.requiresReview = true;
        await ConflictQueue.create(conflict);
        break;
    }

    // Log conflict resolution
    await SyncLog.create({
      type: 'conflict_resolution',
      strategy,
      winner: conflict.winner,
      localData: JSON.stringify(localData),
      moodleData: JSON.stringify(moodleData),
      timestamp: new Date()
    });

    return conflict;
  }

  static async mergeData(local, moodle) {
    // Merge logic for specific data types
    return {
      ...moodle,
      // Preserve local-only fields
      localId: local._id,
      localMetadata: local.metadata
    };
  }
}

module.exports = SyncConflictResolver;
```

### 8.6 Sync Job Queue

```javascript
// jobs/moodleSyncJobs.js

const Queue = require('bull');
const syncQueue = new Queue('moodle-sync', process.env.REDIS_URL);

// Scheduled sync jobs
syncQueue.add('sync-all-courses', {}, {
  repeat: { cron: '0 */6 * * *' }  // Every 6 hours
});

syncQueue.add('sync-deadlines', {}, {
  repeat: { cron: '0 * * * *' }    // Every hour
});

syncQueue.add('sync-user-roles', {}, {
  repeat: { cron: '0 0 * * *' }    // Daily
});

// Process jobs
syncQueue.process('sync-all-courses', async (job) => {
  const inboundSync = new MoodleInboundSync(moodleClient);
  const courses = await MoodleCourse.find({});
  
  for (const course of courses) {
    await inboundSync.syncForumDiscussions(course.moodleId);
    job.progress(courses.indexOf(course) / courses.length * 100);
  }
});

syncQueue.process('sync-user-roles', async (job) => {
  const inboundSync = new MoodleInboundSync(moodleClient);
  const users = await User.find({ moodleConnected: true });
  
  for (const user of users) {
    await inboundSync.syncUserRolesFromMoodle(user._id);
  }
});

// Real-time sync triggers
const triggerOutboundSync = async (type, data) => {
  await syncQueue.add(`outbound-${type}`, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  });
};

module.exports = { syncQueue, triggerOutboundSync };
```

### 8.7 Moodle Webhook Handler

```javascript
// routes/webhooks/moodle.js

const router = require('express').Router();
const crypto = require('crypto');

// Verify webhook signature
const verifyMoodleWebhook = (req, res, next) => {
  const signature = req.headers['x-moodle-signature'];
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', process.env.MOODLE_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  next();
};

// Handle Moodle events
router.post('/moodle', verifyMoodleWebhook, async (req, res) => {
  const { eventname, userid, courseid, objectid, timecreated } = req.body;

  try {
    switch (eventname) {
      case '\\core\\event\\user_enrolment_created':
        await handleEnrollment(userid, courseid, 'enrolled');
        break;

      case '\\core\\event\\user_enrolment_deleted':
        await handleEnrollment(userid, courseid, 'unenrolled');
        break;

      case '\\core\\event\\role_assigned':
        await handleRoleChange(userid, courseid, req.body.relateduserid);
        break;

      case '\\mod_assign\\event\\submission_graded':
        await handleGradeUpdate(userid, objectid);
        break;

      case '\\mod_forum\\event\\discussion_created':
        await handleForumPost(userid, objectid, courseid);
        break;

      case '\\core\\event\\course_created':
        await handleCourseCreated(objectid);
        break;

      default:
        console.log('Unhandled Moodle event:', eventname);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 8.8 Sync Status Schema

```javascript
const SyncLogSchema = new Schema({
  direction: { type: String, enum: ['inbound', 'outbound', 'bidirectional'] },
  type: { type: String },  // 'user', 'course', 'grade', 'forum', 'assignment'
  localId: { type: Schema.Types.ObjectId },
  moodleId: { type: String },
  status: { type: String, enum: ['pending', 'success', 'failed', 'conflict'] },
  error: { type: String },
  conflictResolution: {
    strategy: String,
    winner: String,
    details: Schema.Types.Mixed
  },
  timestamp: { type: Date, default: Date.now },
  processedAt: { type: Date },
  retryCount: { type: Number, default: 0 }
});

// Index for efficient querying
SyncLogSchema.index({ type: 1, status: 1, timestamp: -1 });
SyncLogSchema.index({ localId: 1, direction: 1 });
```

### 8.9 Two-Way Sync API Endpoints

```
# Sync Management (Admin)
GET    /api/admin/sync/status           - Get overall sync status
GET    /api/admin/sync/logs             - View sync logs
POST   /api/admin/sync/trigger/:type    - Manually trigger sync
GET    /api/admin/sync/conflicts        - View unresolved conflicts
PUT    /api/admin/sync/conflicts/:id    - Resolve conflict manually

# User Sync
POST   /api/moodle/sync/user            - Sync current user data from Moodle
POST   /api/moodle/sync/roles           - Sync user roles from Moodle

# Instructor Two-Way Actions
POST   /api/instructor/grades/sync      - Push grades to Moodle
POST   /api/instructor/announcements/sync - Push announcement to Moodle
POST   /api/instructor/forum/sync/:postId - Sync post to Moodle forum

# Student Two-Way Actions
POST   /api/student/submit/:assignmentId - Submit assignment to Moodle
POST   /api/student/forum/post/:courseId - Post to Moodle forum
```

---

## 9. Project Structure

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

## 10. Development Phases

### Phase 1: Foundation (Weeks 1-3)
- [x] Project setup and architecture design
- [ ] Database schema implementation
- [ ] User authentication (JWT, OAuth)
- [ ] RBAC implementation
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

### Phase 4: Moodle Integration (Weeks 10-13)
- [ ] Moodle OAuth setup
- [ ] Inbound sync service (Moodle → Social)
- [ ] Outbound sync service (Social → Moodle)
- [ ] Two-way forum synchronization
- [ ] Grade management with Moodle sync
- [ ] Course-linked groups
- [ ] Conflict resolution system
- [ ] Webhook handlers

### Phase 5: Polish & Launch (Weeks 14-16)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Security audit
- [ ] Testing and bug fixes
- [ ] Documentation
- [ ] Deployment setup

---

## 11. Environment Configuration

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
MOODLE_WEBHOOK_SECRET=your_webhook_secret_for_verification

# Two-Way Sync Settings
SYNC_INTERVAL_COURSES=21600000        # 6 hours in ms
SYNC_INTERVAL_DEADLINES=3600000       # 1 hour in ms
SYNC_CONFLICT_STRATEGY=moodle_wins    # moodle_wins, local_wins, latest_wins, manual

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

## 12. Security Considerations

### Authentication & Authorization
- JWT with refresh tokens
- Password hashing with bcrypt (12 salt rounds)
- Rate limiting on authentication endpoints
- Account lockout after failed attempts
- Role-based access control (RBAC) enforcement

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
- Webhook signature verification
- Two-way sync authentication

### API Security
- CORS configuration
- Request rate limiting
- API versioning
- Input size limits
- Role-based endpoint protection

---

## 13. Testing Strategy

### Unit Tests
- Model validation
- Service logic
- RBAC middleware
- Utility functions
- React components

### Integration Tests
- API endpoints
- Database operations
- Moodle API integration
- Two-way sync operations
- Authentication flows

### E2E Tests
- User registration/login
- Post creation flow
- Messaging flow
- Moodle connection flow
- Grade sync flow

### Tools
- Jest (unit/integration)
- React Testing Library
- Supertest (API testing)
- Cypress (E2E)

---

## 14. Deployment Architecture

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

## 15. Estimated Timeline & Resources

| Phase | Duration | Resources |
|-------|----------|-----------|
| Phase 1: Foundation + RBAC | 3 weeks | 2 Full-stack developers |
| Phase 2: Social Features | 3 weeks | 2 Full-stack developers |
| Phase 3: Messaging & Groups | 3 weeks | 2 Full-stack developers |
| Phase 4: Two-Way Moodle Integration | 4 weeks | 2 Full-stack + 1 Integration specialist |
| Phase 5: Polish & Launch | 3 weeks | Full team |

**Total Estimated Duration**: 16 weeks (4 months)

---

## 16. Future Enhancements

- Mobile applications (React Native)
- Video calling integration
- AI-powered content recommendations
- Advanced analytics dashboard
- Multi-language support (i18n)
- Gamification features (badges, points)
- File sharing and collaboration tools
- Calendar integration
- Third-party LMS support (Canvas, Blackboard)
- Advanced two-way sync with more Moodle modules

---

## 17. Getting Started

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
| 1.1 | 2026-01-30 | Planning Team | Added comprehensive RBAC (Student, Instructor, Admin) and Two-Way Moodle Synchronization |

---

*This document serves as a comprehensive planning guide for the MERN Social Network with Moodle Integration project. It should be updated as requirements evolve and development progresses.*

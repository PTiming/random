# MERN Social Network with Moodle Integration - Project Plan

## 1. Project Overview

### 1.1 Executive Summary
A full-featured social networking platform built with the MERN stack (MongoDB, Express.js, React, Node.js) that integrates seamlessly with Moodle LMS (Learning Management System). This platform enables students, instructors, and educational communities to connect, collaborate, and enhance their learning experience.

### 1.2 Key Objectives
- Create an engaging social platform for educational communities
- Integrate with Moodle for seamless course-related social interactions
- Enable real-time communication and collaboration
- Support multimedia content sharing and discussions
- Provide analytics for engagement and learning outcomes

---

## 2. Technical Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              React.js Frontend Application               │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │    │
│  │  │  Redux  │ │ React   │ │ Socket  │ │ Moodle SSO  │   │    │
│  │  │  Store  │ │ Router  │ │ Client  │ │   Module    │   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           Node.js + Express.js Backend                   │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │    │
│  │  │  REST   │ │ GraphQL │ │ Socket  │ │   Moodle    │   │    │
│  │  │  API    │ │   API   │ │   IO    │ │   Service   │   │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │   MongoDB    │  │    Redis     │  │   File Storage   │      │
│  │   Database   │  │    Cache     │  │   (AWS S3/Local) │      │
│  └──────────────┘  └──────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │ Moodle LMS   │  │ Email Service│  │  Push Notif.    │      │
│  │ (Web Service)│  │  (SendGrid)  │  │  (Firebase)     │      │
│  └──────────────┘  └──────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

#### Backend
| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js 18+ | Server-side JavaScript |
| Framework | Express.js 4.x | REST API framework |
| GraphQL | Apollo Server | GraphQL API (optional) |
| Real-time | Socket.IO | WebSocket connections |
| Database | MongoDB 6+ | Primary data store |
| ODM | Mongoose 7+ | MongoDB object modeling |
| Cache | Redis | Session & data caching |
| Auth | JWT + Passport.js | Authentication |
| Validation | Joi / Yup | Request validation |
| File Upload | Multer + AWS S3 | File handling |

#### Frontend
| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React 18+ | UI library |
| State | Redux Toolkit | State management |
| Routing | React Router 6 | Client-side routing |
| UI Library | Material-UI / Chakra UI | Component library |
| Forms | React Hook Form | Form handling |
| HTTP Client | Axios | API requests |
| Real-time | Socket.IO Client | WebSocket client |
| Styling | Tailwind CSS / Styled Components | Styling |

#### DevOps & Infrastructure
| Component | Technology | Purpose |
|-----------|------------|---------|
| Containerization | Docker | Container runtime |
| Orchestration | Docker Compose / K8s | Container orchestration |
| CI/CD | GitHub Actions | Automated pipelines |
| Hosting | AWS / DigitalOcean / Heroku | Cloud infrastructure |
| CDN | CloudFront / Cloudflare | Content delivery |
| Monitoring | PM2 / New Relic | Application monitoring |

---

## 3. Feature Specifications

### 3.1 Core Social Features

#### 3.1.1 User Management
- **Registration & Authentication**
  - Email/password registration
  - Social login (Google, Facebook, GitHub)
  - Moodle SSO integration
  - Email verification
  - Password reset functionality
  - Two-factor authentication (2FA)

- **User Profiles**
  - Profile picture and cover photo
  - Bio and personal information
  - Education history
  - Skills and interests
  - Privacy settings
  - Connected Moodle courses
  - Activity timeline

#### 3.1.2 Posts & Content
- **Post Types**
  - Text posts
  - Image posts (single/multiple)
  - Video posts
  - Link previews
  - Document sharing
  - Polls
  - Events
  - Course-related posts (linked to Moodle)

- **Post Features**
  - Rich text editor
  - Mentions (@username)
  - Hashtags
  - Location tagging
  - Post scheduling
  - Edit/delete posts
  - Post visibility (public/friends/course members/private)

#### 3.1.3 Social Interactions
- **Reactions**
  - Like
  - Love
  - Celebrate
  - Support
  - Insightful

- **Comments**
  - Nested comments (threaded discussions)
  - Rich text comments
  - Mention users
  - Edit/delete comments
  - Comment reactions

- **Sharing**
  - Share to timeline
  - Share to groups
  - Share via direct message
  - External sharing (copy link)

#### 3.1.4 Connections
- **Friend System**
  - Send/accept/reject friend requests
  - Unfriend
  - Block/unblock users
  - Friend suggestions (based on courses, interests)

- **Following System**
  - Follow/unfollow users
  - Follower/following lists
  - Follow suggestions

#### 3.1.5 Groups
- **Group Types**
  - Public groups
  - Private groups
  - Course-linked groups (synced with Moodle)
  - Study groups

- **Group Features**
  - Group posts and discussions
  - Group files and resources
  - Group events
  - Member management
  - Admin/moderator roles
  - Group analytics

#### 3.1.6 Messaging
- **Direct Messages**
  - One-on-one messaging
  - Read receipts
  - Typing indicators
  - Message reactions
  - File/media sharing

- **Group Chats**
  - Create group conversations
  - Add/remove participants
  - Admin controls
  - Shared media gallery

- **Features**
  - Real-time messaging (WebSocket)
  - Message search
  - Message deletion
  - Mute conversations
  - Push notifications

#### 3.1.7 Notifications
- **Notification Types**
  - Friend requests
  - Post interactions (likes, comments, shares)
  - Mentions
  - Messages
  - Group activities
  - Course updates (from Moodle)
  - System notifications

- **Delivery Channels**
  - In-app notifications
  - Email notifications
  - Push notifications (mobile/desktop)

### 3.2 News Feed
- **Feed Algorithm**
  - Chronological feed option
  - Algorithmic feed (relevance-based)
  - Course-specific feeds
  - Group feeds

- **Feed Features**
  - Infinite scroll
  - Pull to refresh
  - Save posts
  - Hide posts
  - Report posts
  - Feed filters

### 3.3 Search & Discovery
- **Search Types**
  - Users
  - Posts
  - Groups
  - Hashtags
  - Courses

- **Discovery Features**
  - Trending topics
  - Suggested connections
  - Popular groups
  - Featured content

---

## 4. Moodle Integration

### 4.1 Integration Overview

```
┌────────────────────┐          ┌────────────────────┐
│                    │          │                    │
│   Social Network   │◄────────►│    Moodle LMS      │
│     Platform       │          │                    │
└────────────────────┘          └────────────────────┘
         │                               │
         │  • OAuth 2.0 / LTI           │
         │  • REST API                   │
         │  • Web Services               │
         │                               │
         ▼                               ▼
┌─────────────────────────────────────────────────────┐
│              Integration Features                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │     SSO     │ │   Course    │ │   Grade     │   │
│  │   Login     │ │    Sync     │ │    Sync     │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  Activity   │ │   Forum     │ │  Calendar   │   │
│  │   Feed      │ │   Sync      │ │    Sync     │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 4.2 Moodle Web Services Configuration

#### Required Moodle Web Services
```php
// Enable these Moodle web service functions:
$functions = [
    // User functions
    'core_user_get_users_by_field',
    'core_user_get_course_user_profiles',
    
    // Course functions
    'core_course_get_courses',
    'core_course_get_enrolled_courses_by_timeline_classification',
    'core_enrol_get_enrolled_users',
    'core_course_get_course_module',
    
    // Grade functions
    'gradereport_user_get_grades_table',
    'core_grades_get_grades',
    
    // Forum functions
    'mod_forum_get_forums_by_courses',
    'mod_forum_get_forum_discussions',
    'mod_forum_add_discussion_post',
    
    // Calendar functions
    'core_calendar_get_calendar_events',
    'core_calendar_get_calendar_upcoming_view',
    
    // Activity functions
    'core_completion_get_activities_completion_status',
    'core_course_get_contents'
];
```

### 4.3 Authentication Integration

#### 4.3.1 OAuth 2.0 Flow with Moodle
```javascript
// OAuth 2.0 Configuration
const moodleOAuthConfig = {
  authorizationURL: 'https://moodle.example.com/admin/oauth2/authorize.php',
  tokenURL: 'https://moodle.example.com/admin/oauth2/token.php',
  clientID: process.env.MOODLE_CLIENT_ID,
  clientSecret: process.env.MOODLE_CLIENT_SECRET,
  callbackURL: 'https://socialnetwork.example.com/auth/moodle/callback',
  scope: ['openid', 'profile', 'email']
};
```

#### 4.3.2 LTI 1.3 Integration
```javascript
// LTI 1.3 Configuration for deep linking
const ltiConfig = {
  platform: 'https://moodle.example.com',
  clientId: process.env.LTI_CLIENT_ID,
  deploymentId: process.env.LTI_DEPLOYMENT_ID,
  authenticationEndpoint: 'https://moodle.example.com/mod/lti/auth.php',
  accesstokenEndpoint: 'https://moodle.example.com/mod/lti/token.php',
  authorizationServer: 'https://moodle.example.com',
  keysetEndpoint: 'https://moodle.example.com/mod/lti/certs.php'
};
```

### 4.4 Data Synchronization

#### 4.4.1 Course Sync
- Sync enrolled courses to user profile
- Create course-specific groups automatically
- Sync course participants as potential connections
- Update course information periodically

#### 4.4.2 Activity Sync
- Display course deadlines in social feed
- Show assignment submissions as achievements
- Sync quiz completions
- Activity completion badges

#### 4.4.3 Forum Integration
- Bridge Moodle forums with social discussions
- Cross-post from social network to Moodle forums
- Unified notification for forum activities

#### 4.4.4 Calendar Integration
- Sync Moodle calendar events
- Display academic deadlines in social calendar
- Event reminders and notifications

### 4.5 Moodle Plugin Development

#### Social Network Block Plugin
```php
// blocks/socialnetwork/block_socialnetwork.php
class block_socialnetwork extends block_base {
    public function init() {
        $this->title = get_string('pluginname', 'block_socialnetwork');
    }
    
    public function get_content() {
        // Embed social network widget
        // Show recent social activity
        // Quick post to social network
    }
}
```

#### Activity Feed Plugin
```php
// local/socialnetwork/classes/observer.php
class local_socialnetwork_observer {
    public static function course_completed(\core\event\course_completed $event) {
        // Post achievement to social network
    }
    
    public static function assignment_submitted(\mod_assign\event\assessable_submitted $event) {
        // Optional: Share submission notification
    }
}
```

---

## 5. Database Schema Design

### 5.1 MongoDB Collections

#### Users Collection
```javascript
// users
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  username: String (unique, indexed),
  
  profile: {
    firstName: String,
    lastName: String,
    displayName: String,
    avatar: String (URL),
    coverPhoto: String (URL),
    bio: String,
    location: String,
    website: String,
    dateOfBirth: Date,
    education: [{
      institution: String,
      degree: String,
      field: String,
      startYear: Number,
      endYear: Number,
      current: Boolean
    }],
    skills: [String],
    interests: [String]
  },
  
  moodle: {
    userId: Number,
    token: String (encrypted),
    refreshToken: String (encrypted),
    moodleUrl: String,
    lastSync: Date,
    enrolledCourses: [{
      courseId: Number,
      courseName: String,
      shortName: String,
      role: String,
      enrolledAt: Date
    }]
  },
  
  settings: {
    privacy: {
      profileVisibility: String (enum: 'public', 'friends', 'private'),
      showEmail: Boolean,
      showBirthday: Boolean,
      allowMessagesFrom: String (enum: 'everyone', 'friends', 'none')
    },
    notifications: {
      email: {
        friendRequests: Boolean,
        messages: Boolean,
        mentions: Boolean,
        courseUpdates: Boolean
      },
      push: {
        friendRequests: Boolean,
        messages: Boolean,
        mentions: Boolean,
        courseUpdates: Boolean
      }
    }
  },
  
  stats: {
    postsCount: Number,
    friendsCount: Number,
    followersCount: Number,
    followingCount: Number
  },
  
  status: String (enum: 'active', 'inactive', 'suspended', 'deleted'),
  role: String (enum: 'user', 'moderator', 'admin'),
  verified: Boolean,
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ 'moodle.userId': 1 })
db.users.createIndex({ 'profile.displayName': 'text', bio: 'text' })
```

#### Posts Collection
```javascript
// posts
{
  _id: ObjectId,
  author: ObjectId (ref: users),
  
  content: {
    text: String,
    media: [{
      type: String (enum: 'image', 'video', 'document', 'link'),
      url: String,
      thumbnail: String,
      metadata: Object
    }],
    mentions: [ObjectId (ref: users)],
    hashtags: [String],
    links: [{
      url: String,
      title: String,
      description: String,
      image: String
    }]
  },
  
  type: String (enum: 'text', 'image', 'video', 'link', 'poll', 'event', 'share'),
  
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [ObjectId (ref: users)]
    }],
    endDate: Date,
    multipleChoice: Boolean
  },
  
  event: {
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    location: String,
    attendees: [{
      user: ObjectId (ref: users),
      status: String (enum: 'going', 'interested', 'not_going')
    }]
  },
  
  sharedPost: ObjectId (ref: posts),
  
  visibility: String (enum: 'public', 'friends', 'group', 'course', 'private'),
  group: ObjectId (ref: groups),
  course: {
    moodleCourseId: Number,
    courseName: String
  },
  
  reactions: {
    like: [ObjectId (ref: users)],
    love: [ObjectId (ref: users)],
    celebrate: [ObjectId (ref: users)],
    support: [ObjectId (ref: users)],
    insightful: [ObjectId (ref: users)]
  },
  
  stats: {
    reactionsCount: Number,
    commentsCount: Number,
    sharesCount: Number,
    viewsCount: Number
  },
  
  status: String (enum: 'published', 'draft', 'scheduled', 'deleted'),
  scheduledAt: Date,
  editedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.posts.createIndex({ author: 1, createdAt: -1 })
db.posts.createIndex({ group: 1, createdAt: -1 })
db.posts.createIndex({ 'course.moodleCourseId': 1 })
db.posts.createIndex({ visibility: 1, createdAt: -1 })
db.posts.createIndex({ 'content.hashtags': 1 })
db.posts.createIndex({ 'content.text': 'text' })
```

#### Comments Collection
```javascript
// comments
{
  _id: ObjectId,
  post: ObjectId (ref: posts, indexed),
  author: ObjectId (ref: users),
  parent: ObjectId (ref: comments, nullable), // for nested comments
  
  content: {
    text: String,
    media: [{
      type: String,
      url: String
    }],
    mentions: [ObjectId (ref: users)]
  },
  
  reactions: {
    like: [ObjectId (ref: users)],
    love: [ObjectId (ref: users)]
  },
  
  stats: {
    reactionsCount: Number,
    repliesCount: Number
  },
  
  edited: Boolean,
  editedAt: Date,
  status: String (enum: 'active', 'deleted'),
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.comments.createIndex({ post: 1, createdAt: 1 })
db.comments.createIndex({ parent: 1 })
db.comments.createIndex({ author: 1 })
```

#### Friendships Collection
```javascript
// friendships
{
  _id: ObjectId,
  requester: ObjectId (ref: users),
  recipient: ObjectId (ref: users),
  status: String (enum: 'pending', 'accepted', 'rejected', 'blocked'),
  actionBy: ObjectId (ref: users),
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.friendships.createIndex({ requester: 1, recipient: 1 }, { unique: true })
db.friendships.createIndex({ recipient: 1, status: 1 })
db.friendships.createIndex({ status: 1 })
```

#### Groups Collection
```javascript
// groups
{
  _id: ObjectId,
  name: String,
  slug: String (unique),
  description: String,
  avatar: String,
  coverPhoto: String,
  
  type: String (enum: 'public', 'private', 'course'),
  
  moodleCourse: {
    courseId: Number,
    courseName: String,
    shortName: String,
    autoSync: Boolean
  },
  
  members: [{
    user: ObjectId (ref: users),
    role: String (enum: 'admin', 'moderator', 'member'),
    joinedAt: Date
  }],
  
  settings: {
    postApproval: Boolean,
    memberApproval: Boolean,
    allowInvites: Boolean
  },
  
  stats: {
    membersCount: Number,
    postsCount: Number
  },
  
  status: String (enum: 'active', 'archived', 'deleted'),
  createdBy: ObjectId (ref: users),
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.groups.createIndex({ slug: 1 }, { unique: true })
db.groups.createIndex({ 'moodleCourse.courseId': 1 })
db.groups.createIndex({ 'members.user': 1 })
db.groups.createIndex({ name: 'text', description: 'text' })
```

#### Conversations Collection
```javascript
// conversations
{
  _id: ObjectId,
  type: String (enum: 'direct', 'group'),
  name: String (for group chats),
  avatar: String (for group chats),
  
  participants: [{
    user: ObjectId (ref: users),
    role: String (enum: 'admin', 'member'),
    joinedAt: Date,
    lastRead: Date,
    muted: Boolean,
    mutedUntil: Date
  }],
  
  lastMessage: {
    content: String,
    sender: ObjectId (ref: users),
    sentAt: Date
  },
  
  stats: {
    messagesCount: Number
  },
  
  createdBy: ObjectId (ref: users),
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.conversations.createIndex({ 'participants.user': 1 })
db.conversations.createIndex({ updatedAt: -1 })
```

#### Messages Collection
```javascript
// messages
{
  _id: ObjectId,
  conversation: ObjectId (ref: conversations),
  sender: ObjectId (ref: users),
  
  content: {
    text: String,
    media: [{
      type: String,
      url: String,
      name: String,
      size: Number
    }]
  },
  
  replyTo: ObjectId (ref: messages),
  
  reactions: [{
    user: ObjectId (ref: users),
    emoji: String
  }],
  
  readBy: [{
    user: ObjectId (ref: users),
    readAt: Date
  }],
  
  status: String (enum: 'sent', 'delivered', 'read', 'deleted'),
  deletedFor: [ObjectId (ref: users)],
  editedAt: Date,
  createdAt: Date
}

// Indexes
db.messages.createIndex({ conversation: 1, createdAt: -1 })
db.messages.createIndex({ sender: 1 })
```

#### Notifications Collection
```javascript
// notifications
{
  _id: ObjectId,
  recipient: ObjectId (ref: users),
  
  type: String (enum: 'friend_request', 'friend_accepted', 'post_like', 
                'post_comment', 'post_share', 'mention', 'message',
                'group_invite', 'group_post', 'course_update', 'system'),
  
  actor: ObjectId (ref: users),
  
  reference: {
    type: String (enum: 'post', 'comment', 'message', 'group', 'course'),
    id: ObjectId
  },
  
  content: String,
  
  read: Boolean,
  readAt: Date,
  
  emailSent: Boolean,
  pushSent: Boolean,
  
  createdAt: Date
}

// Indexes
db.notifications.createIndex({ recipient: 1, read: 1, createdAt: -1 })
db.notifications.createIndex({ recipient: 1, createdAt: -1 })
```

---

## 6. API Design

### 6.1 REST API Endpoints

#### Authentication
```
POST   /api/auth/register              - Register new user
POST   /api/auth/login                 - Login with email/password
POST   /api/auth/logout                - Logout user
POST   /api/auth/refresh-token         - Refresh access token
POST   /api/auth/forgot-password       - Request password reset
POST   /api/auth/reset-password        - Reset password
POST   /api/auth/verify-email          - Verify email address
GET    /api/auth/moodle                - Initiate Moodle OAuth
GET    /api/auth/moodle/callback       - Moodle OAuth callback
POST   /api/auth/moodle/link           - Link Moodle account
DELETE /api/auth/moodle/unlink         - Unlink Moodle account
```

#### Users
```
GET    /api/users                      - Search users
GET    /api/users/:id                  - Get user profile
PUT    /api/users/:id                  - Update user profile
DELETE /api/users/:id                  - Delete user account
GET    /api/users/:id/posts            - Get user's posts
GET    /api/users/:id/friends          - Get user's friends
GET    /api/users/:id/followers        - Get user's followers
GET    /api/users/:id/following        - Get user's following
GET    /api/users/:id/groups           - Get user's groups
GET    /api/users/:id/courses          - Get user's Moodle courses
PUT    /api/users/:id/settings         - Update user settings
POST   /api/users/:id/avatar           - Upload avatar
POST   /api/users/:id/cover            - Upload cover photo
```

#### Posts
```
GET    /api/posts                      - Get posts (feed)
POST   /api/posts                      - Create new post
GET    /api/posts/:id                  - Get single post
PUT    /api/posts/:id                  - Update post
DELETE /api/posts/:id                  - Delete post
POST   /api/posts/:id/react            - Add reaction to post
DELETE /api/posts/:id/react            - Remove reaction from post
POST   /api/posts/:id/share            - Share post
GET    /api/posts/:id/comments         - Get post comments
POST   /api/posts/:id/comments         - Add comment to post
```

#### Comments
```
GET    /api/comments/:id               - Get comment details
PUT    /api/comments/:id               - Update comment
DELETE /api/comments/:id               - Delete comment
POST   /api/comments/:id/react         - React to comment
DELETE /api/comments/:id/react         - Remove reaction
POST   /api/comments/:id/reply         - Reply to comment
```

#### Friends
```
GET    /api/friends                    - Get friends list
GET    /api/friends/requests           - Get friend requests
GET    /api/friends/sent               - Get sent requests
POST   /api/friends/request/:userId    - Send friend request
PUT    /api/friends/accept/:userId     - Accept friend request
DELETE /api/friends/reject/:userId     - Reject friend request
DELETE /api/friends/:userId            - Unfriend user
POST   /api/friends/block/:userId      - Block user
DELETE /api/friends/block/:userId      - Unblock user
GET    /api/friends/suggestions        - Get friend suggestions
```

#### Groups
```
GET    /api/groups                     - Get groups
POST   /api/groups                     - Create group
GET    /api/groups/:id                 - Get group details
PUT    /api/groups/:id                 - Update group
DELETE /api/groups/:id                 - Delete group
GET    /api/groups/:id/posts           - Get group posts
GET    /api/groups/:id/members         - Get group members
POST   /api/groups/:id/join            - Join group
DELETE /api/groups/:id/leave           - Leave group
POST   /api/groups/:id/invite          - Invite to group
PUT    /api/groups/:id/members/:userId - Update member role
DELETE /api/groups/:id/members/:userId - Remove member
```

#### Messaging
```
GET    /api/conversations              - Get conversations
POST   /api/conversations              - Create conversation
GET    /api/conversations/:id          - Get conversation
DELETE /api/conversations/:id          - Delete conversation
GET    /api/conversations/:id/messages - Get messages
POST   /api/conversations/:id/messages - Send message
PUT    /api/conversations/:id/read     - Mark as read
POST   /api/conversations/:id/mute     - Mute conversation
POST   /api/conversations/:id/participants - Add participants
```

#### Notifications
```
GET    /api/notifications              - Get notifications
PUT    /api/notifications/:id/read     - Mark as read
PUT    /api/notifications/read-all     - Mark all as read
DELETE /api/notifications/:id          - Delete notification
GET    /api/notifications/unread-count - Get unread count
```

#### Moodle Integration
```
GET    /api/moodle/courses             - Get enrolled courses
GET    /api/moodle/courses/:id         - Get course details
GET    /api/moodle/courses/:id/participants - Get course participants
GET    /api/moodle/courses/:id/activities - Get course activities
GET    /api/moodle/courses/:id/grades  - Get course grades
GET    /api/moodle/calendar            - Get calendar events
POST   /api/moodle/sync                - Sync Moodle data
GET    /api/moodle/forums/:id          - Get forum discussions
POST   /api/moodle/forums/:id/post     - Post to Moodle forum
```

#### Search
```
GET    /api/search                     - Global search
GET    /api/search/users               - Search users
GET    /api/search/posts               - Search posts
GET    /api/search/groups              - Search groups
GET    /api/search/hashtags            - Search hashtags
GET    /api/search/trending            - Get trending topics
```

### 6.2 WebSocket Events

#### Client to Server
```javascript
// Connection
socket.emit('authenticate', { token });
socket.emit('join-conversation', { conversationId });
socket.emit('leave-conversation', { conversationId });

// Messaging
socket.emit('send-message', { conversationId, content });
socket.emit('typing-start', { conversationId });
socket.emit('typing-stop', { conversationId });
socket.emit('message-read', { conversationId, messageId });

// Presence
socket.emit('set-status', { status: 'online' | 'away' | 'offline' });
```

#### Server to Client
```javascript
// Messaging
socket.on('new-message', { message, conversation });
socket.on('message-delivered', { messageId, conversationId });
socket.on('message-read', { messageId, conversationId, userId });
socket.on('user-typing', { conversationId, userId });
socket.on('user-stopped-typing', { conversationId, userId });

// Notifications
socket.on('notification', { notification });

// Presence
socket.on('user-online', { userId });
socket.on('user-offline', { userId });

// Posts (real-time feed)
socket.on('new-post', { post });
socket.on('post-updated', { post });
socket.on('post-deleted', { postId });
socket.on('new-comment', { comment, postId });
socket.on('post-reaction', { postId, userId, reaction });
```

---

## 7. Frontend Architecture

### 7.1 Directory Structure
```
client/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── assets/
│       └── images/
├── src/
│   ├── api/                    # API service layer
│   │   ├── axios.config.js
│   │   ├── auth.api.js
│   │   ├── users.api.js
│   │   ├── posts.api.js
│   │   ├── groups.api.js
│   │   ├── messages.api.js
│   │   ├── notifications.api.js
│   │   └── moodle.api.js
│   │
│   ├── components/             # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Avatar/
│   │   │   ├── Dropdown/
│   │   │   ├── Loader/
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── MainLayout/
│   │   ├── auth/
│   │   │   ├── LoginForm/
│   │   │   ├── RegisterForm/
│   │   │   └── MoodleLogin/
│   │   ├── posts/
│   │   │   ├── PostCard/
│   │   │   ├── PostForm/
│   │   │   ├── PostList/
│   │   │   ├── Comments/
│   │   │   ├── Reactions/
│   │   │   └── ShareDialog/
│   │   ├── profile/
│   │   │   ├── ProfileHeader/
│   │   │   ├── ProfileTabs/
│   │   │   ├── EditProfile/
│   │   │   └── FriendsList/
│   │   ├── groups/
│   │   │   ├── GroupCard/
│   │   │   ├── GroupHeader/
│   │   │   ├── GroupMembers/
│   │   │   └── CreateGroup/
│   │   ├── messaging/
│   │   │   ├── ConversationList/
│   │   │   ├── ChatWindow/
│   │   │   ├── MessageItem/
│   │   │   └── MessageInput/
│   │   ├── notifications/
│   │   │   ├── NotificationBell/
│   │   │   ├── NotificationItem/
│   │   │   └── NotificationList/
│   │   └── moodle/
│   │       ├── CourseCard/
│   │       ├── CourseList/
│   │       ├── ActivityFeed/
│   │       └── GradeOverview/
│   │
│   ├── pages/                  # Page components
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Profile/
│   │   ├── Settings/
│   │   ├── Groups/
│   │   ├── GroupDetail/
│   │   ├── Messages/
│   │   ├── Notifications/
│   │   ├── Search/
│   │   ├── Courses/
│   │   └── CourseDetail/
│   │
│   ├── store/                  # Redux store
│   │   ├── index.js
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── userSlice.js
│   │   │   ├── postsSlice.js
│   │   │   ├── groupsSlice.js
│   │   │   ├── messagesSlice.js
│   │   │   ├── notificationsSlice.js
│   │   │   └── moodleSlice.js
│   │   └── middleware/
│   │       └── socketMiddleware.js
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   ├── usePagination.js
│   │   ├── useInfiniteScroll.js
│   │   └── useMoodle.js
│   │
│   ├── context/                # React Context providers
│   │   ├── AuthContext.js
│   │   ├── SocketContext.js
│   │   └── ThemeContext.js
│   │
│   ├── utils/                  # Utility functions
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   ├── constants.js
│   │   └── helpers.js
│   │
│   ├── styles/                 # Global styles
│   │   ├── index.css
│   │   ├── variables.css
│   │   └── tailwind.config.js
│   │
│   ├── App.js
│   ├── index.js
│   └── routes.js
│
├── package.json
└── .env
```

### 7.2 Key Component Specifications

#### PostCard Component
```jsx
// components/posts/PostCard/PostCard.jsx
const PostCard = ({
  post,
  onReact,
  onComment,
  onShare,
  showComments = false
}) => {
  return (
    <Card>
      <PostHeader
        author={post.author}
        timestamp={post.createdAt}
        visibility={post.visibility}
        moodleCourse={post.course}
      />
      
      <PostContent
        text={post.content.text}
        media={post.content.media}
        links={post.content.links}
        poll={post.poll}
        event={post.event}
        sharedPost={post.sharedPost}
      />
      
      <PostStats
        reactions={post.stats.reactionsCount}
        comments={post.stats.commentsCount}
        shares={post.stats.sharesCount}
      />
      
      <PostActions
        onReact={onReact}
        onComment={onComment}
        onShare={onShare}
        userReaction={post.userReaction}
      />
      
      {showComments && (
        <CommentSection
          postId={post._id}
          comments={post.comments}
        />
      )}
    </Card>
  );
};
```

#### ChatWindow Component
```jsx
// components/messaging/ChatWindow/ChatWindow.jsx
const ChatWindow = ({ conversation }) => {
  const { messages, loading, hasMore, loadMore } = useMessages(conversation._id);
  const { sendMessage, typingUsers } = useSocket();
  
  return (
    <ChatContainer>
      <ChatHeader
        conversation={conversation}
        participants={conversation.participants}
      />
      
      <MessageList
        messages={messages}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        typingUsers={typingUsers}
      />
      
      <MessageInput
        onSend={(content) => sendMessage(conversation._id, content)}
        onTyping={() => socket.emit('typing-start', { conversationId: conversation._id })}
      />
    </ChatContainer>
  );
};
```

---

## 8. Backend Architecture

### 8.1 Directory Structure
```
server/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── database.js
│   │   ├── redis.js
│   │   ├── passport.js
│   │   ├── socket.js
│   │   ├── moodle.js
│   │   └── constants.js
│   │
│   ├── models/                 # Mongoose models
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   ├── Friendship.js
│   │   ├── Group.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   └── Notification.js
│   │
│   ├── controllers/            # Route controllers
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── posts.controller.js
│   │   ├── comments.controller.js
│   │   ├── friends.controller.js
│   │   ├── groups.controller.js
│   │   ├── messages.controller.js
│   │   ├── notifications.controller.js
│   │   ├── search.controller.js
│   │   └── moodle.controller.js
│   │
│   ├── routes/                 # API routes
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── posts.routes.js
│   │   ├── comments.routes.js
│   │   ├── friends.routes.js
│   │   ├── groups.routes.js
│   │   ├── messages.routes.js
│   │   ├── notifications.routes.js
│   │   ├── search.routes.js
│   │   └── moodle.routes.js
│   │
│   ├── middleware/             # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── validate.middleware.js
│   │   ├── rateLimiter.middleware.js
│   │   ├── upload.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── services/               # Business logic services
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── post.service.js
│   │   ├── feed.service.js
│   │   ├── notification.service.js
│   │   ├── email.service.js
│   │   ├── upload.service.js
│   │   └── moodle/
│   │       ├── moodle.service.js
│   │       ├── courses.service.js
│   │       ├── grades.service.js
│   │       ├── forums.service.js
│   │       └── calendar.service.js
│   │
│   ├── socket/                 # Socket.IO handlers
│   │   ├── index.js
│   │   ├── auth.handler.js
│   │   ├── messaging.handler.js
│   │   ├── presence.handler.js
│   │   └── notifications.handler.js
│   │
│   ├── validators/             # Request validators
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   ├── post.validator.js
│   │   └── ...
│   │
│   ├── utils/                  # Utility functions
│   │   ├── helpers.js
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── logger.js
│   │   └── crypto.js
│   │
│   ├── jobs/                   # Background jobs
│   │   ├── queue.js
│   │   ├── emailJob.js
│   │   ├── notificationJob.js
│   │   └── moodleSyncJob.js
│   │
│   └── app.js                  # Express app setup
│
├── tests/                      # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                    # Utility scripts
│   ├── seed.js
│   └── migrate.js
│
├── .env.example
├── package.json
└── server.js                   # Entry point
```

### 8.2 Key Service Implementations

#### Moodle Service
```javascript
// services/moodle/moodle.service.js
class MoodleService {
  constructor(moodleUrl, token) {
    this.moodleUrl = moodleUrl;
    this.token = token;
    this.apiUrl = `${moodleUrl}/webservice/rest/server.php`;
  }

  async callFunction(functionName, params = {}) {
    const response = await axios.post(this.apiUrl, null, {
      params: {
        wstoken: this.token,
        wsfunction: functionName,
        moodlewsrestformat: 'json',
        ...params
      }
    });
    
    if (response.data.exception) {
      throw new MoodleApiError(response.data);
    }
    
    return response.data;
  }

  async getEnrolledCourses(userId) {
    return this.callFunction('core_enrol_get_users_courses', { userid: userId });
  }

  async getCourseContents(courseId) {
    return this.callFunction('core_course_get_contents', { courseid: courseId });
  }

  async getGrades(courseId, userId) {
    return this.callFunction('gradereport_user_get_grades_table', {
      courseid: courseId,
      userid: userId
    });
  }

  async getCalendarEvents(startTime, endTime) {
    return this.callFunction('core_calendar_get_calendar_events', {
      events: { timestart: startTime, timeend: endTime }
    });
  }

  async getForumDiscussions(forumId) {
    return this.callFunction('mod_forum_get_forum_discussions', { forumid: forumId });
  }

  async postToForum(forumId, subject, message, parentId = 0) {
    return this.callFunction('mod_forum_add_discussion_post', {
      postid: parentId,
      subject,
      message
    });
  }
}
```

#### Feed Service
```javascript
// services/feed.service.js
class FeedService {
  async getUserFeed(userId, page = 1, limit = 20) {
    const user = await User.findById(userId);
    const friendIds = await this.getFriendIds(userId);
    const groupIds = await this.getUserGroupIds(userId);
    
    const posts = await Post.find({
      $or: [
        // Own posts
        { author: userId },
        // Friends' posts (public or friends visibility)
        { 
          author: { $in: friendIds },
          visibility: { $in: ['public', 'friends'] }
        },
        // Public posts
        { visibility: 'public' },
        // Group posts
        { 
          group: { $in: groupIds },
          visibility: 'group'
        },
        // Course posts (if Moodle linked)
        ...(user.moodle?.enrolledCourses?.map(c => ({
          'course.moodleCourseId': c.courseId,
          visibility: 'course'
        })) || [])
      ],
      status: 'published'
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'username profile.displayName profile.avatar')
    .populate('group', 'name avatar')
    .lean();

    return this.enrichPosts(posts, userId);
  }

  async enrichPosts(posts, userId) {
    return posts.map(post => ({
      ...post,
      userReaction: this.getUserReaction(post, userId),
      isOwner: post.author._id.toString() === userId
    }));
  }
}
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)
- [x] Project setup and configuration
- [ ] Database schema implementation
- [ ] User authentication (email/password)
- [ ] Basic user profiles
- [ ] JWT token management

### Phase 2: Core Social Features (Weeks 4-6)
- [ ] Post CRUD operations
- [ ] Comments system
- [ ] Reactions system
- [ ] Friend system
- [ ] Basic news feed

### Phase 3: Groups & Messaging (Weeks 7-9)
- [ ] Groups CRUD
- [ ] Group membership management
- [ ] Real-time messaging with Socket.IO
- [ ] Conversations and direct messages
- [ ] Group chats

### Phase 4: Moodle Integration (Weeks 10-12)
- [ ] Moodle OAuth integration
- [ ] Course synchronization
- [ ] Activity feed from Moodle
- [ ] Grade display
- [ ] Forum integration
- [ ] Calendar sync

### Phase 5: Enhanced Features (Weeks 13-15)
- [ ] Notifications system
- [ ] Search functionality
- [ ] Media uploads (images, videos)
- [ ] Polls and events
- [ ] Hashtags and mentions

### Phase 6: Polish & Optimization (Weeks 16-18)
- [ ] Performance optimization
- [ ] Caching implementation
- [ ] Security hardening
- [ ] Mobile responsiveness
- [ ] Accessibility improvements

### Phase 7: Testing & Deployment (Weeks 19-20)
- [ ] Unit testing
- [ ] Integration testing
- [ ] E2E testing
- [ ] CI/CD pipeline
- [ ] Production deployment
- [ ] Monitoring setup

---

## 10. Security Considerations

### 10.1 Authentication & Authorization
- Implement JWT with short expiration and refresh tokens
- Use HTTP-only cookies for token storage
- Implement role-based access control (RBAC)
- Rate limiting on authentication endpoints
- Account lockout after failed attempts
- Two-factor authentication support

### 10.2 Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Sanitize all user inputs
- Implement CSRF protection
- Content Security Policy headers
- Regular security audits

### 10.3 Moodle Integration Security
- Encrypt Moodle tokens at rest
- Use short-lived tokens
- Validate Moodle responses
- Implement token refresh mechanism
- Audit Moodle API calls

### 10.4 Privacy
- GDPR compliance considerations
- User data export functionality
- Account deletion with data purge
- Privacy settings for profile visibility
- Consent management for data processing

---

## 11. Deployment Architecture

### 11.1 Production Infrastructure
```
                    ┌─────────────────┐
                    │   CloudFlare    │
                    │      CDN        │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Load Balancer  │
                    │    (nginx)      │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
    │  Node.js  │     │  Node.js  │     │  Node.js  │
    │  Server 1 │     │  Server 2 │     │  Server 3 │
    └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
          │                 │                 │
          └────────────────┬┴─────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
┌───▼───┐            ┌─────▼─────┐          ┌────▼────┐
│MongoDB│            │   Redis   │          │   S3    │
│Cluster│            │  Cluster  │          │ Storage │
└───────┘            └───────────┘          └─────────┘
```

### 11.2 Docker Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
    depends_on:
      - backend

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/socialnetwork
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - MOODLE_URL=${MOODLE_URL}
      - MOODLE_TOKEN=${MOODLE_TOKEN}
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  mongo_data:
  redis_data:
```

### 11.3 Environment Variables
```bash
# .env.example

# App
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/socialnetwork
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Moodle Integration
MOODLE_URL=https://moodle.example.com
MOODLE_CLIENT_ID=your_client_id
MOODLE_CLIENT_SECRET=your_client_secret
MOODLE_REDIRECT_URI=http://localhost:5000/api/auth/moodle/callback

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=socialnetwork-uploads

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@socialnetwork.com

# Push Notifications (Firebase)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

---

## 12. Testing Strategy

### 12.1 Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Focus on business logic in services

### 12.2 Integration Tests
- Test API endpoints
- Test database operations
- Test Moodle service integration

### 12.3 E2E Tests
- Test complete user flows
- Use Cypress or Playwright
- Test critical paths (auth, posting, messaging)

### 12.4 Performance Tests
- Load testing with k6 or Artillery
- Stress testing
- Database query optimization

---

## 13. Monitoring & Logging

### 13.1 Application Monitoring
- PM2 for process management
- New Relic / DataDog for APM
- Custom health check endpoints

### 13.2 Logging
- Winston for structured logging
- ELK Stack for log aggregation
- Request/response logging

### 13.3 Error Tracking
- Sentry for error monitoring
- Automated alerts
- Error grouping and analysis

---

## 14. Future Enhancements

### Phase 2 Features
- Mobile applications (React Native)
- Video conferencing integration
- AI-powered content recommendations
- Gamification (badges, points, leaderboards)
- Advanced analytics dashboard
- Content moderation tools
- Multi-language support
- Offline support (PWA)

### Moodle Deep Integration
- Custom Moodle theme matching social network
- Embedded social features in Moodle
- Social learning analytics
- Peer assessment integration
- Collaborative document editing

---

## 15. Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- npm or yarn

### Quick Start
```bash
# Clone repository
git clone https://github.com/your-org/mern-social-moodle.git
cd mern-social-moodle

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

### Development Commands
```bash
npm run dev          # Start dev servers (frontend + backend)
npm run server       # Start backend only
npm run client       # Start frontend only
npm run test         # Run tests
npm run lint         # Run linter
npm run build        # Build for production
```

---

## Document Version
- **Version**: 1.0.0
- **Created**: January 2026
- **Last Updated**: January 2026
- **Author**: Development Team

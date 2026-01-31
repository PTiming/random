# MERN Social Network with Moodle Integration
## 🎓 Graduation Project Plan (Full Featured)

This is a comprehensive project plan for a **graduation project** with all requested features, suitable for a single developer or small team over **14-16 weeks**.

---

## 📋 Project Summary

A social networking platform for students that connects with Moodle LMS featuring:
- **Real-time messaging** (1-to-1 and group chat)
- **File sharing** 
- **Two-way Moodle synchronization**
- Social interactions (posts, likes, comments, follows)

---

## ✅ MVP Features (What to Build)

### Phase 1: Foundation (Weeks 1-2)
| Feature | Priority | Complexity |
|---------|----------|------------|
| User Registration & Login | Must Have | Low |
| JWT Authentication | Must Have | Low |
| Basic User Profiles | Must Have | Low |
| MongoDB Database Setup | Must Have | Low |

### Phase 2: Social Features (Weeks 3-5)
| Feature | Priority | Complexity |
|---------|----------|------------|
| Create/Edit/Delete Posts | Must Have | Medium |
| News Feed (view posts) | Must Have | Medium |
| Like Posts | Must Have | Low |
| Comment on Posts | Should Have | Medium |
| Follow/Unfollow Users | Should Have | Medium |
| **Image Upload for Posts** | Must Have | Medium |

### Phase 3: Real-Time Messaging (Weeks 6-7)
| Feature | Priority | Complexity |
|---------|----------|------------|
| **Socket.io Setup** | Must Have | Medium |
| **1-to-1 Private Messaging** | Must Have | Medium |
| **Conversation List** | Must Have | Medium |
| **Online/Offline Status** | Should Have | Low |
| **File Sharing in Messages** | Should Have | Medium |

### Phase 4: Group Chat (Weeks 8-9)
| Feature | Priority | Complexity |
|---------|----------|------------|
| **Create Group Chat** | Must Have | Medium |
| **Add/Remove Members** | Must Have | Medium |
| **Group Messages** | Must Have | Medium |
| **Group Admin (manage group)** | Should Have | Low |
| **Leave Group** | Should Have | Low |

### Phase 5: Moodle Integration - Read (Weeks 10-11)
| Feature | Priority | Complexity |
|---------|----------|------------|
| Connect Moodle Account | Must Have | Medium |
| View Enrolled Courses | Must Have | Medium |
| View Upcoming Deadlines | Should Have | Medium |
| View Grades | Should Have | Medium |
| Course-based Groups (auto-create) | Nice to Have | Medium |

### Phase 6: Moodle Integration - Two-Way Sync (Weeks 12-13)
| Feature | Priority | Complexity |
|---------|----------|------------|
| **Submit Assignment to Moodle** | Must Have | High |
| **Post to Moodle Forum** | Should Have | High |
| **Reply to Moodle Forum** | Should Have | Medium |
| **Update Grades (Teacher only)** | Nice to Have | High |
| **Sync Role from Moodle** | Should Have | Medium |

### Phase 7: Polish & Demo (Weeks 14-16)
| Feature | Priority | Complexity |
|---------|----------|------------|
| Responsive UI | Must Have | Medium |
| Admin Panel | Should Have | Medium |
| RBAC (Student/Teacher/Admin) | Should Have | Medium |
| Testing & Bug Fixes | Must Have | - |
| Documentation | Must Have | - |
| Demo Preparation | Must Have | - |

---

## ❌ Out of Scope (Save for Future)

These features are **NOT included** in the MVP:

- ❌ Push notifications
- ❌ Video/voice calls
- ❌ Mobile app (responsive web is enough)
- ❌ Advanced analytics
- ❌ Email notifications

---

## 🛠️ Tech Stack

### Frontend
```
React 18          - UI Framework
React Router      - Navigation
Axios            - API calls
Socket.io-client - Real-time messaging
CSS/Tailwind     - Styling
```

### Backend
```
Node.js + Express - Server
MongoDB + Mongoose - Database
JWT              - Authentication
Socket.io        - Real-time communication
Multer           - File upload handling
Cloudinary       - Image storage (free tier)
```

### Development
```
VS Code          - Editor
Postman          - API testing
Git + GitHub     - Version control
```

---

## 📊 Database Schema

### User
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  avatar: String (URL),
  bio: String,
  role: "student" | "teacher" | "admin",  // 3 roles now
  moodleUserId: String,
  moodleToken: String,
  moodleUrl: String,
  moodleRole: String,                      // Role from Moodle
  followers: [ObjectId],
  following: [ObjectId],
  isOnline: Boolean,
  lastSeen: Date,
  createdAt: Date
}
```

### Post
```javascript
{
  _id: ObjectId,
  author: ObjectId (ref: User),
  content: String,
  images: [String],  // Array of image URLs
  likes: [ObjectId],
  comments: [{
    user: ObjectId,
    text: String,
    createdAt: Date
  }],
  moodleCourseId: String,    // Optional: linked to Moodle course
  moodleForumId: String,     // If synced from/to Moodle forum
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  _id: ObjectId,
  conversation: ObjectId (ref: Conversation),
  sender: ObjectId (ref: User),
  content: String,
  attachments: [{
    type: "image" | "file",
    url: String,
    filename: String
  }],
  readBy: [ObjectId],        // For group chats: who has read
  createdAt: Date
}
```

### Conversation (1-to-1 and Group Chat)
```javascript
{
  _id: ObjectId,
  type: "private" | "group",           // NEW: conversation type
  participants: [ObjectId] (ref: User),
  // Group-specific fields
  groupName: String,                    // Only for groups
  groupAvatar: String,                  // Only for groups
  admin: ObjectId (ref: User),          // Group creator/admin
  lastMessage: ObjectId (ref: Message),
  createdAt: Date,
  updatedAt: Date
}
```

### MoodleCourse (Cached)
```javascript
{
  _id: ObjectId,
  moodleId: String,
  name: String,
  shortName: String,
  summary: String,
  enrolledUsers: [ObjectId],
  linkedGroup: ObjectId (ref: Conversation),  // Auto-created group chat
  lastSynced: Date
}
```

### MoodleAssignment (Cached)
```javascript
{
  _id: ObjectId,
  moodleId: String,
  courseId: String,
  name: String,
  description: String,
  dueDate: Date,
  submissions: [{
    userId: ObjectId,
    moodleSubmissionId: String,
    submittedAt: Date,
    grade: Number,
    feedback: String
  }],
  lastSynced: Date
}
```

### MoodleSyncLog (For Two-Way Sync)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  direction: "inbound" | "outbound",   // From or to Moodle
  type: "assignment" | "forum" | "grade",
  moodleId: String,
  localId: ObjectId,
  status: "pending" | "success" | "failed",
  error: String,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication (4 endpoints)
```
POST /api/auth/register     - Create account
POST /api/auth/login        - Login
GET  /api/auth/me           - Get current user
POST /api/auth/logout       - Logout
```

### Users (5 endpoints)
```
GET  /api/users/:id         - Get user profile
PUT  /api/users/:id         - Update profile
POST /api/users/:id/follow  - Follow user
DELETE /api/users/:id/follow - Unfollow user
GET  /api/users/:id/followers - Get followers
```

### Posts (7 endpoints)
```
GET  /api/posts             - Get feed
POST /api/posts             - Create post (with images)
GET  /api/posts/:id         - Get single post
PUT  /api/posts/:id         - Update post
DELETE /api/posts/:id       - Delete post
POST /api/posts/:id/like    - Toggle like
POST /api/posts/:id/comment - Add comment
```

### Messages - 1-to-1 Chat (5 endpoints)
```
GET  /api/conversations           - Get user's conversations
POST /api/conversations           - Start new conversation
GET  /api/conversations/:id       - Get conversation with messages
POST /api/conversations/:id/messages - Send message
PUT  /api/messages/:id/read       - Mark message as read
```

### Group Chat (6 endpoints) - NEW
```
POST /api/groups                  - Create group chat
GET  /api/groups/:id              - Get group details
PUT  /api/groups/:id              - Update group (name, avatar)
POST /api/groups/:id/members      - Add member to group
DELETE /api/groups/:id/members/:userId - Remove member
DELETE /api/groups/:id/leave      - Leave group
```

### File Upload (2 endpoints)
```
POST /api/upload/image      - Upload image (for posts)
POST /api/upload/file       - Upload file (for messages)
```

### Moodle - Read (5 endpoints)
```
POST /api/moodle/connect    - Connect Moodle account
GET  /api/moodle/courses    - Get enrolled courses
GET  /api/moodle/deadlines  - Get upcoming deadlines
GET  /api/moodle/grades     - Get user's grades
GET  /api/moodle/forums/:courseId - Get forum discussions
```

### Moodle - Two-Way Sync (5 endpoints) - NEW
```
POST /api/moodle/assignments/:id/submit  - Submit assignment TO Moodle
POST /api/moodle/forums/:id/post         - Create forum post IN Moodle
POST /api/moodle/forums/:id/reply        - Reply to forum IN Moodle
PUT  /api/moodle/grades/:id              - Update grade (teacher) IN Moodle
POST /api/moodle/sync                    - Trigger manual sync
```

### Admin (4 endpoints)
```
GET  /api/admin/users       - List all users
DELETE /api/admin/users/:id - Delete user
DELETE /api/admin/posts/:id - Delete any post
GET  /api/admin/stats       - Get system statistics
```

**Total: ~43 endpoints**

---

## 🔄 Real-Time Features (Socket.io)

### Socket Events

```javascript
// Client → Server
'join'              - User comes online
'leave'             - User goes offline
'sendMessage'       - Send a message (1-to-1 or group)
'typing'            - User is typing
'joinGroup'         - Join a group chat room
'leaveGroup'        - Leave a group chat room

// Server → Client
'newMessage'        - Receive new message
'userOnline'        - User came online
'userOffline'       - User went offline
'typing'            - Someone is typing
'groupMessage'      - New message in group
'memberJoined'      - New member added to group
'memberLeft'        - Member left/removed from group
```

### Socket Implementation

```javascript
// server/socket.js
io.on('connection', (socket) => {
  // User joins with their userId
  socket.on('join', (userId) => {
    socket.join(userId);
    User.findByIdAndUpdate(userId, { isOnline: true });
    socket.broadcast.emit('userOnline', userId);
  });

  // Join group chat room
  socket.on('joinGroup', (groupId) => {
    socket.join(`group:${groupId}`);
  });

  // Handle 1-to-1 messages
  socket.on('sendMessage', async (data) => {
    const message = await Message.create(data);
    io.to(data.recipientId).emit('newMessage', message);
  });

  // Handle group messages
  socket.on('groupMessage', async (data) => {
    const message = await Message.create(data);
    io.to(`group:${data.groupId}`).emit('groupMessage', message);
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    // Update offline status
  });
});
```

---

## 👥 Group Chat Implementation

### Creating a Group
```javascript
// POST /api/groups
const createGroup = async (req, res) => {
  const { name, members } = req.body;
  
  const group = await Conversation.create({
    type: 'group',
    groupName: name,
    participants: [req.user.id, ...members],
    admin: req.user.id
  });
  
  // Notify members via socket
  members.forEach(memberId => {
    io.to(memberId).emit('addedToGroup', group);
  });
  
  res.json(group);
};
```

### Group Message Flow
```
1. User sends message → Socket 'groupMessage' event
2. Server saves to MongoDB
3. Server emits to group room → All members receive
4. Each client updates their UI
```

---

## 🔄 Two-Way Moodle Sync

### How It Works

#### Outbound (Your App → Moodle)

**1. Submit Assignment**
```javascript
// POST /api/moodle/assignments/:id/submit
const submitAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const { file, text } = req.body;
  
  // 1. Upload file if provided
  let fileUrl;
  if (file) {
    fileUrl = await uploadToCloudinary(file);
  }
  
  // 2. Call Moodle API
  const result = await moodleClient.call('mod_assign_save_submission', {
    assignmentid: assignmentId,
    plugindata: {
      onlinetext_editor: { text, format: 1 },
      // files if uploaded
    }
  });
  
  // 3. Mark for grading
  await moodleClient.call('mod_assign_submit_for_grading', {
    assignmentid: assignmentId,
    acceptsubmissionstatement: true
  });
  
  // 4. Log the sync
  await MoodleSyncLog.create({
    userId: req.user.id,
    direction: 'outbound',
    type: 'assignment',
    status: 'success'
  });
  
  res.json({ success: true });
};
```

**2. Post to Forum**
```javascript
// POST /api/moodle/forums/:forumId/post
const postToForum = async (req, res) => {
  const { forumId } = req.params;
  const { subject, message } = req.body;
  
  const result = await moodleClient.call('mod_forum_add_discussion', {
    forumid: forumId,
    subject,
    message,
    messageformat: 1
  });
  
  res.json({ discussionId: result.discussionid });
};
```

**3. Update Grade (Teacher Only)**
```javascript
// PUT /api/moodle/grades/:assignmentId
const updateGrade = async (req, res) => {
  // Check if user is teacher
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teachers only' });
  }
  
  const { assignmentId } = req.params;
  const { studentId, grade, feedback } = req.body;
  
  await moodleClient.call('mod_assign_save_grade', {
    assignmentid: assignmentId,
    userid: studentId,
    grade,
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
  
  res.json({ success: true });
};
```

#### Inbound (Moodle → Your App)

**Sync Courses & Assignments**
```javascript
// Called on login or manual sync
const syncFromMoodle = async (userId) => {
  const user = await User.findById(userId);
  
  // 1. Get courses
  const courses = await moodleClient.call('core_enrol_get_users_courses', {
    userid: user.moodleUserId
  });
  
  // 2. Save/update courses locally
  for (const course of courses) {
    await MoodleCourse.findOneAndUpdate(
      { moodleId: course.id },
      {
        name: course.fullname,
        shortName: course.shortname,
        $addToSet: { enrolledUsers: userId }
      },
      { upsert: true }
    );
  }
  
  // 3. Get assignments
  const assignments = await moodleClient.call('mod_assign_get_assignments', {
    courseids: courses.map(c => c.id)
  });
  
  // 4. Save assignments locally
  // ... similar upsert logic
};
```

### Required Moodle Web Services

| Function | Purpose | Direction |
|----------|---------|-----------|
| `core_enrol_get_users_courses` | Get enrolled courses | Inbound |
| `mod_assign_get_assignments` | Get assignments | Inbound |
| `gradereport_user_get_grades_table` | Get grades | Inbound |
| `mod_forum_get_forum_discussions` | Get forum posts | Inbound |
| `mod_assign_save_submission` | Submit assignment | Outbound |
| `mod_assign_submit_for_grading` | Mark for grading | Outbound |
| `mod_forum_add_discussion` | Create forum post | Outbound |
| `mod_forum_add_discussion_post` | Reply to forum | Outbound |
| `mod_assign_save_grade` | Update grade | Outbound |

---

## 📁 File Upload Implementation

### Using Multer + Cloudinary (Recommended)

```javascript
// server/middleware/upload.js
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (free tier: 25GB storage)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// Multer for handling multipart/form-data
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'), false);
    }
  }
});

// Upload to Cloudinary
const uploadToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'social-network' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};
```

### File Size Limits
- **Post images**: Max 5MB, up to 4 images per post
- **Message attachments**: Max 10MB per file
- **Avatar**: Max 2MB

---

## 📁 Updated Project Structure

```
project/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/    # Shared components
│   │   │   ├── posts/     # Post components
│   │   │   ├── messages/  # Chat components (NEW)
│   │   │   └── upload/    # File upload (NEW)
│   │   ├── pages/
│   │   │   ├── Feed.js
│   │   │   ├── Profile.js
│   │   │   ├── Messages.js    # NEW
│   │   │   └── Courses.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js  # NEW
│   │   ├── services/
│   │   └── App.js
│   └── package.json
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js     # NEW
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── messageController.js  # NEW
│   │   └── uploadController.js   # NEW
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js             # NEW
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Message.js            # NEW
│   │   └── Conversation.js       # NEW
│   ├── routes/
│   ├── socket/                   # NEW
│   │   └── index.js
│   └── server.js
│
├── .env
├── .gitignore
└── README.md
```

---

## 📅 Updated Timeline (14-16 Weeks)

| Week | Tasks |
|------|-------|
| **1** | Project setup, database models, basic auth |
| **2** | User registration, login, JWT, profiles |
| **3** | Post CRUD operations |
| **4** | News feed, likes, comments |
| **5** | Follow system, image upload for posts |
| **6** | Socket.io setup, 1-to-1 messaging |
| **7** | Conversation UI, file sharing in messages |
| **8** | **Group chat: create, join, messaging** |
| **9** | **Group chat: admin features, leave group** |
| **10** | Moodle connection, course display, grades |
| **11** | **Two-way sync: submit assignments** |
| **12** | **Two-way sync: forum posts, grade updates** |
| **13** | Admin panel, RBAC (student/teacher/admin) |
| **14** | Responsive design, online status |
| **15** | Testing, bug fixes |
| **16** | Documentation, demo preparation |

---

## 🎓 Moodle Integration (Two-Way)

### What You Need from Moodle Admin
1. Enable Web Services in Moodle
2. Create a Web Service with these functions:
   - `core_webservice_get_site_info`
   - `core_enrol_get_users_courses`
   - `mod_assign_get_assignments`
   - `mod_assign_save_submission` (for two-way)
   - `mod_assign_submit_for_grading` (for two-way)
   - `mod_forum_add_discussion` (for two-way)
   - `mod_forum_add_discussion_post` (for two-way)
   - `mod_assign_save_grade` (for teachers)
   - `gradereport_user_get_grades_table`

### Connection Flow
```
1. User enters their Moodle URL
2. User generates a token in Moodle (Security Keys)
3. User pastes token in your app
4. App stores token encrypted
5. App fetches courses and syncs role
6. Two-way operations use stored token
```

---

## 🔐 Role System (3 Roles)

### Student (Default)
- Create/edit/delete own posts
- Upload images to posts
- Like and comment on posts
- Follow other users
- Send/receive private messages (1-to-1 and group)
- Create/join group chats
- View Moodle courses (own)
- **Submit assignments TO Moodle**
- **Post to Moodle forums**
- Update own profile

### Teacher (From Moodle Role)
- All student permissions
- **Update grades IN Moodle**
- **Create announcements IN Moodle**
- View students in their courses
- Moderate course-related content

### Admin
- All teacher permissions
- Delete any post/comment
- View/manage all users
- System dashboard with stats
- Moodle connection settings

---

## 💡 Tips for Success

### Do's ✅
- Start with backend API first
- Test each endpoint with Postman before building UI
- Set up Socket.io early, but keep it simple
- Use Cloudinary for file storage (easiest option)
- Use a Moodle demo site for testing (demo.moodle.net)
- Keep UI simple - functionality over fancy design
- Commit code frequently

### Don'ts ❌
- Don't add group chats (stick to 1-to-1)
- Don't implement video calls
- Don't try two-way Moodle sync
- Don't spend too long on perfect design
- Don't worry about production scaling

---

## 🧪 Testing Checklist

### Core Functionality to Demo
- [ ] User can register and login
- [ ] User can create a post with images
- [ ] User can see posts in feed
- [ ] User can like a post
- [ ] User can comment on a post
- [ ] User can follow another user
- [ ] **User can send a private message**
- [ ] **User receives messages in real-time**
- [ ] **User can share files in messages**
- [ ] **User can see online/offline status**
- [ ] User can connect Moodle account
- [ ] User can see their Moodle courses
- [ ] Admin can delete posts
- [ ] Site is mobile-responsive

---

## 📝 Documentation Required

For graduation project, prepare:

1. **README.md** - Setup instructions
2. **Project Report** - Technical decisions, architecture
3. **User Manual** - How to use the app
4. **API Documentation** - Endpoint descriptions
5. **Demo Script** - What to show in presentation
6. **Socket Events Documentation** - Real-time event descriptions
7. **Moodle Integration Guide** - Two-way sync documentation

---

## Environment Variables

```env
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social_moodle
JWT_SECRET=your_secret_key

# Cloudinary (for file uploads)
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

# Moodle (optional - can be per-user)
MOODLE_DEFAULT_URL=https://demo.moodle.net
```

---

## 🚀 Demo Environment

For your demo/presentation:
- Use **MongoDB Atlas** (free tier) - cloud database
- Use **Cloudinary** (free tier) - 25GB file storage
- Use **Render.com** or **Railway** (free tier) - hosting
- Use **demo.moodle.net** - test Moodle instance (note: may have limited write permissions)

---

## Feature Summary

| Category | Features Included |
|----------|-------------------|
| **Authentication** | Register, Login, JWT, Profiles, Avatar |
| **Posts & Feed** | Create, Edit, Delete, Images, Likes, Comments |
| **Social** | Follow, Unfollow, Followers, Following |
| **1-to-1 Messaging** | Private chat, File sharing, Online status, Typing |
| **Group Chat** | Create group, Add/remove members, Group messages |
| **Moodle (Read)** | Courses, Assignments, Deadlines, Grades |
| **Moodle (Write)** | Submit assignments, Post to forums, Update grades |
| **Roles** | Student, Teacher, Admin |
| **Admin** | User management, Content moderation, Stats |

**Total: ~43 API endpoints + ~15 socket events**

---

*This is a full-featured graduation project plan including real-time messaging (1-to-1 and group), file uploads, and two-way Moodle synchronization. Timeline: 14-16 weeks.*



# MERN Social Network with Moodle Integration
## 🎓 Simplified Graduation Project Plan (MVP)

This is a streamlined version of the project suitable for a **graduation project** with a realistic scope for a single developer or small team over **10-12 weeks**.

---

## 📋 Project Summary

A social networking platform for students that connects with Moodle LMS to display course information, featuring **real-time messaging**, **file sharing**, and social interactions.

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

### Phase 4: Moodle Integration (Weeks 8-9)
| Feature | Priority | Complexity |
|---------|----------|------------|
| Connect Moodle Account | Must Have | Medium |
| View Enrolled Courses | Must Have | Medium |
| View Upcoming Deadlines | Should Have | Medium |
| Course-based Groups (auto-create) | Nice to Have | Medium |

### Phase 5: Polish & Demo (Weeks 10-12)
| Feature | Priority | Complexity |
|---------|----------|------------|
| Responsive UI | Must Have | Medium |
| Basic Admin Panel | Should Have | Low |
| Testing & Bug Fixes | Must Have | - |
| Documentation | Must Have | - |
| Demo Preparation | Must Have | - |

---

## ❌ Out of Scope (Save for Future)

These features are **NOT included** in the MVP:

- ❌ **Two-way Moodle sync** (read-only is enough for graduation demo)
- ❌ Complex RBAC (just Student/Admin is fine)
- ❌ Push notifications
- ❌ Video/voice calls
- ❌ Mobile app (responsive web is enough)
- ❌ Group chats (just 1-to-1 messaging)
- ❌ Advanced analytics

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
  role: "student" | "admin",
  moodleUserId: String,
  moodleToken: String,
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
  createdAt: Date,
  updatedAt: Date
}
```

### Message (NEW)
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
  readAt: Date,
  createdAt: Date
}
```

### Conversation (NEW)
```javascript
{
  _id: ObjectId,
  participants: [ObjectId] (ref: User),  // Always 2 users for 1-to-1
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
  enrolledUsers: [ObjectId],
  lastSynced: Date
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

### Messages (5 endpoints) - NEW
```
GET  /api/conversations           - Get user's conversations
POST /api/conversations           - Start new conversation
GET  /api/conversations/:id       - Get conversation with messages
POST /api/conversations/:id/messages - Send message
PUT  /api/messages/:id/read       - Mark message as read
```

### File Upload (2 endpoints) - NEW
```
POST /api/upload/image      - Upload image (for posts)
POST /api/upload/file       - Upload file (for messages)
```

### Moodle (3 endpoints)
```
POST /api/moodle/connect    - Connect Moodle account
GET  /api/moodle/courses    - Get enrolled courses
GET  /api/moodle/deadlines  - Get upcoming deadlines
```

**Total: ~26 endpoints** (manageable with extra features)

---

## 🔄 Real-Time Features (Socket.io)

### Socket Events

```javascript
// Client → Server
'join'              - User comes online
'leave'             - User goes offline
'sendMessage'       - Send a new message
'typing'            - User is typing

// Server → Client
'newMessage'        - Receive new message
'userOnline'        - User came online
'userOffline'       - User went offline
'typing'            - Someone is typing
```

### Simple Socket Implementation

```javascript
// server/socket.js
io.on('connection', (socket) => {
  // User joins with their userId
  socket.on('join', (userId) => {
    socket.join(userId);
    // Update user online status
    User.findByIdAndUpdate(userId, { isOnline: true });
    socket.broadcast.emit('userOnline', userId);
  });

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    const message = await Message.create(data);
    // Send to recipient
    io.to(data.recipientId).emit('newMessage', message);
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    // Update offline status
  });
});
```

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

## 📅 Updated Timeline (10-12 Weeks)

| Week | Tasks |
|------|-------|
| **1** | Project setup, database models, basic auth |
| **2** | User registration, login, JWT, profiles |
| **3** | Post CRUD operations |
| **4** | News feed, likes, comments |
| **5** | Follow system, **image upload for posts** |
| **6** | **Socket.io setup, basic messaging** |
| **7** | **Conversation UI, file sharing in messages** |
| **8** | Moodle connection, course display |
| **9** | Deadlines display, online status |
| **10** | Admin panel, responsive design |
| **11** | Testing, bug fixes |
| **12** | Documentation, demo preparation |

---

## 🎓 Moodle Integration (Simplified - Read Only)

### What You Need from Moodle Admin
1. Enable Web Services in Moodle
2. Create a Web Service with these functions:
   - `core_webservice_get_site_info`
   - `core_enrol_get_users_courses`
   - `mod_assign_get_assignments`

### Simple Connection Flow
```
1. User enters their Moodle URL
2. User generates a token in Moodle (Security Keys)
3. User pastes token in your app
4. App stores token and fetches their courses
```

**Note**: Two-way sync is OUT OF SCOPE. This is read-only integration.

---

## 🔐 Simple Role System

Just two roles for MVP:

### Student (Default)
- Create/edit/delete own posts
- Upload images to posts
- Like and comment on posts
- Follow other users
- Send/receive private messages
- Share files in messages
- View Moodle courses (own)
- Update own profile

### Admin
- All student permissions
- Delete any post
- View all users
- Basic dashboard with stats

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
- Use **demo.moodle.net** - test Moodle instance

---

## Quick Comparison

| Aspect | Full Plan | Graduation MVP |
|--------|-----------|----------------|
| Timeline | 16 weeks | 10-12 weeks |
| Team Size | 2-3 developers | 1 developer |
| API Endpoints | 40+ | ~26 |
| Moodle Sync | Two-way, real-time | **One-way only (read)** |
| Roles | 3 (Student, Instructor, Admin) | 2 (Student, Admin) |
| Messaging | Group + 1-to-1 | **1-to-1 only** |
| File Upload | Full media | **Images + files** |
| Mobile | Native apps | Responsive web |
| Complexity | Production-ready | Demo-ready |

---

*This plan includes real-time messaging and file uploads while remaining achievable for a graduation project. Two-way Moodle sync is intentionally excluded as it would significantly increase complexity.*


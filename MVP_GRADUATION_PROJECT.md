# MERN Social Network with Moodle Integration
## 🎓 Simplified Graduation Project Plan (MVP)

This is a streamlined version of the project suitable for a **graduation project** with a realistic scope for a single developer or small team over **8-10 weeks**.

---

## 📋 Project Summary

A social networking platform for students that connects with Moodle LMS to display course information, allowing students to interact, share posts, and stay updated on their academic activities.

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

### Phase 3: Moodle Integration (Weeks 6-7)
| Feature | Priority | Complexity |
|---------|----------|------------|
| Connect Moodle Account | Must Have | Medium |
| View Enrolled Courses | Must Have | Medium |
| View Upcoming Deadlines | Should Have | Medium |
| Course-based Groups (auto-create) | Nice to Have | Medium |

### Phase 4: Polish & Demo (Weeks 8-10)
| Feature | Priority | Complexity |
|---------|----------|------------|
| Responsive UI | Must Have | Medium |
| Basic Admin Panel | Should Have | Low |
| Testing & Bug Fixes | Must Have | - |
| Documentation | Must Have | - |
| Demo Preparation | Must Have | - |

---

## ❌ Out of Scope (Save for Future)

These features are **NOT included** in the MVP to keep the project manageable:

- ❌ Real-time messaging/chat (use comments instead)
- ❌ Two-way Moodle sync (read-only is enough)
- ❌ Complex RBAC (just Student/Admin is fine)
- ❌ Push notifications
- ❌ File uploads (just text and links)
- ❌ Mobile app (responsive web is enough)
- ❌ Video calls
- ❌ Advanced analytics

---

## 🛠️ Simplified Tech Stack

### Frontend
```
React 18          - UI Framework
React Router      - Navigation
Axios            - API calls
CSS/Tailwind     - Styling (pick one you know)
```

### Backend
```
Node.js + Express - Server
MongoDB + Mongoose - Database
JWT              - Authentication
```

### Development
```
VS Code          - Editor
Postman          - API testing
Git + GitHub     - Version control
```

---

## 📊 Simple Database Schema

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
  createdAt: Date
}
```

### Post
```javascript
{
  _id: ObjectId,
  author: ObjectId (ref: User),
  content: String,
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

## 🔌 Essential API Endpoints

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

### Posts (6 endpoints)
```
GET  /api/posts             - Get feed
POST /api/posts             - Create post
GET  /api/posts/:id         - Get single post
PUT  /api/posts/:id         - Update post
DELETE /api/posts/:id       - Delete post
POST /api/posts/:id/like    - Toggle like
POST /api/posts/:id/comment - Add comment
```

### Moodle (3 endpoints)
```
POST /api/moodle/connect    - Connect Moodle account
GET  /api/moodle/courses    - Get enrolled courses
GET  /api/moodle/deadlines  - Get upcoming deadlines
```

**Total: ~18 endpoints** (manageable for graduation project)

---

## 📁 Simple Project Structure

```
project/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Auth context
│   │   ├── services/      # API calls
│   │   └── App.js
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── config/            # Database config
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── server.js
│
├── .env                   # Environment variables
├── .gitignore
└── README.md
```

---

## 🎓 Moodle Integration (Simplified)

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

This is simpler than OAuth and works for a demo!

---

## 🔐 Simple Role System

Just two roles for MVP:

### Student (Default)
- Create/edit/delete own posts
- Like and comment on posts
- Follow other users
- View Moodle courses (own)
- Update own profile

### Admin
- All student permissions
- Delete any post
- View all users
- Basic dashboard with stats

---

## 📅 Realistic Timeline

| Week | Tasks |
|------|-------|
| **1** | Project setup, database models, basic auth |
| **2** | User registration, login, JWT implementation |
| **3** | Post CRUD operations |
| **4** | News feed, likes, basic UI |
| **5** | Comments, follow system |
| **6** | Moodle connection, course display |
| **7** | Deadlines display, polish features |
| **8** | Admin panel, responsive design |
| **9** | Testing, bug fixes |
| **10** | Documentation, demo preparation |

---

## 💡 Tips for Success

### Do's ✅
- Start with backend API first
- Test each endpoint with Postman before building UI
- Use a Moodle demo site for testing (demo.moodle.net)
- Keep UI simple - functionality over fancy design
- Commit code frequently
- Document as you go

### Don'ts ❌
- Don't add features not in MVP list
- Don't spend too long on perfect design
- Don't try real-time features (too complex)
- Don't worry about production deployment details
- Don't skip testing to add more features

---

## 🧪 Testing Checklist

### Core Functionality to Demo
- [ ] User can register and login
- [ ] User can create a post
- [ ] User can see posts in feed
- [ ] User can like a post
- [ ] User can comment on a post
- [ ] User can follow another user
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

---

## 🚀 Demo Environment

For your demo/presentation:
- Use **MongoDB Atlas** (free tier) - cloud database
- Use **Render.com** or **Railway** (free tier) - hosting
- Use **demo.moodle.net** - test Moodle instance

---

## Environment Variables Needed

```env
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social_moodle
JWT_SECRET=your_secret_key

# Moodle (optional - can be per-user)
MOODLE_DEFAULT_URL=https://demo.moodle.net
```

---

## 📚 Learning Resources

### React
- React Official Tutorial
- React Router Documentation

### Node.js/Express
- Express.js Documentation
- JWT Authentication Tutorial

### MongoDB
- MongoDB University (free courses)
- Mongoose Documentation

### Moodle API
- Moodle Web Services Documentation
- demo.moodle.net for testing

---

## Quick Comparison

| Aspect | Full Plan | Graduation MVP |
|--------|-----------|----------------|
| Timeline | 16 weeks | 8-10 weeks |
| Team Size | 2-3 developers | 1 developer |
| API Endpoints | 40+ | ~18 |
| Moodle Sync | Two-way, real-time | One-way, on-demand |
| Roles | 3 (Student, Instructor, Admin) | 2 (Student, Admin) |
| Messaging | Real-time chat | Comments only |
| Mobile | Native apps | Responsive web |
| Complexity | Production-ready | Demo-ready |

---

*This simplified plan is designed to be achievable for a graduation project while still demonstrating key concepts: MERN stack, REST API, authentication, third-party API integration, and basic social networking features.*

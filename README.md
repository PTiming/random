# MERN Social Network with Moodle Integration
## 🎓 Graduation Project

A social networking platform for students built with the MERN stack (MongoDB, Express.js, React, Node.js) that integrates with Moodle LMS, featuring **real-time messaging**, **group chat**, **file sharing**, and **two-way Moodle sync**.

---

## ⭐ Start Here

**👉 [MVP_GRADUATION_PROJECT.md](./MVP_GRADUATION_PROJECT.md)** - Complete plan for 14-16 weeks

**👉 [FEATURE_CHECKLIST.md](./FEATURE_CHECKLIST.md)** - Full feature list to review and customize

---

## All Features Included ✅

| Category | Features |
|----------|----------|
| **Authentication** | Register, Login, JWT, Profiles, Avatar upload |
| **Posts & Feed** | Create, Edit, Delete, Images, Likes, Comments |
| **Social** | Follow/Unfollow, Followers list |
| **1-to-1 Messaging** | Private chat, File sharing, Online status, Typing indicator |
| **Group Chat** | Create group, Add/remove members, Group messages, Leave group |
| **Moodle (Read)** | View courses, Assignments, Deadlines, Grades |
| **Moodle (Write)** | Submit assignments, Post to forums, Update grades |
| **Roles** | Student, Teacher (from Moodle), Admin |

---

## Timeline (14-16 Weeks)

| Phase | Weeks | Features |
|-------|-------|----------|
| Foundation | 1-2 | Auth, Profiles, Database |
| Social | 3-5 | Posts, Feed, Likes, Comments, Follows |
| Messaging | 6-7 | 1-to-1 chat, File sharing |
| Group Chat | 8-9 | Create groups, Group messaging |
| Moodle Read | 10-11 | Courses, Assignments, Grades |
| Moodle Write | 12-13 | Submit, Post to forums, Grade updates |
| Polish | 14-16 | Admin, Testing, Demo |

---

## Tech Stack

```
Frontend: React + Socket.io-client + Axios + Tailwind
Backend:  Node.js + Express + MongoDB + Socket.io + Multer + Cloudinary
```

---

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd mern-social-moodle

# Install backend dependencies
cd server && npm install

# Install frontend dependencies  
cd ../client && npm install

# Set up environment variables
cp .env.example .env

# Start development
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm start
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [MVP_GRADUATION_PROJECT.md](./MVP_GRADUATION_PROJECT.md) | **Full plan** with code examples |
| [FEATURE_CHECKLIST.md](./FEATURE_CHECKLIST.md) | **Feature list** to review/customize |
| [MERN_SOCIAL_NETWORK_PLAN.md](./MERN_SOCIAL_NETWORK_PLAN.md) | Production reference |
| [QUESTIONS_FOR_STAKEHOLDERS.md](./QUESTIONS_FOR_STAKEHOLDERS.md) | Requirements checklist |

---

## License

MIT
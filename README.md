# MERN Social Network with Moodle Integration
## 🎓 Graduation Project

A social networking platform for students built with the MERN stack (MongoDB, Express.js, React, Node.js) that integrates with Moodle LMS, featuring **real-time messaging** and **file sharing**.

---

## ⭐ Start Here: Graduation Project MVP

**👉 [MVP_GRADUATION_PROJECT.md](./MVP_GRADUATION_PROJECT.md)** - Complete plan for 10-12 weeks

This plan includes:
- ✅ **Real-time messaging** (Socket.io)
- ✅ **File uploads** (images for posts, files for messages)
- ✅ One-way Moodle integration (read-only)
- ✅ ~26 API endpoints
- ✅ Week-by-week tasks
- ✅ Socket events documentation
- ✅ File upload implementation guide

---

## MVP Features

| Feature | Weeks | Technologies |
|---------|-------|--------------|
| User Auth & Profiles | 1-2 | JWT, MongoDB |
| Posts with Images | 3-5 | Multer, Cloudinary |
| **Real-time Messaging** | 6-7 | **Socket.io** |
| Moodle Courses | 8-9 | Moodle Web Services |
| Polish & Demo | 10-12 | Testing, Docs |

### Tech Stack
```
Frontend: React + Socket.io-client + Axios
Backend:  Node.js + Express + MongoDB + Socket.io + Multer + Cloudinary
```

### What's IN Scope ✅
- Real-time 1-to-1 private messaging
- Image upload for posts
- File sharing in messages
- Online/offline status
- Moodle course display (read-only)

### What's OUT of Scope ❌
- Two-way Moodle sync
- Group chats
- Video/voice calls
- Push notifications

---

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd mern-social-moodle

# Install backend dependencies
cd server
npm install

# Install frontend dependencies  
cd ../client
npm install

# Set up environment variables
cp .env.example .env
# Add your Cloudinary credentials for file uploads

# Start development (run both in separate terminals)
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm start
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [MVP_GRADUATION_PROJECT.md](./MVP_GRADUATION_PROJECT.md) | **Start here!** Full graduation project plan |
| [MERN_SOCIAL_NETWORK_PLAN.md](./MERN_SOCIAL_NETWORK_PLAN.md) | Full production plan (reference) |
| [QUESTIONS_FOR_STAKEHOLDERS.md](./QUESTIONS_FOR_STAKEHOLDERS.md) | Requirements checklist |

---

## License

MIT
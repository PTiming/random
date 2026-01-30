# Learning Management System (LMS)

A full-stack Learning Management System with Role-Based Access Control (RBAC), built using the MERN stack (MongoDB, Express, React, Node.js) with Moodle integration capabilities.

## 📸 Screenshots

### Homepage
![LMS Homepage](https://github.com/user-attachments/assets/5933161d-c6fa-43bd-9cad-4f885e12e8ea)

### Login Page
![LMS Login](https://github.com/user-attachments/assets/8c554a96-cfe0-46e4-91fd-17e465fa631e)

### Registration Page
![LMS Register](https://github.com/user-attachments/assets/d4c6b8da-28ba-4398-ac8c-9d99bad4b475)

## 🚀 Features

- **Role-Based Access Control (RBAC)** - Three user roles: Admin, Teacher, Student
- **Two-Way Data Synchronization** - Real-time updates using Socket.io
- **JWT Authentication** - Secure token-based authentication
- **Course Management** - Create, publish, and manage courses
- **Grade Management** - Teachers can grade, students can view
- **Moodle Integration Ready** - Designed for LTI 1.3 and Web Services API integration

## 📁 Project Structure

```
├── server/                 # Backend (Node.js + Express + MongoDB)
│   ├── config/            # Database and role configurations
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth and RBAC middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── utils/             # Socket.io handler
│   └── server.js          # Entry point
│
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth and Socket contexts
│   │   ├── pages/         # Page components
│   │   └── services/      # API service layer
│   └── index.html
│
└── docs/                   # Documentation
    └── RBAC_DOCUMENTATION.md
```

## 🔐 RBAC Roles

| Role | Capabilities |
|------|--------------|
| **Admin** | Full system access, user management, role assignment |
| **Teacher** | Create courses, manage content, grade students |
| **Student** | Enroll in courses, submit work, view grades |

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.io
- **Security**: bcryptjs for password hashing

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB 6+

### Server Setup

```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/lms_rbac
# JWT_SECRET=your-secret-key

npm run dev
```

### Client Setup

```bash
cd client
npm install
npm run dev
```

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/register    - Register (students only)
POST /api/auth/login       - Login
GET  /api/auth/me          - Get current user
```

### Users (Admin only)
```
GET    /api/users          - List all users
POST   /api/users          - Create user
PUT    /api/users/:id      - Update user
DELETE /api/users/:id      - Delete user
PUT    /api/users/:id/role - Change role
```

### Courses
```
GET    /api/courses                    - List courses
POST   /api/courses                    - Create (Teacher/Admin)
PUT    /api/courses/:id                - Update (Owner/Admin)
DELETE /api/courses/:id                - Delete (Owner/Admin)
POST   /api/courses/:id/enroll         - Enroll (Student)
DELETE /api/courses/:id/enroll         - Unenroll (Student)
```

### Grades
```
GET  /api/grades/my-grades             - Student's grades
GET  /api/grades/student/:id           - Student grades (Teacher)
GET  /api/grades/course/:id            - Course grades (Teacher)
POST /api/grades                       - Create grade (Teacher)
```

## 🔄 Two-Way Sync

The system uses Socket.io for real-time synchronization:

```javascript
// Client joins course room
socket.emit('join:course', courseId);

// Server broadcasts changes
socket.on('data:changed', ({ type, action, data }) => {
  // Update local state
});
```

## 📚 Documentation

- [**API Functions Reference**](./docs/API_FUNCTIONS.md) - Complete list of all API functions
- [RBAC Documentation](./docs/RBAC_DOCUMENTATION.md) - Detailed RBAC system docs
- [Moodle Integration Plan](./LMS_MOODLE_INTEGRATION_PLAN.md) - Moodle integration planning

## 🧪 Testing

```bash
# Test the API
curl http://localhost:5000/api/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

## 📄 License

MIT
# EduConnect - MERN Social Network with Moodle Integration

A full-stack educational social networking platform built on the MERN stack (MongoDB, Express.js, React, Node.js) that seamlessly integrates with Moodle LMS.

## 🎯 Features

### Social Networking Core
- **User Profiles**: Academic profiles with courses, achievements, and skills
- **News Feed**: Algorithmic feed with posts from connections and courses
- **Connections**: Friend/follow system with academic networking
- **Messaging**: Real-time direct and group messaging (Socket.io)
- **Groups**: Public/private groups for study sessions and collaboration
- **Posts & Interactions**: Rich media posts with comments, reactions, and sharing

### Comprehensive Notification System
- **Multi-Channel**: In-app, push (FCM), email, and SMS notifications
- **Real-Time**: Socket.io powered instant notifications
- **Smart Features**: Notification grouping, quiet hours, digest mode
- **Moodle Integration**: Assignment deadlines, grades, announcements

### Two-Way Moodle Integration
- **Inbound Sync**: Courses, assignments, grades, calendar, notifications
- **Outbound Sync**: Forum posts, submissions, resource uploads
- **Real-Time Webhooks**: Instant sync for enrollment and grade changes
- **Scheduled Sync**: Periodic full synchronization

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Feed   │  │ Messages │  │  Groups  │  │  Moodle  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API + WebSocket
┌───────────────────────────▼─────────────────────────────────────┐
│                      Backend (Node.js/Express)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      API Routes                           │  │
│  │  /auth  /users  /posts  /messages  /groups  /notifications│  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐  │
│  │ Notification  │  │    Moodle     │  │    Socket.io      │  │
│  │   Service     │  │  Sync Service │  │     Service       │  │
│  └───────────────┘  └───────────────┘  └───────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                         Database (MongoDB)                       │
│   Users | Posts | Notifications | Messages | Groups | Moodle    │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
├── server/                    # Backend
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── models/           # MongoDB models
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   ├── Notification.js
│   │   │   ├── Message.js
│   │   │   ├── Group.js
│   │   │   └── Moodle.js
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, validation
│   │   ├── services/
│   │   │   ├── moodle/       # Moodle integration
│   │   │   └── notification/ # Multi-channel notifications
│   │   └── index.js
│   └── package.json
│
├── client/                    # Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # Auth, Socket, Notification
│   │   ├── services/         # API client
│   │   └── styles/
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PTiming/random.git
cd random
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Install client dependencies**
```bash
cd ../client
npm install
```

5. **Start development servers**

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm start
```

## ⚙️ Configuration

### Environment Variables (server/.env)

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/mern_social_moodle

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Moodle
MOODLE_URL=https://your-moodle.com
MOODLE_TOKEN=your_moodle_token

# Firebase (Push Notifications)
FCM_PROJECT_ID=your_project_id
FCM_PRIVATE_KEY=your_private_key
FCM_CLIENT_EMAIL=your_client_email

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Client
CLIENT_URL=http://localhost:3000
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/moodle` - Login with Moodle token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Search users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:id/connect` - Send connection request
- `POST /api/users/:id/follow` - Follow user

### Posts
- `GET /api/posts` - Get feed
- `POST /api/posts` - Create post
- `POST /api/posts/:id/react` - Add reaction
- `POST /api/posts/:id/comments` - Add comment

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/preferences` - Get preferences
- `PUT /api/notifications/preferences` - Update preferences

### Moodle
- `GET /api/moodle/courses` - Get enrolled courses
- `GET /api/moodle/assignments` - Get assignments
- `GET /api/moodle/grades` - Get grades
- `POST /api/moodle/sync` - Trigger sync

## 🔔 Notification Types

| Type | Description | Channels |
|------|-------------|----------|
| `new_comment` | Comment on your post | In-app, Push |
| `new_reaction` | Reaction on your post | In-app |
| `connection_request` | New connection request | In-app, Push, Email |
| `new_message` | New direct message | In-app, Push |
| `moodle_assignment` | New Moodle assignment | In-app, Push, Email |
| `moodle_deadline` | Upcoming deadline | In-app, Push, Email |
| `moodle_grade` | Grade released | In-app, Push, Email |

## 🔒 Security

- JWT-based authentication
- Role-based access control (Student, Instructor, Admin)
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting (recommended for production)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router, Socket.io-client |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-time | Socket.io |
| Auth | JWT, bcrypt |
| Push | Firebase Cloud Messaging |
| Email | Nodemailer, SendGrid |
| Moodle | Moodle Web Services API |

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
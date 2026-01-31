# MERN Social Network with Moodle Integration

A comprehensive full-stack social networking platform built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring seamless integration with Moodle LMS.

## 📚 Documentation

For the complete project plan including architecture, features, database design, API specifications, and implementation roadmap, see:

**[📋 Full Project Plan](./MERN_SOCIAL_NETWORK_MOODLE_PLAN.md)**

## 🚀 Key Features

- **Social Networking**: Posts, comments, reactions, friend system, groups
- **Real-time Messaging**: Direct messages and group chats with Socket.IO
- **Moodle Integration**: SSO, course sync, grade display, forum integration
- **Rich Media**: Image/video uploads, link previews, polls, events
- **Notifications**: In-app, email, and push notifications

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Redux Toolkit, Material-UI, Socket.IO Client |
| Backend | Node.js, Express.js, Socket.IO, Passport.js |
| Database | MongoDB, Redis |
| Integration | Moodle Web Services, OAuth 2.0, LTI 1.3 |

## 📂 Project Structure

```
├── client/                 # React frontend
├── server/                 # Node.js backend
├── docs/                   # Documentation
└── docker-compose.yml      # Docker configuration
```

## 🏁 Getting Started

```bash
# Clone repository
git clone https://github.com/your-org/mern-social-moodle.git

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development
npm run dev
```

## 📖 Learn More

See the [comprehensive project plan](./MERN_SOCIAL_NETWORK_MOODLE_PLAN.md) for:
- Detailed architecture diagrams
- Complete database schema
- Full API documentation
- Moodle integration specifications
- Implementation roadmap
- Security considerations
- Deployment guides
# MERN Social Network with Moodle Integration

A full-stack educational social networking platform built on the MERN stack (MongoDB, Express.js, React, Node.js) that seamlessly integrates with Moodle LMS (Learning Management System).

## 🌟 Features

### Social Networking Core
- **User Profiles**: Academic profiles displaying courses, achievements, skills, and activity
- **News Feed**: Algorithmic feed showing posts from connections, enrolled courses, and followed topics
- **Connections**: Friend/follow system with academic networking capabilities
- **Messaging**: Real-time direct and group messaging with Socket.io
- **Groups**: Public/private groups for study sessions and collaboration
- **Posts & Interactions**: Rich media posts with comments, likes, and sharing

### Two-Way Moodle Integration

#### Data Flow: Moodle → Social Platform
- ✅ Single Sign-On (SSO) with Moodle credentials
- ✅ Course synchronization from Moodle
- ✅ User profile import from Moodle
- ✅ Assignment & deadline sync
- ✅ Grade retrieval from Moodle gradebook
- ✅ Resource access linking

#### Data Flow: Social Platform → Moodle
- ✅ Discussion posts to Moodle forums
- ✅ Assignment submissions synced to Moodle
- ✅ Calendar events synced to Moodle
- ✅ Grade feedback from instructors

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Moodle instance with Web Services enabled

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PTiming/random.git
cd random
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Configure Backend Environment**

Create a `.env` file in the `backend` directory:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/moodle-social-network

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Moodle Configuration
MOODLE_URL=https://your-moodle-instance.com
MOODLE_TOKEN=your_moodle_web_service_token
MOODLE_SERVICE=moodle_mobile_app

# Sync Configuration
SYNC_ENABLED=true
SYNC_FREQUENCY=hourly
SYNC_DIRECTION=bidirectional

# Socket.IO
SOCKET_CORS_ORIGIN=http://localhost:3000
```

4. **Configure Frontend Environment**

Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. **Start the application**

**Development mode (runs both backend and frontend):**
```bash
npm run dev
```

**Or run separately:**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login with Moodle SSO
```http
POST /api/auth/moodle
Content-Type: application/json

{
  "moodleToken": "your_moodle_token",
  "moodleUserId": 123
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Posts Endpoints

#### Get News Feed
```http
GET /api/posts/feed?page=1&limit=20
Authorization: Bearer {token}
```

#### Create Post
```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "This is my post content",
  "visibility": "public"
}
```

#### Like/Unlike Post
```http
PUT /api/posts/:id/like
Authorization: Bearer {token}
```

#### Add Comment
```http
POST /api/posts/:id/comment
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "This is a comment"
}
```

#### Sync Post to Moodle
```http
POST /api/posts/:id/sync-to-moodle
Authorization: Bearer {token}
```

### Courses Endpoints

#### Get Courses
```http
GET /api/courses?enrolled=true
Authorization: Bearer {token}
```

#### Get Single Course
```http
GET /api/courses/:id
Authorization: Bearer {token}
```

#### Sync Courses from Moodle
```http
POST /api/courses/sync-from-moodle
Authorization: Bearer {token}
```

## 🏗️ Project Structure

```
random/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── postController.js    # Post management
│   │   └── courseController.js  # Course management
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Course.js            # Course schema
│   │   ├── Post.js              # Post schema
│   │   ├── Group.js             # Group schema
│   │   ├── Message.js           # Message schema
│   │   └── Assignment.js        # Assignment schema
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── posts.js             # Post routes
│   │   └── courses.js           # Course routes
│   ├── services/
│   │   ├── moodleConnector.js   # Moodle API integration
│   │   └── syncEngine.js        # Bidirectional sync engine
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── utils/
│   │   └── generateToken.js     # JWT token generator
│   ├── server.js                # Express server & Socket.io
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js        # Navigation bar
│   │   │   └── PrivateRoute.js  # Protected route component
│   │   ├── pages/
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Register.js      # Registration page
│   │   │   ├── Home.js          # News feed page
│   │   │   ├── Courses.js       # Courses list page
│   │   │   ├── CourseDetail.js  # Course detail page
│   │   │   ├── Profile.js       # User profile page
│   │   │   └── Settings.js      # Settings page
│   │   ├── redux/
│   │   │   ├── store.js         # Redux store
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── postSlice.js
│   │   │       └── courseSlice.js
│   │   ├── App.js               # Main app component
│   │   ├── index.js             # App entry point
│   │   └── index.css            # Global styles
│   └── package.json
├── package.json                 # Root package.json
└── README.md
```

## 🔧 Moodle Configuration

### Setting up Moodle Web Services

1. **Enable Web Services in Moodle**
   - Navigate to: `Site administration > Advanced features`
   - Enable "Enable web services"

2. **Enable REST Protocol**
   - Navigate to: `Site administration > Plugins > Web services > Manage protocols`
   - Enable REST protocol

3. **Create a Web Service**
   - Navigate to: `Site administration > Plugins > Web services > External services`
   - Add a new service (e.g., "Social Network Integration")

4. **Add Functions to the Service**
   Required functions:
   - `core_user_get_users_by_field`
   - `core_enrol_get_users_courses`
   - `core_course_get_courses`
   - `core_enrol_get_enrolled_users`
   - `mod_assign_get_assignments`
   - `mod_forum_get_forums_by_courses`
   - `mod_forum_add_discussion`
   - `gradereport_user_get_grade_items`

5. **Create a Service User**
   - Create a dedicated user for the web service
   - Assign appropriate capabilities

6. **Generate a Token**
   - Navigate to: `Site administration > Plugins > Web services > Manage tokens`
   - Create a token for the service user
   - Copy the token to your `.env` file

## 🔄 Synchronization Engine

The platform includes a sophisticated bidirectional synchronization engine:

### Sync Modes
- **Real-time**: Via webhooks (requires custom Moodle plugin)
- **Hourly**: Scheduled sync every hour
- **Daily**: Scheduled sync once per day
- **Manual**: User-triggered sync

### Configurable Options
- Sync direction (bidirectional, Moodle-only, Platform-only)
- Content types (courses, assignments, grades, calendar)
- Conflict resolution strategies
- User-level sync preferences

### Monitoring
Check sync status at: `http://localhost:5000/health`

## 🧪 Testing

```bash
cd backend
npm test
```

## 🚢 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Deploy to your preferred hosting (Heroku, AWS, DigitalOcean)

### Frontend Deployment
1. Build the production bundle:
```bash
cd frontend
npm run build
```
2. Serve the `build` folder with a static hosting service or configure your server

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- MERN Stack community
- Moodle development team
- All contributors and users

## 📧 Support

For support, email support@example.com or open an issue in the GitHub repository.
# MERN Social Network with Moodle Integration

A full-stack social networking application built with the MERN stack (MongoDB, Express, React, Node.js) that integrates with Moodle LMS for educational purposes.

## Features

### Social Features
- 👤 User authentication (register, login, logout)
- 📝 Create, edit, and delete posts
- 💬 Comment on posts
- ❤️ Like/unlike posts
- 👥 Follow/unfollow users
- 🔍 User profiles with bio, location, and website

### Moodle Integration
- 🔗 Connect your Moodle account
- 📚 Sync enrolled courses from Moodle
- 📊 View course content and sections
- 📝 Access assignments and grades
- 💬 Course-specific discussions
- 👥 View course participants

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Axios** - HTTP client for Moodle API

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Context API** - State management
- **Axios** - HTTP client
- **CSS3** - Styling

## Project Structure

```
├── backend/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # External services (Moodle)
│   ├── uploads/         # File uploads directory
│   ├── server.js        # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── auth/    # Authentication components
│   │   │   ├── courses/ # Course components
│   │   │   ├── layout/  # Layout components
│   │   │   ├── posts/   # Post components
│   │   │   └── profile/ # Profile components
│   │   ├── context/     # React context
│   │   ├── utils/       # Utility functions
│   │   ├── App.js       # Main app component
│   │   └── index.js     # Entry point
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd random
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file from example
   cp .env.example .env
   
   # Edit .env with your configuration
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   Edit `backend/.env` with your settings:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/social_network_moodle
   JWT_SECRET=your-secret-key
   MOODLE_URL=https://your-moodle-instance.com
   MOODLE_TOKEN=your-moodle-token
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/avatar` - Update avatar
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `GET /api/courses/user/enrolled` - Get enrolled courses

### Moodle Integration
- `POST /api/moodle/connect` - Connect Moodle account
- `DELETE /api/moodle/disconnect` - Disconnect Moodle
- `GET /api/moodle/status` - Check connection status
- `POST /api/moodle/sync/courses` - Sync courses
- `POST /api/moodle/sync/course/:id/content` - Sync course content
- `GET /api/moodle/grades/:courseId` - Get grades

## Moodle Setup

To enable Moodle integration:

1. **Enable Web Services in Moodle**
   - Go to Site Administration > Advanced features
   - Enable "Web services"

2. **Enable REST Protocol**
   - Go to Site Administration > Plugins > Web services > Manage protocols
   - Enable "REST protocol"

3. **Create a Web Service Token**
   - Go to Site Administration > Plugins > Web services > Manage tokens
   - Create a new token for your user
   - Use this token in your `.env` file

4. **Required Web Service Functions**
   - `core_webservice_get_site_info`
   - `core_enrol_get_users_courses`
   - `core_course_get_contents`
   - `core_course_get_courses`
   - `gradereport_user_get_grade_items`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License
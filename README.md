# MERN Social Network with Moodle Integration

A full-stack social networking application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring three user roles: Admin, Teacher, and Student. This application includes seamless integration with Moodle LMS.

## Features

### 🎯 Three User Roles

#### Admin Dashboard
- **User Management**: View, manage, and delete all users (admins, teachers, students)
- **System Statistics**: Monitor total users, teachers, students, and courses
- **Moodle Configuration**: Configure Moodle integration settings
- **System Settings**: Control registration, notifications, and sync requirements

#### Teacher Dashboard
- **Course Management**: Create and manage courses
- **Student Enrollment**: View enrolled students in each course
- **Course Materials**: Upload and manage course resources
- **Announcements**: Post announcements to students
- **Moodle Sync**: Link courses with Moodle
- **Social Feed**: Share updates and interact with students

#### Student Dashboard
- **Course Browsing**: Browse and enroll in available courses
- **Course Access**: View enrolled courses, materials, and announcements
- **Moodle Integration**: Link Moodle account for automatic course sync
- **Social Feed**: Connect with classmates and teachers
- **Learning Materials**: Access all course resources

### 🌐 Social Network Features
- Post creation and sharing
- Like and comment on posts
- Real-time feed updates
- User profiles with avatars
- Interactive comments section

### 🎓 Moodle Integration
- Sync courses from Moodle
- Link user accounts with Moodle
- Import course materials
- Fetch user information from Moodle
- Bidirectional data synchronization

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Axios**: HTTP client for Moodle API

### Frontend
- **React**: UI library
- **React Router**: Navigation
- **Context API**: State management
- **Axios**: API requests
- **CSS3**: Styling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd random
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mern-social-network
   JWT_SECRET=your_jwt_secret_key_here
   MOODLE_URL=https://your-moodle-instance.com
   MOODLE_TOKEN=your_moodle_webservice_token_here
   ```

5. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

6. **Run the application**

   **Development mode (both frontend and backend):**
   ```bash
   npm run dev
   ```

   **Backend only:**
   ```bash
   npm run server
   ```

   **Frontend only:**
   ```bash
   npm run client
   ```

   **Production mode:**
   ```bash
   npm start
   ```

## Usage

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Default User Roles
When registering, you can select from:
- **Student**: Access courses, materials, and social features
- **Teacher**: Create courses, manage students, post materials
- **Admin**: Full system access, user management, configuration

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

#### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/me` - Get current user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

#### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment
- `DELETE /api/posts/:id` - Delete post

#### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (Teacher/Admin)
- `POST /api/courses/:id/enroll` - Enroll in course
- `POST /api/courses/:id/announcement` - Add announcement (Teacher/Admin)
- `POST /api/courses/:id/material` - Add material (Teacher/Admin)

#### Moodle Integration
- `GET /api/moodle/courses` - Get Moodle courses
- `GET /api/moodle/user/:userid` - Get Moodle user info
- `POST /api/moodle/sync/course/:id` - Sync course with Moodle

## Moodle Integration Setup

1. **Enable Web Services in Moodle**
   - Go to Site administration > Advanced features
   - Enable "Enable web services"

2. **Create a Web Service Token**
   - Go to Site administration > Plugins > Web services > Manage tokens
   - Create a token for your user

3. **Configure Permissions**
   - Ensure the following functions are enabled:
     - `core_course_get_courses`
     - `core_user_get_users_by_field`
     - Other required functions as needed

4. **Update Environment Variables**
   - Add your Moodle URL and token to `.env`

## Project Structure

```
random/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/    # Reusable components
│       ├── context/       # React Context (Auth)
│       ├── pages/         # Page components
│       ├── utils/         # Utilities (API client)
│       ├── App.js
│       └── index.js
├── server/                # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   └── server.js         # Server entry point
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Role-based access control (RBAC)
- Protected API routes
- Secure password validation
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue in the repository.

## Acknowledgments

- MERN Stack Community
- Moodle Development Team
- All contributors
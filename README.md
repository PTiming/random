# MERN Social Network with Moodle Integration

A full-stack social networking platform built with the MERN stack (MongoDB, Express, React, Node.js) featuring Moodle LMS integration and role-based access control for three user types: Admin, Teacher, and Student.

## 🌟 Features

### General Features
- 🔐 User authentication and authorization (JWT)
- 👥 Three user roles: Admin, Teacher, and Student
- 📱 Responsive UI design
- 🎓 Moodle LMS integration
- 📰 Social feed with posts, likes, and comments

### Admin Dashboard
- 📊 System statistics and analytics
- 👤 User management (view all users)
- 📚 Course management (view all courses)
- 📰 Social feed access
- 🎓 Moodle integration settings

### Teacher Dashboard
- 📚 Create and manage courses
- 📝 Add assignments to courses
- 🔗 Link courses with Moodle
- 👥 View enrolled students
- 📰 Social feed participation

### Student Dashboard
- 📖 Browse and enroll in courses
- 📝 View course assignments and deadlines
- 🎓 Access Moodle courses
- 📰 Social feed participation
- 💬 Interact with posts (like and comment)

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client for Moodle API

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - API calls
- **Context API** - State management

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Moodle instance (optional, for Moodle integration)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/PTiming/random.git
cd random
```

### 2. Install dependencies

Install backend dependencies:
```bash
npm install
```

Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

Or install all at once:
```bash
npm run install-all
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/mern-social-moodle
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
MOODLE_URL=https://your-moodle-instance.com
MOODLE_TOKEN=your_moodle_webservice_token
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# On Linux/Mac
sudo systemctl start mongodb

# On Windows
net start MongoDB
```

### 5. Run the Application

Development mode (runs both backend and frontend):
```bash
npm run dev
```

Or run separately:

Backend only:
```bash
npm run server
```

Frontend only:
```bash
npm run client
```

Production mode:
```bash
npm start
```

## 📱 Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 👤 User Roles

### 1. Admin
- Full system access
- View all users, courses, and posts
- Manage system settings
- Configure Moodle integration

### 2. Teacher
- Create and manage courses
- Add assignments
- Link courses with Moodle
- View enrolled students
- Post on social feed

### 3. Student
- Browse and enroll in courses
- View assignments and deadlines
- Access Moodle content
- Participate in social feed

## 🎓 Moodle Integration

### Setup Moodle Web Services

1. Enable web services in Moodle:
   - Site administration → Advanced features → Enable web services

2. Create a web service token:
   - Site administration → Plugins → Web services → Manage tokens
   - Create a new token for a user

3. Add the Moodle URL and token to your `.env` file

### Available Moodle Features

- Import courses from Moodle
- Sync assignments and deadlines
- Fetch user information
- View course content

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `POST /api/courses/:id/enroll` - Enroll in course
- `POST /api/courses/:id/assignments` - Add assignment

### Moodle
- `GET /api/moodle/courses` - Get Moodle courses
- `GET /api/moodle/user/:userId` - Get Moodle user
- `GET /api/moodle/assignments/:courseId` - Get Moodle assignments

## 📁 Project Structure

```
random/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── contexts/       # Context providers
│       ├── pages/          # Page components
│       ├── App.js
│       ├── App.css
│       └── index.js
├── server/                 # Express backend
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── .env.example           # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Moodle integration requires proper web service configuration
- File upload functionality not yet implemented
- Real-time notifications pending

## 🔮 Future Enhancements

- [ ] Real-time messaging
- [ ] File upload for posts and assignments
- [ ] Video conferencing integration
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Assignment submission and grading

## 📞 Support

For issues and questions, please create an issue in the GitHub repository.
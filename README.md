# SocialNet - MERN Social Network

A full-stack social network application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- 🔐 User authentication (register, login, JWT)
- 📝 Create, read, and delete posts
- ❤️ Like and unlike posts
- 💬 Comment on posts
- 👥 Follow and unfollow users
- 👤 User profiles with bio and profile picture
- 🔍 Explore page to discover all posts
- 📱 Responsive design

## Project Structure

```
├── backend/                 # Express.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── server.js           # Entry point
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── index.html
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/social-network
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional, for custom API URL):
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile (auth required)
- `POST /api/users/:id/follow` - Follow user (auth required)
- `POST /api/users/:id/unfollow` - Unfollow user (auth required)
- `GET /api/users/search?q=query` - Search users (auth required)

### Posts
- `POST /api/posts` - Create post (auth required)
- `GET /api/posts/feed` - Get home feed (auth required)
- `GET /api/posts/explore` - Get all posts
- `GET /api/posts/:id` - Get single post
- `DELETE /api/posts/:id` - Delete post (auth required)
- `POST /api/posts/:id/like` - Like post (auth required)
- `POST /api/posts/:id/unlike` - Unlike post (auth required)
- `POST /api/posts/:id/comments` - Add comment (auth required)
- `DELETE /api/posts/:postId/comments/:commentId` - Delete comment (auth required)

## Technologies Used

### Backend
- Express.js - Web framework
- MongoDB with Mongoose - Database
- JWT - Authentication
- bcryptjs - Password hashing
- express-validator - Input validation

### Frontend
- React 19 - UI library
- React Router - Navigation
- Axios - HTTP client
- Vite - Build tool

## License

ISC
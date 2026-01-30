# MERN Social Network with Moodle Integration

A full-featured social network application built with the MERN stack (MongoDB, Express.js, React, Node.js) that integrates with Moodle LMS for educational features.

## Features

### Social Network Features
- 👤 User authentication (register/login with JWT)
- 📝 Create, read, and delete posts
- ❤️ Like and unlike posts
- 💬 Comment on posts
- 👥 Follow/unfollow users
- 🔍 Search users
- 📱 Facebook-like responsive UI

### Moodle Integration Features
- 🔗 Link Moodle account to social profile
- 📚 Fetch and display enrolled courses
- 📊 View course grades and assignments
- 🔄 Sync Moodle data to local database
- 📤 Send data to Moodle (forum posts)
- 💾 Store and retrieve Moodle data locally

## Tech Stack

**Frontend:**
- React.js
- React Router for navigation
- Axios for API calls
- CSS3 for styling (Facebook-like design)

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt.js for password hashing

**Moodle Integration:**
- Moodle Web Services API
- REST API integration

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Moodle instance with Web Services enabled (optional for Moodle features)

### Setup

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
MOODLE_URL=https://your-moodle-site.com
MOODLE_TOKEN=your_moodle_token_here
```

5. **Start MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

6. **Run the application**

Development mode (backend only):
```bash
npm run server
```

Production mode:
```bash
npm start
```

Frontend (in a separate terminal):
```bash
cd client
npm start
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:3000`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Posts
- `GET /api/posts` - Get all posts (requires auth)
- `GET /api/posts/:id` - Get single post (requires auth)
- `POST /api/posts` - Create a post (requires auth)
- `PUT /api/posts/:id/like` - Like/unlike a post (requires auth)
- `POST /api/posts/:id/comment` - Add comment to post (requires auth)
- `DELETE /api/posts/:id` - Delete a post (requires auth)

### Users
- `GET /api/users/:id` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)
- `PUT /api/users/:id/follow` - Follow/unfollow user (requires auth)
- `GET /api/users/search/:query` - Search users (requires auth)

### Moodle Integration
- `POST /api/moodle/link-account` - Link Moodle account (requires auth)
- `GET /api/moodle/courses` - Get user's Moodle courses (requires auth)
- `GET /api/moodle/courses/:courseId` - Get course details (requires auth)
- `GET /api/moodle/grades/:courseId` - Get course grades (requires auth)
- `GET /api/moodle/assignments/:courseId` - Get course assignments (requires auth)
- `POST /api/moodle/sync/:courseId` - Sync Moodle data to database (requires auth)
- `GET /api/moodle/data` - Get all synced Moodle data (requires auth)
- `GET /api/moodle/data/:courseId` - Get synced data for specific course (requires auth)
- `POST /api/moodle/send-forum-post` - Send forum post to Moodle (requires auth)

## Moodle Setup

To enable Moodle integration:

1. **Enable Web Services in Moodle**
   - Go to Site Administration → Advanced features
   - Enable "Enable web services"

2. **Create a Web Service User**
   - Create a dedicated user for the integration
   - Assign appropriate permissions

3. **Enable REST Protocol**
   - Go to Site Administration → Plugins → Web services → Manage protocols
   - Enable REST protocol

4. **Create a Web Service**
   - Go to Site Administration → Plugins → Web services → External services
   - Add a new service with required functions

5. **Generate Token**
   - Go to Site Administration → Plugins → Web services → Manage tokens
   - Create a token for the web service user
   - Copy the token to your `.env` file

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Posts**: Share updates with your network
3. **Interact**: Like and comment on posts from other users
4. **Link Moodle**: Connect your Moodle account to access course data
5. **Sync Courses**: Fetch and sync your Moodle course information
6. **View Grades**: Access your grades and assignments from within the social network

## Project Structure

```
random/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── services/       # API service
│       └── index.css       # Global styles
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── .env.example           # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Environment variable configuration
- Input validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue in the repository.

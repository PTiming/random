# Quick Start Guide

## Running the Application

### 1. Install MongoDB

**For macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**For Ubuntu/Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**For Windows:**
Download and install from https://www.mongodb.com/try/download/community

### 2. Set up environment variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-social-network
JWT_SECRET=your_secure_random_string_here
MOODLE_URL=https://your-moodle-site.com
MOODLE_TOKEN=your_moodle_webservice_token
```

### 3. Start the Backend Server

```bash
npm install
npm run server
```

The server will start on http://localhost:5000

### 4. Start the Frontend

Open a new terminal:
```bash
cd client
npm install
npm start
```

The React app will open at http://localhost:3000

## Testing the Application

### 1. Register a new account
- Navigate to http://localhost:3000
- Click "Create New Account"
- Fill in username, email, and password
- Click "Sign Up"

### 2. Create a post
- Once logged in, you'll see the feed
- Click on "What's on your mind?" input
- Type your post content
- Click "Post" button

### 3. Interact with posts
- Click the thumbs up icon to like a post
- Click "Comment" to add a comment
- View the number of likes and comments

### 4. Link Moodle Account (Optional)
If you have a Moodle instance configured:
- Look at the right sidebar "Moodle Courses" widget
- Click "Link Moodle Account"
- Enter your Moodle User ID
- Click "Link Account"
- You can now sync course data

## Features Demo

### Social Network Features
✅ User Registration and Login
✅ Create Posts
✅ Like/Unlike Posts
✅ Comment on Posts
✅ Real-time Feed Updates
✅ User Profiles
✅ Follow/Unfollow Users

### Moodle Integration Features
✅ Link Moodle Account
✅ Fetch Enrolled Courses
✅ View Course Grades
✅ View Assignments
✅ Sync Data to Local Database
✅ Send Forum Posts to Moodle

### UI Features
✅ Facebook-like Design
✅ Responsive Layout
✅ Clean Navigation Bar
✅ Sidebar with Quick Links
✅ Feed with Posts
✅ Interactive Modals
✅ Real Comments Section

## API Testing with cURL

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Create a post (replace TOKEN with JWT from login):
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "content": "Hello from the API!"
  }'
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check the connection string in `.env`

### Port Already in Use
- Change the PORT in `.env` to a different port (e.g., 5001)
- Or kill the process using the port: `lsof -ti:5000 | xargs kill`

### CORS Errors
- Make sure both backend (5000) and frontend (3000) are running
- Check that CORS is enabled in server/index.js

### Moodle Integration Not Working
- Verify Moodle URL and token in `.env`
- Ensure Web Services are enabled in Moodle
- Check that the required Moodle functions are available

## Production Deployment

### Backend
1. Set up MongoDB Atlas or a MongoDB server
2. Update MONGODB_URI in production environment
3. Set strong JWT_SECRET
4. Deploy to platforms like Heroku, DigitalOcean, or AWS

### Frontend
1. Build the React app: `cd client && npm run build`
2. Serve the build folder with a static file server
3. Or deploy to Netlify, Vercel, or similar platforms

### Environment Variables
Make sure to set all required environment variables in your production environment.

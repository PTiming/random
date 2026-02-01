# Quick Start Guide

## Prerequisites

Before running this application, ensure you have the following installed:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (v4.4 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Verify installation: `mongod --version`

3. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

## Installation Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and update the values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-social-network
JWT_SECRET=your_secure_random_secret_here
MOODLE_URL=https://your-moodle-instance.com
MOODLE_TOKEN=your_moodle_webservice_token_here
```

**Important:** Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start MongoDB

**On Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**On macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**On Linux:**
```bash
sudo systemctl start mongod
```

**Or run manually:**
```bash
mongod --dbpath /path/to/data/directory
```

### 4. Run the Application

**Option A: Run Both Frontend and Backend Together**
```bash
npm run dev
```

**Option B: Run Separately**

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run client
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## First Time Setup

### Create Your First Admin User

1. Open http://localhost:3000
2. Click "Register"
3. Fill in your details:
   - Full Name: Your Name
   - Email: admin@example.com
   - Password: (choose a secure password)
   - Role: **Admin**
4. Click "Register"
5. You'll be automatically logged in to the Admin Dashboard

### Create Test Users

Create additional test users for different roles:

**Teacher Account:**
- Name: Jane Teacher
- Email: teacher@test.com
- Password: teacher123
- Role: Teacher

**Student Account:**
- Name: John Student
- Email: student@test.com
- Password: student123
- Role: Student

## Testing the Features

### As Admin:
1. Navigate to "Manage Users" to see all registered users
2. Check system statistics on the Overview page
3. Configure Moodle settings (optional)

### As Teacher:
1. Create a new course from "My Courses" section
2. Add course materials and announcements
3. Post updates on the social feed

### As Student:
1. Browse available courses
2. Enroll in courses
3. View course materials and announcements
4. Interact on the social feed

## Moodle Integration (Optional)

If you want to integrate with Moodle:

### 1. Moodle Configuration

**Enable Web Services:**
1. Log in to Moodle as administrator
2. Go to: Site administration > Advanced features
3. Check "Enable web services"
4. Save changes

**Create Web Service:**
1. Go to: Site administration > Plugins > Web services > External services
2. Click "Add" to create a new service
3. Enter a name (e.g., "MERN Social Network")
4. Add required functions:
   - `core_course_get_courses`
   - `core_user_get_users_by_field`
   - `core_enrol_get_enrolled_users`

**Generate Token:**
1. Go to: Site administration > Plugins > Web services > Manage tokens
2. Click "Add" to create a new token
3. Select a user and the service you created
4. Copy the generated token

### 2. Update Application Configuration

Update your `.env` file:
```env
MOODLE_URL=https://your-moodle-site.com
MOODLE_TOKEN=your_generated_token_here
```

### 3. Test Moodle Connection

1. Log in as Admin
2. Go to "Moodle Integration"
3. Click "Test Connection"
4. Verify successful connection

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongooseServerSelectionError: connect ECONNREFUSED"**

Solution:
1. Ensure MongoDB is running: `mongod`
2. Check MongoDB is listening on port 27017
3. Verify MONGODB_URI in `.env` file

### Port Already in Use

**Error: "Port 5000 is already in use"**

Solution:
1. Change PORT in `.env` file
2. Or stop the process using port 5000:
   ```bash
   # Find process
   lsof -i :5000
   # Kill process
   kill -9 <PID>
   ```

### React App Won't Start

**Error: "Something is already running on port 3000"**

Solution:
1. Stop the process or use a different port:
   ```bash
   PORT=3001 npm start
   ```

### Authentication Issues

**Error: "Token is not valid"**

Solution:
1. Clear localStorage in browser
2. Re-login to get a new token
3. Ensure JWT_SECRET is consistent in `.env`

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Changes to React components reload automatically
- Backend: Using nodemon, server restarts on file changes

### Database Inspection

View your MongoDB data:
```bash
# Connect to MongoDB shell
mongo

# Use the database
use mern-social-network

# View collections
show collections

# Query users
db.users.find().pretty()

# Query courses
db.courses.find().pretty()
```

### API Testing

Use curl or Postman to test API endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Production Deployment

For production deployment:

1. Build the React app:
   ```bash
   cd client
   npm run build
   ```

2. Serve the built files from Express
3. Use environment variables for configuration
4. Set up a reverse proxy (nginx)
5. Use a production MongoDB instance
6. Enable HTTPS
7. Set secure JWT_SECRET
8. Configure CORS for your domain

## Support

For issues or questions:
1. Check the README.md
2. Review troubleshooting section
3. Open an issue on GitHub

## License

ISC License - See LICENSE file for details

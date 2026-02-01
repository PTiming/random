# MERN LMS with Moodle Integration

A full-stack Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring **two-way data synchronization** with Moodle.

## Features

### Core LMS Features
- **User Management**: Students, Instructors, and Admin roles
- **Course Management**: Create, edit, and organize courses
- **Enrollment System**: Self-enrollment and admin-managed enrollment
- **Grade Management**: Track and display student grades

### Moodle Integration (Two-Way Sync)
- **User Sync**: Sync users between MERN LMS and Moodle
- **Course Sync**: Import courses from Moodle or export to Moodle
- **Enrollment Sync**: Automatically sync enrollments in both directions
- **Grade Sync**: Import grades from Moodle to MERN LMS
- **Webhook Support**: Real-time sync when changes occur in Moodle
- **Manual Sync**: On-demand sync for individual entities or full system

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Axios** for Moodle API communication

### Frontend
- **React** 18
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database and Moodle configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth and webhook verification
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Moodle API and sync services
│   │   └── server.js       # Express server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── App.js          # Main application
│   ├── package.json
│   └── .env.example
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Moodle instance with Web Services enabled

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/mern_lms
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   MOODLE_URL=https://your-moodle-site.com
   MOODLE_TOKEN=your-moodle-webservice-token
   MOODLE_WEBHOOK_SECRET=your-webhook-secret
   ```

5. Start the server:
   ```bash
   npm run dev
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

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Configure the API URL:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. Start the development server:
   ```bash
   npm start
   ```

## Moodle Configuration

### Enable Web Services in Moodle

1. Go to **Site administration > Advanced features**
2. Enable "Enable web services"

### Create External Service

1. Go to **Site administration > Plugins > Web services > External services**
2. Add a new service with required functions:
   - `core_user_create_users`
   - `core_user_update_users`
   - `core_user_get_users`
   - `core_user_get_users_by_field`
   - `core_course_get_courses`
   - `core_course_get_courses_by_field`
   - `core_course_create_courses`
   - `core_course_update_courses`
   - `enrol_manual_enrol_users`
   - `enrol_manual_unenrol_users`
   - `core_enrol_get_enrolled_users`
   - `core_enrol_get_users_courses`
   - `gradereport_user_get_grades_table`

### Create Token

1. Go to **Site administration > Plugins > Web services > Manage tokens**
2. Create a token for the external service
3. Copy the token to your `.env` file

### Configure Webhooks (Optional)

1. Install a Moodle webhook plugin
2. Configure webhooks to POST to `https://your-lms-domain.com/api/moodle/webhook`
3. Set the webhook secret in your `.env` file

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Users (Admin)
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user
- `POST /api/users/:id/sync-moodle` - Sync user with Moodle

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/:id/enroll` - Enroll in course
- `DELETE /api/courses/:id/enroll` - Unenroll from course
- `GET /api/courses/:id/students` - Get enrolled students
- `POST /api/courses/:id/sync-moodle` - Sync course with Moodle

### Grades
- `GET /api/grades/my-grades` - Get current user's grades
- `GET /api/grades/course/:courseId` - Get grades for a course
- `GET /api/grades/course/:courseId/all` - Get all grades (instructor)
- `POST /api/grades` - Create/update grade
- `PUT /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade
- `POST /api/grades/sync-moodle` - Sync grades from Moodle

### Moodle Integration
- `POST /api/moodle/webhook` - Moodle webhook endpoint
- `GET /api/moodle/test-connection` - Test Moodle connection
- `GET /api/moodle/courses` - Get Moodle courses
- `POST /api/moodle/import-course` - Import course from Moodle
- `GET /api/moodle/sync-history` - Get sync history
- `POST /api/moodle/full-sync` - Perform full sync

## Two-Way Data Sync Flow

### From MERN LMS to Moodle
1. User creates/updates data in MERN LMS
2. System calls Moodle Web Services API
3. Data is created/updated in Moodle
4. Sync status is logged

### From Moodle to MERN LMS
1. Change occurs in Moodle
2. Moodle sends webhook to MERN LMS (or manual sync triggered)
3. System fetches data via Moodle API
4. Data is created/updated in MERN LMS
5. Sync status is logged

## License

MIT License
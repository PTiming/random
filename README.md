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
2. Add a new service with all required functions listed below

### Create Token

1. Go to **Site administration > Plugins > Web services > Manage tokens**
2. Create a token for the external service
3. Copy the token to your `.env` file

### Configure Webhooks (Optional)

1. Install a Moodle webhook plugin
2. Configure webhooks to POST to `https://your-lms-domain.com/api/moodle/webhook`
3. Set the webhook secret in your `.env` file

## Moodle Web Services API Reference

This LMS uses the following **20 Moodle Web Services API functions** for two-way data synchronization:

### APIs by User Role

#### 🎓 Student APIs
These APIs are triggered when students interact with the LMS:

| API Function | When Used | Description |
|-------------|-----------|-------------|
| `core_user_create_users` | Student registers | Creates student account in Moodle |
| `core_user_update_users` | Student updates profile | Syncs profile changes to Moodle |
| `core_user_get_users_by_field` | Student logs in | Verifies student exists in Moodle |
| `enrol_manual_enrol_users` | Student enrolls in course | Enrolls student in Moodle course (roleid=5) |
| `enrol_manual_unenrol_users` | Student unenrolls | Removes student from Moodle course |
| `core_enrol_get_users_courses` | View "My Courses" | Gets student's enrolled courses from Moodle |
| `gradereport_user_get_grades_table` | View grades | Fetches student's grades from Moodle |
| `core_grades_get_grades` | View specific grade | Gets detailed grade for an activity |
| `core_completion_get_course_completion_status` | View progress | Gets student's course completion status |
| `core_completion_get_activities_completion_status` | View progress | Gets student's activity completion status |

#### 👨‍🏫 Teacher/Instructor APIs
These APIs are triggered when teachers manage courses and students:

| API Function | When Used | Description |
|-------------|-----------|-------------|
| `core_user_create_users` | Teacher registers | Creates teacher account in Moodle |
| `core_user_update_users` | Teacher updates profile | Syncs profile changes to Moodle |
| `core_user_get_users_by_field` | Manage students | Lookup students in Moodle |
| `core_course_create_courses` | Create new course | Creates course in Moodle |
| `core_course_update_courses` | Edit course | Updates course details in Moodle |
| `core_course_get_courses` | View all courses | Lists available Moodle courses |
| `core_course_get_courses_by_field` | Find specific course | Finds course by ID or shortname |
| `enrol_manual_enrol_users` | Add student to course | Enrolls student (roleid=5) or self as teacher (roleid=3) |
| `enrol_manual_unenrol_users` | Remove student | Unenrolls student from course |
| `core_enrol_get_enrolled_users` | View class roster | Gets all students in a course |
| `gradereport_user_get_grades_table` | View student grades | Gets all grades for a course |
| `core_grades_get_grades` | View/export grades | Gets grades for specific items |
| `core_grades_update_grades` | Enter grades | Updates student grades in Moodle |
| `mod_assign_get_assignments` | View assignments | Gets all assignments in course |
| `mod_assign_get_submissions` | View submissions | Gets student assignment submissions |
| `core_completion_get_course_completion_status` | Track student progress | Gets completion status for a student |
| `core_completion_get_activities_completion_status` | Track activity progress | Gets activity completion for a student |

#### 🔧 Admin-Only APIs
These APIs are only used by administrators:

| API Function | When Used | Description |
|-------------|-----------|-------------|
| `core_user_get_users` | Search all users | Query all Moodle users |
| `core_user_delete_users` | Delete user | Removes user from Moodle |
| `core_course_delete_courses` | Delete course | Removes course from Moodle |

### API Usage Summary by Role

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MOODLE API USAGE BY ROLE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STUDENT                      TEACHER                      ADMIN            │
│  ────────                     ───────                      ─────            │
│  • View own grades            • All Student APIs           • All APIs       │
│  • View own progress          • Create/Edit courses        • Delete users   │
│  • Enroll in courses          • Grade students             • Delete courses │
│  • View enrolled courses      • View all students          • Full sync      │
│                               • Manage enrollments                          │
│                               • View submissions                            │
│                                                                             │
│  APIs Used: 10                APIs Used: 17                APIs Used: 20    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### User Management APIs

| API Function | Description | Usage in LMS |
|-------------|-------------|--------------|
| `core_user_create_users` | Create new users in Moodle | Sync new LMS users to Moodle |
| `core_user_update_users` | Update existing user details | Sync user profile changes to Moodle |
| `core_user_get_users` | Search and retrieve users | Query Moodle users |
| `core_user_get_users_by_field` | Get users by specific field (id, email, username) | Find users for sync matching |
| `core_user_delete_users` | Delete users from Moodle | Remove synced users (configured but not actively used) |

### Course Management APIs

| API Function | Description | Usage in LMS |
|-------------|-------------|--------------|
| `core_course_get_courses` | Get all courses from Moodle | List available Moodle courses for import |
| `core_course_get_courses_by_field` | Get courses by field (id, shortname) | Find specific courses for sync |
| `core_course_create_courses` | Create new courses in Moodle | Export LMS courses to Moodle |
| `core_course_update_courses` | Update existing course details | Sync course changes to Moodle |
| `core_course_delete_courses` | Delete courses from Moodle | Remove synced courses (configured but not actively used) |

### Enrollment Management APIs

| API Function | Description | Usage in LMS |
|-------------|-------------|--------------|
| `enrol_manual_enrol_users` | Enroll users in courses | Sync enrollments to Moodle |
| `enrol_manual_unenrol_users` | Unenroll users from courses | Sync unenrollments to Moodle |
| `core_enrol_get_enrolled_users` | Get all enrolled users in a course | Import enrollments from Moodle |
| `core_enrol_get_users_courses` | Get all courses a user is enrolled in | Check user's Moodle enrollments |

### Grade Management APIs

| API Function | Description | Usage in LMS |
|-------------|-------------|--------------|
| `core_grades_get_grades` | Get grades for specific items/users | Fetch detailed grade data |
| `core_grades_update_grades` | Update grade values | Push grades to Moodle (configured for future use) |
| `gradereport_user_get_grades_table` | Get full gradebook table for a user | Import comprehensive grades from Moodle |

### Assignment APIs

| API Function | Description | Usage in LMS |
|-------------|-------------|--------------|
| `mod_assign_get_assignments` | Get assignments for courses | Fetch course assignments from Moodle |
| `mod_assign_get_submissions` | Get assignment submissions | Fetch student submissions from Moodle |

### Completion Tracking APIs

| API Function | Description | Usage in LMS |
|-------------|-------------|--------------|
| `core_completion_get_course_completion_status` | Get course completion status | Track student progress from Moodle |
| `core_completion_get_activities_completion_status` | Get activity completion status | Track activity-level progress |

### API Request Format

All API calls are made via POST to Moodle's Web Services endpoint:
```
POST {MOODLE_URL}/webservice/rest/server.php
```

With parameters:
```
wstoken: {your-token}
wsfunction: {function-name}
moodlewsrestformat: json
{...function-specific-params}
```

### Example API Calls

**Create User:**
```javascript
// Function: core_user_create_users
params: {
  'users[0][username]': 'john.doe',
  'users[0][email]': 'john@example.com',
  'users[0][firstname]': 'John',
  'users[0][lastname]': 'Doe',
  'users[0][password]': 'SecurePass123!',
  'users[0][auth]': 'manual'
}
```

**Create Course:**
```javascript
// Function: core_course_create_courses
params: {
  'courses[0][fullname]': 'Introduction to Programming',
  'courses[0][shortname]': 'PROG101',
  'courses[0][categoryid]': 1,
  'courses[0][summary]': 'Learn programming basics',
  'courses[0][format]': 'topics',
  'courses[0][visible]': 1,
  'courses[0][startdate]': 1704067200,  // Unix timestamp
  'courses[0][enddate]': 1735689600
}
```

**Enroll User:**
```javascript
// Function: enrol_manual_enrol_users
params: {
  'enrolments[0][userid]': 123,      // Moodle user ID
  'enrolments[0][courseid]': 456,    // Moodle course ID
  'enrolments[0][roleid]': 5         // 5=student, 3=teacher
}
```

**Get Course Grades:**
```javascript
// Function: gradereport_user_get_grades_table
params: {
  courseid: 456,
  userid: 123  // Optional: specific user
}
```

### Moodle Role IDs

| Role ID | Role Name | Description |
|---------|-----------|-------------|
| 1 | Manager | Full administrative access |
| 3 | Teacher (Editing) | Can edit course content and grade |
| 4 | Teacher (Non-editing) | Can grade but not edit content |
| 5 | Student | Standard learner role |

### Required Moodle Capabilities

The web service user needs these capabilities:
- `moodle/user:create`, `moodle/user:update`, `moodle/user:viewdetails`
- `moodle/course:create`, `moodle/course:update`, `moodle/course:view`
- `enrol/manual:enrol`, `enrol/manual:unenrol`
- `moodle/grade:view`, `moodle/grade:viewall`
- `mod/assign:view`, `mod/assign:grade`

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
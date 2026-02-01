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

---

## 🔄 How to Sync with Moodle

This section explains all the ways to synchronize data between the MERN LMS and Moodle.

### Sync Methods Overview

| Method | Trigger | Direction | Best For |
|--------|---------|-----------|----------|
| **Automatic Sync** | User actions | Both | Real-time updates |
| **Manual Sync** | Button click | Both | On-demand updates |
| **Webhook Sync** | Moodle events | Moodle → LMS | Real-time from Moodle |
| **Full Sync** | Admin action | Both | Initial setup, recovery |

---

### Method 1: Automatic Sync (Happens Automatically)

Data is automatically synced when users perform actions in the LMS:

#### When a Student:
```
┌─────────────────────────────────────────────────────────────────┐
│ Student Action in LMS          →    Automatic Sync to Moodle   │
├─────────────────────────────────────────────────────────────────┤
│ Registers                      →    Creates Moodle account     │
│ Updates profile                →    Updates Moodle profile     │
│ Enrolls in course              →    Creates Moodle enrollment  │
│ Unenrolls from course          →    Removes Moodle enrollment  │
└─────────────────────────────────────────────────────────────────┘
```

#### When a Teacher:
```
┌─────────────────────────────────────────────────────────────────┐
│ Teacher Action in LMS          →    Automatic Sync to Moodle   │
├─────────────────────────────────────────────────────────────────┤
│ Creates course                 →    Creates Moodle course      │
│ Updates course                 →    Updates Moodle course      │
│ Enrolls student                →    Creates Moodle enrollment  │
│ Enters grades                  →    Updates Moodle gradebook   │
└─────────────────────────────────────────────────────────────────┘
```

**No action required** - this happens in the background!

---

### Method 2: Manual Sync (Via API)

Use these API endpoints to manually trigger sync:

#### Sync Individual User
```bash
# Sync user TO Moodle
POST /api/users/:userId/sync-moodle
Content-Type: application/json
Authorization: Bearer {admin-token}

{
  "direction": "to_moodle"
}

# Sync user FROM Moodle
POST /api/users/:userId/sync-moodle
{
  "direction": "from_moodle"
}
```

#### Sync Individual Course
```bash
# Sync course (bidirectional - both directions)
POST /api/courses/:courseId/sync-moodle
Authorization: Bearer {admin-token}

{
  "direction": "bidirectional"
}

# Options: "to_moodle", "from_moodle", "bidirectional"
```

#### Sync Grades from Moodle
```bash
# Pull grades from Moodle for a student in a course
POST /api/grades/sync-moodle
Authorization: Bearer {admin-token}

{
  "userId": "64abc123...",
  "courseId": "64def456..."
}
```

---

### Method 3: Full System Sync (Admin Dashboard)

For administrators to sync everything at once:

#### Via Admin Dashboard (UI)
1. Login as Admin
2. Go to **Moodle Sync** page (`/moodle`)
3. Click **"Full Sync All Courses"** button

#### Via API
```bash
# Full sync - all courses
POST /api/moodle/full-sync
Authorization: Bearer {admin-token}

{}

# Full sync - specific course
POST /api/moodle/full-sync
Authorization: Bearer {admin-token}

{
  "courseId": "64def456..."
}
```

**What Full Sync Does:**
1. Syncs all course data to Moodle
2. Imports all enrollments from Moodle
3. Imports all grades from Moodle for enrolled users

---

### Method 4: Import from Moodle

#### Import a Course from Moodle
```bash
# Step 1: List available Moodle courses
GET /api/moodle/courses
Authorization: Bearer {admin-token}

# Response:
[
  { "id": 456, "shortname": "PROG101", "fullname": "Intro to Programming" },
  { "id": 457, "shortname": "MATH101", "fullname": "Basic Math" }
]

# Step 2: Import a specific course
POST /api/moodle/import-course
Authorization: Bearer {admin-token}

{
  "moodleCourseId": 456
}
```

---

### Method 5: Webhook Sync (Real-time from Moodle)

When events happen in Moodle, webhooks automatically update the LMS:

#### Supported Moodle Events
| Moodle Event | LMS Action |
|--------------|------------|
| `\core\event\user_created` | Creates/updates local user |
| `\core\event\user_updated` | Updates local user |
| `\core\event\course_created` | Creates local course |
| `\core\event\course_updated` | Updates local course |
| `\core\event\user_enrolment_created` | Enrolls user locally |
| `\core\event\user_enrolment_deleted` | Unenrolls user locally |
| `\core\event\user_graded` | Updates local grades |

#### Webhook Endpoint
```
POST https://your-lms.com/api/moodle/webhook

Headers:
  X-Moodle-Signature: {hmac-signature}

Body:
{
  "eventname": "\\core\\event\\user_graded",
  "objecttable": "grade_grades",
  "objectid": 12345,
  "other": {
    "userid": 123,
    "courseid": 456
  }
}
```

---

### Step-by-Step Sync Guide

#### Initial Setup Sync (First Time)

```
Step 1: Configure Moodle connection
─────────────────────────────────
Set MOODLE_URL and MOODLE_TOKEN in .env

Step 2: Test connection
─────────────────────────────────
GET /api/moodle/test-connection
→ Should return: { "success": true, "coursesCount": X }

Step 3: Import existing Moodle courses
─────────────────────────────────
GET /api/moodle/courses (list available)
POST /api/moodle/import-course (import each)

Step 4: Run full sync
─────────────────────────────────
POST /api/moodle/full-sync
→ Syncs all enrollments and grades
```

#### Daily Operations

```
┌──────────────────────────────────────────────────────────────────┐
│                     RECOMMENDED SYNC WORKFLOW                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Users & Enrollments: Automatic                                  │
│  ─────────────────────────────────                               │
│  → Changes sync immediately when actions occur                   │
│                                                                  │
│  Grades: Manual or Scheduled                                     │
│  ────────────────────────────                                    │
│  → Teachers: Grades push to Moodle when entered                  │
│  → Students: View grades page pulls from Moodle                  │
│  → Admin: Run full sync daily for comprehensive update           │
│                                                                  │
│  Courses: On Creation/Edit                                       │
│  ──────────────────────────                                      │
│  → New courses sync to Moodle automatically                      │
│  → Import new Moodle courses via admin dashboard                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### Sync Status & History

#### Check Sync Status
```bash
# Test Moodle connection
GET /api/moodle/test-connection

# Response:
{
  "success": true,
  "message": "Successfully connected to Moodle",
  "data": {
    "coursesCount": 15,
    "moodleUrl": "https://moodle.example.com"
  }
}
```

#### View Sync History
```bash
# Get recent sync operations
GET /api/moodle/sync-history?limit=50

# Filter by type
GET /api/moodle/sync-history?syncType=course&status=completed

# Response:
[
  {
    "syncType": "course",
    "direction": "to_moodle",
    "status": "completed",
    "entityId": "64def456...",
    "moodleId": 456,
    "changes": [
      { "field": "title", "oldValue": "Old Name", "newValue": "New Name" }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### Sync Troubleshooting

| Problem | Solution |
|---------|----------|
| "Moodle API Error" | Check MOODLE_TOKEN is valid and has required permissions |
| "User not synced" | Run `POST /api/users/:id/sync-moodle` |
| "Course not in Moodle" | Run `POST /api/courses/:id/sync-moodle` |
| "Grades not updating" | Ensure user and course are both synced first |
| "Webhook not working" | Check MOODLE_WEBHOOK_SECRET matches Moodle config |

#### Debug Mode
Set `NODE_ENV=development` to see detailed sync logs in console.

---

### Code Examples

#### JavaScript/Frontend
```javascript
import { moodleAPI, courseAPI, userAPI } from './services/api';

// Test connection
const testConnection = async () => {
  const response = await moodleAPI.testConnection();
  console.log('Connected:', response.data.success);
};

// Sync a course
const syncCourse = async (courseId) => {
  await courseAPI.syncWithMoodle(courseId, 'bidirectional');
};

// Import from Moodle
const importCourse = async (moodleCourseId) => {
  await moodleAPI.importCourse(moodleCourseId);
};

// Full sync
const fullSync = async () => {
  await moodleAPI.fullSync();
};
```

#### cURL Examples
```bash
# Test connection
curl -X GET http://localhost:5000/api/moodle/test-connection \
  -H "Authorization: Bearer YOUR_TOKEN"

# Sync user to Moodle
curl -X POST http://localhost:5000/api/users/USER_ID/sync-moodle \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"direction": "to_moodle"}'

# Full sync
curl -X POST http://localhost:5000/api/moodle/full-sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Moodle Web Services API Reference

This LMS uses the following **20 Moodle Web Services API functions** for two-way data synchronization:

### Two-Way Sync: Data Flow by Role

Both students and teachers can **push data TO Moodle** and **pull data FROM Moodle**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TWO-WAY DATA SYNC BY USER ROLE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐                                      ┌─────────────┐      │
│  │   STUDENT   │ ◄────────────────────────────────────│   MOODLE    │      │
│  │             │ ────────────────────────────────────►│             │      │
│  └─────────────┘                                      └─────────────┘      │
│       │                                                      │             │
│       │  TO MOODLE (Push):                                   │             │
│       │  • Create/update profile                             │             │
│       │  • Enroll/unenroll from courses                      │             │
│       │                                                      │             │
│       │  FROM MOODLE (Pull):                                 │             │
│       │  • View grades                                       │             │
│       │  • View completion status                            │             │
│       │  • View enrolled courses                             │             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐                                      ┌─────────────┐      │
│  │   TEACHER   │ ◄────────────────────────────────────│   MOODLE    │      │
│  │             │ ────────────────────────────────────►│             │      │
│  └─────────────┘                                      └─────────────┘      │
│       │                                                      │             │
│       │  TO MOODLE (Push):                                   │             │
│       │  • Create/update profile                             │             │
│       │  • Create/update courses                             │             │
│       │  • Enroll/unenroll students                          │             │
│       │  • Update student grades                             │             │
│       │                                                      │             │
│       │  FROM MOODLE (Pull):                                 │             │
│       │  • View all courses                                  │             │
│       │  • View student roster                               │             │
│       │  • View grades & submissions                         │             │
│       │  • View completion status                            │             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### APIs by User Role

#### 🎓 Student APIs (Two-Way Sync)

**Data Student Pushes TO Moodle:**

| API Function | Action | Data Sent to Moodle |
|-------------|--------|---------------------|
| `core_user_create_users` | Register | Name, email, password → Creates Moodle account |
| `core_user_update_users` | Update profile | Profile changes → Updates Moodle profile |
| `enrol_manual_enrol_users` | Enroll in course | User ID + Course ID → Creates Moodle enrollment |
| `enrol_manual_unenrol_users` | Unenroll | User ID + Course ID → Removes Moodle enrollment |

**Data Student Pulls FROM Moodle:**

| API Function | Action | Data Retrieved from Moodle |
|-------------|--------|---------------------------|
| `core_user_get_users_by_field` | Login verification | User existence check |
| `core_enrol_get_users_courses` | View "My Courses" | List of enrolled courses |
| `gradereport_user_get_grades_table` | View grades | All grades for courses |
| `core_grades_get_grades` | View specific grade | Grade details for an activity |
| `core_completion_get_course_completion_status` | View progress | Course completion percentage |
| `core_completion_get_activities_completion_status` | View progress | Activity completion status |

#### 👨‍🏫 Teacher/Instructor APIs (Two-Way Sync)

**Data Teacher Pushes TO Moodle:**

| API Function | Action | Data Sent to Moodle |
|-------------|--------|---------------------|
| `core_user_create_users` | Register | Name, email, password → Creates Moodle account |
| `core_user_update_users` | Update profile | Profile changes → Updates Moodle profile |
| `core_course_create_courses` | Create course | Title, description, dates → Creates Moodle course |
| `core_course_update_courses` | Edit course | Course changes → Updates Moodle course |
| `enrol_manual_enrol_users` | Add student/self | User ID + Course ID + Role → Creates enrollment |
| `enrol_manual_unenrol_users` | Remove student | User ID + Course ID → Removes enrollment |
| `core_grades_update_grades` | Enter grades | **Student grades → Updates Moodle gradebook** |

**Data Teacher Pulls FROM Moodle:**

| API Function | Action | Data Retrieved from Moodle |
|-------------|--------|---------------------------|
| `core_user_get_users_by_field` | Lookup student | Student profile data |
| `core_course_get_courses` | View all courses | List of all courses |
| `core_course_get_courses_by_field` | Find course | Specific course details |
| `core_enrol_get_enrolled_users` | View roster | All enrolled students |
| `gradereport_user_get_grades_table` | View grades | All student grades |
| `core_grades_get_grades` | Export grades | Detailed grade data |
| `mod_assign_get_assignments` | View assignments | Assignment list |
| `mod_assign_get_submissions` | View submissions | Student submissions |
| `core_completion_get_course_completion_status` | Track progress | Student completion status |
| `core_completion_get_activities_completion_status` | Track activities | Activity completion |

#### 🔧 Admin-Only APIs

**Data Admin Pushes TO Moodle:**

| API Function | Action | Data Sent to Moodle |
|-------------|--------|---------------------|
| `core_user_delete_users` | Delete user | User ID → Removes Moodle user |
| `core_course_delete_courses` | Delete course | Course ID → Removes Moodle course |

**Data Admin Pulls FROM Moodle:**

| API Function | Action | Data Retrieved from Moodle |
|-------------|--------|---------------------------|
| `core_user_get_users` | Search all users | Full user list |

### Summary: Who Can Push Data to Moodle?

| User Role | Push to Moodle (Write) | Pull from Moodle (Read) |
|-----------|------------------------|-------------------------|
| **Student** | ✅ Profile, Enrollments | ✅ Grades, Progress, Courses |
| **Teacher** | ✅ Profile, Courses, Enrollments, **Grades** | ✅ All student data |
| **Admin** | ✅ Delete users/courses | ✅ All data |

**Key Point:** Both students AND teachers can send data to Moodle. Teachers have the additional ability to:
- Create and update courses
- Enter and update student grades in Moodle's gradebook
- Manage student enrollments

### API Usage Summary by Role

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MOODLE API USAGE BY ROLE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STUDENT                      TEACHER                      ADMIN            │
│  ────────                     ───────                      ─────            │
│  Push: 4 APIs                 Push: 7 APIs                 Push: 2 APIs     │
│  • Create/update profile      • All Student push APIs      • Delete users   │
│  • Enroll/unenroll           • Create/update courses      • Delete courses │
│                               • Update grades                               │
│                                                                             │
│  Pull: 6 APIs                 Pull: 10 APIs                Pull: 1 API      │
│  • View grades               • All Student pull APIs      • Search users   │
│  • View progress             • View roster                                 │
│  • View courses              • View submissions                            │
│                                                                             │
│  Total: 10 APIs              Total: 17 APIs               Total: 20 APIs   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### User Management APIs

#### `core_user_create_users`
Creates one or more users in Moodle.

| Property | Details |
|----------|---------|
| **Purpose** | Create new user accounts in Moodle from the LMS |
| **Direction** | LMS → Moodle (Push) |
| **Used By** | Students (self-registration), Teachers, Admin |
| **Trigger** | User registers in LMS |

**Parameters:**
```javascript
{
  'users[0][username]': 'john.doe',        // Required: unique username
  'users[0][email]': 'john@example.com',   // Required: valid email
  'users[0][firstname]': 'John',           // Required: first name
  'users[0][lastname]': 'Doe',             // Required: last name
  'users[0][password]': 'SecurePass123!',  // Required: meets Moodle policy
  'users[0][auth]': 'manual',              // Auth method (manual, ldap, etc.)
  'users[0][idnumber]': 'EMP001',          // Optional: ID number
  'users[0][lang]': 'en',                  // Optional: language
  'users[0][timezone]': 'America/New_York' // Optional: timezone
}
```

**Response:**
```javascript
[{ "id": 123, "username": "john.doe" }]
```

---

#### `core_user_update_users`
Updates existing user details in Moodle.

| Property | Details |
|----------|---------|
| **Purpose** | Sync profile changes from LMS to Moodle |
| **Direction** | LMS → Moodle (Push) |
| **Used By** | Students, Teachers, Admin |
| **Trigger** | User updates their profile |

**Parameters:**
```javascript
{
  'users[0][id]': 123,                      // Required: Moodle user ID
  'users[0][email]': 'newemail@example.com', // Optional: new email
  'users[0][firstname]': 'Jonathan',         // Optional: new first name
  'users[0][lastname]': 'Smith',             // Optional: new last name
  'users[0][suspended]': 0                   // Optional: 0=active, 1=suspended
}
```

**Response:** `null` (success) or error object

---

#### `core_user_get_users`
Search for users matching criteria.

| Property | Details |
|----------|---------|
| **Purpose** | Search all Moodle users |
| **Direction** | Moodle → LMS (Pull) |
| **Used By** | Admin only |
| **Trigger** | Admin searches for users |

**Parameters:**
```javascript
{
  'criteria[0][key]': 'email',           // Search field
  'criteria[0][value]': '%@example.com'  // Search value (% = wildcard)
}
```

**Response:**
```javascript
{
  "users": [
    { "id": 123, "username": "john.doe", "email": "john@example.com", ... }
  ]
}
```

---

#### `core_user_get_users_by_field`
Get users by a specific field value.

| Property | Details |
|----------|---------|
| **Purpose** | Find specific user for sync matching |
| **Direction** | Moodle → LMS (Pull) |
| **Used By** | Students, Teachers, Admin |
| **Trigger** | Login, profile sync, enrollment |

**Parameters:**
```javascript
{
  'field': 'email',                    // Field: id, email, username
  'values[0]': 'john@example.com'      // Value to match
}
```

**Response:**
```javascript
[{ "id": 123, "username": "john.doe", "email": "john@example.com", "firstname": "John", ... }]
```

---

#### `core_user_delete_users`
Delete users from Moodle.

| Property | Details |
|----------|---------|
| **Purpose** | Remove users from Moodle |
| **Direction** | LMS → Moodle (Push) |
| **Used By** | Admin only |
| **Trigger** | Admin deletes user |

**Parameters:**
```javascript
{
  'userids[0]': 123  // Moodle user ID to delete
}
```

**Response:** `null` (success) or error object

---

### Course Management APIs

#### `core_course_get_courses`
Get all courses from Moodle.

| Property | Details |
|----------|---------|
| **Purpose** | List all available courses for import |
| **Direction** | Moodle → LMS (Pull) |
| **Used By** | Teachers, Admin |
| **Trigger** | View Moodle courses, import course |

**Parameters:**
```javascript
{
  'options[ids][0]': 456  // Optional: specific course IDs
}
// Or empty {} to get all courses
```

**Response:**
```javascript
[
  {
    "id": 456,
    "shortname": "PROG101",
    "fullname": "Introduction to Programming",
    "summary": "Learn programming basics",
    "categoryid": 1,
    "startdate": 1704067200,
    "enddate": 1735689600,
    "visible": 1
  }
]
```

---

#### `core_course_get_courses_by_field`
Get courses by a specific field.

| Property | Details |
|----------|---------|
| **Purpose** | Find specific course for sync |
| **Direction** | Moodle → LMS (Pull) |
| **Used By** | Teachers, Admin |
| **Trigger** | Course sync, verification |

**Parameters:**
```javascript
{
  'field': 'shortname',    // Field: id, shortname, idnumber, category
  'value': 'PROG101'       // Value to match
}
```

**Response:**
```javascript
{
  "courses": [{ "id": 456, "shortname": "PROG101", "fullname": "Introduction to Programming", ... }]
}
```

---

#### `core_course_create_courses`
Create new courses in Moodle.

| Property | Details |
|----------|---------|
| **Purpose** | Export LMS courses to Moodle |
| **Direction** | LMS → Moodle (Push) |
| **Used By** | Teachers, Admin |
| **Trigger** | Teacher creates course, sync to Moodle |

**Parameters:**
```javascript
{
  'courses[0][fullname]': 'Introduction to Programming',  // Required
  'courses[0][shortname]': 'PROG101',                     // Required: unique
  'courses[0][categoryid]': 1,                            // Required: category ID
  'courses[0][summary]': 'Learn programming basics',      // Optional: description
  'courses[0][summaryformat]': 1,                         // 1=HTML, 2=plain text
  'courses[0][format]': 'topics',                         // topics, weeks, social
  'courses[0][visible]': 1,                               // 0=hidden, 1=visible
  'courses[0][startdate]': 1704067200,                    // Unix timestamp
  'courses[0][enddate]': 1735689600,                      // Unix timestamp
  'courses[0][numsections]': 10,                          // Number of sections
  'courses[0][maxbytes]': 0,                              // Max upload size (0=site default)
  'courses[0][showgrades]': 1,                            // Show gradebook
  'courses[0][enablecompletion]': 1                       // Enable completion tracking
}
```

**Response:**
```javascript
[{ "id": 456, "shortname": "PROG101" }]
```

---

#### `core_course_update_courses`
Update existing courses in Moodle.

| Property | Details |
|----------|---------|
| **Purpose** | Sync course changes to Moodle |
| **Direction** | LMS → Moodle (Push) |
| **Used By** | Teachers, Admin |
| **Trigger** | Teacher edits course |

**Parameters:**
```javascript
{
  'courses[0][id]': 456,                           // Required: Moodle course ID
  'courses[0][fullname]': 'Advanced Programming', // Optional: new name
  'courses[0][summary]': 'Updated description',   // Optional: new description
  'courses[0][visible]': 0,                       // Optional: hide course
  'courses[0][enddate]': 1767225600               // Optional: new end date
}
```

**Response:** `null` (success) or error object with warnings

---

#### `core_course_delete_courses`
Delete courses from Moodle.

| Property | Details |
|----------|---------|
| **Purpose** | Remove courses from Moodle |
| **Direction** | LMS → Moodle (Push) |
| **Used By** | Admin only |
| **Trigger** | Admin deletes course |

**Parameters:**
```javascript
{
  'courseids[0]': 456  // Moodle course ID to delete
}
```

**Response:** `null` (success) or error object

---

### Enrollment Management APIs

#### `enrol_manual_enrol_users`
Enroll users in courses with specific roles.

| Property | Details |
|----------|---------|
| **Purpose** | Sync enrollments to Moodle |
| **Direction** | LMS → Moodle (Push) |
| **Used By** | Students (self-enroll), Teachers, Admin |
| **Trigger** | User enrolls in course |

**Parameters:**
```javascript
{
  'enrolments[0][userid]': 123,     // Required: Moodle user ID
  'enrolments[0][courseid]': 456,   // Required: Moodle course ID
  'enrolments[0][roleid]': 5,       // Required: 5=student, 3=teacher, 4=non-editing teacher
  'enrolments[0][timestart]': 0,    // Optional: enrollment start (0=now)
  'enrolments[0][timeend]': 0,      // Optional: enrollment end (0=never)
  'enrolments[0][suspend]': 0       // Optional: 0=active, 1=suspended
}
```

**Role IDs:**
- `1` = Manager
- `3` = Teacher (editing)
- `4` = Teacher (non-editing)
- `5` = Student

**Response:** `null` (success) or error object

---

#### `enrol_manual_unenrol_users`
Unenroll users from courses.

| Property | Details |
|----------|---------|
| **Purpose** | Sync unenrollments to Moodle |
| **Direction** | LMS → Moodle (Push) |
| **Used By** | Students (self), Teachers, Admin |
| **Trigger** | User unenrolls from course |

**Parameters:**
```javascript
{
  'enrolments[0][userid]': 123,    // Required: Moodle user ID
  'enrolments[0][courseid]': 456   // Required: Moodle course ID
}
```

**Response:** `null` (success) or error object

---

#### `core_enrol_get_enrolled_users`
Get all users enrolled in a course.

| Property | Details |
|----------|---------|
| **Purpose** | Import enrollments, view class roster |
| **Direction** | Moodle → LMS (Pull) |
| **Used By** | Teachers, Admin |
| **Trigger** | View course students, sync enrollments |

**Parameters:**
```javascript
{
  'courseid': 456,                           // Required: Moodle course ID
  'options[0][name]': 'userfields',          // Optional: fields to return
  'options[0][value]': 'id,username,email',
  'options[1][name]': 'limitfrom',           // Optional: pagination start
  'options[1][value]': 0,
  'options[2][name]': 'limitnumber',         // Optional: max results
  'options[2][value]': 100
}
```

**Response:**
```javascript
[
  {
    "id": 123,
    "username": "john.doe",
    "email": "john@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "roles": [{ "roleid": 5, "name": "Student" }],
    "enrolledcourses": [{ "id": 456, "fullname": "Introduction to Programming" }]
  }
]
```

---

#### `core_enrol_get_users_courses`
Get all courses a user is enrolled in.

| Property | Details |
|----------|---------|
| **Purpose** | Show "My Courses", check enrollments |
| **Direction** | Moodle → LMS (Pull) |
| **Used By** | Students, Teachers, Admin |
| **Trigger** | View enrolled courses |

**Parameters:**
```javascript
{
  'userid': 123,             // Required: Moodle user ID
  'returnusercount': 1       // Optional: include enrollment count
}
```

**Response:**
```javascript
[
  {
    "id": 456,
    "shortname": "PROG101",
    "fullname": "Introduction to Programming",
    "enrolledusercount": 25,
    "progress": 75,          // Completion percentage
    "startdate": 1704067200,
    "enddate": 1735689600
  }
]
```

---

### Grade Management APIs

#### `core_grades_get_grades`
Get grades for specific grade items and users.

| Property | Details |
|----------|---------|
| **Purpose** | Fetch detailed grade data |
| **Direction** | Moodle → LMS (Pull) |
| **Used By** | Students (own), Teachers (all) |
| **Trigger** | View specific activity grade |

**Parameters:**
```javascript
{
  'courseid': 456,            // Required: Moodle course ID
  'component': 'mod_assign',  // Optional: activity type
  'activityid': 789,          // Optional: activity ID
  'userids[0]': 123           // Optional: specific user(s)
}
```

**Response:**
```javascript
{
  "items": [
    {
      "activityid": 789,
      "itemnumber": 0,
      "scaleid": 0,
      "grades": [
        {
          "userid": 123,
          "grade": 85.5,
          "str_grade": "85.50",
          "feedback": "Good work!",
          "datesubmitted": 1704153600,
          "dategraded": 1704240000
        }
      ]
    }
  ]
}
```

---

#### `core_grades_update_grades`
Update student grades in Moodle.

| Property | Details |
|----------|---------|
| **Purpose** | Push grades to Moodle gradebook |
| **Direction** | LMS → Moodle (Push) |
| **Used By** | Teachers only |
| **Trigger** | Teacher enters/updates grades |

**Parameters:**
```javascript
{
  'source': 'mern_lms',           // Source identifier
  'courseid': 456,                // Required: course ID
  'component': 'mod_assign',      // Activity component
  'activityid': 789,              // Activity ID
  'itemnumber': 0,                // Grade item number
  'grades[0][userid]': 123,       // Student's Moodle ID
  'grades[0][rawgrade]': 85.5,    // Grade value
  'grades[0][feedback]': 'Good!', // Optional: feedback
  'grades[0][feedbackformat]': 1  // 1=HTML, 2=plain
}
```

**Response:** `0` (success) or error code

---

#### `gradereport_user_get_grades_table`
Get the full gradebook table for a user.

| Property | Details |
|----------|---------|
| **Purpose** | Import comprehensive grades |
| **Direction** | Moodle → LMS (Pull) |
| **Used By** | Students (own), Teachers (all) |
| **Trigger** | View grades page |

**Parameters:**
```javascript
{
  'courseid': 456,  // Required: Moodle course ID
  'userid': 123     // Optional: specific user (omit for all)
}
```

**Response:**
```javascript
{
  "tables": [
    {
      "courseid": 456,
      "userid": 123,
      "userfullname": "John Doe",
      "maxdepth": 1,
      "tabledata": [
        {
          "itemname": { "content": "Assignment 1", "id": 789 },
          "grade": { "content": "85.50" },
          "percentage": { "content": "85.50 %" },
          "feedback": { "content": "Good work!" },
          "contributiontocoursetotal": { "content": "17.10 %" }
        },
        {
          "itemname": { "content": "Course total" },
          "grade": { "content": "85.50" }
        }
      ]
    }
  ]
}
```

---

### Assignment APIs

#### `mod_assign_get_assignments`
Get assignments for one or more courses.

| Property | Details |
|----------|---------|
| **Purpose** | Fetch course assignments |
| **Direction** | Moodle → LMS (Pull) |
| **Used By** | Teachers |
| **Trigger** | View course assignments |

**Parameters:**
```javascript
{
  'courseids[0]': 456,           // Course IDs
  'capabilities[0]': 'mod/assign:grade',  // Optional: filter by capability
  'includenotenrolledcourses': 0 // Include unenrolled courses
}
```

**Response:**
```javascript
{
  "courses": [
    {
      "id": 456,
      "fullname": "Introduction to Programming",
      "assignments": [
        {
          "id": 789,
          "cmid": 101,
          "course": 456,
          "name": "Assignment 1",
          "intro": "Write a program...",
          "duedate": 1705363200,
          "cutoffdate": 1705449600,
          "grade": 100,
          "submissiondrafts": 0,
          "sendnotifications": 1,
          "teamsubmission": 0
        }
      ]
    }
  ]
}
```

---

#### `mod_assign_get_submissions`
Get student submissions for assignments.

| Property | Details |
|----------|---------|
| **Purpose** | View student work |
| **Direction** | Moodle → LMS (Pull) |
| **Used By** | Teachers |
| **Trigger** | View submissions for grading |

**Parameters:**
```javascript
{
  'assignmentids[0]': 789,       // Assignment IDs
  'status': 'submitted',         // Optional: draft, submitted, etc.
  'since': 0,                    // Optional: modified since timestamp
  'before': 0                    // Optional: modified before timestamp
}
```

**Response:**
```javascript
{
  "assignments": [
    {
      "assignmentid": 789,
      "submissions": [
        {
          "id": 1001,
          "userid": 123,
          "timecreated": 1705276800,
          "timemodified": 1705363100,
          "status": "submitted",
          "groupid": 0,
          "plugins": [
            {
              "type": "onlinetext",
              "name": "Online text",
              "editorfields": [{ "name": "onlinetext", "text": "My submission..." }]
            },
            {
              "type": "file",
              "name": "File submissions",
              "fileareas": [{ "files": [{ "filename": "code.py", "fileurl": "..." }] }]
            }
          ]
        }
      ]
    }
  ]
}
```

---

### Completion Tracking APIs

#### `core_completion_get_course_completion_status`
Get overall course completion status for a user.

| Property | Details |
|----------|---------|
| **Purpose** | Track student's course progress |
| **Direction** | Moodle → LMS (Pull) |
| **Used By** | Students (own), Teachers (all) |
| **Trigger** | View progress/completion |

**Parameters:**
```javascript
{
  'courseid': 456,  // Required: Moodle course ID
  'userid': 123     // Required: Moodle user ID
}
```

**Response:**
```javascript
{
  "completionstatus": {
    "completed": false,
    "aggregation": 1,           // 1=ALL, 2=ANY
    "completions": [
      {
        "type": 1,              // Completion criteria type
        "title": "Activity completion",
        "status": "No",
        "complete": false,
        "timecompleted": null,
        "details": {
          "criteria": "Complete all activities",
          "requirement": "Assignment 1, Quiz 1"
        }
      }
    ]
  }
}
```

---

#### `core_completion_get_activities_completion_status`
Get completion status of individual activities.

| Property | Details |
|----------|---------|
| **Purpose** | Track activity-level progress |
| **Direction** | Moodle → LMS (Pull) |
| **Used By** | Students (own), Teachers (all) |
| **Trigger** | View detailed progress |

**Parameters:**
```javascript
{
  'courseid': 456,  // Required: Moodle course ID
  'userid': 123     // Required: Moodle user ID
}
```

**Response:**
```javascript
{
  "statuses": [
    {
      "cmid": 101,              // Course module ID
      "modname": "assign",      // Module type
      "instance": 789,          // Activity ID
      "state": 1,               // 0=incomplete, 1=complete, 2=complete pass, 3=complete fail
      "timecompleted": 1705363200,
      "tracking": 2,            // 0=none, 1=manual, 2=automatic
      "overrideby": null
    },
    {
      "cmid": 102,
      "modname": "quiz",
      "instance": 790,
      "state": 0,
      "timecompleted": null,
      "tracking": 2
    }
  ]
}
```

---

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
- `moodle/grade:view`, `moodle/grade:viewall`, `moodle/grade:edit`
- `mod/assign:view`, `mod/assign:grade`
- `moodle/completion:view`

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
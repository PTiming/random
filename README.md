# LMS with Moodle Integration

A comprehensive Learning Management System (LMS) with full two-way data synchronization with Moodle and complete RBAC (Role-Based Access Control) implementation.

## 🎯 Features

### Core Features
- ✅ **Two-Way Moodle Synchronization**: Bidirectional sync for users, courses, enrollments, and grades
- ✅ **RBAC System**: Role-based access control with Admin, Instructor, and Student roles
- ✅ **User Management**: Complete user CRUD operations with role assignments
- ✅ **Course Management**: Full course lifecycle management
- ✅ **Enrollment System**: Student enrollment and course access management
- ✅ **Grade Management**: Grade tracking and synchronization
- ✅ **Sync Monitoring**: Real-time sync status and comprehensive logging
- ✅ **RESTful API**: Complete REST API with JWT authentication
- ✅ **Security**: JWT authentication, bcrypt password hashing, rate limiting, CORS, Helmet

### RBAC Capabilities
- **Admin Role**: Full system access, user/course/role management, sync operations
- **Instructor Role**: Course creation, student management, grading, course content management
- **Student Role**: Course access, assignment submission, grade viewing

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt
- **Moodle Integration**: Moodle Web Services API (REST)
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest
- **Linting**: ESLint

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Moodle instance with Web Services enabled
- Moodle Web Service token

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/PTiming/random.git
cd random
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Create a PostgreSQL database:

```bash
createdb lms_db
```

Run the database migration:

```bash
psql -d lms_db -f src/migrations/001_initial_schema.sql
```

### 4. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret_key_change_this
JWT_REFRESH_SECRET=your_refresh_secret_key_change_this

# Moodle
MOODLE_URL=https://your-moodle-instance.com
MOODLE_TOKEN=your_moodle_webservice_token

# Application
PORT=3000
NODE_ENV=development
```

### 5. Seed Default Data

Seed the database with default roles, permissions, and admin user:

```bash
npm run build
ts-node src/utils/seed.ts
```

Default admin credentials:
- Email: `admin@lms.local`
- Password: `admin123`

### 6. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "admin@lms.local",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@lms.local",
    "roles": ["Admin"]
  }
}
```

#### POST `/api/auth/register`
Register a new user.

#### POST `/api/auth/refresh`
Refresh access token.

#### POST `/api/auth/logout`
Logout user.

### User Endpoints (RBAC Protected)

#### GET `/api/users`
List all users (Admin, Instructor only).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

#### GET `/api/users/:id`
Get user details (Admin, Instructor, or self).

#### POST `/api/users`
Create new user (Admin only).

#### PUT `/api/users/:id`
Update user (Admin or self).

#### DELETE `/api/users/:id`
Delete user (Admin only).

#### POST `/api/users/:id/roles`
Assign role to user (Admin only).

#### POST `/api/users/:id/sync`
Sync user to Moodle (Admin only).

### Course Endpoints (RBAC Protected)

#### GET `/api/courses`
List all courses.

#### GET `/api/courses/:id`
Get course details.

#### POST `/api/courses`
Create new course (Admin, Instructor).

#### PUT `/api/courses/:id`
Update course (Admin, Instructor).

#### DELETE `/api/courses/:id`
Delete course (Admin only).

#### POST `/api/courses/:id/enroll`
Enroll user in course (Admin, Instructor).

#### GET `/api/courses/:id/students`
Get enrolled students (Admin, Instructor).

#### POST `/api/courses/:id/sync`
Sync course to Moodle (Admin only).

### Role & Permission Endpoints (Admin Only)

#### GET `/api/roles`
List all roles.

#### GET `/api/roles/:id`
Get role details with permissions.

#### POST `/api/roles`
Create new role.

#### PUT `/api/roles/:id`
Update role.

#### DELETE `/api/roles/:id`
Delete role (non-system roles only).

#### POST `/api/roles/:id/permissions`
Assign permissions to role.

#### GET `/api/permissions/all`
Get all available permissions.

### Sync Endpoints (Admin Only)

#### POST `/api/sync/full`
Trigger full bidirectional sync.

#### POST `/api/sync/users`
Sync users from Moodle to LMS.

#### POST `/api/sync/courses`
Sync courses from Moodle to LMS.

#### GET `/api/sync/status`
Get sync status and statistics.

#### GET `/api/sync/logs`
Get sync operation logs.

**Query Parameters:**
- `limit`: Number of logs to retrieve (default: 100)
- `entityType`: Filter by entity type (user, course, enrollment, etc.)

## 🔐 RBAC Permission Matrix

| Resource/Action     | Admin | Instructor | Student      |
|---------------------|-------|------------|--------------|
| User Management     | CRUD  | R          | R (self)     |
| Course Management   | CRUD  | CRUD       | R            |
| Enrollment          | CRUD  | CRU        | R            |
| Grades              | CRUD  | CRUD       | R (self)     |
| Assignments         | CRUD  | CRUD       | RU (submissions) |
| Roles & Permissions | CRUD  | -          | -            |
| Sync Operations     | CRUD  | -          | -            |

## 🔄 Moodle Integration

### Supported Moodle Web Service Functions

**User Management:**
- `core_user_get_users`
- `core_user_create_users`
- `core_user_update_users`
- `core_user_delete_users`

**Course Management:**
- `core_course_get_courses`
- `core_course_create_courses`
- `core_course_update_courses`
- `core_course_delete_courses`

**Enrollment Management:**
- `core_enrol_get_enrolled_users`
- `enrol_manual_enrol_users`
- `enrol_manual_unenrol_users`

**Grade Management:**
- `core_grades_get_grades`
- `core_grades_update_grades`

**Role Management:**
- `core_role_get_all_roles`
- `core_role_assign_roles`
- `core_role_unassign_roles`

### Setting Up Moodle Web Services

1. **Enable Web Services** in Moodle:
   - Site administration → Advanced features → Enable web services

2. **Create a Web Service User**:
   - Create a dedicated user for API access

3. **Create a Role with Capabilities**:
   - Assign necessary capabilities for web service operations

4. **Create a Service**:
   - Add the required functions listed above

5. **Generate Token**:
   - Create a token for the web service user
   - Copy the token to your `.env` file

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## 🏗 Database Schema

The system uses PostgreSQL with the following main tables:

- `users`: User accounts and profiles
- `roles`: Role definitions
- `permissions`: Permission definitions
- `role_permissions`: Role-permission mappings
- `user_roles`: User-role assignments
- `courses`: Course information
- `enrollments`: Course enrollments
- `assignments`: Course assignments
- `grades`: Student grades
- `sync_logs`: Synchronization operation logs

## 📊 Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────┐
│   LMS API   │ ←──────→ │  Sync Engine │ ←──────→ │ Moodle  │
└─────────────┘         └──────────────┘         └─────────┘
       ↓                       ↓                        
  ┌─────────┐           ┌──────────┐
  │   DB    │           │   Logs   │
  └─────────┘           └──────────┘
```

### Key Components

- **Express API Server**: RESTful API with RBAC middleware
- **Sync Engine**: Bidirectional synchronization service
- **Moodle Service**: Wrapper for Moodle Web Services API
- **RBAC Middleware**: Permission checking and enforcement
- **Database Layer**: PostgreSQL with connection pooling

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Request validation (ready for Joi integration)
- **SQL Injection Prevention**: Parameterized queries
- **Role-Based Access Control**: Fine-grained permissions

## 📝 Development

### Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Data models (future)
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── migrations/      # Database migrations
└── index.ts         # Application entry point
```

### Code Style

The project uses ESLint for code linting:

```bash
npm run lint
```

## 🚀 Deployment

### Environment Variables for Production

Ensure these are set securely:
- Use strong, randomly generated JWT secrets
- Use secure database credentials
- Enable HTTPS/TLS
- Set `NODE_ENV=production`
- Configure proper CORS origins

### Recommended Infrastructure

- **Web Server**: Nginx or Apache as reverse proxy
- **Application**: PM2 or Docker for process management
- **Database**: PostgreSQL with backups
- **Cache**: Redis for session management (optional)
- **Monitoring**: Application monitoring and error tracking

## 📖 Additional Documentation

- [Database Schema](src/migrations/001_initial_schema.sql)
- [Type Definitions](src/types/index.ts)
- [Environment Configuration](.env.example)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License

## 🙋 Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the API documentation
- Review the environment configuration

## 🎯 Roadmap

Future enhancements:
- [ ] Assignment submission handling
- [ ] Content management (files, videos, SCORM)
- [ ] Calendar and events sync
- [ ] Messaging and notifications
- [ ] Analytics dashboard
- [ ] LTI integration
- [ ] Mobile app support
- [ ] Real-time sync via webhooks
- [ ] Advanced reporting
- [ ] Gamification features

---

Built with ❤️ for the education community
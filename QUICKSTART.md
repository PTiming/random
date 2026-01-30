# Quick Start Guide

Get your LMS with Moodle integration up and running in 5 minutes!

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- A Moodle instance (optional for basic testing)

## Step 1: Clone and Install (1 minute)

```bash
# Clone the repository
git clone https://github.com/PTiming/random.git
cd random

# Install dependencies
npm install
```

## Step 2: Database Setup (1 minute)

```bash
# Create database
createdb lms_db

# Run migrations
psql -d lms_db -f src/migrations/001_initial_schema.sql
```

## Step 3: Configure Environment (1 minute)

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
# Minimum required: DB credentials
# Moodle integration is optional for basic testing
nano .env
```

**Minimal .env for testing:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=test_secret_change_in_production_min_32_chars
JWT_REFRESH_SECRET=test_refresh_secret_change_in_production_32

PORT=3000
NODE_ENV=development
```

## Step 4: Seed Database (1 minute)

```bash
# Build and seed with default data
npm run build
ts-node src/utils/seed.ts
```

This creates:
- Admin, Instructor, and Student roles
- All permissions
- Default admin user (admin@lms.local / admin123)

## Step 5: Start Server (30 seconds)

```bash
# Development mode
npm run dev

# OR Production mode
npm start
```

## Step 6: Test the API (30 seconds)

### Health Check
```bash
curl http://localhost:3000/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lms.local",
    "password": "admin123"
  }'
```

Save the returned `token` for authenticated requests.

### Get Users (Protected)
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Use Cases

### Create a New User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Create a Course
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Introduction to Programming",
    "description": "Learn the basics of programming",
    "status": "published"
  }'
```

### Enroll a Student
```bash
curl -X POST http://localhost:3000/api/courses/COURSE_ID/enroll \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID"
  }'
```

## Moodle Integration Setup (Optional)

### 1. Enable Web Services in Moodle

1. Go to **Site Administration** → **Advanced Features**
2. Check **Enable web services**
3. Save changes

### 2. Create Web Service User

1. Create a new user for API access
2. Assign appropriate role with web service capabilities

### 3. Create Custom Service

1. Go to **Site Administration** → **Server** → **Web Services** → **External Services**
2. Add a new service
3. Add required functions:
   - `core_user_get_users`
   - `core_user_create_users`
   - `core_course_get_courses`
   - `core_course_create_courses`
   - `core_enrol_get_enrolled_users`
   - `enrol_manual_enrol_users`
   - And others as needed

### 4. Generate Token

1. Go to **Site Administration** → **Server** → **Web Services** → **Manage Tokens**
2. Create token for your web service user
3. Copy the token

### 5. Update Environment

Add to your `.env`:
```env
MOODLE_URL=https://your-moodle-instance.com
MOODLE_TOKEN=your_generated_token_here
```

### 6. Test Sync

```bash
# Sync users from Moodle
curl -X POST http://localhost:3000/api/sync/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Sync courses from Moodle
curl -X POST http://localhost:3000/api/sync/courses \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Check sync status
curl http://localhost:3000/api/sync/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Troubleshooting

### Database Connection Error
```
Error: Connection refused
```
**Solution:** Ensure PostgreSQL is running and credentials in `.env` are correct.

### Moodle API Error
```
Error: Invalid token
```
**Solution:** Verify your Moodle token and URL are correct.

### TypeScript Compilation Error
```
Error: Cannot find module
```
**Solution:** Run `npm install` to ensure all dependencies are installed.

### Port Already in Use
```
Error: EADDRINUSE :::3000
```
**Solution:** Change `PORT` in `.env` or kill the process using port 3000.

## Next Steps

1. **Read the Full Documentation:** [README.md](README.md)
2. **Explore API Endpoints:** [docs/API.md](docs/API.md)
3. **Plan Production Deployment:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
4. **Review Implementation:** [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

## Development Tips

### Watch Mode
```bash
# Auto-restart on file changes
npx nodemon --exec ts-node src/index.ts
```

### Database Reset
```bash
# Drop and recreate database
dropdb lms_db
createdb lms_db
psql -d lms_db -f src/migrations/001_initial_schema.sql
ts-node src/utils/seed.ts
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

## Production Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Generate strong JWT secrets
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper database credentials
- [ ] Set up SSL/TLS
- [ ] Configure firewall
- [ ] Set up automated backups
- [ ] Configure monitoring
- [ ] Review security settings
- [ ] Test all endpoints
- [ ] Load test the application

## Support

- **Documentation:** Check the README and docs folder
- **Issues:** Create an issue on GitHub
- **Testing:** Use the included Jest tests as examples

---

**You're ready to go! 🚀**

The LMS is now running with:
- ✅ REST API on port 3000
- ✅ RBAC system active
- ✅ Default admin user ready
- ✅ Database initialized
- ✅ Ready for Moodle integration
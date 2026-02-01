# UI Screenshots and Features

## Authentication Pages

### Login Page
![Login Page](https://github.com/user-attachments/assets/940631b1-9e71-4438-aefe-95503cee1827)

**Features:**
- Clean, centered login form with gradient background
- Email and password fields
- Link to registration page
- Responsive design

### Register Page
![Register Page](https://github.com/user-attachments/assets/94c80434-d775-411c-b40c-4287d408667d)

**Features:**
- User registration form
- Full name, email, and password fields
- Role selection dropdown (Student, Teacher, Admin)
- Link back to login page
- Beautiful gradient background

## Dashboard Pages

### Admin Dashboard
The Admin Dashboard provides complete system control with:
- **Statistics Cards**: Display total users, teachers, students, and courses
- **User Management**: View all users in a table with ability to delete
- **Moodle Configuration**: Configure Moodle URL and token
- **System Settings**: Control registration, notifications, and sync requirements
- **Sidebar Navigation**: Quick access to Overview, Manage Users, Moodle Integration, and Settings

**Key Features:**
- Role-based badges (Admin, Teacher, Student)
- User table with name, email, role, and creation date
- Delete user functionality
- Moodle integration settings
- System-wide configuration options

### Teacher Dashboard
The Teacher Dashboard enables course management with:
- **Statistics Cards**: Show course count, total students, materials, and announcements
- **My Courses Section**: List of courses created by the teacher
- **Create Course**: Form to create new courses with Moodle integration
- **Social Feed**: Share posts and interact with students
- **Moodle Sync**: Sync courses with Moodle platform
- **Course Details**: Display student count, materials, and announcements for each course

**Key Features:**
- Create and manage courses
- Upload course materials
- Post announcements to students
- Moodle course ID integration
- Social networking features
- Course statistics

### Student Dashboard
The Student Dashboard provides learning resources with:
- **Statistics Cards**: Show enrolled courses, materials, announcements, and available courses
- **My Courses**: View enrolled courses with materials and announcements
- **Browse Courses**: Discover and enroll in available courses
- **Social Feed**: Connect with classmates and teachers
- **Moodle Sync**: Link Moodle account for automatic course sync
- **Course Details**: Access announcements and materials from enrolled courses

**Key Features:**
- Browse and enroll in courses
- View course materials and resources
- Read announcements from teachers
- Social feed interaction
- Moodle account linking
- One-click course enrollment

## Common UI Components

### Navbar
- Displays application title
- Shows user avatar and name
- Displays current user role
- Logout button

### Posts/Social Feed
- Create new posts with text content
- Like and comment on posts
- View post author and timestamp
- Interactive comment section
- Post counter displays

### Course Cards
- Course title and description
- Instructor information
- Student count
- Materials count
- Moodle sync status badge
- Announcements preview

## Design Features

### Color Scheme
- Primary: #1877f2 (Facebook Blue)
- Success: #28a745 (Green)
- Danger: #dc3545 (Red)
- Background: #f0f2f5 (Light Gray)
- Gradient Backgrounds for Auth pages and stat cards

### Responsive Design
- Mobile-friendly layouts
- Flexible grid system
- Responsive navigation
- Touch-friendly buttons

### Interactive Elements
- Hover effects on buttons and links
- Smooth transitions
- Loading states
- Empty states with helpful messages
- Error messages for failed operations

## Technical Implementation

### Frontend (React)
- React Router for navigation
- Context API for authentication state
- Axios for API requests
- Component-based architecture
- Modular CSS styling

### Backend (Node.js/Express)
- RESTful API design
- JWT authentication
- Role-based authorization
- MongoDB database integration
- Moodle API integration

### Security
- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes with middleware
- Role-based access control
- CORS configuration

## User Flows

### New User Registration
1. User visits the application
2. Clicks "Register" link
3. Fills in name, email, password
4. Selects role (Student, Teacher, or Admin)
5. Submits form
6. Automatically logged in and redirected to role-specific dashboard

### Course Enrollment (Student)
1. Student logs in
2. Navigates to "Browse Courses"
3. Views available courses
4. Clicks "Enroll Now" on desired course
5. Course appears in "My Courses"
6. Access to course materials and announcements

### Course Creation (Teacher)
1. Teacher logs in
2. Navigates to "My Courses"
3. Clicks "Create New Course"
4. Fills in course title and description
5. Optionally adds Moodle Course ID
6. Submits form
7. Course is created and appears in list

### Moodle Integration
1. Admin configures Moodle URL and token in settings
2. Teachers link courses with Moodle Course IDs
3. Students link their Moodle accounts
4. System syncs courses, materials, and user data
5. Seamless integration between platforms

# Dashboard UI Mockups

This document describes the UI for each user role dashboard in the MERN Social Network application.

## 🎨 Design System

### Color Palette
- **Primary Blue**: #1877f2 (Main buttons, links)
- **Success Green**: #28a745 (Teacher badges, success messages)
- **Danger Red**: #dc3545 (Admin badges, delete buttons)
- **Warning Orange**: #f5576c (Stats, highlights)
- **Info Purple**: #764ba2 (Backgrounds, gradients)
- **Light Gray**: #f0f2f5 (Background, cards)
- **Text Gray**: #65676b (Secondary text)

### Typography
- **Headings**: Bold, 24-32px
- **Body**: Regular, 14-16px
- **Small Text**: 12-13px

---

## 👤 Student Dashboard

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  MERN Social Network          [Avatar] John S. | [Logout]   │
│                                       Student                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Student Dashboard                                           │
│                                                               │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │   3    │  │   12   │  │   5    │  │   7    │            │
│  │ Courses│  │Materials│  │Announce│  │Available│           │
│  └────────┘  └────────┘  └────────┘  └────────┘            │
│                                                               │
│  ┌─────────┐  ┌─────────────────────────────────────────┐  │
│  │📊Overview│  │                                         │  │
│  │         │  │  Welcome, John Student!                 │  │
│  ├─────────┤  │                                         │  │
│  │📚My     │  │  You are enrolled in 3 courses...       │  │
│  │ Courses │  │                                         │  │
│  ├─────────┤  │  • Browse and enroll in courses         │  │
│  │🔍Browse │  │  • Access course materials              │  │
│  │ Courses │  │  • View announcements                   │  │
│  ├─────────┤  │  • Connect with classmates              │  │
│  │📝Social │  │                                         │  │
│  │  Feed   │  └─────────────────────────────────────────┘  │
│  ├─────────┤                                                │
│  │🎓Moodle │                                                │
│  │  Sync   │                                                │
│  └─────────┘                                                │
└─────────────────────────────────────────────────────────────┘
```

### Key Sections

#### 1. My Courses
Displays enrolled courses with:
- Course title and description
- Instructor name
- Number of students
- Number of materials
- Recent announcements (first 3)
- Course materials list

#### 2. Browse Courses
Shows available courses:
- Course details
- Instructor information
- Enrollment count
- "Enroll Now" button (primary blue)
- Moodle sync badge (if applicable)

#### 3. Social Feed
Interactive feed with:
- "Create Post" form at top
- List of posts from teachers and students
- Like and comment functionality
- User avatars
- Timestamps

#### 4. Moodle Sync
Integration interface:
- Moodle User ID input field
- "Link Moodle Account" button
- "Sync Courses" button
- Information box explaining benefits

---

## 👨‍🏫 Teacher Dashboard

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  MERN Social Network          [Avatar] Jane T. | [Logout]   │
│                                       Teacher                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Teacher Dashboard                                           │
│                                                               │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │   5    │  │   45   │  │   23   │  │   8    │            │
│  │  My    │  │ Total  │  │ Course │  │Announce│            │
│  │Courses │  │Students│  │Materials│  │ -ments │            │
│  └────────┘  └────────┘  └────────┘  └────────┘            │
│                                                               │
│  ┌─────────┐  ┌─────────────────────────────────────────┐  │
│  │📊Overview│  │                                         │  │
│  │         │  │  [+ Create New Course]                  │  │
│  ├─────────┤  │                                         │  │
│  │📚My     │  │  ┌─────────────────────────────────┐   │  │
│  │ Courses │  │  │ Introduction to React           │   │  │
│  ├─────────┤  │  │ Learn React fundamentals...     │   │  │
│  │📝Social │  │  │ Students: 15 | Materials: 8    │   │  │
│  │  Feed   │  │  │ [Synced with Moodle]           │   │  │
│  ├─────────┤  │  └─────────────────────────────────┘   │  │
│  │🎓Moodle │  │                                         │  │
│  │  Sync   │  │  ┌─────────────────────────────────┐   │  │
│  └─────────┘  │  │ Advanced JavaScript             │   │  │
│                │  │ Master JS concepts...           │   │  │
│                │  │ Students: 20 | Materials: 12   │   │  │
│                │  └─────────────────────────────────┘   │  │
│                └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Sections

#### 1. My Courses
Course management:
- "Create New Course" button (prominent)
- Create course form (expandable):
  - Course title input
  - Description textarea
  - Moodle Course ID input (optional)
  - Submit button
- List of created courses:
  - Title and description
  - Student count
  - Materials count
  - Announcements count
  - Moodle sync badge

#### 2. Social Feed
Content sharing:
- "Create Post" form
- Share updates with students
- View all posts
- Like and comment features

#### 3. Moodle Sync
Integration tools:
- List of available Moodle courses
- "Sync with Moodle" button
- Course mapping interface

---

## 🔐 Admin Dashboard

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  MERN Social Network          [Avatar] Admin | [Logout]     │
│                                        Admin                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Admin Dashboard                                             │
│                                                               │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │   42   │  │   8    │  │   30   │  │   15   │            │
│  │ Total  │  │Teachers│  │Students│  │ Courses│            │
│  │ Users  │  │        │  │        │  │        │            │
│  └────────┘  └────────┘  └────────┘  └────────┘            │
│                                                               │
│  ┌─────────┐  ┌─────────────────────────────────────────┐  │
│  │📊Overview│  │  User Management                        │  │
│  │         │  │                                         │  │
│  ├─────────┤  │  Name    Email         Role    Actions  │  │
│  │👥Manage │  │  ─────────────────────────────────────  │  │
│  │  Users  │  │  Jane D  jane@...     TEACHER  [Delete] │  │
│  ├─────────┤  │  John S  john@...     STUDENT  [Delete] │  │
│  │🎓Moodle │  │  Bob T   bob@...      STUDENT  [Delete] │  │
│  │ Integra │  │  Alice M alice@...    ADMIN    [Delete] │  │
│  │  -tion  │  │                                         │  │
│  ├─────────┤  └─────────────────────────────────────────┘  │
│  │⚙️Settings│                                               │
│  └─────────┘                                                │
└─────────────────────────────────────────────────────────────┘
```

### Key Sections

#### 1. Overview
System statistics:
- Total users count
- Teachers count  
- Students count
- Courses count
- System information
- Key features list

#### 2. Manage Users
User administration:
- Complete user table
- Columns:
  - Name
  - Email
  - Role (with colored badges)
  - Created date
  - Actions (Delete button)
- Sort and filter options
- Role badges:
  - Admin (red)
  - Teacher (green)
  - Student (blue)

#### 3. Moodle Integration
Configuration panel:
- Moodle URL input
- Moodle Token input (password field)
- "Save Settings" button
- "Test Connection" button
- Connection status indicator

#### 4. Settings
System configuration:
- Checkboxes for features:
  - ☐ Allow user registration
  - ☑ Enable email notifications
  - ☑ Require Moodle sync
- "Save Settings" button
- Settings descriptions

---

## 🎯 Common UI Components

### Navbar (All Dashboards)
```
┌─────────────────────────────────────────────────────────────┐
│  MERN Social Network          [Avatar] Name | [Logout Btn]  │
│                                       Role                   │
└─────────────────────────────────────────────────────────────┘
```

### Statistics Cards
```
┌────────────────┐
│  Gradient BG   │
│                │
│      42        │  ← Large number (32px)
│   Total Users  │  ← Label (14px)
│                │
└────────────────┘
```
Colors by position:
1. Blue-Purple gradient
2. Green gradient
3. Orange-Pink gradient
4. Blue-Cyan gradient

### Post Component
```
┌─────────────────────────────────────────────┐
│  [Avatar] John Doe                          │
│            December 1, 2024 at 2:30 PM     │
│  ─────────────────────────────────────────  │
│  This is my post content...                │
│  ─────────────────────────────────────────  │
│  👍 Like (5)  💬 Comment (2)               │
│  ─────────────────────────────────────────  │
│  [Avatar] Comment text...                   │
│  [Avatar] Another comment...                │
└─────────────────────────────────────────────┘
```

### Course Card
```
┌─────────────────────────────────────────────┐
│  Introduction to React                      │
│  Learn React fundamentals and build apps    │
│                                             │
│  Instructor: Jane Teacher                   │
│  Students: 15 | Materials: 8                │
│                                             │
│  [Synced with Moodle]                      │
│                                             │
│  Recent Announcements:                      │
│  • Assignment 1 due next week              │
│  • New materials uploaded                   │
└─────────────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────────────┐
│                                             │
│              (Empty icon)                   │
│                                             │
│           No courses yet                    │
│     Create your first course to get         │
│              started                        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📱 Responsive Design

### Mobile View (<768px)
- Sidebar collapses to hamburger menu
- Statistics cards stack vertically
- Tables become card-based lists
- Forms take full width
- Larger touch targets

### Tablet View (768px-1024px)
- 2-column stats grid
- Sidebar remains visible
- Tables show essential columns
- Optimized spacing

### Desktop View (>1024px)
- Full 4-column stats grid
- Side-by-side sidebar and content
- Complete table columns
- Maximum content visibility

---

## ♿ Accessibility Features

- High contrast text
- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators
- Screen reader friendly
- Semantic HTML structure
- Alt text for images/icons

---

## 🎭 Interactive States

### Buttons
- **Default**: Primary color background
- **Hover**: Slightly darker shade
- **Active**: Pressed appearance
- **Disabled**: Grayed out, no pointer

### Cards
- **Default**: White background, subtle shadow
- **Hover**: Slight shadow increase
- **Selected**: Border highlight

### Links
- **Default**: Blue color
- **Hover**: Underline appears
- **Visited**: Slightly darker blue
- **Focus**: Outline visible

---

This UI design provides a clean, modern, and user-friendly interface for all three user roles in the MERN Social Network application with seamless Moodle integration.

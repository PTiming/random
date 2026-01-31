# 🎨 UI Design Plan

Complete UI/UX planning for the MERN Social Network with Moodle Integration.

---

## 📱 App Structure

### Navigation Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 EduConnect                    🔍  💬 3  🔔 5  👤            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐                                                    │
│  │ Sidebar │              Main Content Area                     │
│  │         │                                                    │
│  │ 🏠 Feed │                                                    │
│  │ 💬 Chat │                                                    │
│  │ 📚 Courses                                                   │
│  │ 👥 Groups│                                                   │
│  │ 📖 Library                                                   │
│  │ 📊 Analytics (Teacher)                                       │
│  │ ⚙️ Settings                                                  │
│  └─────────┘                                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Navigation (Bottom)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Main Content                              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│    🏠        💬        📚        👥        👤                    │
│   Feed      Chat    Courses   Groups   Profile                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📄 Pages Overview

| Page | Route | Description | Access |
|------|-------|-------------|--------|
| Login | `/login` | Email/password login | Public |
| Register | `/register` | Create account | Public |
| Feed | `/` | Social posts, deadlines | Auth |
| Profile | `/profile/:id` | User profile | Auth |
| Edit Profile | `/settings/profile` | Edit own profile | Auth |
| Messages | `/messages` | Chat list | Auth |
| Chat | `/messages/:id` | Conversation | Auth |
| Courses | `/courses` | Moodle courses | Auth |
| Course Detail | `/courses/:id` | Course content | Auth |
| Study Groups | `/groups` | Study groups list | Auth |
| Group Detail | `/groups/:id` | Group page | Auth |
| Resources | `/resources` | Resource library | Auth |
| Search | `/search` | Global search | Auth |
| Analytics | `/analytics` | Teacher dashboard | Teacher |
| Admin | `/admin` | Admin panel | Admin |

---

## 🖼️ Page Wireframes

### 1. Login Page

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                         🎓 EduConnect                            │
│                                                                  │
│                    ┌─────────────────────────┐                  │
│                    │                         │                  │
│                    │  📧 Email               │                  │
│                    │  ┌───────────────────┐  │                  │
│                    │  │                   │  │                  │
│                    │  └───────────────────┘  │                  │
│                    │                         │                  │
│                    │  🔒 Password            │                  │
│                    │  ┌───────────────────┐  │                  │
│                    │  │                   │  │                  │
│                    │  └───────────────────┘  │                  │
│                    │                         │                  │
│                    │  ☐ Remember me          │                  │
│                    │                         │                  │
│                    │  ┌───────────────────┐  │                  │
│                    │  │      Login        │  │                  │
│                    │  └───────────────────┘  │                  │
│                    │                         │                  │
│                    │  ─────── or ───────     │                  │
│                    │                         │                  │
│                    │  ┌───────────────────┐  │                  │
│                    │  │ 🎓 Login with     │  │                  │
│                    │  │    Moodle         │  │                  │
│                    │  └───────────────────┘  │                  │
│                    │                         │                  │
│                    │  Forgot password?       │                  │
│                    │  Don't have account?    │                  │
│                    │  Register               │                  │
│                    │                         │                  │
│                    └─────────────────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Register Page

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                         🎓 EduConnect                            │
│                       Create Account                             │
│                                                                  │
│                    ┌─────────────────────────┐                  │
│                    │                         │                  │
│                    │  👤 First Name          │                  │
│                    │  ┌───────────────────┐  │                  │
│                    │  │                   │  │                  │
│                    │  └───────────────────┘  │                  │
│                    │                         │                  │
│                    │  👤 Last Name           │                  │
│                    │  ┌───────────────────┐  │                  │
│                    │  │                   │  │                  │
│                    │  └───────────────────┘  │                  │
│                    │                         │                  │
│                    │  📧 Email               │                  │
│                    │  ┌───────────────────┐  │                  │
│                    │  │                   │  │                  │
│                    │  └───────────────────┘  │                  │
│                    │                         │                  │
│                    │  🔒 Password            │                  │
│                    │  ┌───────────────────┐  │                  │
│                    │  │                   │  │                  │
│                    │  └───────────────────┘  │                  │
│                    │  Min 8 chars, 1 number  │                  │
│                    │                         │                  │
│                    │  🔒 Confirm Password    │                  │
│                    │  ┌───────────────────┐  │                  │
│                    │  │                   │  │                  │
│                    │  └───────────────────┘  │                  │
│                    │                         │                  │
│                    │  ┌───────────────────┐  │                  │
│                    │  │   Create Account  │  │                  │
│                    │  └───────────────────┘  │                  │
│                    │                         │                  │
│                    │  Already have account?  │                  │
│                    │  Login                  │                  │
│                    │                         │                  │
│                    └─────────────────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Main Feed Page

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 EduConnect                    🔍  💬 3  🔔 5  [Avatar]      │
├──────────┬──────────────────────────────────────┬───────────────┤
│          │                                      │               │
│  Sidebar │         📰 Feed                      │  Right Panel  │
│          │                                      │               │
│ 🏠 Feed  │  ┌────────────────────────────────┐  │ ⏰ Deadlines  │
│ 💬 Chat  │  │ What's on your mind?        📷 │  │              │
│ 📚 Courses│  │ ┌────────────────────────────┐│  │ 📝 Math HW   │
│ 👥 Groups│  │ │                            ││  │    Due: 2h   │
│ 📖 Library│  │ └────────────────────────────┘│  │              │
│ 📊 Analytics│ │ [Post]                       │  │ 📝 Essay     │
│          │  └────────────────────────────────┘  │    Due: 3d   │
│          │                                      │               │
│          │  ┌────────────────────────────────┐  │ ───────────  │
│          │  │ 👤 John Doe         2h ago     │  │               │
│          │  │                                │  │ 👥 Online (8) │
│          │  │ Just finished the calculus     │  │               │
│          │  │ assignment! Who else found     │  │ 🟢 Sarah     │
│          │  │ question 5 difficult?          │  │ 🟢 Mike      │
│          │  │                                │  │ 🟢 Emma      │
│          │  │ 📚 MATH 101                    │  │               │
│          │  │                                │  │               │
│          │  │ ❤️ 12  💬 5  🔗 Share          │  │               │
│          │  └────────────────────────────────┘  │               │
│          │                                      │               │
│          │  ┌────────────────────────────────┐  │               │
│          │  │ 👤 Prof. Smith (Teacher)  1d   │  │               │
│          │  │ 📌 Pinned                      │  │               │
│          │  │                                │  │               │
│          │  │ Reminder: Midterm next week!   │  │               │
│          │  │ Study guide attached.          │  │               │
│          │  │ 📎 study_guide.pdf             │  │               │
│          │  │                                │  │               │
│          │  │ ❤️ 45  💬 12  🔗 Share         │  │               │
│          │  └────────────────────────────────┘  │               │
│          │                                      │               │
└──────────┴──────────────────────────────────────┴───────────────┘
```

### 4. Messages Page

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 EduConnect                    🔍  💬 3  🔔 5  [Avatar]      │
├──────────┬───────────────────┬──────────────────────────────────┤
│          │ 💬 Messages   ✏️ │                                   │
│  Sidebar │                   │      Select a conversation       │
│          │ 🔍 Search chats   │                                   │
│          │                   │      💬                           │
│          │ ───────────────── │                                   │
│          │                   │      Choose a chat from the      │
│          │ 🟢 Sarah M.       │      list to start messaging     │
│          │    Hey, did you   │                                   │
│          │    finish...  2m  │                                   │
│          │                   │                                   │
│          │ 👥 MATH Study     │                                   │
│          │    Mike: Let's    │                                   │
│          │    meet at...  1h │                                   │
│          │                   │                                   │
│          │    John D.        │                                   │
│          │    Thanks for     │                                   │
│          │    the notes  3h  │                                   │
│          │                   │                                   │
│          │ 🟢 Prof. Smith    │                                   │
│          │    Office hours   │                                   │
│          │    tomorrow   1d  │                                   │
│          │                   │                                   │
└──────────┴───────────────────┴──────────────────────────────────┘
```

### 5. Chat Conversation

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 EduConnect                    🔍  💬 3  🔔 5  [Avatar]      │
├──────────┬───────────────────┬──────────────────────────────────┤
│          │ 💬 Messages   ✏️ │ 🟢 Sarah Miller              ⋮   │
│  Sidebar │                   │    Online                        │
│          │ 🔍 Search chats   ├──────────────────────────────────┤
│          │                   │                                   │
│          │ ───────────────── │        Today, 2:30 PM            │
│          │                   │                                   │
│          │ ● Sarah M.        │                    ┌────────────┐│
│          │    Hey, did you   │                    │ Hey! Did   ││
│          │    finish...  2m  │                    │ you finish ││
│          │                   │                    │ the math?  ││
│          │ 👥 MATH Study     │                    └────────────┘│
│          │    Mike: Let's    │                          2:30 PM │
│          │    meet at...  1h │                                   │
│          │                   │  ┌────────────┐                   │
│          │    John D.        │  │ Yes! It was│                   │
│          │    Thanks for     │  │ hard. Q5   │                   │
│          │    the notes  3h  │  │ took forever│                  │
│          │                   │  └────────────┘                   │
│          │                   │  2:32 PM  ✓✓                      │
│          │                   │                                   │
│          │                   │                    ┌────────────┐│
│          │                   │                    │ Same! Can  ││
│          │                   │                    │ you help   ││
│          │                   │                    │ me with it?││
│          │                   │                    └────────────┘│
│          │                   │                          2:35 PM │
│          │                   │                                   │
│          │                   │  Sarah is typing...               │
│          │                   ├──────────────────────────────────┤
│          │                   │ ┌────────────────────────┐ 📎 😊 │
│          │                   │ │ Type a message...      │  ➤    │
│          │                   │ └────────────────────────┘       │
└──────────┴───────────────────┴──────────────────────────────────┘
```

### 6. Profile Page

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 EduConnect                    🔍  💬 3  🔔 5  [Avatar]      │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│  Sidebar │  ┌───────────────────────────────────────────────┐   │
│          │  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │   │
│          │  │  ░░░░░░░░░░░░ Cover Photo ░░░░░░░░░░░░░░░░░░  │   │
│          │  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │   │
│          │  └───────────────────────────────────────────────┘   │
│          │                                                       │
│          │     ┌─────┐                                          │
│          │     │ 👤  │  John Doe                                │
│          │     │     │  @johndoe                                │
│          │     └─────┘  Student • Computer Science              │
│          │              📍 University of Example                │
│          │                                                       │
│          │     Bio: Learning to code, one bug at a time 🐛      │
│          │                                                       │
│          │     📚 5 Courses  👥 3 Groups  📄 12 Resources       │
│          │                                                       │
│          │     [✏️ Edit Profile]  [💬 Message]  [➕ Follow]      │
│          │                                                       │
│          │  ─────────────────────────────────────────────────   │
│          │                                                       │
│          │  [Posts]  [Courses]  [Resources]  [Following]        │
│          │  ═══════                                              │
│          │                                                       │
│          │  ┌───────────────────────────────────────────────┐   │
│          │  │ 👤 John Doe                       2 days ago  │   │
│          │  │                                               │   │
│          │  │ Finally understood recursion!                 │   │
│          │  │ It's just recursion.                          │   │
│          │  │                                               │   │
│          │  │ ❤️ 24  💬 8                                   │   │
│          │  └───────────────────────────────────────────────┘   │
│          │                                                       │
└──────────┴──────────────────────────────────────────────────────┘
```

### 7. Courses Page (Moodle Sync)

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 EduConnect                    🔍  💬 3  🔔 5  [Avatar]      │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│  Sidebar │  📚 My Courses                    [🔄 Sync Moodle]   │
│          │                                                       │
│          │  ┌─────────────────────┐ ┌─────────────────────┐     │
│          │  │ 📐 MATH 101         │ │ 💻 CS 201           │     │
│          │  │ Calculus I          │ │ Data Structures     │     │
│          │  │                     │ │                     │     │
│          │  │ 👨‍🏫 Prof. Johnson    │ │ 👨‍🏫 Prof. Smith      │     │
│          │  │                     │ │                     │     │
│          │  │ ⏰ Next: Quiz 3     │ │ ⏰ Next: Lab 5      │     │
│          │  │    Due in 2 days    │ │    Due in 5 days    │     │
│          │  │                     │ │                     │     │
│          │  │ 📊 Grade: 85%       │ │ 📊 Grade: 92%       │     │
│          │  │                     │ │                     │     │
│          │  │ [View Course]       │ │ [View Course]       │     │
│          │  └─────────────────────┘ └─────────────────────┘     │
│          │                                                       │
│          │  ┌─────────────────────┐ ┌─────────────────────┐     │
│          │  │ 📝 ENG 102          │ │ 🔬 PHY 101          │     │
│          │  │ Academic Writing    │ │ Physics I           │     │
│          │  │                     │ │                     │     │
│          │  │ 👩‍🏫 Prof. Williams   │ │ 👨‍🏫 Prof. Lee        │     │
│          │  │                     │ │                     │     │
│          │  │ ⏰ Next: Essay      │ │ ⏰ Next: Midterm    │     │
│          │  │    Due in 1 week    │ │    Due in 2 weeks   │     │
│          │  │                     │ │                     │     │
│          │  │ 📊 Grade: 78%       │ │ 📊 Grade: 88%       │     │
│          │  │                     │ │                     │     │
│          │  │ [View Course]       │ │ [View Course]       │     │
│          │  └─────────────────────┘ └─────────────────────┘     │
│          │                                                       │
└──────────┴──────────────────────────────────────────────────────┘
```

### 8. Course Detail Page

```
┌─────────────────────────────────────────────────────────────────┐
│  🏠 EduConnect                    🔍  💬 3  🔔 5  [Avatar]      │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│  Sidebar │  ← Back to Courses                                   │
│          │                                                       │
│          │  📐 MATH 101 - Calculus I                            │
│          │  👨‍🏫 Prof. Johnson                                    │
│          │                                                       │
│          │  [Assignments] [Grades] [Forum] [Resources] [Group]  │
│          │  ════════════                                         │
│          │                                                       │
│          │  📋 Upcoming Assignments                              │
│          │                                                       │
│          │  ┌───────────────────────────────────────────────┐   │
│          │  │ 📝 Quiz 3 - Derivatives            ⏰ 2 days  │   │
│          │  │    Chapter 4 & 5 material                     │   │
│          │  │    [Submit on Moodle]  [View Details]         │   │
│          │  └───────────────────────────────────────────────┘   │
│          │                                                       │
│          │  ┌───────────────────────────────────────────────┐   │
│          │  │ 📝 Homework 6                      ⏰ 5 days  │   │
│          │  │    Problems 4.1 - 4.25                        │   │
│          │  │    Status: ✅ Submitted                       │   │
│          │  └───────────────────────────────────────────────┘   │
│          │                                                       │
│          │  📊 Your Grade: 85% (B+)                             │
│          │  ┌───────────────────────────────────────────────┐   │
│          │  │ Assignment      | Grade | Weight | Weighted   │   │
│          │  │ ─────────────────────────────────────────────│   │
│          │  │ Quiz 1          | 90%   | 10%    | 9.0        │   │
│          │  │ Quiz 2          | 85%   | 10%    | 8.5        │   │
│          │  │ Homework 1-5    | 82%   | 20%    | 16.4       │   │
│          │  │ Midterm         | 80%   | 30%    | 24.0       │   │
│          │  └───────────────────────────────────────────────┘   │
│          │                                                       │
└──────────┴──────────────────────────────────────────────────────┘
```

---

## 🎨 Design System

### Colors

```css
/* Primary - Blue (Education, Trust) */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Secondary - Purple (Creativity) */
--secondary-500: #8b5cf6;

/* Success - Green */
--success-500: #22c55e;

/* Warning - Yellow */
--warning-500: #eab308;

/* Error - Red */
--error-500: #ef4444;

/* Neutral - Gray */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-500: #6b7280;
--gray-900: #111827;

/* Dark Mode */
--dark-bg: #1f2937;
--dark-card: #374151;
--dark-text: #f9fafb;
```

### Typography

```css
/* Font Family */
font-family: 'Inter', -apple-system, sans-serif;

/* Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing

```css
/* Using 4px base unit */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

### Border Radius

```css
--rounded-sm: 0.125rem;  /* 2px */
--rounded: 0.25rem;      /* 4px */
--rounded-md: 0.375rem;  /* 6px */
--rounded-lg: 0.5rem;    /* 8px */
--rounded-xl: 0.75rem;   /* 12px */
--rounded-2xl: 1rem;     /* 16px */
--rounded-full: 9999px;
```

---

## 🧩 Component Library

### Buttons

```jsx
// Primary Button
<button className="bg-primary-600 hover:bg-primary-700 text-white 
                   px-4 py-2 rounded-lg font-medium">
  Primary
</button>

// Secondary Button
<button className="bg-gray-100 hover:bg-gray-200 text-gray-900 
                   px-4 py-2 rounded-lg font-medium">
  Secondary
</button>

// Outline Button
<button className="border border-primary-600 text-primary-600 
                   hover:bg-primary-50 px-4 py-2 rounded-lg font-medium">
  Outline
</button>

// Ghost Button
<button className="text-gray-600 hover:bg-gray-100 
                   px-4 py-2 rounded-lg font-medium">
  Ghost
</button>

// Icon Button
<button className="p-2 rounded-full hover:bg-gray-100">
  <Icon />
</button>
```

### Input Fields

```jsx
// Text Input
<div className="space-y-1">
  <label className="text-sm font-medium text-gray-700">Email</label>
  <input 
    type="email" 
    className="w-full px-3 py-2 border border-gray-300 rounded-lg
               focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    placeholder="Enter your email"
  />
</div>

// With Error
<div className="space-y-1">
  <label className="text-sm font-medium text-gray-700">Email</label>
  <input 
    type="email" 
    className="w-full px-3 py-2 border border-error-500 rounded-lg
               focus:ring-2 focus:ring-error-500"
  />
  <p className="text-sm text-error-500">Please enter a valid email</p>
</div>

// Password with Toggle
<div className="relative">
  <input 
    type={showPassword ? "text" : "password"} 
    className="w-full px-3 py-2 pr-10 border rounded-lg"
  />
  <button className="absolute right-3 top-2.5">
    {showPassword ? <EyeOff /> : <Eye />}
  </button>
</div>
```

### Cards

```jsx
// Post Card
<div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
  <div className="flex items-center space-x-3">
    <Avatar src={user.avatar} />
    <div>
      <p className="font-medium">{user.name}</p>
      <p className="text-sm text-gray-500">{timeAgo}</p>
    </div>
  </div>
  <p>{content}</p>
  <div className="flex items-center space-x-4 text-gray-500">
    <button>❤️ {likes}</button>
    <button>💬 {comments}</button>
    <button>🔗 Share</button>
  </div>
</div>

// Course Card
<div className="bg-white rounded-xl shadow-sm border p-4">
  <div className="flex items-center space-x-3 mb-3">
    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
      📚
    </div>
    <div>
      <p className="font-medium">{course.name}</p>
      <p className="text-sm text-gray-500">{course.instructor}</p>
    </div>
  </div>
  <div className="space-y-2 text-sm">
    <p>⏰ Next: {nextDeadline}</p>
    <p>📊 Grade: {grade}%</p>
  </div>
</div>
```

### Avatar

```jsx
// With Image
<div className="w-10 h-10 rounded-full overflow-hidden">
  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
</div>

// With Initials
<div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
  <span className="text-white font-medium">{getInitials(user.name)}</span>
</div>

// With Online Status
<div className="relative">
  <Avatar />
  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 
                  rounded-full border-2 border-white"></div>
</div>
```

### Badge

```jsx
// Role Badge
<span className="px-2 py-1 text-xs font-medium rounded-full 
                bg-primary-100 text-primary-700">
  Teacher
</span>

// Status Badge
<span className="px-2 py-1 text-xs font-medium rounded-full 
                bg-success-100 text-success-700">
  Online
</span>

// Count Badge
<span className="inline-flex items-center justify-center w-5 h-5 
                text-xs font-bold text-white bg-error-500 rounded-full">
  3
</span>
```

---

## 📱 Responsive Breakpoints

```css
/* Tailwind Default Breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Layout Changes

| Screen | Sidebar | Bottom Nav | Layout |
|--------|---------|------------|--------|
| Mobile (<768px) | Hidden | Visible | Single column |
| Tablet (768-1024px) | Collapsed | Hidden | 2 columns |
| Desktop (>1024px) | Expanded | Hidden | 3 columns |

---

## 📂 React Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Avatar.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Dropdown.jsx
│   │   ├── Spinner.jsx
│   │   └── Toast.jsx
│   │
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   ├── BottomNav.jsx
│   │   └── Layout.jsx
│   │
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── MoodleLoginButton.jsx
│   │
│   ├── posts/
│   │   ├── PostCard.jsx
│   │   ├── PostForm.jsx
│   │   ├── PostList.jsx
│   │   └── CommentSection.jsx
│   │
│   ├── messages/
│   │   ├── ChatList.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   └── MessageInput.jsx
│   │
│   ├── courses/
│   │   ├── CourseCard.jsx
│   │   ├── CourseList.jsx
│   │   ├── AssignmentCard.jsx
│   │   └── GradeTable.jsx
│   │
│   ├── groups/
│   │   ├── GroupCard.jsx
│   │   ├── GroupList.jsx
│   │   └── MeetingCard.jsx
│   │
│   ├── profile/
│   │   ├── ProfileHeader.jsx
│   │   ├── ProfileStats.jsx
│   │   └── EditProfileForm.jsx
│   │
│   └── analytics/
│       ├── AnalyticsDashboard.jsx
│       ├── AtRiskCard.jsx
│       └── GradeChart.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Feed.jsx
│   ├── Profile.jsx
│   ├── Messages.jsx
│   ├── Courses.jsx
│   ├── CourseDetail.jsx
│   ├── Groups.jsx
│   ├── GroupDetail.jsx
│   ├── Resources.jsx
│   ├── Search.jsx
│   ├── Analytics.jsx
│   └── Settings.jsx
│
├── context/
│   ├── AuthContext.jsx
│   ├── SocketContext.jsx
│   └── ThemeContext.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useSocket.js
│   ├── useApi.js
│   └── useLocalStorage.js
│
├── services/
│   ├── api.js
│   ├── auth.js
│   ├── posts.js
│   ├── messages.js
│   └── moodle.js
│
└── utils/
    ├── formatDate.js
    ├── validation.js
    └── constants.js
```

---

## 🚀 Implementation Order

| Week | UI Components |
|------|---------------|
| 1 | Design system setup, common components |
| 2 | Auth pages (Login, Register) |
| 3 | Layout (Sidebar, Navbar, responsive) |
| 4 | Feed page, Post components |
| 5 | Profile page |
| 6 | Messages UI (list, conversation) |
| 7 | Courses pages |
| 8 | Groups pages |
| 9 | Resources, Search |
| 10 | Analytics dashboard |
| 11 | Settings, polish |
| 12 | Dark mode, accessibility |

---

*Use Tailwind CSS for rapid development. Consider using Headless UI for accessible components.*

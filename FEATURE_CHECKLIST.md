# 📋 Complete Feature List - MERN Social Network with Moodle Integration

This document lists **ALL features** for your graduation project. Review each feature and check (✅) if you want it included.

---

## 🔐 1. Authentication & User Management

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 1.1 | **User Registration** | New users can create an account | User fills form (email, password, name) → Password hashed with bcrypt → Saved to MongoDB |
| 1.2 | **User Login** | Existing users can sign in | User enters credentials → Server validates → Returns JWT token |
| 1.3 | **JWT Authentication** | Secure token-based auth | Token stored in localStorage → Sent with every API request → Server validates token |
| 1.4 | **User Logout** | Users can sign out | Token removed from localStorage → User redirected to login |
| 1.5 | **User Profiles** | View/edit personal info | Profile page shows name, bio, avatar, stats → Users can edit their own profile |
| 1.6 | **Avatar Upload** | Users can set profile picture | Upload image → Stored in Cloudinary → URL saved in user document |
| 1.7 | **Password Reset** | Forgot password functionality | User requests reset → Email sent with token → User sets new password |

**Your Choice:** Include all? [ ] Yes [ ] No - Remove: ____________

---

## 📝 2. Posts & News Feed

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 2.1 | **Create Post** | Users can write posts | Text input + optional images → Saved to MongoDB → Appears in feeds |
| 2.2 | **Edit Post** | Users can modify their posts | Only post author can edit → Updates MongoDB document |
| 2.3 | **Delete Post** | Users can remove their posts | Only author (or admin) can delete → Removes from MongoDB |
| 2.4 | **Image Upload** | Attach images to posts | Max 4 images per post → Uploaded to Cloudinary → URLs stored in post |
| 2.5 | **News Feed** | View posts from followed users | Fetches posts from users you follow → Sorted by date → Paginated |
| 2.6 | **Like Post** | Show appreciation for posts | Click like → Adds user ID to likes array → Updates count |
| 2.7 | **Unlike Post** | Remove like | Click again → Removes user ID from likes array |
| 2.8 | **Comment on Post** | Discuss posts | Comment form → Saved as embedded document in post |
| 2.9 | **Delete Comment** | Remove your comment | Only comment author can delete |

**Your Choice:** Include all? [ ] Yes [ ] No - Remove: ____________

---

## 👥 3. Social Features

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 3.1 | **Follow User** | Subscribe to someone's posts | Click follow → Add to following array → Their posts appear in your feed |
| 3.2 | **Unfollow User** | Stop following someone | Click unfollow → Remove from following array |
| 3.3 | **View Followers** | See who follows you | List of users who have you in their following array |
| 3.4 | **View Following** | See who you follow | List of users in your following array |
| 3.5 | **User Search** | Find other users | Search by name/username → Returns matching users |
| 3.6 | **User Suggestions** | Discover new people | Algorithm suggests users you might want to follow |

**Your Choice:** Include all? [ ] Yes [ ] No - Remove: ____________

---

## 💬 4. Real-Time Messaging (1-to-1)

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 4.1 | **Start Conversation** | Begin chatting with someone | Click message on profile → Creates conversation document |
| 4.2 | **Send Message** | Send text to another user | Type message → Socket.io emits to recipient → Saved to MongoDB |
| 4.3 | **Receive Message** | Get messages in real-time | Socket.io listener → Notification → Message appears instantly |
| 4.4 | **Conversation List** | See all your chats | List of conversations sorted by last message time |
| 4.5 | **Message History** | View past messages | Load messages for conversation → Paginated scroll |
| 4.6 | **Read Receipts** | Know when message was read | Recipient opens chat → Marks messages as read → Sender sees ✓✓ |
| 4.7 | **Typing Indicator** | See when someone is typing | Socket event emitted while typing → "User is typing..." shown |
| 4.8 | **Online Status** | See who's online | Socket tracks connections → Green dot for online users |
| 4.9 | **File Sharing** | Send files in chat | Upload file → Cloudinary → Send URL as message attachment |

**Your Choice:** Include all? [ ] Yes [ ] No - Remove: ____________

---

## 👥 5. Group Chat (NEW)

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 5.1 | **Create Group** | Start a group chat | Name group + add members → Creates group conversation |
| 5.2 | **Add Members** | Invite users to group | Group admin selects users → Added to participants array |
| 5.3 | **Remove Members** | Kick users from group | Group admin removes → User removed from participants |
| 5.4 | **Leave Group** | Exit a group chat | User leaves → Removed from participants array |
| 5.5 | **Group Messages** | Chat with multiple people | Message sent → Socket emits to all group members |
| 5.6 | **Group Admin** | Manage the group | Creator is admin → Can rename, add/remove members |
| 5.7 | **Group Name/Avatar** | Customize group | Admin can set group name and picture |

**Your Choice:** Include all? [ ] Yes [ ] No - Remove: ____________

---

## 🎓 6. Moodle Integration - READ (Moodle → Your App)

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 6.1 | **Connect Moodle** | Link Moodle account | User enters Moodle URL + token → Stored encrypted in MongoDB |
| 6.2 | **Sync User Role** | Get role from Moodle | API call to Moodle → Determines if student/teacher → Updates local role |
| 6.3 | **View Courses** | See enrolled courses | API call: `core_enrol_get_users_courses` → Display course list |
| 6.4 | **View Assignments** | See homework/tasks | API call: `mod_assign_get_assignments` → List with due dates |
| 6.5 | **View Deadlines** | See upcoming due dates | Filter assignments by due date → Show calendar/list view |
| 6.6 | **View Grades** | See your grades | API call: `gradereport_user_get_grades_table` → Display grades |
| 6.7 | **Course Groups** | Auto-create social groups | When user syncs → Create group for each course → Add enrolled users |
| 6.8 | **Sync Forum Posts** | Import Moodle forum discussions | API call: `mod_forum_get_forum_discussions` → Convert to local posts |

**Your Choice:** Include all? [ ] Yes [ ] No - Remove: ____________

---

## 🔄 7. Moodle Integration - WRITE (Your App → Moodle) - TWO-WAY SYNC

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 7.1 | **Submit Assignment** | Submit work to Moodle | User uploads file → API call: `mod_assign_save_submission` → Sent to Moodle |
| 7.2 | **Post to Forum** | Create Moodle forum post | User writes post → API call: `mod_forum_add_discussion` → Created in Moodle |
| 7.3 | **Reply to Forum** | Reply in Moodle forum | User replies → API call: `mod_forum_add_discussion_post` → Added in Moodle |
| 7.4 | **Update Grades** (Teacher) | Teachers enter grades | Teacher enters grade → API call: `mod_assign_save_grade` → Updated in Moodle |
| 7.5 | **Create Announcement** (Teacher) | Post course announcement | Teacher writes → API call: `mod_forum_add_discussion` to news forum |
| 7.6 | **Sync Back** | Keep data in sync | Changes in your app → Queued → Sent to Moodle via API |

**Your Choice:** Include all? [ ] Yes [ ] No - Remove: ____________

---

## 🔐 8. Role-Based Access Control (RBAC)

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 8.1 | **Student Role** | Regular user permissions | Can: post, message, view own courses/grades |
| 8.2 | **Teacher Role** | Instructor permissions | Can: everything student can + update grades, create announcements |
| 8.3 | **Admin Role** | Full system access | Can: everything + delete any content, manage users, system settings |
| 8.4 | **Role from Moodle** | Auto-assign role | Sync with Moodle → If teacher in any course → Set as teacher locally |

**Your Choice:** Include all? [ ] Yes [ ] No - Remove: ____________

---

## 🛠️ 9. Admin Features

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 9.1 | **User Management** | View/edit/delete users | Admin dashboard → List users → Actions available |
| 9.2 | **Content Moderation** | Remove inappropriate content | Admin can delete any post/comment |
| 9.3 | **System Stats** | View platform statistics | Dashboard shows: total users, posts, messages, active users |
| 9.4 | **Moodle Settings** | Configure Moodle connection | Set default Moodle URL, manage API settings |

**Your Choice:** Include all? [ ] Yes [ ] No - Remove: ____________

---

## 📱 10. UI/UX Features

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 10.1 | **Responsive Design** | Works on mobile/tablet | CSS media queries → Layout adapts to screen size |
| 10.2 | **Dark/Light Mode** | Theme toggle | User preference stored → CSS variables change |
| 10.3 | **Notifications Badge** | Show unread count | Badge on icon shows number of unread messages/notifications |
| 10.4 | **Loading States** | Show progress | Spinner/skeleton while data loads |
| 10.5 | **Error Handling** | User-friendly errors | Toast messages for errors → Clear instructions |

**Your Choice:** Include all? [ ] Yes [ ] No - Remove: ____________

---

## 📊 Feature Summary

### Total Features by Category

| Category | Count | Complexity |
|----------|-------|------------|
| Authentication | 7 | Low-Medium |
| Posts & Feed | 9 | Medium |
| Social | 6 | Medium |
| 1-to-1 Messaging | 9 | Medium-High |
| Group Chat | 7 | Medium-High |
| Moodle READ | 8 | Medium |
| Moodle WRITE (Two-way) | 6 | High |
| RBAC | 4 | Medium |
| Admin | 4 | Low-Medium |
| UI/UX | 5 | Medium |
| **TOTAL** | **65** | - |

---

## ⏱️ Estimated Timeline with All Features

| Phase | Weeks | Features |
|-------|-------|----------|
| Foundation | 1-2 | Auth (1.1-1.6), Database setup |
| Social Core | 3-5 | Posts (2.1-2.9), Social (3.1-3.6) |
| Messaging | 6-8 | 1-to-1 Chat (4.1-4.9), Group Chat (5.1-5.7) |
| Moodle | 9-11 | Read (6.1-6.8), Write (7.1-7.6) |
| Polish | 12-14 | RBAC, Admin, UI/UX, Testing |

**Total: 14 weeks** (with all features)

---

## 🎯 Recommended MVP (For 12-Week Graduation Project)

If you need to cut scope, here's my recommendation:

### Must Have (Core)
- ✅ All Authentication (1.1-1.6, skip 1.7 password reset)
- ✅ All Posts & Feed (2.1-2.9)
- ✅ Basic Social (3.1-3.4, skip 3.5-3.6 suggestions)
- ✅ Basic 1-to-1 Messaging (4.1-4.5, skip 4.6-4.9)
- ✅ Basic Group Chat (5.1, 5.2, 5.5)
- ✅ Moodle Read (6.1-6.5)
- ✅ Basic RBAC (8.1, 8.3)

### Should Have (If Time Permits)
- 🟡 File sharing in messages (4.9)
- 🟡 Online status (4.8)
- 🟡 Moodle grades (6.6)
- 🟡 Moodle two-way: Submit assignment (7.1)
- 🟡 Admin panel (9.1-9.3)

### Nice to Have (Bonus)
- 🔵 Full two-way Moodle sync (7.2-7.6)
- 🔵 Course groups auto-create (6.7)
- 🔵 Dark mode (10.2)

---

## ✏️ Your Selections

Please mark your choices:

**Include Two-way Moodle Sync?** [ ] Full (7.1-7.6) [ ] Partial (7.1 only) [ ] No

**Include Group Chat?** [ ] Full (5.1-5.7) [ ] Basic (5.1, 5.2, 5.5) [ ] No

**Target Timeline:** [ ] 10 weeks [ ] 12 weeks [ ] 14 weeks

**Team Size:** [ ] 1 person [ ] 2 people [ ] 3+ people

---

*Review this list and let me know which features to include or exclude!*

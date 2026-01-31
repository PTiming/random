# 🚨 At-Risk Student Detection System

This document explains how the **At-Risk Student Detection** feature works in detail, including the algorithm, data sources, and implementation.

---

## 📋 Overview

The At-Risk Student Detection system automatically identifies students who may be struggling academically or becoming disengaged. It helps teachers intervene early before students fall behind.

---

## 🎯 What Makes a Student "At-Risk"?

A student is flagged as at-risk based on multiple factors:

### Risk Indicators

| Indicator | Weight | Description |
|-----------|--------|-------------|
| **Missing Assignments** | High | Student has not submitted one or more assignments |
| **Late Submissions** | Medium | Student consistently submits work after the due date |
| **Low Activity** | Medium | Student hasn't logged in or participated recently |
| **Declining Grades** | High | Student's grades have dropped significantly |
| **No Forum Participation** | Low | Student never posts or comments in discussions |
| **Missed Deadlines** | High | Student has multiple overdue assignments |

---

## 🔢 Risk Score Calculation

Each student gets a **risk score** from 0-100. Higher score = higher risk.

### Algorithm

```javascript
// server/services/riskDetection.js

const calculateRiskScore = async (studentId, courseId) => {
  let riskScore = 0;
  const weights = {
    missingAssignments: 25,    // Max 25 points
    lateSubmissions: 15,       // Max 15 points
    inactivity: 20,            // Max 20 points
    gradeDrop: 25,             // Max 25 points
    noForumPosts: 10,          // Max 10 points
    missedDeadlines: 5         // Max 5 points per deadline
  };

  // 1. Missing Assignments (0-25 points)
  const assignments = await MoodleAssignment.find({ courseId });
  const submissions = await getStudentSubmissions(studentId, courseId);
  const submittedIds = submissions.map(s => s.assignmentId.toString());
  
  const missingCount = assignments.filter(a => 
    new Date(a.dueDate) < new Date() && 
    !submittedIds.includes(a._id.toString())
  ).length;
  
  const missingRate = missingCount / assignments.length;
  riskScore += Math.min(missingRate * 100, weights.missingAssignments);

  // 2. Late Submissions (0-15 points)
  const lateCount = submissions.filter(s => 
    new Date(s.submittedAt) > new Date(s.assignment.dueDate)
  ).length;
  
  const lateRate = submissions.length > 0 ? lateCount / submissions.length : 0;
  riskScore += lateRate * weights.lateSubmissions;

  // 3. Inactivity (0-20 points)
  const student = await User.findById(studentId);
  const daysSinceActive = (Date.now() - student.lastSeen) / (1000 * 60 * 60 * 24);
  
  if (daysSinceActive > 14) riskScore += 20;      // 2+ weeks = max risk
  else if (daysSinceActive > 7) riskScore += 12;  // 1-2 weeks = medium risk
  else if (daysSinceActive > 3) riskScore += 5;   // 3-7 days = low risk

  // 4. Grade Drop (0-25 points)
  const recentGrades = submissions
    .filter(s => s.grade !== null)
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .slice(0, 3);
  
  const olderGrades = submissions
    .filter(s => s.grade !== null)
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .slice(3, 6);
  
  if (recentGrades.length > 0 && olderGrades.length > 0) {
    const recentAvg = average(recentGrades.map(s => s.grade));
    const olderAvg = average(olderGrades.map(s => s.grade));
    const gradeDrop = olderAvg - recentAvg;
    
    if (gradeDrop > 20) riskScore += 25;        // 20+ point drop
    else if (gradeDrop > 10) riskScore += 15;   // 10-20 point drop
    else if (gradeDrop > 5) riskScore += 8;     // 5-10 point drop
  }

  // 5. No Forum Participation (0-10 points)
  const forumPosts = await Post.countDocuments({
    author: studentId,
    moodleCourseId: courseId
  });
  
  if (forumPosts === 0) riskScore += weights.noForumPosts;

  // 6. Overdue Assignments (5 points each, max 25)
  const overdueAssignments = assignments.filter(a => {
    const isPastDue = new Date(a.dueDate) < new Date();
    const notSubmitted = !submittedIds.includes(a._id.toString());
    return isPastDue && notSubmitted;
  });
  
  riskScore += Math.min(overdueAssignments.length * 5, 25);

  return Math.min(Math.round(riskScore), 100);
};
```

---

## 🚦 Risk Levels

Based on the risk score, students are categorized:

| Score | Level | Color | Description |
|-------|-------|-------|-------------|
| 0-25 | **Active** | 🟢 Green | Student is engaged and on track |
| 26-50 | **Watch** | 🟡 Yellow | Some concerns, monitor closely |
| 51-75 | **At Risk** | 🟠 Orange | Student needs intervention |
| 76-100 | **Critical** | 🔴 Red | Urgent attention required |

```javascript
const getRiskLevel = (score) => {
  if (score <= 25) return { level: 'active', color: 'green', label: 'Active' };
  if (score <= 50) return { level: 'watch', color: 'yellow', label: 'Watch' };
  if (score <= 75) return { level: 'at-risk', color: 'orange', label: 'At Risk' };
  return { level: 'critical', color: 'red', label: 'Critical' };
};
```

---

## 📊 Data Sources

The detection system pulls data from multiple sources:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AT-RISK DETECTION ENGINE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │   Moodle     │    │   Your App   │    │   MongoDB    │     │
│   │  Assignments │    │   Activity   │    │    Logs      │     │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     │
│          │                   │                    │              │
│          ▼                   ▼                    ▼              │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  Data Aggregation Layer                  │   │
│   │                                                          │   │
│   │  • Assignment submissions    • Login timestamps          │   │
│   │  • Grades                    • Posts/comments            │   │
│   │  • Due dates                 • Message activity          │   │
│   │  • Forum participation       • Resource downloads        │   │
│   └─────────────────────────────┬───────────────────────────┘   │
│                                 │                                │
│                                 ▼                                │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              Risk Score Calculator                       │   │
│   │                                                          │   │
│   │  Score = Σ (indicator_weight × indicator_value)         │   │
│   └─────────────────────────────┬───────────────────────────┘   │
│                                 │                                │
│                                 ▼                                │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              Risk Level Classification                   │   │
│   │                                                          │   │
│   │  🟢 Active   🟡 Watch   🟠 At Risk   🔴 Critical         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 When Detection Runs

The at-risk detection can run:

### 1. Real-Time (On View)
```javascript
// When teacher opens analytics dashboard
router.get('/api/analytics/course/:courseId/at-risk', async (req, res) => {
  const students = await getEnrolledStudents(req.params.courseId);
  
  const atRiskStudents = await Promise.all(
    students.map(async (student) => {
      const score = await calculateRiskScore(student._id, req.params.courseId);
      const level = getRiskLevel(score);
      return {
        student: {
          _id: student._id,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          avatar: student.avatar
        },
        riskScore: score,
        riskLevel: level,
        reasons: await getRiskReasons(student._id, req.params.courseId)
      };
    })
  );
  
  // Sort by risk score (highest first)
  atRiskStudents.sort((a, b) => b.riskScore - a.riskScore);
  
  res.json(atRiskStudents);
});
```

### 2. Scheduled (Daily)
```javascript
// Run every night at 2 AM
const cron = require('node-cron');

cron.schedule('0 2 * * *', async () => {
  console.log('Running at-risk detection...');
  
  const courses = await MoodleCourse.find();
  
  for (const course of courses) {
    const students = await getEnrolledStudents(course._id);
    
    for (const student of students) {
      const score = await calculateRiskScore(student._id, course._id);
      const level = getRiskLevel(score);
      
      // Store result for historical tracking
      await RiskAssessment.create({
        student: student._id,
        course: course._id,
        score,
        level: level.level,
        assessedAt: new Date()
      });
      
      // Alert teacher if student became critical
      if (level.level === 'critical') {
        await notifyTeacher(course, student, score);
      }
    }
  }
});
```

---

## 📝 Risk Reasons

When a student is flagged, the system provides specific reasons:

```javascript
const getRiskReasons = async (studentId, courseId) => {
  const reasons = [];
  
  // Check each risk factor
  const student = await User.findById(studentId);
  const assignments = await MoodleAssignment.find({ courseId });
  const submissions = await getStudentSubmissions(studentId, courseId);
  
  // Missing assignments
  const missingCount = getMissingCount(assignments, submissions);
  if (missingCount > 0) {
    reasons.push({
      type: 'missing_assignments',
      severity: missingCount >= 3 ? 'high' : 'medium',
      message: `Missing ${missingCount} assignment${missingCount > 1 ? 's' : ''}`,
      details: getMissingAssignmentNames(assignments, submissions)
    });
  }
  
  // Inactivity
  const daysSinceActive = getDaysSinceActive(student);
  if (daysSinceActive > 7) {
    reasons.push({
      type: 'inactivity',
      severity: daysSinceActive > 14 ? 'high' : 'medium',
      message: `Last active ${daysSinceActive} days ago`,
      details: { lastSeen: student.lastSeen }
    });
  }
  
  // Grade drop
  const gradeDrop = calculateGradeDrop(submissions);
  if (gradeDrop > 10) {
    reasons.push({
      type: 'grade_drop',
      severity: gradeDrop > 20 ? 'high' : 'medium',
      message: `Grades dropped by ${gradeDrop.toFixed(1)}%`,
      details: { drop: gradeDrop }
    });
  }
  
  // Late submissions
  const lateRate = calculateLateRate(submissions);
  if (lateRate > 0.5) {
    reasons.push({
      type: 'late_submissions',
      severity: lateRate > 0.75 ? 'high' : 'medium',
      message: `${Math.round(lateRate * 100)}% of submissions are late`,
      details: { lateRate }
    });
  }
  
  return reasons;
};
```

---

## 🖥️ Teacher Dashboard UI

```
┌─────────────────────────────────────────────────────────────────┐
│ 🚨 At-Risk Students                                    MATH 101 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Filter: [All ▼] [Critical ▼] [This Week ▼]        [📤 Export]   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 🔴 CRITICAL (2 students)                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 👤 John Doe                               Risk Score: 85/100│ │
│ │    john.doe@school.edu                                      │ │
│ │                                                             │ │
│ │    ⚠️ Reasons:                                              │ │
│ │    • Missing 4 assignments                                  │ │
│ │    • Last active 18 days ago                                │ │
│ │    • Grades dropped by 25%                                  │ │
│ │                                                             │ │
│ │    [📧 Send Email] [📝 Add Note] [📊 View Details]          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 👤 Jane Smith                             Risk Score: 78/100│ │
│ │    jane.smith@school.edu                                    │ │
│ │                                                             │ │
│ │    ⚠️ Reasons:                                              │ │
│ │    • Missing 3 assignments                                  │ │
│ │    • 80% of submissions are late                            │ │
│ │                                                             │ │
│ │    [📧 Send Email] [📝 Add Note] [📊 View Details]          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 🟠 AT RISK (4 students)                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 👤 Bob Johnson                            Risk Score: 62/100│ │
│ │    ...                                                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ 🟡 WATCH (6 students)                       [Expand to view]    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📧 Automated Alerts (Optional)

Teachers can opt to receive automated alerts:

```javascript
// Schema for teacher notification preferences
const NotificationPreference = {
  teacher: ObjectId,
  course: ObjectId,
  alertWhen: {
    studentBecomesCritical: { type: Boolean, default: true },
    studentBecomesAtRisk: { type: Boolean, default: true },
    assignmentMissedBy: { type: Number, default: 3 },  // days after due date
    noActivityFor: { type: Number, default: 7 }         // days
  },
  alertMethod: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false }
  }
};

// Send alert
const notifyTeacher = async (course, student, score) => {
  const teachers = await getTeachersForCourse(course._id);
  
  for (const teacher of teachers) {
    const prefs = await NotificationPreference.findOne({
      teacher: teacher._id,
      course: course._id
    });
    
    if (prefs?.alertWhen.studentBecomesCritical) {
      // In-app notification
      if (prefs.alertMethod.inApp) {
        io.to(teacher._id.toString()).emit('atRiskAlert', {
          student: { name: student.firstName + ' ' + student.lastName },
          course: course.name,
          score
        });
      }
      
      // Email notification
      if (prefs.alertMethod.email) {
        await sendEmail({
          to: teacher.email,
          subject: `⚠️ At-Risk Student Alert: ${student.firstName} ${student.lastName}`,
          template: 'at-risk-alert',
          data: { teacher, student, course, score }
        });
      }
    }
  }
};
```

---

## 📈 Historical Tracking

Track how a student's risk score changes over time:

```javascript
// Schema for risk history
const RiskHistory = {
  student: ObjectId,
  course: ObjectId,
  assessments: [{
    date: Date,
    score: Number,
    level: String,
    reasons: [{ type: String, message: String }]
  }]
};

// API to get risk trend
router.get('/api/analytics/student/:studentId/risk-trend', async (req, res) => {
  const history = await RiskHistory.findOne({
    student: req.params.studentId,
    course: req.query.courseId
  });
  
  // Format for chart display
  const trend = history.assessments.map(a => ({
    date: a.date.toISOString().split('T')[0],
    score: a.score,
    level: a.level
  }));
  
  res.json(trend);
});
```

**Trend Chart:**
```
Risk Score Over Time
100 ┤
 80 ┤            ●──────────●
 60 ┤       ●────┘           ╲
 40 ┤  ●────┘                 ╲●
 20 ┤──┘                       
  0 ┼────────────────────────────
    Week1  Week2  Week3  Week4
    
    🔴 Week 2-3: At Risk (intervention needed)
    🟢 Week 4: Improved after teacher contact
```

---

## 🛠️ Implementation Steps

### Step 1: Create Risk Detection Service
```bash
# Create the service file
touch server/services/riskDetection.js
```

### Step 2: Add Risk History Schema
```javascript
// server/models/RiskHistory.js
const mongoose = require('mongoose');

const riskHistorySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'MoodleCourse', required: true },
  assessments: [{
    date: { type: Date, default: Date.now },
    score: { type: Number, required: true },
    level: { type: String, enum: ['active', 'watch', 'at-risk', 'critical'] },
    reasons: [{
      type: { type: String },
      severity: { type: String },
      message: String
    }]
  }]
}, { timestamps: true });

// Index for efficient queries
riskHistorySchema.index({ student: 1, course: 1 });

module.exports = mongoose.model('RiskHistory', riskHistorySchema);
```

### Step 3: Add API Routes
```javascript
// server/routes/analytics.js
router.get('/course/:courseId/at-risk', teacherOnly, getAtRiskStudents);
router.get('/student/:studentId/risk-trend', teacherOnly, getRiskTrend);
router.post('/course/:courseId/notify', teacherOnly, notifyAtRiskStudent);
```

### Step 4: Add Scheduled Job
```javascript
// server/jobs/riskAssessment.js
const cron = require('node-cron');

// Run daily at 2 AM
cron.schedule('0 2 * * *', runDailyRiskAssessment);
```

---

## ⚙️ Configuration Options

Teachers can customize thresholds:

```javascript
// Default thresholds (can be customized per course)
const DEFAULT_THRESHOLDS = {
  inactivityDays: {
    low: 3,      // 3-7 days = low risk
    medium: 7,   // 7-14 days = medium risk
    high: 14     // 14+ days = high risk
  },
  gradeDropPercent: {
    low: 5,      // 5-10% = low risk
    medium: 10,  // 10-20% = medium risk
    high: 20     // 20%+ = high risk
  },
  lateSubmissionRate: {
    low: 0.25,   // 25-50% = low risk
    medium: 0.5, // 50-75% = medium risk
    high: 0.75   // 75%+ = high risk
  }
};
```

---

## 📋 Summary

| Component | Purpose |
|-----------|---------|
| **Risk Score** | Numerical value 0-100 based on multiple factors |
| **Risk Level** | Categorization (Active/Watch/At-Risk/Critical) |
| **Risk Reasons** | Specific explanations for why student is flagged |
| **Detection Engine** | Service that calculates scores on-demand or scheduled |
| **Teacher Dashboard** | UI showing at-risk students sorted by severity |
| **Alerts** | Optional notifications when students become critical |
| **Historical Tracking** | Monitor how risk changes over time |

---

*This feature helps teachers identify struggling students early, enabling timely intervention and support.*

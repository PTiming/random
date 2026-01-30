# LMS with Moodle Integration - Planning Document

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Moodle Integration Strategy](#moodle-integration-strategy)
4. [Feature Requirements](#feature-requirements)
5. [System Architecture](#system-architecture)
6. [Database Schema Design](#database-schema-design)
7. [API Specifications](#api-specifications)
8. [Security Considerations](#security-considerations)
9. [Deployment Strategy](#deployment-strategy)
10. [Development Roadmap](#development-roadmap)

---

## 1. Executive Summary

This document outlines the comprehensive plan for building a Learning Management System (LMS) with full Moodle integration. The system will provide seamless interoperability with Moodle while offering additional custom features for enhanced learning experiences.

### Goals
- Create a modern, scalable LMS platform
- Integrate seamlessly with Moodle via LTI (Learning Tools Interoperability) and REST APIs
- Support course management, user authentication, and grade synchronization
- Provide real-time analytics and reporting
- Ensure mobile-responsive design

---

## 2. System Overview

### 2.1 Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        LMS Application                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Web UI    │  │  Mobile UI  │  │      Admin Panel        │  │
│  │  (React)    │  │   (React    │  │    (React Admin)        │  │
│  │             │  │   Native)   │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      API Gateway (Node.js/Express)              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────────┐  │
│  │  Auth     │ │  Course   │ │  User     │ │    Moodle       │  │
│  │  Service  │ │  Service  │ │  Service  │ │    Integration  │  │
│  │           │ │           │ │           │ │    Service      │  │
│  └───────────┘ └───────────┘ └───────────┘ └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        Database Layer                           │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│  │  PostgreSQL   │  │    Redis      │  │   File Storage    │   │
│  │  (Primary DB) │  │   (Cache)     │  │   (S3/MinIO)      │   │
│  └───────────────┘  └───────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Moodle Instance                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ LTI Plugin  │  │ Web Services│  │    Grade Book           │  │
│  │             │  │  (REST API) │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| Frontend | React 18+ | Component-based, large ecosystem |
| Backend | Node.js + Express | JavaScript consistency, async-friendly |
| Database | PostgreSQL | Robust, reliable, complex queries |
| Cache | Redis | Session management, real-time features |
| File Storage | S3/MinIO | Scalable object storage |
| Authentication | OAuth 2.0 / JWT | Industry standard, Moodle compatible |
| LTI | LTI 1.3 / LTI Advantage | Latest standard for learning tools |

---

## 3. Moodle Integration Strategy

### 3.1 Integration Methods

#### 3.1.1 LTI (Learning Tools Interoperability) Integration

LTI 1.3 / LTI Advantage will be the primary integration method:

```
┌─────────────┐         LTI Launch         ┌─────────────┐
│             │ ──────────────────────────▶│             │
│   Moodle    │                            │    LMS      │
│  (Platform) │ ◀──────────────────────────│   (Tool)    │
│             │     Grade Passback         │             │
└─────────────┘                            └─────────────┘
```

**LTI Features to Implement:**
- **LTI Launch**: Single sign-on from Moodle to LMS
- **Deep Linking**: Content selection and linking
- **Assignment and Grade Services**: Grade synchronization
- **Names and Role Provisioning Services**: User roster sync

#### 3.1.2 Moodle REST API Integration

For direct data synchronization:

```javascript
// Example: Moodle Web Service Functions to Use
const MOODLE_FUNCTIONS = {
  // User Management
  'core_user_get_users': 'Get user information',
  'core_user_create_users': 'Create new users',
  
  // Course Management  
  'core_course_get_courses': 'Get course list',
  'core_course_get_contents': 'Get course contents',
  'core_enrol_get_enrolled_users': 'Get enrolled users',
  
  // Grade Management
  'gradereport_user_get_grade_items': 'Get grade items',
  'core_grades_update_grades': 'Update grades',
  
  // Assignment
  'mod_assign_get_assignments': 'Get assignments',
  'mod_assign_get_submissions': 'Get submissions'
};
```

### 3.2 Authentication Flow with Moodle

```
┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
│  User  │     │ Moodle │     │  LMS   │     │ Auth   │
│        │     │        │     │        │     │ Server │
└───┬────┘     └───┬────┘     └───┬────┘     └───┬────┘
    │              │              │              │
    │ 1. Click     │              │              │
    │    LTI Link  │              │              │
    │─────────────▶│              │              │
    │              │              │              │
    │              │ 2. LTI       │              │
    │              │    Launch    │              │
    │              │─────────────▶│              │
    │              │              │              │
    │              │              │ 3. Validate  │
    │              │              │    Token     │
    │              │              │─────────────▶│
    │              │              │              │
    │              │              │ 4. JWT Token │
    │              │              │◀─────────────│
    │              │              │              │
    │ 5. LMS Session Created     │              │
    │◀─────────────────────────────              │
    │              │              │              │
```

### 3.3 Data Synchronization Strategy

| Data Type | Sync Direction | Frequency | Method |
|-----------|----------------|-----------|--------|
| Users | Moodle → LMS | Real-time (LTI) | LTI Launch |
| Course Roster | Moodle → LMS | On-demand | NRPS API |
| Grades | LMS → Moodle | Real-time | AGS API |
| Assignments | Bidirectional | Scheduled (15 min) | REST API |
| Content | LMS → Moodle | On-demand | Deep Linking |

---

## 4. Feature Requirements

### 4.1 Core LMS Features

#### 4.1.1 User Management
- [ ] User registration and authentication
- [ ] Role-based access control (Student, Instructor, Admin)
- [ ] Profile management
- [ ] SSO via Moodle (LTI)

#### 4.1.2 Course Management
- [ ] Course creation and configuration
- [ ] Course enrollment management
- [ ] Course content organization (modules, units)
- [ ] Course templates

#### 4.1.3 Content Delivery
- [ ] Multi-format content support (video, PDF, HTML)
- [ ] SCORM package support
- [ ] Interactive content (H5P integration)
- [ ] Content sequencing and prerequisites

#### 4.1.4 Assessment & Grading
- [ ] Quiz and assignment creation
- [ ] Multiple question types (MCQ, essay, file upload)
- [ ] Automatic grading for objective questions
- [ ] Rubric-based grading
- [ ] Grade book with weighted categories
- [ ] Grade sync with Moodle

#### 4.1.5 Communication
- [ ] Discussion forums
- [ ] Announcements
- [ ] Direct messaging
- [ ] Video conferencing integration (Zoom/Meet)

#### 4.1.6 Analytics & Reporting
- [ ] Student progress tracking
- [ ] Course completion reports
- [ ] Engagement analytics
- [ ] Custom report builder

### 4.2 Moodle-Specific Features

#### 4.2.1 LTI Tool Provider
- [ ] LTI 1.3 compliant tool provider
- [ ] Platform registration management
- [ ] Launch request handling
- [ ] Deep linking support

#### 4.2.2 Grade Synchronization
- [ ] Real-time grade passback
- [ ] Batch grade sync
- [ ] Grade item mapping
- [ ] Sync status monitoring

#### 4.2.3 Content Sharing
- [ ] LTI content selection
- [ ] Resource link creation
- [ ] Content item message support

---

## 5. System Architecture

### 5.1 Microservices Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              Load Balancer (nginx)                        │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼─────────────────────────────────────┐
│                           API Gateway                                     │
│                    (Authentication, Rate Limiting, Routing)               │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Auth Service   │       │ Course Service  │       │  User Service   │
│                 │       │                 │       │                 │
│ - JWT/OAuth     │       │ - CRUD courses  │       │ - User profiles │
│ - LTI Auth      │       │ - Enrollments   │       │ - Role mgmt     │
│ - Sessions      │       │ - Content mgmt  │       │ - Permissions   │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         │              ┌──────────┴──────────┐              │
         │              ▼                     ▼              │
         │    ┌─────────────────┐   ┌─────────────────┐     │
         │    │ Content Service │   │ Assess Service  │     │
         │    │                 │   │                 │     │
         │    │ - File uploads  │   │ - Quizzes       │     │
         │    │ - SCORM         │   │ - Assignments   │     │
         │    │ - Video         │   │ - Grading       │     │
         │    └────────┬────────┘   └────────┬────────┘     │
         │             │                     │              │
         └─────────────┴─────────┬───────────┴──────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Moodle Integration    │
                    │       Service           │
                    │                         │
                    │ - LTI 1.3 Handler       │
                    │ - REST API Client       │
                    │ - Grade Sync            │
                    │ - Data Mapping          │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Message Queue       │
                    │       (RabbitMQ)        │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   PostgreSQL    │   │     Redis       │   │   MinIO/S3      │
│   (Primary DB)  │   │    (Cache)      │   │ (File Storage)  │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

### 5.2 Directory Structure

```
lms-moodle/
├── apps/
│   ├── web/                    # React web application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   ├── admin/                  # Admin panel application
│   │   └── src/
│   │
│   └── mobile/                 # React Native mobile app
│       └── src/
│
├── services/
│   ├── api-gateway/            # API Gateway service
│   │   ├── src/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   └── config/
│   │   └── package.json
│   │
│   ├── auth/                   # Authentication service
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── lti/            # LTI implementation
│   │   └── package.json
│   │
│   ├── course/                 # Course management service
│   │   └── src/
│   │
│   ├── user/                   # User management service
│   │   └── src/
│   │
│   ├── content/                # Content delivery service
│   │   └── src/
│   │
│   ├── assessment/             # Assessment & grading service
│   │   └── src/
│   │
│   └── moodle-integration/     # Moodle integration service
│       ├── src/
│       │   ├── lti/
│       │   │   ├── launch.js
│       │   │   ├── deep-linking.js
│       │   │   ├── grade-service.js
│       │   │   └── nrps.js
│       │   ├── api/
│       │   │   ├── client.js
│       │   │   └── sync.js
│       │   └── mappers/
│       └── package.json
│
├── packages/
│   ├── shared/                 # Shared utilities
│   ├── ui/                     # Shared UI components
│   └── types/                  # TypeScript types
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   └── Dockerfile.*
│   ├── kubernetes/
│   │   ├── deployments/
│   │   └── services/
│   └── terraform/
│
├── docs/
│   ├── api/
│   └── architecture/
│
└── package.json                # Monorepo root
```

---

## 6. Database Schema Design

### 6.1 Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      users       │       │     courses      │       │    enrollments   │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ email            │       │ title            │       │ user_id (FK)     │
│ password_hash    │       │ description      │       │ course_id (FK)   │
│ first_name       │       │ start_date       │       │ role             │
│ last_name        │       │ end_date         │       │ enrolled_at      │
│ role             │       │ status           │       │ completed_at     │
│ moodle_user_id   │───┐   │ moodle_course_id │───┐   │ moodle_enrol_id  │
│ created_at       │   │   │ created_at       │   │   │ created_at       │
│ updated_at       │   │   │ updated_at       │   │   │ updated_at       │
└──────────────────┘   │   └──────────────────┘   │   └──────────────────┘
                       │                          │
                       └──────────────────────────┴───────────┐
                                                              │
┌──────────────────┐       ┌──────────────────┐       ┌───────┴──────────┐
│     modules      │       │   assignments    │       │  moodle_mapping  │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ course_id (FK)   │       │ module_id (FK)   │       │ entity_type      │
│ title            │       │ title            │       │ local_id         │
│ description      │       │ description      │       │ moodle_id        │
│ order_index      │       │ due_date         │       │ sync_status      │
│ status           │       │ max_score        │       │ last_synced_at   │
│ created_at       │       │ moodle_assign_id │       │ created_at       │
│ updated_at       │       │ created_at       │       │ updated_at       │
└──────────────────┘       └──────────────────┘       └──────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   submissions    │       │     grades       │       │   lti_platforms  │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ assignment_id(FK)│       │ submission_id(FK)│       │ name             │
│ user_id (FK)     │       │ score            │       │ issuer           │
│ content          │       │ feedback         │       │ client_id        │
│ file_urls        │       │ graded_by (FK)   │       │ auth_endpoint    │
│ submitted_at     │       │ synced_to_moodle │       │ token_endpoint   │
│ status           │       │ moodle_grade_id  │       │ jwks_uri         │
│ created_at       │       │ created_at       │       │ deployment_id    │
│ updated_at       │       │ updated_at       │       │ created_at       │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

### 6.2 Key Tables SQL

```sql
-- Users table with Moodle mapping
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    avatar_url VARCHAR(500),
    moodle_user_id INTEGER,
    moodle_username VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    moodle_category_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table with Moodle mapping
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'draft',
    visibility VARCHAR(50) DEFAULT 'private',
    moodle_course_id INTEGER,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules table
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    moodle_section_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grades table
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID,
    user_id UUID REFERENCES users(id),
    module_id UUID REFERENCES modules(id),
    score DECIMAL(10,2),
    max_score DECIMAL(10,2),
    feedback TEXT,
    graded_by UUID REFERENCES users(id),
    synced_to_moodle BOOLEAN DEFAULT false,
    moodle_grade_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LTI Platform registration (for Moodle instances)
CREATE TABLE lti_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(500) NOT NULL UNIQUE,
    client_id VARCHAR(255) NOT NULL,
    auth_endpoint VARCHAR(500) NOT NULL,
    token_endpoint VARCHAR(500) NOT NULL,
    jwks_uri VARCHAR(500) NOT NULL,
    deployment_id VARCHAR(255),
    public_key TEXT,
    private_key TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LTI Resource Links
CREATE TABLE lti_resource_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID REFERENCES lti_platforms(id),
    resource_link_id VARCHAR(255) NOT NULL,
    course_id UUID REFERENCES courses(id),
    module_id UUID REFERENCES modules(id),
    title VARCHAR(255),
    context_id VARCHAR(255),
    lineitem_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform_id, resource_link_id)
);

-- Grade sync tracking
CREATE TABLE grade_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID REFERENCES grades(id),
    platform_id UUID REFERENCES lti_platforms(id),
    lineitem_url VARCHAR(500),
    score_given DECIMAL(10,2),
    score_maximum DECIMAL(10,2),
    sync_status VARCHAR(50),
    error_message TEXT,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. API Specifications

### 7.1 RESTful API Endpoints

#### Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Get current user |

#### LTI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/lti/launch` | LTI launch endpoint |
| GET | `/lti/jwks` | Public key set |
| POST | `/lti/deep-linking/callback` | Deep linking response |
| GET | `/lti/platforms` | List registered platforms |
| POST | `/lti/platforms` | Register new platform |

#### Course API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List courses |
| POST | `/api/courses` | Create course |
| GET | `/api/courses/:id` | Get course details |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |
| GET | `/api/courses/:id/modules` | List course modules |
| POST | `/api/courses/:id/enroll` | Enroll user |

#### Moodle Sync API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/moodle/sync/courses` | Sync courses from Moodle |
| POST | `/api/moodle/sync/users` | Sync users from Moodle |
| POST | `/api/moodle/sync/grades` | Push grades to Moodle |
| GET | `/api/moodle/sync/status` | Get sync status |

### 7.2 LTI 1.3 Implementation

```javascript
// LTI Launch Handler
class LTILaunchHandler {
  // LTI 1.3 claim namespace
  static LTI_CLAIM = 'https://purl.imsglobal.org/spec/lti/claim';
  
  async handleLaunch(req, res) {
    // 1. Validate the JWT from the platform
    const idToken = req.body.id_token;
    const state = req.body.state;
    
    // 2. Verify platform and deployment
    const platform = await this.verifyPlatform(idToken);
    
    // 3. Extract claims
    const claims = this.extractClaims(idToken);
    
    // 4. Create or update user
    const user = await this.findOrCreateUser(claims);
    
    // 5. Handle based on message type (using LTI 1.3 standard claim path)
    const messageType = claims[`${LTILaunchHandler.LTI_CLAIM}/message_type`];
    switch(messageType) {
      case 'LtiResourceLinkRequest':
        return this.handleResourceLink(claims, user, res);
      case 'LtiDeepLinkingRequest':
        return this.handleDeepLinking(claims, user, res);
      default:
        throw new Error('Unsupported message type');
    }
  }
  
  async syncGradeToMoodle(gradeId) {
    const grade = await Grade.findById(gradeId);
    const resourceLink = await LTIResourceLink.findByModuleId(grade.module_id);
    
    if (!resourceLink?.lineitem_url) {
      throw new Error('No lineitem URL found');
    }
    
    // Get access token
    const token = await this.getAccessToken(
      resourceLink.platform,
      ['https://purl.imsglobal.org/spec/lti-ags/scope/score']
    );
    
    // Post score (using snake_case to match database schema)
    await fetch(resourceLink.lineitem_url + '/scores', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/vnd.ims.lis.v1.score+json'
      },
      body: JSON.stringify({
        userId: grade.user.moodle_user_id,
        scoreGiven: grade.score,
        scoreMaximum: grade.max_score,
        activityProgress: 'Completed',
        gradingProgress: 'FullyGraded',
        timestamp: new Date().toISOString()
      })
    });
  }
}
```

---

## 8. Security Considerations

### 8.1 Authentication & Authorization

- **JWT Tokens**: Short-lived access tokens (15 min) with refresh tokens
- **LTI Security**: OAuth 2.0 / OpenID Connect compliant
- **RBAC**: Role-based access control for all resources
- **API Rate Limiting**: Prevent abuse with rate limits

### 8.2 Data Security

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Layers                              │
├─────────────────────────────────────────────────────────────────┤
│  Transport:    TLS 1.3 for all communications                   │
│  Storage:      AES-256 encryption for sensitive data            │
│  Passwords:    bcrypt with cost factor 12                       │
│  API Keys:     Stored as hashed values                          │
│  PII:          GDPR compliant data handling                     │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Moodle-Specific Security

- Secure web service token storage
- LTI key pair management
- Grade passback authentication
- Platform registration validation

---

## 9. Deployment Strategy

### 9.1 Infrastructure Requirements

```yaml
# docker-compose.yml (Development)
version: '3.8'

services:
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  auth-service:
    build: ./services/auth
    environment:
      - DATABASE_URL=postgres://user:pass@postgres:5432/lms
      - REDIS_URL=redis://redis:6379

  moodle-integration:
    build: ./services/moodle-integration
    environment:
      - MOODLE_URL=${MOODLE_URL}
      - MOODLE_TOKEN=${MOODLE_TOKEN}
      - LTI_PRIVATE_KEY=${LTI_PRIVATE_KEY}

  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=lms
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 9.2 Production Deployment

| Environment | Technology | Scaling |
|-------------|------------|---------|
| Containerization | Docker | Auto-scaling groups |
| Orchestration | Kubernetes | HPA based on CPU/Memory |
| Database | AWS RDS / Cloud SQL | Read replicas |
| Cache | ElastiCache / Redis Cloud | Cluster mode |
| CDN | CloudFront / Cloudflare | Global edge caching |
| Monitoring | Prometheus + Grafana | Alerting |

---

## 10. Development Roadmap

### Phase 1: Foundation (Weeks 1-4)

- [x] Project setup and architecture
- [ ] Database schema implementation
- [ ] Core authentication service
- [ ] Basic user management
- [ ] LTI 1.3 platform registration

### Phase 2: Core LMS (Weeks 5-8)

- [ ] Course management CRUD
- [ ] Module and content management
- [ ] Basic content delivery
- [ ] Enrollment system
- [ ] LTI launch handling

### Phase 3: Moodle Integration (Weeks 9-12)

- [ ] Moodle REST API client
- [ ] Course synchronization
- [ ] User roster sync (NRPS)
- [ ] Deep linking implementation
- [ ] Grade passback (AGS)

### Phase 4: Assessment (Weeks 13-16)

- [ ] Quiz creation and management
- [ ] Assignment submission system
- [ ] Grading interface
- [ ] Grade book
- [ ] Grade sync with Moodle

### Phase 5: Enhancement (Weeks 17-20)

- [ ] Discussion forums
- [ ] Analytics dashboard
- [ ] Mobile app development
- [ ] Performance optimization
- [ ] Security audit

### Phase 6: Launch (Weeks 21-24)

- [ ] Beta testing
- [ ] Documentation
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] User training

---

## Appendix A: Moodle Web Service Configuration

### Required Moodle Setup

1. **Enable Web Services**
   - Site administration → Advanced features → Enable web services

2. **Create External Service**
   - Site administration → Server → External services
   - Add new service with required functions

3. **Required Functions**
   ```
   core_user_get_users
   core_user_get_users_by_field
   core_course_get_courses
   core_course_get_contents
   core_enrol_get_enrolled_users
   mod_assign_get_assignments
   mod_assign_get_submissions
   gradereport_user_get_grade_items
   ```

4. **Generate API Token**
   - Site administration → Server → Manage tokens
   - Create token for service user

5. **Enable LTI Tool Provider**
   - Site administration → Plugins → Activity modules → External tool
   - Configure LTI platforms

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| LTI | Learning Tools Interoperability - standard for integrating learning tools |
| AGS | Assignment and Grade Services - LTI service for grade sync |
| NRPS | Names and Role Provisioning Services - LTI service for roster sync |
| SCORM | Shareable Content Object Reference Model - e-learning standard |
| JWT | JSON Web Token - secure token format |
| SSO | Single Sign-On - unified authentication |

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Author: LMS Development Team*

# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Browser, Mobile App, API Clients)                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS/REST
                 │
┌────────────────▼────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  - Nginx Reverse Proxy                                      │
│  - SSL/TLS Termination                                      │
│  - Load Balancing                                           │
│  - Rate Limiting                                            │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  Express Application                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Middleware Layer                         │  │
│  │  - Helmet (Security Headers)                         │  │
│  │  - CORS                                              │  │
│  │  - Rate Limiting                                     │  │
│  │  - Body Parser                                       │  │
│  │  - Authentication (JWT)                              │  │
│  │  - RBAC (Permission Checking)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Route Layer                              │  │
│  │  - /api/auth/*                                       │  │
│  │  - /api/users/*                                      │  │
│  │  - /api/courses/*                                    │  │
│  │  - /api/roles/*                                      │  │
│  │  - /api/sync/*                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Controller Layer                           │  │
│  │  - AuthController                                    │  │
│  │  - UserController                                    │  │
│  │  - CourseController                                  │  │
│  │  - RoleController                                    │  │
│  │  - SyncController                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             Service Layer                             │  │
│  │  - MoodleService (Web Services Integration)         │  │
│  │  - SyncService (Bidirectional Sync)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────┬───────────────────────┘
              │                       │
              │                       │
   ┌──────────▼──────────┐ ┌─────────▼────────────┐
   │   PostgreSQL DB     │ │   Moodle Instance    │
   │                     │ │                      │
   │  - Users            │ │  REST API            │
   │  - Roles            │ │  Web Services        │
   │  - Permissions      │ │                      │
   │  - Courses          │ │  - Users             │
   │  - Enrollments      │ │  - Courses           │
   │  - Grades           │ │  - Enrollments       │
   │  - Sync Logs        │ │  - Grades            │
   └─────────────────────┘ └──────────────────────┘
```

## Component Details

### 1. Authentication Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. POST /api/auth/login
     │    {email, password}
     │
┌────▼────────────┐
│ AuthController  │
└────┬────────────┘
     │ 2. Verify credentials
     │    (bcrypt compare)
     │
┌────▼─────┐
│   DB     │
└────┬─────┘
     │ 3. Get user & roles
     │
┌────▼────────────┐
│ JWT Generation  │
│ - Access Token  │
│ - Refresh Token │
└────┬────────────┘
     │ 4. Return tokens
     │
┌────▼────┐
│ Client  │
└─────────┘
```

### 2. RBAC Flow

```
┌─────────┐
│ Request │ Authorization: Bearer TOKEN
└────┬────┘
     │
┌────▼──────────────┐
│ Auth Middleware   │
│ - Verify JWT      │
│ - Extract user    │
└────┬──────────────┘
     │
┌────▼──────────────┐
│ RBAC Middleware   │
│ - Check roles     │
│ - Check perms     │
└────┬──────────────┘
     │
     ├─── Authorized ────▶ Controller
     │
     └─── Denied ────▶ 403 Forbidden
```

### 3. Sync Flow

```
┌──────────────┐
│ Sync Trigger │ (Manual or Scheduled)
└──────┬───────┘
       │
┌──────▼────────────┐
│  SyncController   │
│  - Full Sync      │
│  - Entity Sync    │
└──────┬────────────┘
       │
┌──────▼────────────┐
│   SyncService     │
│                   │
│  1. Fetch from    │
│     Moodle        │◄──────┐
│                   │       │
│  2. Compare with  │       │
│     LMS DB        │       │
│                   │       │
│  3. Resolve       │       │
│     Conflicts     │       │
│                   │       │
│  4. Update LMS    │       │
│                   │       │
│  5. Update Moodle │───────┘
│                   │
│  6. Log Results   │
└──────┬────────────┘
       │
┌──────▼────────┐
│   Sync Logs   │
│   - Status    │
│   - Errors    │
│   - Metrics   │
└───────────────┘
```

## Data Models

### Entity Relationships

```
┌─────────┐
│  Users  │───────┐
└────┬────┘       │
     │            │
     │ has many   │ has many
     │            │
┌────▼─────────┐  │
│  User_Roles  │◄─┘
└────┬─────────┘
     │
     │ belongs to
     │
┌────▼─────┐       ┌──────────────┐
│  Roles   │───────│ Role_Perms   │
└──────────┘       └──────┬───────┘
                          │
                          │ belongs to
                          │
                   ┌──────▼────────┐
                   │  Permissions  │
                   └───────────────┘

┌─────────┐
│  Users  │
└────┬────┘
     │
     │ has many
     │
┌────▼──────────┐       ┌──────────┐
│  Enrollments  │───────│ Courses  │
└────┬──────────┘       └──────────┘
     │
     │ has many
     │
┌────▼────────┐
│   Grades    │
└─────────────┘
```

## Security Layers

### 1. Network Layer
- SSL/TLS encryption
- Firewall rules
- DDoS protection

### 2. Application Layer
- Rate limiting
- CORS policies
- Security headers (Helmet)
- Input validation

### 3. Authentication Layer
- JWT tokens
- bcrypt password hashing
- Token expiration
- Refresh token rotation

### 4. Authorization Layer
- Role-based access control
- Permission checking
- Context-aware permissions
- Resource-level access

### 5. Data Layer
- Parameterized queries
- SQL injection prevention
- Database encryption
- Access logs

## Scalability Considerations

### Horizontal Scaling
```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  App     │      │  App     │      │  App     │
│Instance 1│      │Instance 2│      │Instance 3│
└─────┬────┘      └─────┬────┘      └─────┬────┘
      │                 │                 │
      └─────────────────┼─────────────────┘
                        │
                ┌───────▼────────┐
                │  Load Balancer │
                └────────────────┘
```

### Database Scaling
- Connection pooling (configured)
- Read replicas (ready)
- Query optimization with indexes
- Partitioning for large tables

### Caching Strategy (Optional)
```
┌─────────┐
│  Redis  │ ◄─── Session Storage
└────┬────┘      API Response Cache
     │           User Permissions Cache
     │
┌────▼─────────┐
│  Application │
└──────────────┘
```

## Deployment Architecture

### Development
```
┌────────────┐
│   Local    │
│   Node.js  │
│   + DB     │
└────────────┘
```

### Production
```
┌───────────────┐
│  Load Balancer│
└──────┬────────┘
       │
  ┌────┴────┬─────────┬────────┐
  │         │         │        │
┌─▼───┐ ┌──▼──┐ ┌───▼──┐ ┌───▼──┐
│ App │ │ App │ │ App  │ │ App  │
│ PM2 │ │ PM2 │ │ PM2  │ │ PM2  │
└─┬───┘ └──┬──┘ └───┬──┘ └───┬──┘
  │        │        │        │
  └────────┴────────┴────────┘
           │
      ┌────▼──────┐
      │ PostgreSQL│
      │  Cluster  │
      └───────────┘
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 18+ | JavaScript execution |
| Language | TypeScript | Type safety |
| Framework | Express.js | Web framework |
| Database | PostgreSQL | Data persistence |
| Authentication | JWT | Token-based auth |
| Password | bcrypt | Hashing |
| Testing | Jest | Unit/integration tests |
| API Client | Axios | Moodle integration |
| Process Manager | PM2 | Production runtime |
| Reverse Proxy | Nginx | Load balancing |
| Security | Helmet, CORS | Headers, policies |

## File Structure

```
src/
├── config/
│   ├── database.ts         # DB connection pool
│   └── index.ts            # App configuration
├── controllers/
│   ├── auth.controller.ts  # Authentication
│   ├── user.controller.ts  # User management
│   ├── course.controller.ts# Course management
│   ├── role.controller.ts  # Role & permissions
│   └── sync.controller.ts  # Sync operations
├── middleware/
│   ├── auth.ts             # JWT verification
│   └── rbac.ts             # Permission checking
├── routes/
│   ├── auth.routes.ts      # Auth endpoints
│   ├── user.routes.ts      # User endpoints
│   ├── course.routes.ts    # Course endpoints
│   ├── role.routes.ts      # Role endpoints
│   └── sync.routes.ts      # Sync endpoints
├── services/
│   ├── moodle.service.ts   # Moodle API client
│   └── sync.service.ts     # Sync logic
├── types/
│   └── index.ts            # TypeScript types
├── utils/
│   └── seed.ts             # Database seeding
├── migrations/
│   └── 001_initial_schema.sql
└── index.ts                # Application entry
```

## Performance Metrics

### Target Metrics
- API Response Time: < 200ms (95th percentile)
- Database Queries: < 50ms
- Sync Operations: < 5s for 100 records
- Concurrent Users: 1000+
- Uptime: 99.9%

### Monitoring Points
- API endpoint response times
- Database connection pool usage
- Sync operation success rate
- Error rates by endpoint
- Authentication failures
- Permission check performance

## Future Enhancements

1. **Caching Layer**: Redis for sessions and frequently accessed data
2. **Message Queue**: RabbitMQ for async operations
3. **Microservices**: Split into user, course, and sync services
4. **GraphQL API**: Alternative to REST
5. **Real-time**: WebSocket support for live updates
6. **File Storage**: S3 integration for content
7. **CDN**: Static asset distribution
8. **Analytics**: Advanced reporting and dashboards

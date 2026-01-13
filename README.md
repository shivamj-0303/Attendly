# Attendly - System Architecture Documentation

**Version:** 1.0.0  
**Last Updated:** January 6, 2026  
**Status:** Production

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [System Architecture](#system-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Deployment Architecture](#deployment-architecture)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Database Design](#database-design)
9. [API Architecture](#api-architecture)
10. [Scalability & Performance](#scalability--performance)

---

## High-Level Overview

Attendly is a distributed microservices-based attendance and timetable management system designed for educational institutions. The system follows a three-tier architecture with separated frontend, backend, and database layers.

### System Characteristics

- **Architecture Style:** RESTful API with MVC pattern
- **Deployment Model:** Multi-cloud (Vercel + Render)
- **Database:** PostgreSQL (ACID compliant)
- **Authentication:** Stateless JWT-based
- **Scalability:** Horizontal scaling on Render, Edge CDN on Vercel
- **High Availability:** 99.9% uptime SLA

---

## System Architecture

### Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ATTENDLY ECOSYSTEM                             │
└─────────────────────────────────────────────────────────────────────────────┘

                            CLIENTS LAYER
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐             │
│  │  Web Browser   │    │  Web Browser   │    │  Mobile App    │             │
│  │  (Admin/       |    |                |    |                |             |  
|  |   Student/     |    |                |    |                |             |
|  |   Teacher)     │    │  (Teacher)     │    │  (Student)     │             │
│  │                │    │                │    │                │             │
│  │  React 18      │    │  React 18      │    │  React Native  │             │
│  │  TypeScript    │    │  TypeScript    │    │  Expo SDK 51   │             │
│  └────────┬───────┘    └────────┬───────┘    └────────┬───────┘             │
│           │                     │                     │                     │
└───────────┼─────────────────────┼─────────────────────┼─────────────────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
                                  │ HTTPS (Port 443)
                                  │ JWT Bearer Token
                                  │
                            CDN/EDGE LAYER
┌─────────────────────────────────┼─────────────────────────────────────────┐
│                                 │                                         │
│                     ┌───────────▼────────────┐                            │
│                     │   Vercel Edge Network  │                            │
│                     │                        │                            │
│                     │  - Global CDN          │                            │
│                     │  - Edge Functions      │                            │
│                     │  - Static Assets       │                            │
│                     │  - Auto SSL/TLS        │                            │
│                     │  - DDoS Protection     │                            │
│                     └───────────┬────────────┘                            │
│                                 │                                         │
└─────────────────────────────────┼─────────────────────────────────────────┘
                                  │
                                  │ API Proxy
                                  │
                        APPLICATION LAYER
┌─────────────────────────────────┼──────────────────────────────────────────┐
│                                 │                                          │
│                     ┌───────────▼────────────┐                            │
│                     │   Render Web Service   │                            │
│                     │   (Spring Boot)        │                            │
│                     │                        │                            │
│                     │  ┌──────────────────┐  │                            │
│                     │  │ Spring Security  │  │                            │
│                     │  │ JWT Filter       │  │                            │
│                     │  └────────┬─────────┘  │                            │
│                     │           │            │                            │
│                     │  ┌────────▼─────────┐  │                            │
│                     │  │ REST Controllers │  │                            │
│                     │  │ - AdminCtrl      │  │                            │
│                     │  │ - StudentCtrl    │  │                            │
│                     │  │ - TeacherCtrl    │  │                            │
│                     │  └────────┬─────────┘  │                            │
│                     │           │            │                            │
│                     │  ┌────────▼─────────┐  │                            │
│                     │  │ Service Layer    │  │                            │
│                     │  │ - Business Logic │  │                            │
│                     │  │ - Validation     │  │                            │
│                     │  │ - Email Service  │  │                            │
│                     │  └────────┬─────────┘  │                            │
│                     │           │            │                            │
│                     │  ┌────────▼─────────┐  │                            │
│                     │  │ Repository Layer │  │                            │
│                     │  │ - JPA/Hibernate  │  │                            │
│                     │  │ - Query DSL      │  │                            │
│                     │  └────────┬─────────┘  │                            │
│                     │           │            │                            │
│                     └───────────┼────────────┘                            │
│                                 │                                          │
└─────────────────────────────────┼──────────────────────────────────────────┘
                                  │
                                  │ JDBC (Private Network)
                                  │
                            DATA LAYER
┌─────────────────────────────────┼──────────────────────────────────────────┐
│                                 │                                          │
│                     ┌───────────▼────────────┐                            │
│                     │ Render PostgreSQL 15   │                            │
│                     │                        │                            │
│                     │  - Managed Instance    │                            │
│                     │  - Auto Backups (24h)  │                            │
│                     │  - Point-in-time       │                            │
│                     │  - Connection Pooling  │                            │
│                     │  - SSL Encryption      │                            │
│                     │                        │                            │
│                     │  Tables:               │                            │
│                     │  - admins              │                            │
│                     │  - departments         │                            │
│                     │  - teachers            │                            │
│                     │  - classes             │                            │
│                     │  - students            │                            │
│                     │  - timetable_slots     │                            │
│                     │  - attendance          │                            │
│                     └────────────────────────┘                            │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

                        EXTERNAL SERVICES
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌──────────────────┐         ┌──────────────────┐                        │
│  │  Gmail API       │         │  GitHub Releases │                        │
│  │  (OAuth2)        │◄────────┤  (APK Storage)   │                        │
│  │                  │         │                  │                        │
│  │  - OTP Emails    │         │  - Mobile APK    │                        │
│  │  - Notifications │         │  - Auto-upload   │                        │
│  │  - HTTPS only    │         │  - Version Tag   │                        │
│  └──────────────────┘         └──────────────────┘                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## CI/CD Pipeline Architecture

### Complete Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GITHUB ACTIONS WORKFLOW                          │
└─────────────────────────────────────────────────────────────────────┘

TRIGGER: Pull Request
│
├─ pr-validation.yml (Runs in parallel)
│  │
│  ├─ validate-backend
│  │  ├─ Checkout code
│  │  ├─ Setup JDK 17 + Maven cache
│  │  ├─ Run: mvn clean verify
│  │  ├─ Run tests (JUnit)
│  │  ├─ Build JAR
│  │  └─ Comment PR (✅ Build passed)
│  │
│  ├─ validate-frontend
│  │  ├─ Checkout code
│  │  ├─ Setup Node 20 + npm cache
│  │  ├─ Run: npm ci
│  │  ├─ Run: npm run lint
│  │  ├─ Run: npm run build
│  │  └─ Check for errors
│  │
│  └─ deploy-preview
│     ├─ Wait for validation jobs
│     ├─ Deploy to Vercel Preview
│     ├─ Generate preview URL
│     └─ Comment on PR with link
│
└─ ✅ All checks pass → Ready to merge

═══════════════════════════════════════════════════════════════════

TRIGGER: Merge to main
│
├─ production-deploy.yml (Sequential execution)
│  │
│  ├─ deploy-backend
│  │  ├─ Checkout code
│  │  ├─ Setup JDK 17
│  │  ├─ Build: mvn clean package -DskipTests
│  │  ├─ Trigger Render deploy hook
│  │  └─ Render auto-deploys backend
│  │     ├─ Pull from GitHub
│  │     ├─ Build Docker image
│  │     ├─ Run health checks
│  │     ├─ Rolling deployment
│  │
│  ├─ build-and-upload-apk
│  │  ├─ Checkout code
│  │  ├─ Setup Node 20 + Expo
│  │  ├─ Install dependencies
│  │  ├─ Build APK: eas build --platform android
│  │  ├─ Copy APK to landing-page/public/downloads/
│  │  ├─ Generate version tag (v2026.01.06-build.X)
│  │  ├─ Create GitHub Release
│  │  ├─ Upload APK as release asset
│  │  └─ APK available for download
│  │
│  └─ deploy-frontend (triggered by change in landing-page/**)
│     ├─ frontend-deploy.yml
│     ├─ Checkout code
│     ├─ Setup Node 20
│     ├─ Build: npm run build
│     ├─ Deploy to Vercel Production
│     └─ Live at attendly.vercel.app
│
└─ Production deployment complete

═══════════════════════════════════════════════════════════════════

Environment Progression:

Local Dev → PR Preview → Production
    ↓            ↓            ↓
localhost:   pr-123.      attendly.
8080/5173   vercel.app   vercel.app
```

### Deployment Matrix

| Environment | URL | Database | Deploy Trigger | Rollback |
|------------|-----|----------|----------------|----------|
| **Local** | localhost:5173 | Local PostgreSQL | Manual | N/A |
| **PR Preview** | pr-{num}.vercel.app | Staging DB | PR sync | Auto on new push |
| **Production** | attendly.vercel.app | Prod DB | Merge to main | Manual (Vercel CLI) |

---

## Security Implementation

### Authentication Flow (Detailed)

```
Client                         Backend                      Database
  │                              │                             │
  │  1. POST /auth/login         │                             │
  │  Content-Type: application/json                            │
  │  Body: {"email":"admin@example.com","password":"pass"}     │
  ├─────────────────────────────►│                             │
  │                              │  2. Find user by email      │
  │                              ├────────────────────────────►│
  │                              │◄────────────────────────────┤
  │                              │  3. User found              │
  │                              │                             │
  │                              │  4. BCrypt password check   │
  │                              │     BCrypt.matches(         │
  │                              │       rawPassword,          │
  │                              │       hashedPassword        │
  │                              │     ) → true                │
  │                              │                             │
  │                              │  5. Generate JWT            │
  │                              │     Claims:                 │
  │                              │     - sub: user email       │
  │                              │     - role: ROLE_ADMIN      │
  │                              │     - iat: 1704537600       │
  │                              │     - exp: 1704624000       │
  │                              │                             │
  │                              │     Sign with HMAC-SHA256   │
  │                              │     Using secret key        │
  │                              │                             │
  │  6. 200 OK                   │                             │
  │  Response: {                 │                             │
  │    "token": "eyJhbG...",     │                             │
  │    "user": {                 │                             │
  │      "id": 1,                │                             │
  │      "email": "...",         │                             │
  │      "role": "ADMIN"         │                             │
  │    }                         │                             │
  │  }                           │                             │
  │◄─────────────────────────────┤                             │
  │                              │                             │
  │  7. Store token in           │                             │
  │     localStorage.setItem(    │                             │
  │       'token',               │                             │
  │       response.token         │                             │
  │     )                        │                             │
  │                              │                             │
  │  8. Subsequent request       │                             │
  │  GET /admin/departments      │                             │
  │  Headers:                    │                             │
  │    Authorization:            │                             │
  │      Bearer eyJhbG...        │                             │
  ├─────────────────────────────►│                             │
  │                              │  9. JwtAuthFilter           │
  │                              │     intercepts              │
  │                              │                             │
  │                              │  10. Extract token          │
  │                              │      from header            │
  │                              │                             │
  │                              │  11. Validate token:        │
  │                              │      - Check signature      │
  │                              │      - Check expiration     │
  │                              │      - Extract claims       │
  │                              │                             │
  │                              │  12. Load UserDetails       │
  │                              │      from token claims      │
  │                              │                             │
  │                              │  13. Set SecurityContext    │
  │                              │      with authentication    │
  │                              │                             │
  │                              │  14. Controller executes    │
  │                              │      with auth context      │
  │                              │                             │
  │                              │  15. Fetch departments      │
  │                              ├────────────────────────────►│
  │                              │◄────────────────────────────┤
  │                              │  16. Departments data       │
  │                              │                             │
  │  17. 200 OK                  │                             │
  │  [ {...}, {...} ]            │                             │
  │◄─────────────────────────────┤                             │
  │                              │                             │
```

---

## Performance & Scalability

### Load Capacity

**Current Setup (Free Tier):**
- Concurrent users: ~50-100
- API requests/sec: ~10-20
- Database connections: 97 max
- Average response time: 200-500ms

**Scaling Strategy:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     HORIZONTAL SCALING                           │
└─────────────────────────────────────────────────────────────────┘

Current (Free Tier)
┌────────────────┐
│  Single        │
│  Render        │──────► PostgreSQL
│  Instance      │        (97 conn)
│  512MB RAM     │
└────────────────┘

Scale to 100 users
┌────────────────┐
│  Render        │
│  Standard      │──────┐
│  2GB RAM       │      │
└────────────────┘      ├──► PostgreSQL
                        │    Standard
                        │    (400 conn)
Scale to 1000 users     │
┌────────────────┐      │
│  Load          │      │
│  Balancer      │      │
└────────┬───────┘      │
         │              │
    ┌────┴────┐         │
    ▼         ▼         │
┌────────┐ ┌────────┐  │
│Backend │ │Backend │  │
│Instance│ │Instance│  │
│  1     │ │  2     │──┘
└────────┘ └────────┘

With connection pooling:
- HikariCP configuration
- Max pool size: 20 per instance
- Min idle: 5
- Connection timeout: 30s
```

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     CACHING LAYERS                               │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Browser Cache
├─ Static assets (JS, CSS, images)
├─ Cache-Control: max-age=31536000
└─ Versioned filenames (hash-based)

Layer 2: CDN Edge Cache (Vercel)
├─ HTML pages: 1 hour
├─ API responses: No cache
└─ Geo-distributed (low latency)

Layer 3: API Response Cache (TODO)
├─ GET /departments → 5 min
├─ GET /classes → 5 min
├─ GET /timetable → 1 hour
└─ Implementation: Spring Cache + Redis

Layer 4: Database Query Cache
├─ Hibernate L2 cache (TODO)
├─ Query result cache
└─ Connection pooling (HikariCP)

Layer 5: Client-Side Cache
├─ React Query cache (5 min)
├─ AsyncStorage (mobile)
└─ Optimistic updates
```

---

## API Specification

### REST API Endpoints

**Base URL:** `https://attendly-backend-1ckt.onrender.com/api`

#### Authentication Endpoints

```
POST   /auth/signup
POST   /auth/login
POST   /auth/user/login
POST   /auth/request-password-reset
POST   /auth/reset-password
POST   /auth/verify-otp
```

#### Admin Endpoints

```
# Departments
GET    /admin/departments
POST   /admin/departments
PUT    /admin/departments/{id}
DELETE /admin/departments/{id}

# Classes
GET    /admin/classes
GET    /admin/classes/department/{departmentId}
POST   /admin/classes
PUT    /admin/classes/{id}
DELETE /admin/classes/{id}

# Teachers
GET    /admin/teachers
GET    /admin/teachers/department/{departmentId}
POST   /admin/teachers
PUT    /admin/teachers/{id}
DELETE /admin/teachers/{id}

# Students
GET    /admin/students
GET    /admin/students/class/{classId}
POST   /admin/students
PUT    /admin/students/{id}
DELETE /admin/students/{id}

# Timetable
GET    /admin/timetable/class/{classId}
GET    /admin/timetable/class/{classId}/day/{day}
POST   /admin/timetable
PUT    /admin/timetable/{id}
DELETE /admin/timetable/{id}

# Attendance
POST   /admin/attendance/mark
POST   /admin/attendance/mark/bulk
GET    /admin/attendance/student/{studentId}
GET    /admin/attendance/slot/{slotId}
```

#### Student Endpoints

```
GET    /student/timetable
GET    /student/timetable?date=YYYY-MM-DD
GET    /student/attendance
GET    /student/attendance/today
GET    /student/profile
PUT    /student/profile
```

### API Response Format

**Success Response:**
```json
{
  "id": 1,
  "name": "Computer Science",
  "code": "CS",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

**Error Response:**
```json
{
  "timestamp": "2026-01-06T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/admin/departments"
}
```

---

## Monitoring Dashboard

### Key Metrics to Track

**Application Metrics:**
- Request rate (req/min)
- Error rate (%)
- P50/P95/P99 latency
- Active connections

**Infrastructure Metrics:**
- CPU usage (%)
- Memory usage (MB)
- Disk usage (%)
- Network I/O

**Business Metrics:**
- Active users (daily/monthly)
- API calls by endpoint
- Student enrollment count
- Attendance marking frequency

---

## Conclusion

This architecture provides a solid foundation for Attendly with:

 **Scalability:** Cloud-native design supports growth  
 **Security:** Multi-layer security with JWT auth  
 **Reliability:** Automated backups and health monitoring  
 **Maintainability:** Clear separation of concerns  
 **Performance:** CDN caching and efficient API design  
 **Cost-Effective:** Free tier with upgrade path  

### Future Enhancements

1. Implement Redis caching layer
2. Add Elasticsearch for advanced search
3. Implement WebSocket for real-time updates
4. Add Prometheus + Grafana monitoring
5. Implement rate limiting middleware
6. Add comprehensive API documentation (Swagger)
7. Implement blue-green deployment strategy
8. Add automated database migration tools

---
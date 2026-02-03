# Attendly – System Architecture Documentation

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

Attendly is a distributed, microservices-based attendance and timetable management system designed for educational institutions. The system follows a three-tier architecture with clearly separated frontend, backend, and database layers.

### System Characteristics

* **Architecture Style:** RESTful API with MVC pattern
* **Deployment Model:** Multi-cloud (Vercel + Render)
* **Database:** PostgreSQL (ACID-compliant)
* **Authentication:** Stateless JWT-based authentication
* **Scalability:** Horizontal scaling on Render, Edge CDN on Vercel
* **High Availability:** Target 99.9% uptime SLA

---

## System Architecture

### Complete System Diagram

```
ATTENDLY ECOSYSTEM

Clients
  ├─ Web (Admin / Teacher / Student) – React 18 + TypeScript
  ├─ Web (Teacher) – React 18 + TypeScript
  └─ Mobile (Student) – React Native + Expo SDK 51
        │
        ▼
Vercel Edge Network
  ├─ Global CDN
  ├─ Edge Functions
  ├─ Static Assets
  ├─ Auto SSL/TLS
  └─ DDoS Protection
        │
        ▼
Backend (Render)
  └─ Spring Boot Application
       ├─ Spring Security + JWT Filter
       ├─ REST Controllers (Admin / Teacher / Student)
       ├─ Service Layer (Business Logic, Validation, Email)
       └─ Repository Layer (JPA / Hibernate)
        │
        ▼
Database (Render)
  └─ PostgreSQL 15
       ├─ Managed Instance
       ├─ Automated Backups
       ├─ Point-in-Time Recovery
       └─ SSL Encryption
```

### Core Database Tables

* `admins`
* `departments`
* `teachers`
* `classes`
* `students`
* `timetable_slots`
* `attendance`

---

## CI/CD Pipeline

### Pipeline Overview

```
Pull Request
  ├─ Backend Validation (JUnit + Maven)
  ├─ Frontend Validation (Lint + Build)
  └─ Vercel Preview Deployment

Merge to main
  ├─ Backend Deployment (Render)
  ├─ APK Build & GitHub Release (Expo EAS)
  └─ Frontend Deployment (Vercel Production)
```

### GitHub Actions – PR Validation

* Backend

  * JDK 17 setup
  * `mvn clean verify`
  * Unit tests (JUnit)
  * JAR build

* Frontend

  * Node.js 20
  * `npm ci`
  * Lint + production build

* Preview

  * Vercel preview deployment
  * Automatic PR comment with preview URL

### Production Deployment

* Backend

  * Render deploy hook
  * Docker build
  * Health checks
  * Rolling deployment

* Mobile

  * Expo EAS Android build
  * APK versioning
  * GitHub Release creation

* Frontend

  * Triggered on `landing-page/**` changes
  * Vercel production deployment

### Deployment Matrix

| Environment | URL                 | Database         | Trigger       | Rollback |
| ----------- | ------------------- | ---------------- | ------------- | -------- |
| Local       | localhost:5173      | Local PostgreSQL | Manual        | N/A      |
| Production  | attendly.vercel.app | Prod DB          | Merge to main | Manual   |

---

## Security Architecture

### Authentication Flow

1. Client submits credentials to `/auth/login`
2. Backend validates user via PostgreSQL
3. Password verification using BCrypt
4. JWT issued with claims:

   * Subject (email)
   * Role
   * Issued-at timestamp
   * Expiration timestamp
5. Client stores JWT
6. JWT sent via `Authorization: Bearer <token>` header
7. Spring Security filter validates JWT on each request

### Security Measures

* HTTPS enforced (TLS 1.2+)
* Stateless JWT authentication
* BCrypt password hashing
* Role-based access control (RBAC)
* Secure database connections (SSL)

---

## Performance & Scalability

### Current Capacity (Free Tier)

* Concurrent users: 50–100
* Requests per second: 10–20
* Avg response time: 200–500 ms
* Max DB connections: 97

### Horizontal Scaling Strategy

* Upgrade Render instance (2 GB RAM)
* Add multiple backend instances
* Enable load balancing
* Use HikariCP connection pooling

**HikariCP Configuration:**

* Max pool size: 20 per instance
* Min idle: 5
* Connection timeout: 30s

---

## Caching Strategy

1. **Browser Cache**

   * Static assets
   * Cache-Control: `max-age=31536000`

2. **CDN Cache (Vercel)**

   * HTML: 1 hour
   * Static assets: long-lived

3. **API Cache (Planned)**

   * Redis + Spring Cache
   * Departments / Classes: 5 min
   * Timetable: 1 hour

4. **Client Cache**

   * React Query
   * AsyncStorage (mobile)

---

## API Architecture

**Base URL:** `https://attendly-backend-1ckt.onrender.com/api`

### Authentication

```
POST /auth/signup
POST /auth/login
POST /auth/user/login
POST /auth/request-password-reset
POST /auth/reset-password
POST /auth/verify-otp
```

### Admin APIs

* Departments
* Classes
* Teachers
* Students
* Timetable
* Attendance

(Full CRUD supported as per REST conventions.)

### Student APIs

```
GET /student/timetable
GET /student/attendance
GET /student/profile
PUT /student/profile
```

### API Response Format

**Success**

```json
{
  "id": 1,
  "name": "Computer Science",
  "code": "CS",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

**Error**

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

## Monitoring & Observability

### Metrics

* Request rate
* Error rate
* Latency (P50 / P95 / P99)
* CPU & memory usage
* Active users
* Attendance activity

---

## Conclusion

Attendly’s architecture is cloud-native, scalable, and production-ready.

### Strengths

* Clear separation of concerns
* Secure authentication
* Automated CI/CD
* Cost-efficient scaling path

### Planned Enhancements

1. Redis caching
2. Elasticsearch
3. WebSocket-based real-time updates
4. Prometheus + Grafana
5. Rate limiting
6. Swagger/OpenAPI documentation
7. Blue-green deployments
8. Automated DB migrations

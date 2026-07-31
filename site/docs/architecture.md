# NEET/JEE Preparation Platform - System Architecture

## Executive Summary

This document outlines the complete system architecture for India's most structured free NEET/JEE preparation platform. The platform is designed to serve millions of students with a scalable, performant, and maintainable architecture.

---

## 1. High-Level Architecture Overview

### 1.1 System Architecture Diagram

```mermaid
graph TB
    subgraph Client Layer
        WEB[Web Browser]
        MOBILE[Mobile Browser]
    end

    subgraph CDN Layer
        CLOUDINARY[Cloudinary - PDF/Media Storage]
        VERCEL[Vercel Edge Network]
    end

    subgraph Frontend - Next.js
        PAGES[Pages - SSR/SSG]
        COMPONENTS[React Components]
        STATE[State Management]
        API_CLIENT[API Client]
    end

    subgraph Backend - Node.js/Express
        AUTH[Auth Service]
        USER[User Service]
        CONTENT[Content Service]
        TEST[Test Service]
        AI[AI Service]
        ANALYTICS[Analytics Service]
    end

    subgraph Database Layer
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis Cache)]
    end

    subgraph External Services
        JWT[JWT Auth]
        YOUTUBE[YouTube API]
        AI_API[AI/LLM API]
    end

    WEB --> VERCEL
    MOBILE --> VERCEL
    VERCEL --> PAGES
    PAGES --> COMPONENTS
    COMPONENTS --> STATE
    STATE --> API_CLIENT
    API_CLIENT --> AUTH
    API_CLIENT --> USER
    API_CLIENT --> CONTENT
    API_CLIENT --> TEST
    API_CLIENT --> AI
    AUTH --> JWT
    AUTH --> POSTGRES
    USER --> POSTGRES
    USER --> REDIS
    CONTENT --> POSTGRES
    CONTENT --> CLOUDINARY
    TEST --> POSTGRES
    TEST --> REDIS
    AI --> AI_API
    ANALYTICS --> POSTGRES
    CONTENT --> YOUTUBE
```

### 1.2 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend Framework | Next.js 14+ | SSR, SSG, App Router, SEO optimization |
| Styling | Tailwind CSS | Utility-first CSS, dark/light themes |
| Animations | Framer Motion | Smooth UI transitions |
| Backend Runtime | Node.js | JavaScript runtime |
| Backend Framework | Express.js | REST API server |
| Primary Database | PostgreSQL | Relational data, ACID compliance |
| Caching | Redis | Session storage, rate limiting, caching |
| Authentication | JWT | Stateless authentication |
| File Storage | Cloudinary | PDF uploads, image optimization |
| Hosting - Frontend | Vercel | Edge deployment, automatic SSL |
| Hosting - Backend | Railway/Render | Containerized deployment |

---

## 2. Core System Components

### 2.1 Frontend Architecture

#### Next.js App Router Structure

```mermaid
graph LR
    subgraph App Router
        LAYOUT[Root Layout]
        PAGE[Page Components]
        LOADING[Loading States]
        ERROR[Error Boundaries]
        API[API Routes]
    end

    subgraph Rendering Strategies
        SSR[Server-Side Rendering]
        SSG[Static Site Generation]
        ISR[Incremental Static Regeneration]
        CSR[Client-Side Rendering]
    end

    LAYOUT --> SSR
    PAGE --> SSG
    PAGE --> SSR
    PAGE --> CSR
    LOADING --> CSR
    ERROR --> CSR
    API --> SSR
```

#### Page Rendering Strategy

| Page | Strategy | Reason |
|------|----------|--------|
| `/` Landing | SSG | Static content, SEO critical |
| `/dashboard` | SSR | User-specific data |
| `/neet`, `/jee` | SSG + ISR | Semi-static content |
| `/pyqs` | SSR | Filterable content |
| `/mock-tests` | SSR | User-specific tests |
| `/resources` | SSG + ISR | Static resources |
| `/revision` | SSR | User-specific revision |
| `/profile` | SSR | User data |
| `/admin` | SSR | Admin operations |

### 2.2 Backend Architecture

#### Service-Oriented Architecture

```mermaid
graph TB
    subgraph API Gateway
        GATEWAY[Express Router]
        MIDDLEWARE[Middleware Stack]
    end

    subgraph Core Services
        AUTH_SVC[Authentication Service]
        USER_SVC[User Management Service]
        CHAPTER_SVC[Chapter Service]
        QUESTION_SVC[Question Service]
        TEST_SVC[Test Service]
        MISTAKE_SVC[Mistake Notebook Service]
        RESOURCE_SVC[Resource Service]
        AI_SVC[AI Integration Service]
        ANALYTICS_SVC[Analytics Service]
    end

    subgraph Shared Utilities
        VALIDATOR[Request Validator]
        LOGGER[Winston Logger]
        CACHE[Cache Manager]
        ERROR_HANDLER[Error Handler]
    end

    GATEWAY --> MIDDLEWARE
    MIDDLEWARE --> AUTH_SVC
    MIDDLEWARE --> USER_SVC
    MIDDLEWARE --> CHAPTER_SVC
    MIDDLEWARE --> QUESTION_SVC
    MIDDLEWARE --> TEST_SVC
    MIDDLEWARE --> MISTAKE_SVC
    MIDDLEWARE --> RESOURCE_SVC
    MIDDLEWARE --> AI_SVC
    MIDDLEWARE --> ANALYTICS_SVC

    AUTH_SVC --> VALIDATOR
    USER_SVC --> VALIDATOR
    CHAPTER_SVC --> VALIDATOR
    QUESTION_SVC --> VALIDATOR
    TEST_SVC --> VALIDATOR
    MISTAKE_SVC --> VALIDATOR
    RESOURCE_SVC --> VALIDATOR
    AI_SVC --> VALIDATOR
    ANALYTICS_SVC --> VALIDATOR

    VALIDATOR --> LOGGER
    LOGGER --> CACHE
    CACHE --> ERROR_HANDLER
```

---

## 3. Authentication & Authorization

### 3.1 JWT Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Backend
    participant Database
    participant Redis

    Client->>Frontend: Login Request
    Frontend->>Backend: POST /api/auth/login
    Backend->>Database: Verify Credentials
    Database-->>Backend: User Data
    Backend->>Backend: Generate JWT Tokens
    Backend->>Redis: Store Refresh Token
    Backend-->>Frontend: Access Token + Refresh Token
    Frontend->>Client: Store Tokens - HttpOnly Cookie

    Note over Client,Redis: Subsequent Requests

    Client->>Frontend: API Request
    Frontend->>Backend: Request + Access Token
    Backend->>Backend: Verify Access Token
    Backend-->>Frontend: Response
    Frontend-->>Client: Data

    Note over Client,Redis: Token Refresh Flow

    Client->>Backend: POST /api/auth/refresh
    Backend->>Redis: Validate Refresh Token
    Redis-->>Backend: Valid
    Backend->>Backend: Generate New Access Token
    Backend-->>Frontend: New Access Token
```

### 3.2 Token Strategy

| Token Type | Lifetime | Storage | Purpose |
|------------|----------|---------|---------|
| Access Token | 15 minutes | Memory/State | API authentication |
| Refresh Token | 7 days | HttpOnly Cookie | Token renewal |
| Reset Token | 1 hour | Database | Password reset |

### 3.3 Role-Based Access Control

```mermaid
graph TB
    subgraph Roles
        GUEST[Guest]
        STUDENT[Student]
        PREMIUM[Premium Student]
        ADMIN[Admin]
    end

    subgraph Permissions
        VIEW_CONTENT[View Free Content]
        TAKE_TEST[Take Tests]
        SAVE_MISTAKES[Save Mistakes]
        AI_HELP[AI Doubt Help]
        VIEW_PREMIUM[View Premium Content]
        MANAGE_USERS[Manage Users]
        MANAGE_CONTENT[Manage Content]
        VIEW_ANALYTICS[View Analytics]
    end

    GUEST --> VIEW_CONTENT
    STUDENT --> VIEW_CONTENT
    STUDENT --> TAKE_TEST
    STUDENT --> SAVE_MISTAKES
    PREMIUM --> VIEW_CONTENT
    PREMIUM --> TAKE_TEST
    PREMIUM --> SAVE_MISTAKES
    PREMIUM --> AI_HELP
    PREMIUM --> VIEW_PREMIUM
    ADMIN --> MANAGE_USERS
    ADMIN --> MANAGE_CONTENT
    ADMIN --> VIEW_ANALYTICS
```

---

## 4. Data Flow Architecture

### 4.1 Request Processing Pipeline

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Controller
    participant Service
    participant Repository
    participant Database

    Client->>Middleware: HTTP Request
    Middleware->>Middleware: Rate Limiting
    Middleware->>Middleware: Authentication
    Middleware->>Middleware: Request Validation
    Middleware->>Controller: Validated Request
    Controller->>Service: Business Logic Call
    Service->>Repository: Data Operation
    Repository->>Database: Query
    Database-->>Repository: Result
    Repository-->>Service: Data
    Service-->>Controller: Processed Data
    Controller-->>Middleware: Response
    Middleware-->>Client: HTTP Response
```

### 4.2 Caching Strategy

```mermaid
graph TB
    subgraph Cache Layers
        BROWSER[Browser Cache]
        CDN[CDN Cache - Vercel Edge]
        APP[Application Cache - Redis]
        DB[Database Query Cache]
    end

    subgraph Cache Rules
        STATIC[Static Content - 1 year]
        SEMI_STATIC[Semi-Static - 1 hour]
        DYNAMIC[Dynamic Content - 5 minutes]
        NO_CACHE[User-Specific - No Cache]
    end

    BROWSER --> STATIC
    CDN --> STATIC
    CDN --> SEMI_STATIC
    APP --> SEMI_STATIC
    APP --> DYNAMIC
    DB --> DYNAMIC
    NO_CACHE --> APP
```

---

## 5. Feature Architecture

### 5.1 Smart Dashboard

```mermaid
graph TB
    subgraph Dashboard Components
        PROGRESS[Chapter Progress Tracker]
        SCORES[Mock Score History]
        WEAK[Weak Chapter Detection]
        STREAKS[Study Streaks]
        SUGGESTIONS[AI Revision Suggestions]
    end

    subgraph Data Sources
        USER_PROGRESS[User Progress Table]
        TEST_RESULTS[Test Results Table]
        CHAPTER_STATS[Chapter Statistics]
        USER_ACTIVITY[User Activity Log]
    end

    PROGRESS --> USER_PROGRESS
    SCORES --> TEST_RESULTS
    WEAK --> USER_PROGRESS
    WEAK --> CHAPTER_STATS
    STREAKS --> USER_ACTIVITY
    SUGGESTIONS --> USER_PROGRESS
    SUGGESTIONS --> TEST_RESULTS
```

### 5.2 PYQ Engine Architecture

```mermaid
graph TB
    subgraph PYQ Filters
        YEAR[Year Filter]
        CHAPTER[Chapter Filter]
        DIFFICULTY[Difficulty Filter]
        EXAM_TYPE[Exam Type - NEET/JEE]
        TOPIC[Topic Filter]
    end

    subgraph Question Processing
        QUERY[Query Builder]
        PAGINATION[Pagination Handler]
        CACHE[Cache Layer]
    end

    subgraph Question Data
        QUESTIONS[Questions Table]
        OPTIONS[Options Table]
        SOLUTIONS[Solutions Table]
        METADATA[Question Metadata]
    end

    YEAR --> QUERY
    CHAPTER --> QUERY
    DIFFICULTY --> QUERY
    EXAM_TYPE --> QUERY
    TOPIC --> QUERY
    QUERY --> CACHE
    CACHE --> PAGINATION
    PAGINATION --> QUESTIONS
    QUESTIONS --> OPTIONS
    QUESTIONS --> SOLUTIONS
    QUESTIONS --> METADATA
```

### 5.3 Mock Test System

```mermaid
sequenceDiagram
    participant Student
    participant Frontend
    participant Backend
    participant Database
    participant Timer

    Student->>Frontend: Start Mock Test
    Frontend->>Backend: POST /api/tests/start
    Backend->>Database: Create Test Attempt
    Backend->>Database: Fetch Questions
    Backend-->>Frontend: Test Session + Questions
    Frontend->>Timer: Start Countdown

    loop For Each Question
        Student->>Frontend: Select Answer
        Frontend->>Backend: PUT /api/tests/answer
        Backend->>Database: Save Answer
    end

    Student->>Frontend: Submit Test
    Frontend->>Backend: POST /api/tests/submit
    Backend->>Database: Calculate Results
    Backend->>Database: Update Statistics
    Backend-->>Frontend: Results + Analysis
    Frontend-->>Student: Display Results
```

### 5.4 Error Notebook System

```mermaid
graph TB
    subgraph Mistake Capture
        FROM_TEST[From Test Results]
        FROM_PYQ[From PYQ Practice]
        MANUAL[Manual Entry]
    end

    subgraph Mistake Data
        QUESTION[Question Reference]
        USER_ANSWER[User Answer]
        CORRECT_ANSWER[Correct Answer]
        EXPLANATION[Explanation]
        TAGS[Tags/Topics]
        NOTES[User Notes]
    end

    subgraph Revision Features
        SPACED[Spaced Repetition]
        FILTER[Filter by Topic]
        QUIZ[Revision Quiz Mode]
    end

    FROM_TEST --> QUESTION
    FROM_PYQ --> QUESTION
    MANUAL --> QUESTION
    QUESTION --> USER_ANSWER
    QUESTION --> CORRECT_ANSWER
    QUESTION --> EXPLANATION
    QUESTION --> TAGS
    QUESTION --> NOTES

    USER_ANSWER --> SPACED
    TAGS --> FILTER
    SPACED --> QUIZ
```

---

## 6. Performance Architecture

### 6.1 Frontend Performance

| Optimization | Implementation |
|--------------|----------------|
| Code Splitting | Dynamic imports per route |
| Image Optimization | Next.js Image component |
| Font Optimization | Next.js Font optimization |
| Bundle Analysis | Webpack bundle analyzer |
| Lazy Loading | React.lazy for heavy components |
| Prefetching | Link prefetching for navigation |

### 6.2 Backend Performance

| Optimization | Implementation |
|--------------|----------------|
| Connection Pooling | pg-pool for PostgreSQL |
| Query Optimization | Indexed queries, query planning |
| Response Compression | gzip/brotli compression |
| Rate Limiting | express-rate-limit |
| Request Batching | DataLoader for N+1 queries |
| Caching | Redis for frequent queries |

### 6.3 Database Performance

```mermaid
graph TB
    subgraph Indexing Strategy
        PRIMARY[Primary Keys]
        FOREIGN[Foreign Keys]
        SEARCH[Search Indexes]
        COMPOSITE[Composite Indexes]
    end

    subgraph Query Optimization
        PREPARED[Prepared Statements]
        VIEWS[Materialized Views]
        PARTITION[Table Partitioning]
    end

    subgraph Scaling Strategy
        READ_REPLICA[Read Replicas]
        CONNECTION_POOL[Connection Pooling]
        SHARDING[Future Sharding]
    end

    PRIMARY --> PREPARED
    FOREIGN --> PREPARED
    SEARCH --> VIEWS
    COMPOSITE --> VIEWS
    VIEWS --> READ_REPLICA
    PREPARED --> CONNECTION_POOL
    READ_REPLICA --> SHARDING
```

---

## 7. Security Architecture

### 7.1 Security Layers

```mermaid
graph TB
    subgraph Network Security
        HTTPS[HTTPS/TLS]
        CORS[CORS Policy]
        CSP[Content Security Policy]
    end

    subgraph Application Security
        INPUT[Input Validation]
        SANITIZE[Output Sanitization]
        AUTH_CHECK[Authorization Checks]
        CSRF[CSRF Protection]
    end

    subgraph Data Security
        ENCRYPT[Encryption at Rest]
        HASH[Password Hashing - bcrypt]
        TOKEN[Secure Token Storage]
        BACKUP[Encrypted Backups]
    end

    HTTPS --> INPUT
    CORS --> INPUT
    CSP --> SANITIZE
    INPUT --> AUTH_CHECK
    SANITIZE --> AUTH_CHECK
    AUTH_CHECK --> CSRF
    CSRF --> ENCRYPT
    ENCRYPT --> HASH
    HASH --> TOKEN
    TOKEN --> BACKUP
```

### 7.2 Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| Strict-Transport-Security | max-age=31536000 | Force HTTPS |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | XSS protection |
| Content-Security-Policy | default-src self | Resource control |

---

## 8. Deployment Architecture

### 8.1 CI/CD Pipeline

```mermaid
graph LR
    subgraph Development
        CODE[Code Push]
        LINT[Linting]
        TEST[Testing]
        BUILD[Build]
    end

    subgraph Staging
        DEPLOY_STG[Deploy to Staging]
        E2E[E2E Tests]
        REVIEW[Code Review]
    end

    subgraph Production
        DEPLOY_PROD[Deploy to Production]
        MONITOR[Monitoring]
        ALERTS[Alerts]
    end

    CODE --> LINT
    LINT --> TEST
    TEST --> BUILD
    BUILD --> DEPLOY_STG
    DEPLOY_STG --> E2E
    E2E --> REVIEW
    REVIEW --> DEPLOY_PROD
    DEPLOY_PROD --> MONITOR
    MONITOR --> ALERTS
```

### 8.2 Infrastructure

```mermaid
graph TB
    subgraph Production Environment
        subgraph Vercel
            EDGE[Edge Network]
            FRONTEND[Next.js App]
            FUNCTIONS[Serverless Functions]
        end

        subgraph Railway/Render
            API[Express API Server]
            WORKERS[Background Workers]
        end

        subgraph Database
            POSTGRES_PROD[PostgreSQL Primary]
            POSTGRES_REPLICA[PostgreSQL Replica]
            REDIS_PROD[Redis Cluster]
        end

        subgraph Storage
            CLOUDINARY_PROD[Cloudinary]
        end
    end

    EDGE --> FRONTEND
    FRONTEND --> FUNCTIONS
    FUNCTIONS --> API
    API --> POSTGRES_PROD
    API --> REDIS_PROD
    POSTGRES_PROD --> POSTGRES_REPLICA
    API --> CLOUDINARY_PROD
    WORKERS --> POSTGRES_PROD
    WORKERS --> REDIS_PROD
```

---

## 9. Monitoring & Observability

### 9.1 Logging Strategy

| Log Level | Use Case | Storage |
|-----------|----------|---------|
| ERROR | Application errors, exceptions | Persistent + Alerts |
| WARN | Deprecations, potential issues | Persistent |
| INFO | Request logs, business events | Rotating logs |
| DEBUG | Development debugging | Development only |

### 9.2 Metrics Collection

```mermaid
graph TB
    subgraph Application Metrics
        REQ_LATENCY[Request Latency]
        REQ_RATE[Request Rate]
        ERROR_RATE[Error Rate]
        ACTIVE_USERS[Active Users]
    end

    subgraph Infrastructure Metrics
        CPU[CPU Usage]
        MEMORY[Memory Usage]
        DISK[Disk I/O]
        NETWORK[Network I/O]
    end

    subgraph Business Metrics
        TESTS_TAKEN[Tests Taken]
        QUESTIONS_SOLVED[Questions Solved]
        USER_SIGNUPS[User Signups]
        RETENTION[User Retention]
    end

    REQ_LATENCY --> DASHBOARD[Monitoring Dashboard]
    REQ_RATE --> DASHBOARD
    ERROR_RATE --> DASHBOARD
    ACTIVE_USERS --> DASHBOARD
    CPU --> DASHBOARD
    MEMORY --> DASHBOARD
    DISK --> DASHBOARD
    NETWORK --> DASHBOARD
    TESTS_TAKEN --> DASHBOARD
    QUESTIONS_SOLVED --> DASHBOARD
    USER_SIGNUPS --> DASHBOARD
    RETENTION --> DASHBOARD
```

---

## 10. Scalability Considerations

### 10.1 Horizontal Scaling

- **Frontend**: Vercel automatically scales with edge deployment
- **Backend**: Stateless API servers behind load balancer
- **Database**: Read replicas for read-heavy operations
- **Cache**: Redis cluster for distributed caching

### 10.2 Future Enhancements

| Enhancement | Trigger Condition | Implementation |
|-------------|-------------------|----------------|
| Database Sharding | > 1M users | Shard by user_id |
| Message Queue | High async tasks | Bull/BullMQ with Redis |
| Microservices | Complex domain | Split services |
| GraphQL | Complex queries | Add GraphQL layer |
| CDN for API | Global users | Edge functions |

---

## 11. Design Principles

### 11.1 UI/UX Philosophy

Following Stripe.com-style minimal design principles:

- **Clean Typography**: Inter font, clear hierarchy
- **Generous Whitespace**: Focus on content
- **Subtle Animations**: Framer Motion micro-interactions
- **Dark/Light Theme**: System preference detection
- **Mobile-First**: Responsive design priority

### 11.2 Code Quality Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent formatting
- **Husky**: Pre-commit hooks
- **Testing**: Jest + React Testing Library

---

## 12. Error Handling Patterns

### 12.1 Error Response Structure

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "requestId": "req_abc123"
}
```

### 12.2 Error Categories

| Category | HTTP Status | Example Codes |
|----------|-------------|---------------|
| Validation | 400 | VALIDATION_ERROR, INVALID_INPUT |
| Authentication | 401 | UNAUTHORIZED, TOKEN_EXPIRED |
| Authorization | 403 | FORBIDDEN, INSUFFICIENT_PERMISSIONS |
| Not Found | 404 | USER_NOT_FOUND, RESOURCE_NOT_FOUND |
| Conflict | 409 | DUPLICATE_ENTRY, EMAIL_EXISTS |
| Server Error | 500 | INTERNAL_ERROR, DATABASE_ERROR |

---

## 13. SEO Optimization Strategy

### 13.1 Technical SEO

- **Server-Side Rendering**: Critical pages SSR
- **Meta Tags**: Dynamic meta per page
- **Sitemap**: Auto-generated sitemap.xml
- **Robots.txt**: Proper crawling rules
- **Structured Data**: JSON-LD for rich snippets

### 13.2 Content SEO

- **URL Structure**: Clean, descriptive URLs
- **Heading Hierarchy**: Proper H1-H6 usage
- **Image Alt Text**: Descriptive alt attributes
- **Page Speed**: Core Web Vitals optimization
- **Mobile Friendly**: Responsive design

---

## 14. Conclusion

This architecture provides a solid foundation for building a scalable, performant, and maintainable NEET/JEE preparation platform. The modular design allows for incremental development and future enhancements while maintaining code quality and user experience standards.

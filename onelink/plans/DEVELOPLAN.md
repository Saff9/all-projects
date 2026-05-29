# Developer Plan: Migrating from Firebase to Neo4j

## 1. Overview

This document outlines the plan to migrate OneLink from Firebase (Firestore, Auth, Storage, Functions) to a Neon -based graph database with a custom backend. The migration aims to leverage Neo4j's relationship capabilities for improved data modeling, performance, and scalability while maintaining or enhancing existing features.

## 2. Authentication Migration

### Current State
- Firebase Auth handles email/password, Google, and other OAuth providers.
- User data (UID, email, displayName, etc.) stored in Firestore `users` collection.

### Migration Plan
- Replace Firebase Auth with a custom authentication system using Neon  for user storage.
- Implement JWT-based authentication for stateless verification.
- Integrate with OAuth providers (Google, etc.) directly via OAuth 2.0 flows, storing user info in Neon.
- Password handling: Use bcrypt for secure password hashing and storage in Neo4j.
- Maintain security best practices: rate limiting, secure headers, etc.

### Neo4j User Model
- Node: `User` with properties: `userId` (UUID), `email`, `passwordHash`, `displayName`, `photoURL`, `username`, `createdAt`, `updatedAt`, `subscription`, `settings`, `socialConnections`.
- Unique constraints on `email` and `username`.

## 3. Data Storage Migration (to Neo4j)

### Current State
- Firestore collections: `users`, `profiles`, `links`, `analytics`, `templates`, `themes`.

### Migration Plan
- Migrate all data to Neo4j using a graph model that emphasizes relationships.
- Design nodes and relationships to efficiently traverse and query interconnected data.
- Use Neo4j's ACID transactions for data integrity.

### Proposed Neo4j Data Model

#### Nodes
- `User`: Authentication and account info.
- `Profile`: User's link-in-bio page.
- `Link`: Individual links on a profile.
- `Template`: Pre-designed layouts.
- `Theme`: Customizable styling options.
- `AnalyticsEvent`: Individual view/click events (optional, see note below).
- `Visitor`: Aggregated visitor data for privacy (hashed IP, user agent, etc.).

#### Relationships
- `(User)-[:HAS_PROFILE]->(Profile)`
- `(Profile)-[:USES_TEMPLATE]->(Template)`
- `(Profile)-[:HAS_THEME]->(Theme)`
- `(Profile)-[:HAS_LINK]->(Link)`
- `(Link)-[:BELONGS_TO]->(Profile)`
- For analytics: `(Link)-[:HAS_EVENT]->(AnalyticsEvent)` or aggregate via `Visitor` nodes.

### Data Model Improvements
- **Denormalization Reduction**: Leverage relationships to avoid data duplication (e.g., a `Profile` node directly links to its `User` via `HAS_PROFILE`).
- **Traversal Efficiency**: Efficiently fetch a profile with all its links and analytics by traversing relationships.
- **Flexible Schema**: Easy to add new node types or relationships without schema migrations.
- **Analytics Enhancement**: Model complex analytics paths (e.g., `(Visitor)-[:VIEWED]->(Profile)`, `(Visitor)-[:CLICKED]->(Link)`) for deeper insights.

## 4. File Storage Migration

### Current State
- Firebase Storage stores user-uploaded files (profile images, cover images, icons, etc.).

### Migration Plan
- Replace Firebase Storage with a third-party object storage service (e.g., AWS S3, Cloudinary, or similar).
- Store file metadata (URL, filename, upload date) in Neon  as properties on relevant nodes (e.g., `Profile.avatarURL`, `Profile.coverImageURL`, `Link.iconURL`).
- Implement secure, signed URLs for file access if needed.
- Maintain existing file organization and access patterns.

## 5. Functions Migration (Cloud Functions to Custom Backend)

### Current State
- Cloud Functions handle API routes, analytics processing, QR code generation, etc.

### Migration Plan
- Replace Cloud Functions with a custom backend (Node.js/Express) deployed on a platform like Vercel, AWS Elastic Beanstalk, or a VPS.
- Alternatively, use serverless functions on the chosen platform (e.g., Vercel Serverless Functions, AWS Lambda) that interact with Neo4j.
- Reimplement each Firebase Function:
  - API Routes: Create REST or GraphQL endpoints for frontend consumption.
  - Analytics: Process events and store in Neon (or update aggregated counters).
  - QR Code Generation: Use a library like `qrcode` to generate QR codes on demand.
  - Other functions (e.g., email sending) replaced with appropriate services (e.g., SendGrid, SMTP).

### Backend Architecture
- RESTful API or GraphQL API layer.
- Neo4j driver for database interactions.
- Modular services for auth, profiles, links, analytics, etc.
- Error handling, logging, and monitoring.

## 6. Overall Architecture Post-Migration

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React.js Frontend                     │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │    │
│  │  │  Home   │ │Dashboard│ │ Editor  │ │Analytics│       │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │    │
│  │  │  Auth   │ │ Profile │ │Templates│ │  QR/OG  │       │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICES                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Neon     │ │ Object       │ │   Custom     │            │
│  │   Database   │ │ Storage (S3) │ │   Backend    │            │
│  │  - Nodes     │ │  - Images    │ │  - API Routes│            │
│  │  - Relationships│ │  - Files   │ │  - Auth      │            │
│  │  - Queries   │ │              │ │  - Analytics │            │
│  └──────────────┘ └──────────────┘ │  - QR Gen    │            │
│                                    └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 7. Migration Steps (Phased Approach)

### Phase 0: Preparation
- [ ] Set up Neon instance (AuraDB or self-managed).
- [ ] Choose and configure object storage service.
- [ ] Design detailed Neo4j schema and relationships.
- [ ] Develop data migration scripts (Firestore to Neo4j).
- [ ] Set up backend project structure.

### Phase 1: Authentication Migration
- [ ] Implement custom auth (JWT, password hashing) with Neon User storage.
- [ ] Integrate OAuth providers.
- [ ] Update AuthContext and auth-related components (LoginForm, RegisterForm, etc.).
- [ ] Test authentication flows.
- [ ] Switch frontend to use new auth backend.

### Phase 2: Data Storage Migration (Core)
- [ ] Migrate User and Profile data to Neon.
- [ ] Implement backend services for profiles and links.
- [ ] Update frontend to consume new profile/link APIs.
- [ ] Test profile creation, editing, and linking.

### Phase 3: File Storage Migration
- [ ] Configure object storage service.
- [ ] Update file upload handlers to use new storage.
- [ ] Migrate existing files (if any) to new storage.
- [ ] Update frontend components that handle file uploads (avatar, cover, icons).

### Phase 4: Analytics Migration
- [ ] Design analytics model in Neo4j (events or aggregated).
- [ ] Implement analytics tracking backend.
- [ ] Update frontend to send analytics events to new backend.
- [ ] Test analytics collection and reporting.

### Phase 5: Template and Theme Data
- [ ] Migrate templates and themes to Neo4j.
- [ ] Update template/theme selection and customization features.

### Phase 6: Cloud Functions Replacement
- [ ] Reimplement each Cloud Function as a backend endpoint or serverless function.
- [ ] Test all API routes (QR code generation, etc.).
- [ ] Ensure feature parity.

### Phase 7: Testing and Optimization
- [ ] Conduct integration testing.
- [ ] Performance testing and query optimization (Neo4j indexes).
- [ ] Security audit.
- [ ] Load testing.

### Phase 8: Cutover
- [ ] Final data synchronization.
- [ ] Switch DNS to new backend.
- [ ] Monitor for issues.

## 8. Risks and Mitigations

- **Data Loss**: Mitigation - Backups, phased migration with rollback plan.
- **Performance Issues**: Mitigation - Neon indexing, query profiling, caching.
- **Authentication Security**: Mitigation - Follow OWASP standards, use well-vetted libraries.
- **File Storage Costs**: Mitigation - Choose cost-effective storage, implement lifecycle policies.
- **Learning Curve**: Mitigation - Training on Neo4j and Cypher, documentation.

## 9. Timeline

Estimated timeline: 10-12 weeks for a team of 2-3 developers.

- Weeks 1-2: Preparation and Phase 0.
- Weeks 3-4: Phase 1.
- Weeks 5-6: Phase 2.
- Week 7: Phase 3.
- Weeks 8-9: Phase 4 and 5.
- Weeks 10-11: Phase 6.
- Week 12: Phase 7 and 8.

## 10. Conclusion

Migrating to Neon will provide OneLink with a more flexible and powerful data model, enabling advanced features like social network analytics, recommendation engines, and complex relationship queries. The migration will reduce reliance on proprietary Firebase services and increase control over the infrastructure.

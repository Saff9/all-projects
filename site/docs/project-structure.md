# NEET/JEE Preparation Platform - Project Structure

## Overview

This document defines the complete folder organization for both frontend (Next.js) and backend (Express.js) applications. The structure follows industry best practices for scalability, maintainability, and developer experience.

---

## 1. Monorepo Structure

```
jeeneet/
├── apps/
│   ├── web/                    # Next.js Frontend Application
│   └── api/                    # Express.js Backend Application
├── packages/
│   ├── shared/                 # Shared utilities and types
│   ├── ui/                     # Shared UI components
│   └── config/                 # Shared configuration
├── docs/                       # Documentation
├── scripts/                    # Build and deployment scripts
├── docker/                     # Docker configurations
├── .github/                    # GitHub workflows
├── package.json                # Root package.json
├── turbo.json                  # Turborepo configuration
└── README.md
```

---

## 2. Frontend Structure (Next.js App Router)

```
apps/web/
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   ├── subjects/
│   │   │   ├── physics.svg
│   │   │   ├── chemistry.svg
│   │   │   ├── mathematics.svg
│   │   │   └── biology.svg
│   │   ├── icons/
│   │   │   └── ...
│   │   └── og/
│   │       └── default-og.png
│   ├── fonts/
│   │   └── Inter-Variable.woff2
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── loading.tsx         # Root loading state
│   │   ├── error.tsx           # Root error boundary
│   │   ├── not-found.tsx       # 404 page
│   │   ├── globals.css         # Global styles
│   │   │
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── reset-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/        # Dashboard route group
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   └── streaks/
│   │   │       └── page.tsx
│   │   │
│   │   ├── neet/               # NEET path
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── [subject]/
│   │   │       ├── page.tsx
│   │   │       └── [chapter]/
│   │   │           ├── page.tsx
│   │   │           ├── practice/
│   │   │           │   └── page.tsx
│   │   │           └── pyqs/
│   │   │               └── page.tsx
│   │   │
│   │   ├── jee/                # JEE path
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── main/           # JEE Main
│   │   │   │   └── [subject]/
│   │   │   │       └── [chapter]/
│   │   │   └── advanced/       # JEE Advanced
│   │   │       └── [subject]/
│   │   │           └── [chapter]/
│   │   │
│   │   ├── pyqs/               # PYQ Engine
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── practice/
│   │   │   │   └── page.tsx
│   │   │   └── [examType]/
│   │   │       └── [year]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── mock-tests/         # Mock Test System
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── instructions/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── attempt/
│   │   │   │       └── page.tsx
│   │   │   ├── results/
│   │   │   │   └── [attemptId]/
│   │   │   │       └── page.tsx
│   │   │   └── history/
│   │   │       └── page.tsx
│   │   │
│   │   ├── resources/          # Resources Section
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── ncert/
│   │   │   │   └── page.tsx
│   │   │   ├── syllabus/
│   │   │   │   └── page.tsx
│   │   │   ├── formula-sheets/
│   │   │   │   └── page.tsx
│   │   │   └── videos/
│   │   │       └── page.tsx
│   │   │
│   │   ├── revision/           # Revision Mode
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── mistakes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── formulas/
│   │   │   │   └── page.tsx
│   │   │   └── quick/
│   │   │       └── page.tsx
│   │   │
│   │   ├── bookmarks/          # Bookmarks
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── notes/              # User Notes
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── planner/            # Daily Planner
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── ai-doubt/           # AI Doubt Helper
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── [conversationId]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/              # Admin Panel
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── questions/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── tests/
│   │   │   │   └── page.tsx
│   │   │   ├── resources/
│   │   │   │   └── page.tsx
│   │   │   └── analytics/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                # API Routes (if needed)
│   │       ├── revalidate/
│   │       │   └── route.ts
│   │       └── webhooks/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   ├── user-menu.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── forms/              # Form components
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── profile-form.tsx
│   │   │   ├── question-form.tsx
│   │   │   ├── test-form.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── overview-cards.tsx
│   │   │   ├── progress-chart.tsx
│   │   │   ├── streak-calendar.tsx
│   │   │   ├── weak-chapters.tsx
│   │   │   ├── recent-activity.tsx
│   │   │   ├── revision-suggestions.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── questions/          # Question components
│   │   │   ├── question-card.tsx
│   │   │   ├── question-options.tsx
│   │   │   ├── question-solution.tsx
│   │   │   ├── question-filter.tsx
│   │   │   ├── question-pagination.tsx
│   │   │   ├── question-navigation.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── tests/              # Test components
│   │   │   ├── test-card.tsx
│   │   │   ├── test-timer.tsx
│   │   │   ├── test-navigation.tsx
│   │   │   ├── test-question.tsx
│   │   │   ├── test-result-summary.tsx
│   │   │   ├── test-analysis.tsx
│   │   │   ├── test-leaderboard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── chapters/           # Chapter components
│   │   │   ├── chapter-card.tsx
│   │   │   ├── chapter-list.tsx
│   │   │   ├── chapter-progress.tsx
│   │   │   ├── unit-accordion.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── mistakes/           # Mistake notebook components
│   │   │   ├── mistake-card.tsx
│   │   │   ├── mistake-list.tsx
│   │   │   ├── mistake-filter.tsx
│   │   │   ├── revision-queue.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── resources/          # Resource components
│   │   │   ├── resource-card.tsx
│   │   │   ├── resource-grid.tsx
│   │   │   ├── pdf-viewer.tsx
│   │   │   ├── video-player.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── ai/                 # AI components
│   │   │   ├── chat-interface.tsx
│   │   │   ├── chat-message.tsx
│   │   │   ├── chat-input.tsx
│   │   │   ├── explanation-panel.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── productivity/       # Productivity components
│   │   │   ├── pomodoro-timer.tsx
│   │   │   ├── daily-planner.tsx
│   │   │   ├── study-plan-card.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── common/             # Common shared components
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── search-input.tsx
│   │   │   ├── filter-dropdown.tsx
│   │   │   ├── confirm-dialog.tsx
│   │   │   ├── file-upload.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── providers/          # Context providers
│   │       ├── theme-provider.tsx
│   │       ├── auth-provider.tsx
│   │       ├── query-provider.tsx
│   │       ├── toast-provider.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-user.ts
│   │   ├── use-progress.ts
│   │   ├── use-tests.ts
│   │   ├── use-questions.ts
│   │   ├── use-mistakes.ts
│   │   ├── use-bookmarks.ts
│   │   ├── use-notes.ts
│   │   ├── use-pomodoro.ts
│   │   ├── use-theme.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-debounce.ts
│   │   ├── use-media-query.ts
│   │   ├── use-pagination.ts
│   │   └── index.ts
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── api/                # API client
│   │   │   ├── client.ts
│   │   │   ├── endpoints.ts
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── questions.ts
│   │   │   ├── tests.ts
│   │   │   ├── chapters.ts
│   │   │   ├── mistakes.ts
│   │   │   ├── resources.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/              # Utility functions
│   │   │   ├── cn.ts           # Class name utility
│   │   │   ├── format.ts       # Formatting utilities
│   │   │   ├── date.ts         # Date utilities
│   │   │   ├── validation.ts   # Validation utilities
│   │   │   ├── constants.ts    # App constants
│   │   │   └── index.ts
│   │   │
│   │   ├── auth/               # Auth utilities
│   │   │   ├── token.ts
│   │   │   ├── session.ts
│   │   │   └── index.ts
│   │   │
│   │   └── storage/            # Storage utilities
│   │       ├── local.ts
│   │       ├── cookies.ts
│   │       └── index.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── api.ts
│   │   ├── user.ts
│   │   ├── question.ts
│   │   ├── test.ts
│   │   ├── chapter.ts
│   │   ├── mistake.ts
│   │   ├── resource.ts
│   │   ├── progress.ts
│   │   └── index.ts
│   │
│   ├── config/                 # App configuration
│   │   ├── site.ts
│   │   ├── navigation.ts
│   │   ├── subjects.ts
│   │   ├── exams.ts
│   │   └── index.ts
│   │
│   └── styles/                 # Additional styles
│       ├── animations.css
│       └── print.css
│
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Backend Structure (Express.js)

```
apps/api/
├── src/
│   ├── index.ts                # Application entry point
│   ├── app.ts                  # Express app configuration
│   │
│   ├── config/                 # Configuration
│   │   ├── index.ts
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── jwt.ts
│   │   ├── cloudinary.ts
│   │   ├── rate-limit.ts
│   │   └── env.ts
│   │
│   ├── controllers/            # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── subject.controller.ts
│   │   ├── chapter.controller.ts
│   │   ├── question.controller.ts
│   │   ├── pyq.controller.ts
│   │   ├── test.controller.ts
│   │   ├── mistake.controller.ts
│   │   ├── resource.controller.ts
│   │   ├── revision.controller.ts
│   │   ├── bookmark.controller.ts
│   │   ├── note.controller.ts
│   │   ├── ai.controller.ts
│   │   ├── pomodoro.controller.ts
│   │   ├── planner.controller.ts
│   │   ├── search.controller.ts
│   │   ├── admin.controller.ts
│   │   └── index.ts
│   │
│   ├── services/               # Business logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── subject.service.ts
│   │   ├── chapter.service.ts
│   │   ├── question.service.ts
│   │   ├── pyq.service.ts
│   │   ├── test.service.ts
│   │   ├── mistake.service.ts
│   │   ├── resource.service.ts
│   │   ├── revision.service.ts
│   │   ├── bookmark.service.ts
│   │   ├── note.service.ts
│   │   ├── ai.service.ts
│   │   ├── pomodoro.service.ts
│   │   ├── planner.service.ts
│   │   ├── search.service.ts
│   │   ├── analytics.service.ts
│   │   ├── email.service.ts
│   │   ├── cache.service.ts
│   │   └── index.ts
│   │
│   ├── repositories/           # Data access layer
│   │   ├── user.repository.ts
│   │   ├── chapter.repository.ts
│   │   ├── question.repository.ts
│   │   ├── test.repository.ts
│   │   ├── mistake.repository.ts
│   │   ├── resource.repository.ts
│   │   ├── progress.repository.ts
│   │   ├── bookmark.repository.ts
│   │   ├── note.repository.ts
│   │   ├── ai.repository.ts
│   │   └── index.ts
│   │
│   ├── models/                 # Database models
│   │   ├── user.model.ts
│   │   ├── subject.model.ts
│   │   ├── chapter.model.ts
│   │   ├── topic.model.ts
│   │   ├── question.model.ts
│   │   ├── question-option.model.ts
│   │   ├── question-tag.model.ts
│   │   ├── test.model.ts
│   │   ├── test-attempt.model.ts
│   │   ├── answer-response.model.ts
│   │   ├── user-progress.model.ts
│   │   ├── study-streak.model.ts
│   │   ├── daily-activity.model.ts
│   │   ├── mistake.model.ts
│   │   ├── resource.model.ts
│   │   ├── bookmark.model.ts
│   │   ├── note.model.ts
│   │   ├── ai-conversation.model.ts
│   │   ├── ai-message.model.ts
│   │   ├── refresh-token.model.ts
│   │   └── index.ts
│   │
│   ├── routes/                 # API routes
│   │   ├── index.ts            # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── subjects.routes.ts
│   │   ├── chapters.routes.ts
│   │   ├── questions.routes.ts
│   │   ├── pyqs.routes.ts
│   │   ├── tests.routes.ts
│   │   ├── mistakes.routes.ts
│   │   ├── resources.routes.ts
│   │   ├── revision.routes.ts
│   │   ├── bookmarks.routes.ts
│   │   ├── notes.routes.ts
│   │   ├── ai.routes.ts
│   │   ├── productivity.routes.ts
│   │   ├── search.routes.ts
│   │   ├── admin.routes.ts
│   │   └── health.routes.ts
│   │
│   ├── middlewares/            # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── request-logger.middleware.ts
│   │   ├── sanitize.middleware.ts
│   │   ├── cors.middleware.ts
│   │   └── index.ts
│   │
│   ├── validators/             # Request validation schemas
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   ├── question.validator.ts
│   │   ├── test.validator.ts
│   │   ├── mistake.validator.ts
│   │   ├── resource.validator.ts
│   │   ├── ai.validator.ts
│   │   └── index.ts
│   │
│   ├── utils/                  # Utility functions
│   │   ├── logger.ts
│   │   ├── response.ts
│   │   ├── password.ts
│   │   ├── token.ts
│   │   ├── pagination.ts
│   │   ├── cache.ts
│   │   ├── file-upload.ts
│   │   ├── error.ts
│   │   └── index.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── express.d.ts
│   │   ├── jwt.ts
│   │   ├── request.ts
│   │   ├── response.ts
│   │   └── index.ts
│   │
│   ├── constants/              # Application constants
│   │   ├── error-codes.ts
│   │   ├── status.ts
│   │   ├── roles.ts
│   │   └── index.ts
│   │
│   ├── jobs/                   # Background jobs
│   │   ├── index.ts
│   │   ├── streak-update.job.ts
│   │   ├── revision-reminder.job.ts
│   │   ├── rank-calculation.job.ts
│   │   └── analytics-aggregation.job.ts
│   │
│   └── database/               # Database related
│       ├── connection.ts
│       ├── migrations/
│       │   ├── 001_create_users.ts
│       │   ├── 002_create_subjects.ts
│       │   ├── 003_create_chapters.ts
│       │   └── ...
│       ├── seeds/
│       │   ├── subjects.seed.ts
│       │   ├── chapters-neet.seed.ts
│       │   ├── chapters-jee.seed.ts
│       │   └── ...
│       └── queries/            # Complex SQL queries
│           ├── dashboard.ts
│           ├── analytics.ts
│           └── leaderboard.ts
│
├── tests/                      # Test files
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── questions.test.ts
│   │   └── tests.test.ts
│   └── setup.ts
│
├── uploads/                    # Temporary upload directory
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## 4. Shared Packages

### 4.1 Shared Package Structure

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── user.ts
│   │   ├── question.ts
│   │   ├── test.ts
│   │   ├── chapter.ts
│   │   ├── api.ts
│   │   └── index.ts
│   │
│   ├── constants/
│   │   ├── subjects.ts
│   │   ├── exams.ts
│   │   ├── errors.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   ├── date.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

### 4.2 UI Package Structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── index.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   └── index.ts
│
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

### 4.3 Config Package Structure

```
packages/config/
├── src/
│   ├── eslint/
│   │   ├── base.js
│   │   ├── next.js
│   │   └── node.js
│   │
│   ├── typescript/
│   │   ├── base.json
│   │   ├── next.json
│   │   └── node.json
│   │
│   └── index.ts
│
├── package.json
└── README.md
```

---

## 5. Docker Configuration

```
docker/
├── frontend.Dockerfile
├── backend.Dockerfile
├── nginx.conf
├── docker-compose.yml
├── docker-compose.dev.yml
└── docker-compose.prod.yml
```

---

## 6. GitHub Workflows

```
.github/
├── workflows/
│   ├── ci.yml
│   ├── deploy-staging.yml
│   ├── deploy-production.yml
│   └── test.yml
│
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
│
└── PULL_REQUEST_TEMPLATE.md
```

---

## 7. Scripts Directory

```
scripts/
├── seed-database.ts
├── generate-sitemap.ts
├── migrate-data.ts
└── deploy.sh
```

---

## 8. Key File Descriptions

### 8.1 Frontend Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers |
| `src/app/page.tsx` | Landing page |
| `src/lib/api/client.ts` | API client configuration |
| `src/lib/auth/session.ts` | Session management |
| `src/hooks/use-auth.ts` | Authentication hook |
| `src/components/providers/` | Context providers |
| `tailwind.config.ts` | Tailwind configuration |

### 8.2 Backend Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Application entry point |
| `src/app.ts` | Express configuration |
| `src/routes/index.ts` | Route aggregator |
| `src/middlewares/auth.middleware.ts` | JWT authentication |
| `src/config/database.ts` | Database connection |
| `src/utils/response.ts` | API response utilities |

---

## 9. Naming Conventions

### 9.1 File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `QuestionCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `User.ts` |
| Constants | camelCase | `errorCodes.ts` |
| API Routes | kebab-case | `auth.routes.ts` |

### 9.2 Directory Naming

| Type | Convention | Example |
|------|------------|---------|
| Feature directories | kebab-case | `mock-tests/` |
| Component directories | camelCase | `components/` |
| Route groups | parentheses | `(auth)/` |

---

## 10. Import Organization

### 10.1 Import Order

```typescript
// 1. External imports
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal imports (absolute)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

// 3. Types
import type { User } from '@/types';

// 4. Constants
import { API_ENDPOINTS } from '@/lib/utils/constants';

// 5. Relative imports
import { LocalComponent } from './local-component';
```

---

## 11. Environment Variables

### 11.1 Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 11.2 Backend (.env)

```env
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/jeeneet

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Service
AI_API_KEY=your_ai_api_key

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

---

## 12. Package Scripts

### 12.1 Frontend Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### 12.2 Backend Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "tsx src/database/migrate.ts",
    "seed": "tsx src/database/seed.ts"
  }
}
```

---

This project structure provides a clean, scalable foundation for the NEET/JEE preparation platform, following industry best practices for both Next.js and Express.js applications.

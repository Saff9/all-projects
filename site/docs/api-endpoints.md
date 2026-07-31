# NEET/JEE Preparation Platform - API Endpoints

## Overview

This document defines all RESTful API endpoints for the platform. The API follows these conventions:

- **Base URL**: `/api/v1`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json`
- **Response Format**: JSON with consistent structure

---

## 1. API Response Structure

### 1.1 Success Response

```json
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "requestId": "req_abc123"
}
```

### 1.2 Error Response

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

### 1.3 HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 2. Authentication Endpoints

### 2.1 Register User

```
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "targetExam": "NEET",
  "targetYear": 2025
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "fullName": "John Doe",
      "targetExam": "NEET",
      "role": "student"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2.2 Login

```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "fullName": "John Doe",
      "role": "student"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2.3 Refresh Token

```
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2.4 Logout

```
POST /api/v1/auth/logout
```

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 2.5 Forgot Password

```
POST /api/v1/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "student@example.com"
}
```

### 2.6 Reset Password

```
POST /api/v1/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!"
}
```

### 2.7 Verify Email

```
POST /api/v1/auth/verify-email
```

**Request Body:**
```json
{
  "token": "verification_token"
}
```

### 2.8 Get Current User

```
GET /api/v1/auth/me
```

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "student@example.com",
    "fullName": "John Doe",
    "targetExam": "NEET",
    "targetYear": 2025,
    "role": "student",
    "subscriptionStatus": "free",
    "preferences": {
      "theme": "system",
      "language": "en"
    }
  }
}
```

---

## 3. User Endpoints

### 3.1 Get User Profile

```
GET /api/v1/users/profile
```

**Headers:** `Authorization: Bearer {accessToken}`

### 3.2 Update User Profile

```
PUT /api/v1/users/profile
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phone": "9876543210",
  "targetExam": "JEE_MAIN",
  "targetYear": 2025,
  "schoolName": "ABC School",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

### 3.3 Update User Preferences

```
PATCH /api/v1/users/preferences
```

**Request Body:**
```json
{
  "theme": "dark",
  "language": "en",
  "notifications": {
    "email": true,
    "push": true,
    "reminder": true
  }
}
```

### 3.4 Update Avatar

```
POST /api/v1/users/avatar
```

**Request:** `multipart/form-data`
- `avatar`: Image file (max 2MB)

### 3.5 Change Password

```
POST /api/v1/users/change-password
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

### 3.6 Delete Account

```
DELETE /api/v1/users/account
```

**Request Body:**
```json
{
  "password": "CurrentPass123!",
  "reason": "optional feedback"
}
```

### 3.7 Get User Dashboard Data

```
GET /api/v1/users/dashboard
```

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalChaptersAccessed": 45,
      "chaptersCompleted": 20,
      "weakChapters": 5,
      "totalQuestionsSolved": 1250,
      "overallAccuracy": 72.5,
      "testsTaken": 15,
      "averageTestScore": 68.3
    },
    "streak": {
      "current": 12,
      "longest": 25
    },
    "recentActivity": [],
    "weakChapters": [],
    "revisionSuggestions": [],
    "upcomingTests": []
  }
}
```

### 3.8 Get User Statistics

```
GET /api/v1/users/statistics
```

**Query Parameters:**
- `period`: `week` | `month` | `year` | `all`

---

## 4. Subject Endpoints

### 4.1 Get All Subjects

```
GET /api/v1/subjects
```

**Query Parameters:**
- `examType`: `NEET` | `JEE_MAIN` | `JEE_ADVANCED`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Physics",
      "slug": "physics",
      "iconUrl": "https://...",
      "colorCode": "#3B82F6",
      "chapterCount": 29,
      "forNeet": true,
      "forJeeMain": true,
      "forJeeAdvanced": true
    }
  ]
}
```

### 4.2 Get Subject by Slug

```
GET /api/v1/subjects/:slug
```

### 4.3 Get Subject Chapters

```
GET /api/v1/subjects/:slug/chapters
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": {
      "id": "uuid",
      "name": "Physics"
    },
    "units": [
      {
        "unitNumber": 1,
        "unitName": "Mechanics",
        "chapters": [
          {
            "id": "uuid",
            "name": "Kinematics",
            "slug": "kinematics",
            "chapterNumber": 1,
            "neetWeightage": 8.5,
            "totalQuestions": 450,
            "userProgress": {
              "status": "in_progress",
              "completionPercentage": 45.5,
              "accuracyPercentage": 72.0
            }
          }
        ]
      }
    ]
  }
}
```

---

## 5. Chapter Endpoints

### 5.1 Get All Chapters

```
GET /api/v1/chapters
```

**Query Parameters:**
- `subject`: Subject slug
- `examType`: `NEET` | `JEE_MAIN` | `JEE_ADVANCED`
- `status`: `not_started` | `in_progress` | `completed`
- `weak`: `true` | `false`
- `page`: Page number
- `limit`: Items per page

### 5.2 Get Chapter by Slug

```
GET /api/v1/chapters/:slug
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Kinematics",
    "slug": "kinematics",
    "description": "...",
    "subject": {
      "id": "uuid",
      "name": "Physics",
      "slug": "physics"
    },
    "unitName": "Mechanics",
    "unitNumber": 1,
    "chapterNumber": 1,
    "neetWeightage": 8.5,
    "jeeMainWeightage": 6.5,
    "difficultyLevel": "medium",
    "estimatedHours": 12,
    "topics": [
      {
        "id": "uuid",
        "name": "Motion in One Dimension",
        "slug": "motion-one-dimension",
        "topicNumber": 1
      }
    ],
    "userProgress": {
      "status": "in_progress",
      "completionPercentage": 45.5,
      "questionsAttempted": 125,
      "questionsCorrect": 90,
      "accuracyPercentage": 72.0,
      "isWeakChapter": false
    },
    "resources": []
  }
}
```

### 5.3 Get Chapter Topics

```
GET /api/v1/chapters/:slug/topics
```

### 5.4 Get Chapter Resources

```
GET /api/v1/chapters/:slug/resources
```

### 5.5 Get Chapter PYQs

```
GET /api/v1/chapters/:slug/pyqs
```

**Query Parameters:**
- `year`: Filter by year
- `examType`: `NEET` | `JEE_MAIN` | `JEE_ADVANCED`
- `difficulty`: `easy` | `medium` | `hard`
- `page`, `limit`: Pagination

### 5.6 Start Chapter Practice

```
POST /api/v1/chapters/:slug/practice/start
```

**Request Body:**
```json
{
  "questionCount": 20,
  "difficulty": "mixed",
  "timeLimit": 30
}
```

### 5.7 Get Chapter Statistics

```
GET /api/v1/chapters/:slug/statistics
```

---

## 6. Question Endpoints

### 6.1 Get Questions

```
GET /api/v1/questions
```

**Query Parameters:**
- `subject`: Subject slug
- `chapter`: Chapter slug
- `topic`: Topic slug
- `difficulty`: `easy` | `medium` | `hard`
- `examType`: `NEET` | `JEE_MAIN` | `JEE_ADVANCED`
- `sourceType`: `pyq` | `ncert` | `exemplar` | `custom`
- `year`: PYQ year
- `tags`: Comma-separated tags
- `search`: Search query
- `page`, `limit`: Pagination

### 6.2 Get Question by ID

```
GET /api/v1/questions/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "questionText": "A particle moves in a straight line...",
    "questionImageUrl": null,
    "questionType": "mcq",
    "difficultyLevel": "medium",
    "chapter": {
      "id": "uuid",
      "name": "Kinematics",
      "slug": "kinematics"
    },
    "subject": {
      "id": "uuid",
      "name": "Physics"
    },
    "sourceExam": "NEET",
    "sourceYear": 2023,
    "options": [
      {
        "id": "uuid",
        "label": "A",
        "optionText": "10 m/s",
        "optionImageUrl": null
      }
    ],
    "solution": {
      "text": "Detailed solution...",
      "imageUrl": null
    },
    "hint": "Use the equation of motion...",
    "userBookmark": false,
    "userMistake": false
  }
}
```

### 6.3 Submit Answer

```
POST /api/v1/questions/:id/submit
```

**Request Body:**
```json
{
  "selectedOptions": ["A"],
  "timeSpentSeconds": 45
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "correctAnswer": ["A"],
    "solution": {
      "text": "Detailed solution...",
      "imageUrl": null
    },
    "explanation": "AI-generated explanation..."
  }
}
```

### 6.4 Get Question Solution

```
GET /api/v1/questions/:id/solution
```

### 6.5 Bookmark Question

```
POST /api/v1/questions/:id/bookmark
```

**Request Body:**
```json
{
  "folder": "important",
  "notes": "Need to revise this concept"
}
```

### 6.6 Remove Bookmark

```
DELETE /api/v1/questions/:id/bookmark
```

### 6.7 Report Question

```
POST /api/v1/questions/:id/report
```

**Request Body:**
```json
{
  "reason": "incorrect_answer",
  "description": "The correct answer should be B"
}
```

---

## 7. PYQ Engine Endpoints

### 7.1 Get PYQ Filters

```
GET /api/v1/pyqs/filters
```

**Response:**
```json
{
  "success": true,
  "data": {
    "years": [2024, 2023, 2022, 2021, 2020],
    "examTypes": ["NEET", "JEE_MAIN", "JEE_ADVANCED"],
    "subjects": [...],
    "chapters": [...],
    "difficulties": ["easy", "medium", "hard"],
    "sessions": ["April", "May", "June", "July"]
  }
}
```

### 7.2 Get PYQs

```
GET /api/v1/pyqs
```

**Query Parameters:**
- `year[]`: Multiple years
- `examType[]`: Multiple exam types
- `subject[]`: Multiple subjects
- `chapter[]`: Multiple chapters
- `difficulty[]`: Multiple difficulties
- `session`: Session name
- `page`, `limit`: Pagination

### 7.3 Get PYQ Paper

```
GET /api/v1/pyqs/papers/:year/:examType/:session
```

### 7.4 Start PYQ Practice

```
POST /api/v1/pyqs/practice/start
```

**Request Body:**
```json
{
  "filters": {
    "years": [2023, 2024],
    "examTypes": ["NEET"],
    "subjects": ["physics"],
    "chapters": ["kinematics", "laws-of-motion"]
  },
  "questionCount": 30,
  "mode": "practice"
}
```

### 7.5 Get PYQ Statistics

```
GET /api/v1/pyqs/statistics
```

---

## 8. Mock Test Endpoints

### 8.1 Get All Tests

```
GET /api/v1/tests
```

**Query Parameters:**
- `type`: `chapter_test` | `unit_test` | `subject_test` | `full_test`
- `examType`: `NEET` | `JEE_MAIN` | `JEE_ADVANCED`
- `subject`: Subject slug
- `isPremium`: `true` | `false`
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "NEET 2024 Full Test 1",
      "slug": "neet-2024-full-test-1",
      "testType": "full_test",
      "examType": "NEET",
      "totalQuestions": 200,
      "totalMarks": 720,
      "durationMinutes": 200,
      "attemptsCount": 15420,
      "isPremium": false,
      "userAttempted": true,
      "userBestScore": 580
    }
  ]
}
```

### 8.2 Get Test by Slug

```
GET /api/v1/tests/:slug
```

### 8.3 Get Test Instructions

```
GET /api/v1/tests/:slug/instructions
```

### 8.4 Start Test

```
POST /api/v1/tests/:slug/start
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "testId": "uuid",
    "totalQuestions": 200,
    "durationMinutes": 200,
    "startedAt": "2024-01-15T10:00:00Z",
    "questions": [
      {
        "questionNumber": 1,
        "questionId": "uuid",
        "questionText": "...",
        "options": [...]
      }
    ]
  }
}
```

### 8.5 Save Answer

```
PUT /api/v1/tests/attempts/:attemptId/answer
```

**Request Body:**
```json
{
  "questionNumber": 1,
  "selectedOptions": ["A"],
  "timeSpentSeconds": 45,
  "markedForReview": false
}
```

### 8.6 Get Test Status

```
GET /api/v1/tests/attempts/:attemptId/status
```

### 8.7 Submit Test

```
POST /api/v1/tests/attempts/:attemptId/submit
```

**Request Body:**
```json
{
  "forceSubmit": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "status": "submitted",
    "result": {
      "totalQuestions": 200,
      "attemptedQuestions": 185,
      "correctAnswers": 145,
      "incorrectAnswers": 40,
      "skippedQuestions": 15,
      "marksObtained": 540,
      "totalMarks": 720,
      "percentage": 75.0,
      "rank": 1250,
      "totalParticipants": 15420,
      "percentile": 91.89
    },
    "analysis": {
      "subjectWise": {
        "physics": { "correct": 45, "incorrect": 15, "score": 165 },
        "chemistry": { "correct": 50, "incorrect": 10, "score": 190 },
        "biology": { "correct": 50, "incorrect": 15, "score": 185 }
      },
      "timeDistribution": {},
      "difficultyBreakdown": {}
    }
  }
}
```

### 8.8 Get Test Result

```
GET /api/v1/tests/attempts/:attemptId/result
```

### 8.9 Get Test Solutions

```
GET /api/v1/tests/attempts/:attemptId/solutions
```

### 8.10 Get Test History

```
GET /api/v1/tests/history
```

**Query Parameters:**
- `testType`: Filter by type
- `status`: `submitted` | `abandoned`
- `page`, `limit`: Pagination

### 8.11 Abandon Test

```
POST /api/v1/tests/attempts/:attemptId/abandon
```

### 8.12 Get Leaderboard

```
GET /api/v1/tests/:slug/leaderboard
```

**Query Parameters:**
- `page`, `limit`: Pagination

---

## 9. Mistake Notebook Endpoints

### 9.1 Get All Mistakes

```
GET /api/v1/mistakes
```

**Query Parameters:**
- `subject`: Subject slug
- `chapter`: Chapter slug
- `mistakeType`: `conceptual` | `calculation` | `silly` | `time_pressure` | `misinterpretation` | `other`
- `severity`: `minor` | `moderate` | `major`
- `isMastered`: `true` | `false`
- `needsRevision`: `true` | `false`
- `page`, `limit`: Pagination

### 9.2 Add Mistake

```
POST /api/v1/mistakes
```

**Request Body:**
```json
{
  "questionId": "uuid",
  "userAnswer": ["B"],
  "userNotes": "Confused between A and B",
  "mistakeReason": "Did not read the question carefully",
  "mistakeType": "misinterpretation",
  "severity": "moderate",
  "conceptGap": "Need to revise projectile motion"
}
```

### 9.3 Get Mistake by ID

```
GET /api/v1/mistakes/:id
```

### 9.4 Update Mistake

```
PUT /api/v1/mistakes/:id
```

**Request Body:**
```json
{
  "userNotes": "Updated notes",
  "mistakeType": "conceptual",
  "severity": "major"
}
```

### 9.5 Delete Mistake

```
DELETE /api/v1/mistakes/:id
```

### 9.6 Mark as Mastered

```
POST /api/v1/mistakes/:id/master
```

### 9.7 Get Revision Queue

```
GET /api/v1/mistakes/revision-queue
```

**Response:**
```json
{
  "success": true,
  "data": {
    "today": [],
    "overdue": [],
    "upcoming": []
  }
}
```

### 9.8 Start Revision Session

```
POST /api/v1/mistakes/revision/start
```

**Request Body:**
```json
{
  "filters": {
    "subjects": ["physics"],
    "mistakeTypes": ["conceptual"]
  },
  "questionCount": 20
}
```

### 9.9 Get Mistake Statistics

```
GET /api/v1/mistakes/statistics
```

---

## 10. Resource Endpoints

### 10.1 Get All Resources

```
GET /api/v1/resources
```

**Query Parameters:**
- `type`: `pdf` | `video` | `link` | `formula_sheet` | `notes` | `syllabus`
- `category`: `ncert` | `exemplar` | `pyq_paper` | `formula_sheet` | `syllabus` | `video_lecture`
- `subject`: Subject slug
- `chapter`: Chapter slug
- `page`, `limit`: Pagination

### 10.2 Get Resource by Slug

```
GET /api/v1/resources/:slug
```

### 10.3 Get NCERT PDFs

```
GET /api/v1/resources/ncert
```

**Query Parameters:**
- `class`: `11` | `12`
- `subject`: Subject slug

### 10.4 Get Formula Sheets

```
GET /api/v1/resources/formula-sheets
```

### 10.5 Get Syllabus

```
GET /api/v1/resources/syllabus
```

**Query Parameters:**
- `examType`: `NEET` | `JEE_MAIN` | `JEE_ADVANCED`

### 10.6 Track Resource View

```
POST /api/v1/resources/:id/view
```

### 10.7 Track Resource Download

```
POST /api/v1/resources/:id/download
```

---

## 11. Revision Mode Endpoints

### 11.1 Get Revision Dashboard

```
GET /api/v1/revision/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "highWeightageChapters": [],
    "weakChapters": [],
    "revisionDueChapters": [],
    "formulaSheets": [],
    "quickRevisionNotes": []
  }
}
```

### 11.2 Get High Weightage Questions

```
GET /api/v1/revision/high-weightage
```

**Query Parameters:**
- `examType`: `NEET` | `JEE_MAIN` | `JEE_ADVANCED`
- `subject`: Subject slug
- `limit`: Number of questions

### 11.3 Get Formula Rapid Revision

```
GET /api/v1/revision/formulas
```

**Query Parameters:**
- `subject`: Subject slug
- `chapter`: Chapter slug

### 11.4 Start Quick Revision

```
POST /api/v1/revision/start
```

**Request Body:**
```json
{
  "mode": "weak_chapters" | "high_weightage" | "mistakes" | "custom",
  "chapters": ["kinematics"],
  "questionCount": 20
}
```

### 11.5 Get Revision Plan

```
GET /api/v1/revision/plan
```

---

## 12. AI Doubt Helper Endpoints

### 12.1 Get Conversations

```
GET /api/v1/ai/conversations
```

### 12.2 Get Conversation

```
GET /api/v1/ai/conversations/:id
```

### 12.3 Start Conversation

```
POST /api/v1/ai/conversations
```

**Request Body:**
```json
{
  "questionId": "uuid",
  "contextType": "question_help",
  "initialMessage": "Can you explain why option A is correct?"
}
```

### 12.4 Send Message

```
POST /api/v1/ai/conversations/:id/messages
```

**Request Body:**
```json
{
  "content": "Can you provide more details about the formula used?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "uuid",
      "role": "user",
      "content": "Can you provide more details about the formula used?"
    },
    "assistantResponse": {
      "id": "uuid",
      "role": "assistant",
      "content": "Of course! The formula used here is..."
    }
  }
}
```

### 12.5 Get Question Explanation

```
POST /api/v1/ai/explain
```

**Request Body:**
```json
{
  "questionId": "uuid"
}
```

### 12.6 Provide Feedback

```
POST /api/v1/ai/messages/:id/feedback
```

**Request Body:**
```json
{
  "feedback": "helpful" | "not_helpful" | "incorrect",
  "notes": "Optional feedback notes"
}
```

### 12.7 Delete Conversation

```
DELETE /api/v1/ai/conversations/:id
```

---

## 13. Productivity Tools Endpoints

### 13.1 Pomodoro Endpoints

#### Start Pomodoro Session

```
POST /api/v1/pomodoro/start
```

**Request Body:**
```json
{
  "durationMinutes": 25,
  "subject": "physics",
  "chapter": "kinematics",
  "task": "Practice problems"
}
```

#### Complete Pomodoro Session

```
POST /api/v1/pomodoro/complete
```

#### Get Pomodoro Statistics

```
GET /api/v1/pomodoro/statistics
```

**Query Parameters:**
- `period`: `today` | `week` | `month`

### 13.2 Daily Planner Endpoints

#### Get Daily Plan

```
GET /api/v1/planner/:date
```

#### Create Daily Plan

```
POST /api/v1/planner
```

**Request Body:**
```json
{
  "date": "2024-01-15",
  "tasks": [
    {
      "title": "Complete Kinematics",
      "subject": "physics",
      "chapter": "kinematics",
      "estimatedMinutes": 60,
      "scheduledTime": "09:00"
    }
  ]
}
```

#### Update Task Status

```
PATCH /api/v1/planner/:date/tasks/:taskId
```

**Request Body:**
```json
{
  "status": "completed",
  "actualMinutes": 45
}
```

### 13.3 Study Plan Endpoints

#### Get Study Plans

```
GET /api/v1/study-plans
```

#### Generate Study Plan

```
POST /api/v1/study-plans/generate
```

**Request Body:**
```json
{
  "targetExam": "NEET",
  "targetDate": "2024-05-05",
  "dailyHours": 6,
  "weakSubjects": ["physics"],
  "preferences": {
    "includeRevision": true,
    "includeMockTests": true
  }
}
```

#### Get Active Study Plan

```
GET /api/v1/study-plans/active
```

#### Update Study Plan Progress

```
PATCH /api/v1/study-plans/:id/progress
```

---

## 14. Bookmark Endpoints

### 14.1 Get All Bookmarks

```
GET /api/v1/bookmarks
```

**Query Parameters:**
- `folder`: Folder name
- `subject`: Subject slug
- `chapter`: Chapter slug
- `page`, `limit`: Pagination

### 14.2 Get Bookmark Folders

```
GET /api/v1/bookmarks/folders
```

### 14.3 Create Folder

```
POST /api/v1/bookmarks/folders
```

**Request Body:**
```json
{
  "name": "Important Questions"
}
```

### 14.4 Move Bookmark

```
PATCH /api/v1/bookmarks/:id/move
```

**Request Body:**
```json
{
  "folder": "Important Questions"
}
```

---

## 15. Notes Endpoints

### 15.1 Get All Notes

```
GET /api/v1/notes
```

**Query Parameters:**
- `chapter`: Chapter slug
- `noteType`: `general` | `formula` | `concept` | `tip` | `important`
- `page`, `limit`: Pagination

### 15.2 Create Note

```
POST /api/v1/notes
```

**Request Body:**
```json
{
  "questionId": "uuid",
  "chapterId": "uuid",
  "title": "Important Formula",
  "content": "v = u + at...",
  "noteType": "formula",
  "tags": ["kinematics", "important"]
}
```

### 15.3 Update Note

```
PUT /api/v1/notes/:id
```

### 15.4 Delete Note

```
DELETE /api/v1/notes/:id
```

### 15.5 Toggle Pin

```
PATCH /api/v1/notes/:id/pin
```

---

## 16. Search Endpoints

### 16.1 Global Search

```
GET /api/v1/search
```

**Query Parameters:**
- `q`: Search query
- `type`: `questions` | `chapters` | `resources` | `all`
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": {
      "items": [],
      "total": 45
    },
    "chapters": {
      "items": [],
      "total": 3
    },
    "resources": {
      "items": [],
      "total": 12
    }
  }
}
```

### 16.2 Search Suggestions

```
GET /api/v1/search/suggestions
```

**Query Parameters:**
- `q`: Partial search query

---

## 17. Admin Endpoints

### 17.1 Dashboard

```
GET /api/v1/admin/dashboard
```

### 17.2 User Management

#### Get All Users

```
GET /api/v1/admin/users
```

**Query Parameters:**
- `role`: Filter by role
- `status`: Filter by status
- `search`: Search by name/email
- `page`, `limit`: Pagination

#### Get User Details

```
GET /api/v1/admin/users/:id
```

#### Update User

```
PUT /api/v1/admin/users/:id
```

#### Ban User

```
POST /api/v1/admin/users/:id/ban
```

#### Unban User

```
POST /api/v1/admin/users/:id/unban
```

### 17.3 Content Management

#### Get All Questions (Admin)

```
GET /api/v1/admin/questions
```

#### Create Question

```
POST /api/v1/admin/questions
```

#### Update Question

```
PUT /api/v1/admin/questions/:id
```

#### Delete Question

```
DELETE /api/v1/admin/questions/:id
```

#### Bulk Upload Questions

```
POST /api/v1/admin/questions/bulk-upload
```

**Request:** `multipart/form-data`
- `file`: CSV/JSON file

#### Get Reported Questions

```
GET /api/v1/admin/questions/reported
```

#### Resolve Report

```
POST /api/v1/admin/questions/reports/:id/resolve
```

### 17.4 Test Management

#### Create Test

```
POST /api/v1/admin/tests
```

#### Update Test

```
PUT /api/v1/admin/tests/:id
```

#### Delete Test

```
DELETE /api/v1/admin/tests/:id
```

### 17.5 Resource Management

#### Create Resource

```
POST /api/v1/admin/resources
```

**Request:** `multipart/form-data` for file uploads

#### Update Resource

```
PUT /api/v1/admin/resources/:id
```

#### Delete Resource

```
DELETE /api/v1/admin/resources/:id
```

### 17.6 Analytics

#### Get Platform Statistics

```
GET /api/v1/admin/analytics/overview
```

#### Get User Growth

```
GET /api/v1/admin/analytics/user-growth
```

**Query Parameters:**
- `period`: `week` | `month` | `year`

#### Get Test Analytics

```
GET /api/v1/admin/analytics/tests
```

#### Get Question Analytics

```
GET /api/v1/admin/analytics/questions
```

### 17.7 System Configuration

#### Get Configurations

```
GET /api/v1/admin/config
```

#### Update Configuration

```
PUT /api/v1/admin/config/:key
```

### 17.8 Audit Log

```
GET /api/v1/admin/audit-log
```

---

## 18. Rate Limiting

### 18.1 Rate Limit Tiers

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 10 requests | 1 minute |
| API (Authenticated) | 100 requests | 1 minute |
| API (Unauthenticated) | 30 requests | 1 minute |
| AI Endpoints | 20 requests | 1 minute |
| Admin Endpoints | 200 requests | 1 minute |

### 18.2 Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

---

## 19. Webhook Endpoints

### 19.1 Payment Webhooks

```
POST /api/v1/webhooks/payment
```

### 19.2 Email Webhooks

```
POST /api/v1/webhooks/email
```

---

## 20. Health Check Endpoints

### 20.1 API Health

```
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "storage": "healthy"
  }
}
```

### 20.2 Database Health

```
GET /api/v1/health/database
```

---

## 21. API Versioning

The API uses URL-based versioning (`/api/v1/`). Future versions will be introduced as:
- `/api/v2/` - New major version
- Backward compatibility maintained for at least 6 months
- Deprecation notices in response headers

---

This comprehensive API documentation covers all endpoints required for the NEET/JEE preparation platform. Each endpoint is designed to be RESTful, consistent, and secure.

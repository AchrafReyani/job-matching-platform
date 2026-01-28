# Plan 08: News Feature

## Overview
Add a news/announcements system where admins can create, edit, schedule, and publish news posts. Job seekers and companies see news on their dashboards and in a dedicated News tab.

## Requirements Summary
- **Audience**: Public (all users) or targeted (job seekers only / companies only)
- **Categories**: 8 fixed types (Release, Bug Fix, Announcement, Maintenance, Feature Update, Security, Tips & Tricks, Event)
- **Content**: Basic markdown (bold, italic, links, bullet points)
- **Publishing**: Draft, Publish Now, or Schedule for future
- **Display**: Dashboard widget (3 latest) + dedicated News page
- **Read tracking**: Per-user read/unread status with dot indicator
- **Pinning**: Admin can pin important posts to top
- **Pagination**: 10 items per page
- **Deletion**: Hard delete
- **Scheduler**: Cron job to publish scheduled posts

---

## Phase 1: Database Schema

### 1.1 Create News model in Prisma schema

```prisma
enum NewsCategory {
  RELEASE
  BUG_FIX
  ANNOUNCEMENT
  MAINTENANCE
  FEATURE_UPDATE
  SECURITY
  TIPS_AND_TRICKS
  EVENT
}

enum NewsStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
}

enum NewsAudience {
  ALL
  JOB_SEEKER
  COMPANY
}

model News {
  id          Int           @id @default(autoincrement())
  title       String
  content     String        @db.Text
  category    NewsCategory
  status      NewsStatus    @default(DRAFT)
  audience    NewsAudience  @default(ALL)
  isPinned    Boolean       @default(false)
  scheduledAt DateTime?
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  readBy      NewsRead[]
}

model NewsRead {
  id        Int      @id @default(autoincrement())
  newsId    Int
  userId    String
  readAt    DateTime @default(now())

  news      News     @relation(fields: [newsId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([newsId, userId])
}
```

### 1.2 Update User model
Add relation to NewsRead:
```prisma
model User {
  // ... existing fields
  newsRead    NewsRead[]
}
```

### 1.3 Run migration
```bash
npx prisma migrate dev --name add_news_feature
```

---

## Phase 2: Backend - News Module

### 2.1 Create News module structure
```
src/news/
├── news.module.ts
├── controller/
│   └── news.controller.ts
├── usecase/
│   ├── create-news.usecase.ts
│   ├── update-news.usecase.ts
│   ├── delete-news.usecase.ts
│   ├── get-news.usecase.ts
│   ├── get-news-by-id.usecase.ts
│   ├── publish-news.usecase.ts
│   ├── mark-news-read.usecase.ts
│   ├── get-unread-count.usecase.ts
│   └── publish-scheduled-news.usecase.ts
├── repository/
│   └── news.repository.ts
├── infrastructure/
│   └── prisma-news.repository.ts
└── dto/
    ├── create-news.dto.ts
    ├── update-news.dto.ts
    └── news-query.dto.ts
```

### 2.2 DTOs

**create-news.dto.ts:**
- title: string (required, 1-200 chars)
- content: string (required, markdown text)
- category: NewsCategory (required)
- audience: NewsAudience (default: ALL)
- status: NewsStatus (default: DRAFT)
- isPinned: boolean (default: false)
- scheduledAt: Date (optional, required if status=SCHEDULED)

**update-news.dto.ts:**
- Same as create but all optional (PartialType)

**news-query.dto.ts (for admin filtering):**
- category?: NewsCategory
- status?: NewsStatus
- audience?: NewsAudience
- page: number (default: 1)
- limit: number (default: 10)

### 2.3 API Endpoints

**Admin endpoints (requires ADMIN role):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news/admin` | List all news with filters |
| GET | `/api/news/admin/:id` | Get single news by ID |
| POST | `/api/news` | Create news |
| PATCH | `/api/news/:id` | Update news |
| DELETE | `/api/news/:id` | Delete news |
| POST | `/api/news/:id/publish` | Publish draft immediately |

**User endpoints (JOB_SEEKER, COMPANY):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | Get published news for user's role |
| GET | `/api/news/:id` | Get single published news |
| POST | `/api/news/:id/read` | Mark news as read |
| GET | `/api/news/unread-count` | Get count of unread news |

### 2.4 Cron Job for Scheduled Posts
Create a scheduled task that runs every minute to check for posts where:
- status = SCHEDULED
- scheduledAt <= now()

Update matching posts to status = PUBLISHED, publishedAt = now()

Use NestJS `@Cron` decorator from `@nestjs/schedule`:
```typescript
@Cron('* * * * *') // Every minute
async publishScheduledNews() {
  await this.publishScheduledNewsUseCase.execute();
}
```

---

## Phase 3: Backend - Tests

### 3.1 Unit tests for each use case
- create-news.usecase.spec.ts
- update-news.usecase.spec.ts
- delete-news.usecase.spec.ts
- get-news.usecase.spec.ts
- mark-news-read.usecase.spec.ts
- publish-scheduled-news.usecase.spec.ts

### 3.2 Controller tests
- news.controller.spec.ts (test all endpoints)

---

## Phase 4: Frontend - Admin News Management

### 4.1 Add News to admin sidebar
Update admin navigation to include "News" item with icon.

### 4.2 Admin News List Page
`/dashboard/admin/news`
- Table with columns: Title, Category, Status, Audience, Published Date, Actions
- Filters: Category dropdown, Status dropdown, Date range
- Pagination controls
- "Create News" button
- Row actions: Edit, Delete, Publish (if draft)

### 4.3 Admin News Create/Edit Page
`/dashboard/admin/news/create`
`/dashboard/admin/news/edit/[id]`

Form fields:
- Title (text input)
- Category (select dropdown)
- Audience (radio: All Users, Job Seekers Only, Companies Only)
- Content (textarea with markdown preview)
- Status (radio: Draft, Publish Now, Schedule)
- Schedule Date/Time (shown only if Schedule selected)
- Pin to top (checkbox)

Actions:
- Save as Draft
- Publish / Schedule
- Cancel

### 4.4 Markdown Preview Component
Simple split view or toggle between edit/preview for content field.

---

## Phase 5: Frontend - User News Experience

### 5.1 Add News to user sidebar
Add "News" item to job seeker and company sidebars with unread dot indicator.

### 5.2 Dashboard News Widget
Add to both job seeker and company dashboard pages:
- Card titled "Latest News"
- Show 3 most recent published news items (title, category badge, date)
- Unread items have visual indicator (bold or dot)
- "View All" link to news page

### 5.3 News List Page
`/dashboard/job-seeker/news`
`/dashboard/company/news`

- List of news cards showing:
  - Title (bold if unread)
  - Category badge (colored by type)
  - Published date
  - Content preview (first 150 chars)
- Pinned posts always at top with pin icon
- Pagination (10 per page)
- Click to expand/view full content

### 5.4 News Detail View
Option A: Modal overlay on news list
Option B: Dedicated page `/dashboard/[role]/news/[id]`

Show:
- Full title
- Category badge
- Published date
- Full markdown content (rendered)
- Mark as read automatically when viewed

### 5.5 Unread Indicator Logic
- Fetch unread count on dashboard load
- Show dot on News sidebar item if count > 0
- Clear dot when user visits news page
- Individual items marked read when clicked/expanded

---

## Phase 6: Frontend - Shared Components

### 6.1 NewsCategoryBadge component
Colored badge based on category:
- RELEASE: blue
- BUG_FIX: red
- ANNOUNCEMENT: purple
- MAINTENANCE: orange
- FEATURE_UPDATE: green
- SECURITY: red (darker)
- TIPS_AND_TRICKS: teal
- EVENT: pink

### 6.2 NewsCard component
Reusable card for news list items.

### 6.3 MarkdownRenderer component
Render basic markdown (bold, italic, links, lists).

### 6.4 NewsWidget component
Dashboard widget showing latest news.

---

## Phase 7: i18n Translations

### 7.1 Add translations for both en.json and nl.json
```json
{
  "News": {
    "title": "News",
    "latestNews": "Latest News",
    "viewAll": "View All",
    "noNews": "No news yet",
    "categories": {
      "RELEASE": "Release",
      "BUG_FIX": "Bug Fix",
      "ANNOUNCEMENT": "Announcement",
      "MAINTENANCE": "Maintenance",
      "FEATURE_UPDATE": "Feature Update",
      "SECURITY": "Security",
      "TIPS_AND_TRICKS": "Tips & Tricks",
      "EVENT": "Event"
    },
    "status": {
      "DRAFT": "Draft",
      "PUBLISHED": "Published",
      "SCHEDULED": "Scheduled"
    },
    "audience": {
      "ALL": "All Users",
      "JOB_SEEKER": "Job Seekers",
      "COMPANY": "Companies"
    },
    "admin": {
      "createNews": "Create News",
      "editNews": "Edit News",
      "deleteConfirm": "Are you sure you want to delete this news post?",
      "publishConfirm": "Publish this news post now?",
      "form": {
        "title": "Title",
        "content": "Content",
        "category": "Category",
        "audience": "Audience",
        "status": "Status",
        "scheduledAt": "Schedule Date",
        "isPinned": "Pin to top",
        "saveDraft": "Save as Draft",
        "publish": "Publish",
        "schedule": "Schedule"
      }
    },
    "pinned": "Pinned",
    "markAsRead": "Mark as read",
    "unread": "Unread"
  }
}
```

---

## Phase 8: Integration & Testing

### 8.1 Integration testing
- Test scheduled publishing works correctly
- Test audience filtering (job seekers don't see company-only news)
- Test read status persistence
- Test pinned posts appear first

### 8.2 Browser testing
- Admin: Create, edit, delete, schedule news
- Admin: Filter and paginate news list
- User: View news on dashboard widget
- User: Navigate to news page
- User: Read news and verify unread indicator updates

---

## File Summary

### New Backend Files
- `prisma/schema.prisma` (update)
- `src/news/news.module.ts`
- `src/news/controller/news.controller.ts`
- `src/news/controller/news.controller.spec.ts`
- `src/news/usecase/*.ts` (9 use case files + specs)
- `src/news/repository/news.repository.ts`
- `src/news/infrastructure/prisma-news.repository.ts`
- `src/news/dto/*.ts` (3 DTO files)
- `src/app.module.ts` (update - add NewsModule, ScheduleModule)

### New Frontend Files
- `components/news/NewsCategoryBadge.tsx`
- `components/news/NewsCard.tsx`
- `components/news/NewsWidget.tsx`
- `components/news/MarkdownRenderer.tsx`
- `app/dashboard/admin/news/page.tsx`
- `app/dashboard/admin/news/create/page.tsx`
- `app/dashboard/admin/news/edit/[id]/page.tsx`
- `app/dashboard/job-seeker/news/page.tsx`
- `app/dashboard/company/news/page.tsx`
- `lib/news/api.ts`
- `lib/news/types.ts`
- `components/layout/Sidebar.tsx` (update - add News item)
- `messages/en.json` (update)
- `messages/nl.json` (update)

### Updated Frontend Files
- `app/dashboard/job-seeker/page.tsx` (add NewsWidget)
- `app/dashboard/company/page.tsx` (add NewsWidget)

---

## Estimated Scope
- Database: 2 new models, 3 new enums
- Backend: 1 new module, ~15 new files
- Frontend: ~12 new files, ~5 updated files
- Tests: ~10 new test files

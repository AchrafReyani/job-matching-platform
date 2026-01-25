# Feature Plan: Dashboard Redesign + Notifications

## Overview

Redesign the dashboard with a fixed left sidebar navigation and add a notification system for both job seekers and companies.

---

## Navigation Structure

### Layout
- **Fixed left sidebar** on all authenticated pages
- Main content area to the right of sidebar
- Sidebar always visible (not collapsible)

### Job Seeker Sidebar Items
1. Dashboard
2. Vacancies (browse jobs)
3. Applications (my applications)
4. Messages (chats)
5. Profile
6. Settings

### Company Sidebar Items
1. Dashboard
2. My Vacancies
3. Applications (incoming)
4. Messages (chats)
5. Profile
6. Settings

---

## Dashboard Content

### Job Seeker Dashboard

**Stats Cards:**
| Stat | Description |
|------|-------------|
| Pending | Applications awaiting response |
| Accepted | Applications that were accepted |
| Rejected | Applications that were rejected |
| Total Sent | Total applications submitted |

**Notifications Section:**
- List of recent notifications (see Notification Events below)
- Unread notifications highlighted
- "Mark all as read" action

**Recent Activity:**
- Same content as notifications, chronologically ordered

### Company Dashboard

**Stats Cards:**
| Stat | Description |
|------|-------------|
| Active Vacancies | Currently open job postings |
| Total Applicants | All-time applicant count |
| Pending Review | Applications not yet reviewed |
| Accepted | Candidates accepted |
| Rejected | Candidates rejected |
| New This Week | Applicants received in last 7 days |

**Notifications Section:**
- List of recent notifications
- Unread notifications highlighted
- "Mark all as read" action

**Recent Activity:**
- Same content as notifications, chronologically ordered

---

## Notification System

### Storage
- **New database table: `Notification`**
- Stores all notifications with read/unread status
- Supports badge counter on sidebar

### Notification Events

**Job Seeker receives notifications for:**
| Event | Message Example |
|-------|-----------------|
| Application Accepted | "Your application to {vacancy} at {company} was accepted!" |
| Application Rejected | "Your application to {vacancy} at {company} was not selected" |
| New Message | "New message from {company} about {vacancy}" |

**Company receives notifications for:**
| Event | Message Example |
|-------|-----------------|
| New Application | "{name} applied to {vacancy}" |
| New Message | "New message from {name} about {vacancy}" |
| Application Withdrawn | "{name} withdrew their application to {vacancy}" |

### Read/Unread Status
- Notifications start as unread
- Badge counter shows unread count on Dashboard sidebar item
- Viewing notifications page marks them as read
- "Mark all as read" button available

### Delivery Method
- **Refresh-based** (not real-time)
- Notifications load when user visits dashboard or refreshes
- No WebSocket infrastructure required

---

## Database Schema Changes

```prisma
model Notification {
  id          Int       @id @default(autoincrement())
  userId      String
  type        NotificationType
  title       String
  message     String
  relatedId   Int?      // applicationId, vacancyId, etc.
  isRead      Boolean   @default(false)
  createdAt   DateTime  @default(now())

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum NotificationType {
  APPLICATION_ACCEPTED
  APPLICATION_REJECTED
  NEW_MESSAGE
  NEW_APPLICATION
  APPLICATION_WITHDRAWN
}
```

---

## API Endpoints

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get user's notifications (paginated) |
| GET | `/notifications/unread-count` | Get unread notification count |
| PATCH | `/notifications/:id/read` | Mark single notification as read |
| PATCH | `/notifications/read-all` | Mark all notifications as read |

### Dashboard Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get dashboard statistics for current user |

---

## UI Components to Create

### Shared Components
- `Sidebar` - Left navigation sidebar
- `SidebarItem` - Individual nav item with icon, label, optional badge
- `StatCard` - Dashboard stat display card
- `NotificationList` - List of notifications
- `NotificationItem` - Single notification row

### Layout Changes
- `DashboardLayout` - Wrapper with sidebar for all authenticated pages
- Update existing pages to use new layout

---

## Implementation Order

1. Create `Notification` database model and migration
2. Create notification API endpoints
3. Build Sidebar component
4. Build DashboardLayout wrapper
5. Build StatCard and stats API
6. Build NotificationList/NotificationItem components
7. Integrate notifications into existing actions (accept/reject application, send message, etc.)
8. Update all authenticated pages to use DashboardLayout
9. Update seed data to include sample notifications

---

## File Structure

```
apps/frontend/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── SidebarItem.tsx
│   │   └── DashboardLayout.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   └── StatsGrid.tsx
│   └── notifications/
│       ├── NotificationList.tsx
│       ├── NotificationItem.tsx
│       └── NotificationBadge.tsx
├── app/
│   └── dashboard/
│       └── page.tsx (updated)

apps/backend/
├── src/
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   └── dto/
│   └── dashboard/
│       ├── dashboard.module.ts
│       ├── dashboard.controller.ts
│       └── dashboard.service.ts
```

---

## Notes

- Notifications are created server-side when relevant actions occur
- Need to update ApplicationsService to create notifications on status change
- Need to update MessagesService to create notifications on new message
- Badge counter refreshes on page load, not in real-time

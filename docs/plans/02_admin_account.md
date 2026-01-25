# Feature Plan: Admin Account

## Overview

Add an admin account with a management dashboard to oversee users and vacancies on the platform. Admin has full CRUD capabilities with data archiving before deletion.

---

## Admin Account Structure

### Creation
- **Single admin account** created via seed data only
- No registration path for admins
- No ability to create additional admins via UI

### Credentials (Seed Data)
```
Email: admin@jobmatch.com
Password: admin123 (change in production)
Role: ADMIN
```

---

## Admin Navigation

Reuses the existing sidebar structure with an added Admin section:

### Admin Sidebar Items
1. Dashboard (admin overview)
2. Users (user management)
3. Vacancies (vacancy management)
4. Settings

---

## Admin Dashboard

### Platform Stats

| Stat | Description |
|------|-------------|
| Total Job Seekers | All registered job seekers |
| Total Companies | All registered companies |
| Total Vacancies | All job postings |
| Total Applications | All applications submitted |
| Active Vacancies | Currently open positions |
| Pending Applications | Applications awaiting review |
| New Users This Week | Registrations in last 7 days |
| Applications This Month | Applications in last 30 days |

### Quick Links
- Go to User Management
- Go to Vacancy Management

---

## User Management Page

### Features

**View:**
- Paginated list of all users
- Filter by role (Job Seeker / Company)
- Search by email or name
- Sort by date, name, email

**Table Columns:**
| Column | Description |
|--------|-------------|
| Email | User email |
| Name | Full name or company name |
| Role | JOB_SEEKER or COMPANY |
| Created | Registration date |
| Actions | Edit, Delete buttons |

**Edit User:**
- Modal or separate page
- Editable fields: email, name/company name, website, description
- Cannot change role or password

**Delete User:**
- Simple confirm dialog: "Are you sure you want to delete this user?"
- Archives user data before deletion (see Archive System below)
- Cascade deletes all related data after archiving

**Bulk Actions:**
- "Delete All Job Seekers" button (with confirmation)
- "Delete All Companies" button (with confirmation)

---

## Vacancy Management Page

### Features

**View:**
- Paginated list of all vacancies
- Filter by company
- Search by title
- Sort by date, title, company

**Table Columns:**
| Column | Description |
|--------|-------------|
| Title | Vacancy title |
| Company | Company name |
| Role | Job role/category |
| Applications | Number of applications |
| Created | Post date |
| Actions | Edit, Delete buttons |

**Edit Vacancy:**
- Modal or separate page
- Editable fields: title, salary range, role, description

**Delete Vacancy:**
- Simple confirm dialog
- Archives vacancy data before deletion
- Cascade deletes related applications and messages

**Bulk Actions:**
- "Delete All Vacancies" button (with confirmation)

---

## Archive System

Before any deletion, data is archived to preserve audit trail.

### Archive Tables

```prisma
model ArchivedUser {
  id            Int       @id @default(autoincrement())
  originalId    String    // Original user UUID
  email         String
  role          String
  profileData   Json      // JobSeeker or Company profile as JSON
  archivedAt    DateTime  @default(now())
  archivedBy    String    // Admin user ID who performed deletion
}

model ArchivedVacancy {
  id            Int       @id @default(autoincrement())
  originalId    Int       // Original vacancy ID
  companyName   String    // Denormalized for reference
  title         String
  salaryRange   String?
  role          String
  jobDescription String
  applicationCount Int    // Number of applications at time of deletion
  archivedAt    DateTime  @default(now())
  archivedBy    String    // Admin user ID
}

model ArchivedApplication {
  id            Int       @id @default(autoincrement())
  originalId    Int
  vacancyTitle  String    // Denormalized
  seekerName    String    // Denormalized
  status        String
  messageCount  Int       // Number of messages at time of deletion
  archivedAt    DateTime  @default(now())
  archivedBy    String
}
```

### Archive Flow

**When deleting a user:**
1. Create ArchivedUser record with profile data as JSON
2. For each vacancy (if company): create ArchivedVacancy
3. For each application: create ArchivedApplication
4. Delete user (cascades to profile, vacancies, applications, messages)

**When deleting a vacancy:**
1. Create ArchivedVacancy record
2. For each application: create ArchivedApplication
3. Delete vacancy (cascades to applications, messages)

---

## Database Schema Changes

```prisma
enum Role {
  JOB_SEEKER
  COMPANY
  ADMIN
}

model User {
  // ... existing fields
  role  Role
}

model ArchivedUser {
  id            Int       @id @default(autoincrement())
  originalId    String
  email         String
  role          String
  profileData   Json
  archivedAt    DateTime  @default(now())
  archivedBy    String
}

model ArchivedVacancy {
  id              Int       @id @default(autoincrement())
  originalId      Int
  companyName     String
  title           String
  salaryRange     String?
  role            String
  jobDescription  String
  applicationCount Int
  archivedAt      DateTime  @default(now())
  archivedBy      String
}

model ArchivedApplication {
  id            Int       @id @default(autoincrement())
  originalId    Int
  vacancyTitle  String
  seekerName    String
  status        String
  messageCount  Int
  archivedAt    DateTime  @default(now())
  archivedBy    String
}
```

---

## API Endpoints

### Admin Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| - | - | Uses existing auth, just checks for ADMIN role |

### Admin Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Get platform statistics |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users (paginated, filterable) |
| GET | `/admin/users/:id` | Get user details |
| PATCH | `/admin/users/:id` | Update user details |
| DELETE | `/admin/users/:id` | Archive and delete user |
| DELETE | `/admin/users/bulk/job-seekers` | Delete all job seekers |
| DELETE | `/admin/users/bulk/companies` | Delete all companies |

### Vacancy Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/vacancies` | List all vacancies (paginated, filterable) |
| GET | `/admin/vacancies/:id` | Get vacancy details |
| PATCH | `/admin/vacancies/:id` | Update vacancy details |
| DELETE | `/admin/vacancies/:id` | Archive and delete vacancy |
| DELETE | `/admin/vacancies/bulk/all` | Delete all vacancies |

---

## Authorization

### Route Guards
- All `/admin/*` routes require authenticated user with `role === 'ADMIN'`
- Return 403 Forbidden for non-admin users

### Frontend Guards
- Admin sidebar items only visible to admin users
- Admin routes redirect non-admins to their dashboard

---

## UI Components to Create

### Admin Components
- `AdminDashboard` - Stats overview page
- `AdminStatsCard` - Individual stat display
- `UserManagementTable` - Users list with actions
- `VacancyManagementTable` - Vacancies list with actions
- `EditUserModal` - User editing form
- `EditVacancyModal` - Vacancy editing form
- `ConfirmDeleteDialog` - Reusable confirmation dialog
- `BulkDeleteButton` - Button with confirmation for bulk actions

---

## Implementation Order

1. Add ADMIN to Role enum, create migration
2. Create archive tables, migration
3. Update seed data with admin account
4. Create admin guard/middleware on backend
5. Create admin stats endpoint
6. Create admin user management endpoints
7. Create admin vacancy management endpoints
8. Build AdminDashboard page
9. Build UserManagementTable and related components
10. Build VacancyManagementTable and related components
11. Add admin section to sidebar (conditionally rendered)
12. Update frontend route guards

---

## File Structure

```
apps/backend/src/
├── admin/
│   ├── admin.module.ts
│   ├── admin.controller.ts
│   ├── admin.service.ts
│   ├── guards/
│   │   └── admin.guard.ts
│   └── dto/
│       ├── update-user.dto.ts
│       └── update-vacancy.dto.ts

apps/frontend/
├── app/
│   └── admin/
│       ├── page.tsx (dashboard)
│       ├── users/
│       │   └── page.tsx
│       └── vacancies/
│           └── page.tsx
├── components/
│   └── admin/
│       ├── AdminStatsCard.tsx
│       ├── UserManagementTable.tsx
│       ├── VacancyManagementTable.tsx
│       ├── EditUserModal.tsx
│       ├── EditVacancyModal.tsx
│       └── ConfirmDeleteDialog.tsx
```

---

## Seed Data Addition

```typescript
// In seed.ts
const adminUser = await prisma.user.create({
  data: {
    email: 'admin@jobmatch.com',
    passwordHash: await bcrypt.hash('admin123', 10),
    role: Role.ADMIN,
  },
});
```

---

## Notes

- Admin cannot delete themselves
- Bulk delete operations should be rate-limited or require additional confirmation
- Archive tables are append-only (no delete/update operations)
- Consider adding an "Archives" view page for admin to see deleted data history (future enhancement)

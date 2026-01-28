# Plan 7: Comprehensive Codebase Refactoring

## Overview
This plan consolidates duplicate code patterns identified across the frontend and backend, reducing code duplication by an estimated 20-30%.

---

## Phase 1: Shared Infrastructure (High Priority)

### 1.1 Backend - Consolidate AuthenticatedRequest Interface
**Problem**: Same interface defined in 6+ controller files
**Files affected**:
- notifications.controller.ts
- applications.controller.ts
- dashboard.controller.ts
- messages.controller.ts
- admin.controller.ts
- vacancy.controller.ts

**Solution**: Create `src/common/interfaces/authenticated-request.interface.ts`

### 1.2 Backend - Remove Duplicate DTOs
**Problem**: Registration DTOs exist in both `/auth/dto/` and `/user-management/dto/`
**Files to remove**:
- auth/dto/register-company.dto.ts
- auth/dto/register-jobseeker.dto.ts
- auth/dto/update-company.dto.ts
- auth/dto/update-jobseeker.dto.ts

**Solution**: Use user-management DTOs everywhere, update imports

### 1.3 Backend - Create Prisma Select Constants
**Problem**: Same select fragments repeated 15+ times
**Solution**: Create `src/common/prisma/selects.ts` with reusable constants

---

## Phase 2: Frontend Shared Components (High Priority)

### 2.1 Create LoadingSpinner Component
**Problem**: Same loading spinner pattern in 10+ files
**Solution**: Create `components/ui/LoadingSpinner.tsx`

### 2.2 Create EmptyState Component
**Problem**: Same empty state pattern in 8+ files
**Solution**: Create `components/ui/EmptyState.tsx`

### 2.3 Create StatusBadge Component
**Problem**: Same status color logic in applications pages
**Solution**: Create `components/ui/StatusBadge.tsx`

---

## Phase 3: Frontend Page Consolidation (Medium Priority)

### 3.1 Consolidate Messages Pages
**Problem**: company/messages and job-seeker/messages are 85% identical
**Solution**: Create shared `features/messages/components/MessagesPageContent.tsx`

### 3.2 Consolidate Dashboard Home Pages
**Problem**: company/page.tsx and job-seeker/page.tsx are 90% identical
**Solution**: Create shared `features/dashboard/components/DashboardHome.tsx`

### 3.3 Consolidate Profile Edit Pages
**Problem**: Both profile edit pages have identical logic
**Solution**: Create `useProfileEdit` hook in `features/profile/hooks/`

### 3.4 Consolidate Vacancy Forms
**Problem**: Add and Edit vacancy pages share 70% code
**Solution**: Create `features/vacancies/components/VacancyForm.tsx`

---

## Phase 4: Backend Use Case Patterns (Medium Priority)

### 4.1 Create Role-Based Guards
**Problem**: Role checks repeated inline in controllers
**Solution**: Create `src/common/guards/roles.guard.ts` with decorators

### 4.2 Extract Notification Helper
**Problem**: Notification creation logic duplicated in use cases
**Solution**: Create `src/common/services/notification.helper.ts`

---

## Phase 5: Frontend API Consolidation (Low Priority)

### 5.1 Fix settings/api.ts
**Problem**: Manual fetch instead of using authRequest wrapper
**Solution**: Refactor to use authRequest consistently

---

## Execution Order
1. Phase 1 (Backend infrastructure) - Foundation for other changes
2. Phase 2 (UI components) - Quick wins, high visibility
3. Phase 3 (Page consolidation) - Largest code reduction
4. Phase 4 (Backend patterns) - Clean architecture
5. Phase 5 (API cleanup) - Final polish

## Testing Strategy
After all refactoring:
1. Run all 185+ backend tests
2. Run frontend build check
3. Full browser verification of all major flows:
   - Login/Register (both roles)
   - Dashboard (both roles)
   - Profile view/edit (both roles)
   - Vacancies (browse, add, edit)
   - Applications (submit, accept/reject)
   - Messages (send, receive, delete match)
   - Settings (password change, notifications, delete account)
   - Admin panel (users, vacancies management)

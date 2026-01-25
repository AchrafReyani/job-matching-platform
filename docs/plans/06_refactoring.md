# Feature Plan: Codebase Refactoring

## Overview

Audit-based refactoring to eliminate duplicate code patterns and improve maintainability across both frontend and backend codebases.

---

## Frontend Refactoring

### Phase 1: High Impact (Do First)

#### 1.1 Create `useAsyncData<T>()` Hook
**Files affected:** 14+ page components

**Current duplication:**
```typescript
// Repeated in every page:
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState(null);

useEffect(() => {
  const load = async () => {
    try {
      setData(await apiCall());
    } catch (err) {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);
```

**Solution:** Create `lib/hooks/useAsyncData.ts`
```typescript
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = []
): { data: T | null; loading: boolean; error: string | null; refetch: () => void }
```

**Files to update:**
- `app/dashboard/company/page.tsx`
- `app/dashboard/job-seeker/page.tsx`
- `app/dashboard/company/applications/page.tsx`
- `app/dashboard/job-seeker/applications/page.tsx`
- `app/dashboard/company/vacancies/page.tsx`
- `app/dashboard/job-seeker/vacancies/page.tsx`
- `app/dashboard/company/vacancies/add/page.tsx`
- `app/dashboard/company/vacancies/edit/[id]/page.tsx`
- And 6+ more pages

---

#### 1.2 Extract `MessagesPageLayout` Component
**Files affected:**
- `app/dashboard/company/messages/page.tsx`
- `app/dashboard/job-seeker/messages/page.tsx`

**Current duplication:** 95% identical code, only differs in:
- Dashboard back link path
- `userRole` prop value

**Solution:** Create `components/messages/MessagesPageLayout.tsx`
```typescript
interface MessagesPageLayoutProps {
  dashboardPath: string;
  userRole: 'COMPANY' | 'JOB_SEEKER';
}
```

---

#### 1.3 Create Form Hooks
**Files affected:**
- `app/dashboard/company/profile/edit/page.tsx`
- `app/dashboard/job-seeker/profile/edit/page.tsx`
- `app/dashboard/company/vacancies/add/page.tsx`
- `app/dashboard/company/vacancies/edit/[id]/page.tsx`

**Solution:** Create two hooks in `lib/hooks/`:

**`useFormState.ts`:**
```typescript
export function useFormState<T>(initialState: T): {
  form: T;
  updateField: (key: keyof T, value: any) => void;
  reset: () => void;
}
```

**`useFormSubmit.ts`:**
```typescript
export function useFormSubmit(onSubmit: () => Promise<void>): {
  loading: boolean;
  message: string | null;
  submit: () => Promise<void>;
}
```

---

### Phase 2: Medium Impact

#### 2.1 Create `StatusBadge` Component
**Files affected:**
- `app/dashboard/company/applications/page.tsx`
- `app/dashboard/job-seeker/applications/page.tsx`

**Solution:** Create `components/ui/StatusBadge.tsx`
```typescript
interface StatusBadgeProps {
  status: 'APPLIED' | 'ACCEPTED' | 'REJECTED';
}
```

---

#### 2.2 Create `VacancyCard` Component
**Files affected:**
- `app/dashboard/company/vacancies/page.tsx`
- `app/dashboard/job-seeker/vacancies/page.tsx`

**Solution:** Create `components/vacancies/VacancyCard.tsx`
```typescript
interface VacancyCardProps {
  vacancy: Vacancy;
  actions?: React.ReactNode;
}
```

---

#### 2.3 Standardize Loading/Error Components
**Files affected:** 10+ pages

**Solution:** Enhance `components/LoadingScreen.tsx` and create `components/ErrorMessage.tsx`
```typescript
// LoadingScreen
interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

// ErrorMessage
interface ErrorMessageProps {
  message: string;
  fullScreen?: boolean;
  onRetry?: () => void;
}
```

---

#### 2.4 Create `usePolling<T>()` Hook
**Files affected:**
- `features/messages/hooks/useChat.ts`
- `features/messages/hooks/useConversations.ts`

**Solution:** Create `lib/hooks/usePolling.ts`
```typescript
export function usePolling<T>(
  fetcher: () => Promise<T>,
  interval: number = 5000
): { data: T | null; loading: boolean; error: string | null; refetch: () => void }
```

---

### Phase 3: Low Impact (Nice to Have)

#### 3.1 Generic Profile Components
- Create `ProfileDetailsView` for displaying profile fields
- Create `ProfileFormFields` for editing profile fields
- Consolidate `ProfileDetailsCompany` and `ProfileDetailsJobSeeker`
- Consolidate `ProfileFormCompany` and `ProfileFormJobSeeker`

---

## Backend Refactoring

### Phase 1: High Impact

#### 1.1 Consolidate Duplicate DTOs
**Current state:** 8 duplicate DTO files between `auth/dto/` and `user-management/dto/`

| Auth DTO | User-Management DTO | Action |
|----------|---------------------|--------|
| `register-company.dto.ts` | `register-company.dto.ts` | Merge to shared |
| `register-jobseeker.dto.ts` | `register-jobseeker.dto.ts` | Merge to shared |
| `update-company.dto.ts` | `update-company.dto.ts` | Merge to shared |
| `update-jobseeker.dto.ts` | `update-jobseeker.dto.ts` | Merge to shared |

**Solution:** Create `src/shared/dto/` folder:
```
src/shared/dto/
├── register-company.dto.ts
├── register-jobseeker.dto.ts
├── update-company.dto.ts
├── update-jobseeker.dto.ts
└── index.ts (re-exports)
```

Update imports in:
- `src/auth/` module
- `src/user-management/` module

---

#### 1.2 Extract Shared Types
**Current state:** `AuthenticatedRequest` interface defined in 5 files

**Solution:** Create `src/shared/types/authenticated-request.ts`
```typescript
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: Role;
  };
}
```

Update all controllers to import from shared location.

---

### Phase 2: Medium Impact

#### 2.1 Create Role Guard Decorator
**Current state:** Role checks repeated in controllers
```typescript
if (req.user.role !== 'COMPANY') {
  throw new ForbiddenException('Only companies can...');
}
```

**Solution:** Create `src/shared/guards/roles.guard.ts` and `@Roles()` decorator
```typescript
@Roles('COMPANY')
@Post()
create() { ... }
```

---

#### 2.2 Extract Authorization Utilities
**Current state:** Participant validation repeated in message usecases

**Solution:** Create `src/shared/utils/authorization.ts`
```typescript
export function validateParticipant(
  userId: string,
  allowedIds: string[],
  errorMessage: string
): void {
  if (!allowedIds.includes(userId)) {
    throw new ForbiddenException(errorMessage);
  }
}
```

---

## New File Structure

### Frontend
```
apps/frontend/
├── lib/
│   └── hooks/
│       ├── useAsyncData.ts      (NEW)
│       ├── useFormState.ts      (NEW)
│       ├── useFormSubmit.ts     (NEW)
│       └── usePolling.ts        (NEW)
├── components/
│   ├── ui/
│   │   ├── StatusBadge.tsx      (NEW)
│   │   ├── LoadingScreen.tsx    (ENHANCED)
│   │   └── ErrorMessage.tsx     (NEW)
│   ├── vacancies/
│   │   └── VacancyCard.tsx      (NEW)
│   └── messages/
│       └── MessagesPageLayout.tsx (NEW)
```

### Backend
```
apps/backend/src/
├── shared/
│   ├── dto/
│   │   ├── register-company.dto.ts
│   │   ├── register-jobseeker.dto.ts
│   │   ├── update-company.dto.ts
│   │   ├── update-jobseeker.dto.ts
│   │   └── index.ts
│   ├── types/
│   │   └── authenticated-request.ts
│   ├── guards/
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   └── roles.decorator.ts
│   └── utils/
│       └── authorization.ts
```

---

## Implementation Order

### Sprint 1: Foundation Hooks
1. Create `useAsyncData` hook
2. Create `useFormState` hook
3. Create `useFormSubmit` hook
4. Update 2-3 pages to use new hooks (test)

### Sprint 2: UI Components
1. Create `StatusBadge` component
2. Create `VacancyCard` component
3. Create/enhance `LoadingScreen` and `ErrorMessage`
4. Update pages to use new components

### Sprint 3: Layout Components
1. Create `MessagesPageLayout`
2. Update both messages pages
3. Consolidate any remaining page duplications

### Sprint 4: Backend Cleanup
1. Create shared DTO folder, move DTOs
2. Create shared types (AuthenticatedRequest)
3. Create roles guard and decorator
4. Update all controllers

---

## Testing Strategy

1. **Before refactoring:** Ensure existing tests pass
2. **After each hook/component:** Write unit tests
3. **After page updates:** Run integration tests
4. **Final:** Full regression test

---

## Estimated Impact

| Metric | Before | After |
|--------|--------|-------|
| Duplicate code blocks | ~50+ | ~10 |
| Lines of code (frontend) | ~6000 | ~4500 |
| Lines of code (backend) | ~3000 | ~2700 |
| Maintenance burden | High | Low |

---

## Notes

- Refactoring should be done incrementally, not all at once
- Each refactored component should be tested before moving on
- Consider feature flags for gradual rollout if needed
- Update documentation as patterns are established
- This work can be done in parallel with other features

# Claude Code Project Guidelines

## Development Workflow

### TDD (Test-Driven Development) - MANDATORY
All features must follow TDD:
1. Write unit tests first (backend use cases, frontend API functions)
2. Implement the feature to make tests pass
3. Write E2E tests for API endpoints
4. All tests must pass before considering feature complete

### Browser Verification - MANDATORY
After implementing any new feature:
1. **Re-seed the database first** for consistent test data: `docker-compose exec -T backend npx prisma db seed`
2. Use Chrome browser automation tools to manually verify the feature works
3. Test as different user roles (JOB_SEEKER, COMPANY, ADMIN) when applicable
4. Verify UI renders correctly and interactions work as expected
5. Take screenshots to confirm functionality before marking complete

## Project Architecture

### Tech Stack
- **Backend**: NestJS with clean architecture (Controllers → Use Cases → Repositories)
- **Frontend**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **i18n**: next-intl (English + Dutch)
- **Styling**: Tailwind CSS with CSS variables for theming

### Development Environment
- **Docker**: Always use `docker-compose up` to run the full stack
- **Ports**: Frontend on 3000, Backend on 3001, Database on 5432
- **Hot reload**: Source code is mounted as volumes for live updates

## Important Patterns

### Routing Convention
Dashboard pages follow: `/dashboard/[role]/[feature]`
- `/dashboard/job-seeker/...`
- `/dashboard/company/...`
- `/dashboard/admin/...`
- `/dashboard/settings` (shared across roles)

Do NOT put pages at root level like `/settings` - they won't work properly.

### i18n - No Hardcoded Text
All user-facing text must use translations:
- Frontend: `useTranslations('Namespace')` hook
- Add keys to both `messages/en.json` and `messages/nl.json`
- Never hardcode strings in components

### Backend Clean Architecture
```
Controller (HTTP layer)
    ↓
Use Case (Business logic)
    ↓
Repository Interface
    ↓
Prisma Repository (Implementation)
```

### Type Safety
- Use `import type` for interfaces used only as types
- Avoid `any` - define proper types
- Backend DTOs use class-validator decorators

## Common Gotchas

### Prisma in Docker
When changing `schema.prisma`:
1. Run migration: `docker exec job_matching_backend npx prisma migrate dev`
2. Regenerate client: `docker exec job_matching_backend npx prisma generate`
3. Restart backend container if needed

### Rate Limiting
Use `@nestjs/throttler` for security-sensitive endpoints:
- Password change: 5 attempts per minute
- Account deletion: 3 attempts per minute
- Login attempts: Consider rate limiting

### Test Accounts (from seed)
- Job Seekers: `charlie@example.com`, `bob@example.com` (password: `password123`)
- Companies: `hr@techcorp.com`, `hr@innovate.io` (password: `password123`)
- Admin: `admin@jobmatch.com` (password: `admin123`)

### Notification Preferences
Different roles have different notification types:
- **Job Seekers**: applicationAccepted, applicationRejected, newMessages
- **Companies**: newApplications, applicationWithdrawn, newMessages

Always check user preferences before creating notifications.

## Testing Requirements

### Backend Tests
- Unit tests for each use case (`*.usecase.spec.ts`)
- Controller tests (`*.controller.spec.ts`)
- E2E tests in `test/` folder (`*.e2e-spec.ts`)

### Frontend Tests
- API function tests (`*.test.ts`)
- Use Jest with jsdom environment for frontend

### Running Tests
```bash
# Backend unit tests
docker exec job_matching_backend npm test

# Backend E2E tests
docker exec job_matching_backend npm run test:e2e

# Frontend tests
cd apps/frontend && npm test
```

## Before Committing - MANDATORY CHECKS

**Always run these commands and ensure they pass before committing:**

### 1. Backend Lint (must pass with no errors)
```bash
docker-compose exec -T backend npm run lint
```

### 2. Backend Unit Tests (all must pass)
```bash
docker-compose exec -T backend npm test -- --no-coverage
```

### 3. Frontend Lint (must pass with no errors/warnings)
```bash
cd apps/frontend && npm run lint
```

### 4. Frontend Unit Tests (all must pass)
```bash
cd apps/frontend && npm test
```

### 5. Additional Checks
- Browser verification complete (test with Chrome automation or manually)
- i18n translations added for both EN and NL
- No hardcoded text in UI

**Do NOT commit until ALL lint and test commands pass successfully.**

## Git Conventions

- Feature branches: `feature/[plan-number]-[feature-name]`
- Commit messages: Use conventional commits (feat:, fix:, test:, etc.)
- Always include `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`

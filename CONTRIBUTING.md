# Contributing to JobMatch

Thanks for your interest! JobMatch is a full-stack job-matching platform
(Next.js + NestJS + PostgreSQL). This guide gets you from clone to a
running stack and a green test suite.

## Prerequisites

- Docker + Docker Compose (the supported way to run everything)
- Node.js 20+ and npm (only if you run an app outside Docker)

## Run the stack

```sh
git clone https://github.com/AchrafReyani/job-matching-platform.git
cd job-matching-platform
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend (Swagger): http://localhost:3001/api-docs
- Postgres: localhost:5432 (`dev` / `devpass`)

Apply migrations and seed demo data:

```sh
docker exec job_matching_backend npx prisma migrate deploy
docker exec job_matching_backend npx prisma db seed
```

Seed accounts (password `password123`, admin `admin123`):

| Role       | Email                                 |
|------------|---------------------------------------|
| Job seeker | charlie@example.com, bob@example.com  |
| Company    | hr@techcorp.com, hr@innovate.io       |
| Admin      | admin@jobmatch.com                    |

## Project layout

```
apps/backend    NestJS API — clean architecture: Controller → Use Case → Repository → Prisma
apps/frontend   Next.js 15 (App Router), next-intl (EN + NL), Tailwind
```

## Tests, lint, types (run before every PR)

Run these on the **host** (not `docker exec`) so tooling picks up
`apps/backend/.prettierrc`:

```sh
# Backend
cd apps/backend
npm test                 # unit tests
npm run test:e2e         # end-to-end (needs the db container up)
npx tsc --noEmit         # types
npm run lint             # eslint + prettier

# Frontend
cd apps/frontend
npm test
npx tsc --noEmit
npm run lint
```

## Conventions

- **Clean architecture** on the backend: a controller calls a use case,
  which calls a repository interface, implemented by a Prisma repository.
  Each use case has a `*.usecase.spec.ts`; endpoints have e2e tests.
- **No hardcoded UI text** — use `next-intl` and add keys to both
  `apps/frontend/messages/en.json` and `nl.json`.
- **Quotes/formatting**: prettier enforces single quotes + LF (see
  `.prettierrc` / `.editorconfig`). `.gitattributes` normalizes line
  endings, so Windows contributors get clean diffs.
- **Commits**: conventional commits (`feat:`, `fix:`, `test:`, `chore:`).
  Branches: `feature/<short-name>` or `fix/<short-name>`.
- When changing `schema.prisma`, generate a migration:
  `docker exec job_matching_backend npx prisma migrate dev --name <change>`.

## Prisma in Docker

```sh
docker exec job_matching_backend npx prisma migrate dev --name <change>
docker exec job_matching_backend npx prisma generate
```

## Optional: LINE login (renkei)

The backend can offer "Continue with LINE" via
[renkei](https://github.com/AchrafReyani/renkei), a self-hosted OIDC
broker for LINE. It's off unless `RENKEI_ISSUER`, `RENKEI_CLIENT_ID`,
`RENKEI_CLIENT_SECRET` and `BACKEND_URL` are set (see
`apps/backend/.env.example`). You do **not** need it to work on the rest
of the app.

## Good first issues

Look for the [`good first issue`](https://github.com/AchrafReyani/job-matching-platform/labels/good%20first%20issue)
label. Questions are welcome in an issue or on a draft PR.

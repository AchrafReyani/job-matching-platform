# Job Matching Platform – Local Development Setup

This guide explains how to set up and run the **Job Matching Platform** locally using **Docker**. The entire stack (PostgreSQL, NestJS backend, Next.js frontend) runs in containers with hot-reload enabled.

---

## Prerequisites

Before you start, make sure you have installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

That's it! Node.js is not required on your machine since everything runs in Docker.

---

## Quick Start

**Start everything with one command:**

```bash
docker-compose up --build
```

**First time only – run migrations and seed the database:**

```bash
docker exec job_matching_backend npx prisma migrate deploy
docker exec job_matching_backend npx prisma db seed
```

**Access the application:**

| Service      | URL                     |
|--------------|-------------------------|
| Frontend     | http://localhost:3000   |
| Backend API  | http://localhost:3001   |
| Swagger Docs | http://localhost:3001/api |

---

## Seed Data & Demo Accounts

The seed command populates the database with demo data for testing. All demo accounts use the password: **`password123`**

### Job Seeker Accounts

| Email               | Name           | Notes                                      |
|---------------------|----------------|--------------------------------------------|
| alice@example.com   | Alice Johnson  | Has accepted application with active chat  |
| bob@example.com     | Bob Smith      | Has accepted application with active chat  |
| charlie@example.com | Charlie Brown  | Has pending application                    |
| diana@example.com   | Diana Prince   | Has multiple applications (accepted + pending) |
| evan@example.com    | Evan Williams  | Has rejected + pending applications        |

### Company Accounts

| Email            | Company Name      | Notes                    |
|------------------|-------------------|--------------------------|
| hr@techcorp.com  | TechCorp Solutions | 2 vacancies, multiple applications |
| hr@innovate.io   | Innovate.io       | 2 vacancies with applications |
| hr@startup.dev   | Startup Labs      | 1 vacancy with pending application |
| hr@acme.com      | Acme Corporation  | 1 vacancy with pending application |

### What's Included in Seed Data

- **9 Users** (5 job seekers + 4 companies)
- **6 Vacancies** (various roles: Frontend, Backend, Full Stack, DevOps, Junior)
- **7 Applications** (mix of APPLIED, ACCEPTED, REJECTED statuses)
- **12 Messages** (3 conversation threads between companies and applicants)

---

## Debugging & Viewing Logs

### View logs in real-time (like a terminal)

```bash
docker logs -f job_matching_backend
```

```bash
docker logs -f job_matching_frontend
```

### View all services at once

```bash
docker-compose logs -f
```

### View only backend and frontend (no database logs)

```bash
docker-compose logs -f backend frontend
```

### View last N lines

```bash
docker logs --tail 100 job_matching_backend
```

Press `Ctrl+C` to stop following logs.

---

## Common Commands

### Starting & Stopping

```bash
# Start all services (with rebuild if needed)
docker-compose up --build

# Start all services (without rebuild)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (full reset)
docker-compose down -v
```

### Database Operations

```bash
# Run migrations
docker exec job_matching_backend npx prisma migrate deploy

# Create a new migration
docker exec job_matching_backend npx prisma migrate dev --name <migration_name>

# Seed the database
docker exec job_matching_backend npx prisma db seed

# Reset database (drops all data, re-runs migrations and seed)
docker exec job_matching_backend npx prisma migrate reset --force

# Open Prisma Studio (database GUI)
docker exec -it job_matching_backend npx prisma studio
```

### Container Management

```bash
# Check running containers
docker ps

# Restart a specific service
docker-compose restart backend

# Rebuild a specific service
docker-compose up --build backend

# Access container shell
docker exec -it job_matching_backend sh
docker exec -it job_matching_frontend sh
```

---

## Hot Reload

Hot reload is enabled for both frontend and backend. When you edit files on your machine, changes are automatically detected:

| Service  | Watched Directories                              |
|----------|--------------------------------------------------|
| Backend  | `apps/backend/src/`, `apps/backend/prisma/`      |
| Frontend | `apps/frontend/app/`, `components/`, `features/`, `lib/`, `public/` |

**Note:** Changes to `package.json` or configuration files require rebuilding:

```bash
docker-compose up --build
```

---

## Project Structure

```
job-matching-app/
├── apps/
│   ├── backend/           # NestJS backend (port 3001)
│   │   ├── src/           # Source code
│   │   ├── prisma/        # Database schema & migrations
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts    # Seed data script
│   │   │   └── migrations/
│   │   └── Dockerfile.dev
│   └── frontend/          # Next.js frontend (port 3000)
│       ├── app/           # Next.js App Router pages
│       ├── components/    # Reusable components
│       ├── features/      # Feature modules
│       └── Dockerfile.dev
├── docs/                  # Documentation
├── docker-compose.yml     # Docker orchestration
└── README.md
```

---

## Troubleshooting

### Port already in use

If you get a port conflict error, stop any existing services using those ports:

```bash
# Check what's using a port (Windows)
netstat -ano | findstr :3000

# Or stop all Docker containers
docker stop $(docker ps -q)
```

### Database connection errors

If the backend can't connect to the database, ensure the database container is healthy:

```bash
docker ps
```

The `job_matching_db` container should show `(healthy)` status. If not, try:

```bash
docker-compose down
docker-compose up --build
```

### Changes not reflecting

1. **Code changes:** Ensure you're editing files in the correct directories (see Hot Reload section)
2. **Package changes:** Rebuild the containers: `docker-compose up --build`
3. **Database schema changes:** Run migrations: `docker exec job_matching_backend npx prisma migrate dev`

### Container keeps restarting

Check the logs for errors:

```bash
docker logs job_matching_backend
docker logs job_matching_frontend
```

### Reset everything from scratch

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build

# Run migrations and seed
docker exec job_matching_backend npx prisma migrate deploy
docker exec job_matching_backend npx prisma db seed
```

---

## Environment Variables

Environment variables are configured in `docker-compose.yml`. For local development, the defaults work out of the box.

### Backend Environment

| Variable       | Default Value                                    | Description           |
|----------------|--------------------------------------------------|-----------------------|
| DATABASE_URL   | postgresql://dev:devpass@db:5432/jobmatching     | PostgreSQL connection |
| JWT_SECRET     | your-super-secret-jwt-key-change-in-production   | JWT signing key       |
| PORT           | 3001                                             | Backend port          |
| FRONTEND_URL   | http://localhost:3000                            | CORS allowed origin   |

### Frontend Environment

| Variable              | Default Value           | Description       |
|-----------------------|-------------------------|-------------------|
| NEXT_PUBLIC_API_URL   | http://localhost:3001   | Backend API URL   |

---

## Database Schema

See `database.png` in this folder for the ER diagram, or view the schema in `apps/backend/prisma/schema.prisma`.

**Main entities:**
- **User** – Base authentication (email, password, role)
- **JobSeeker** – Job seeker profile (extends User)
- **Company** – Company profile (extends User)
- **Vacancy** – Job postings by companies
- **Application** – Job applications by seekers
- **Message** – Chat messages on accepted applications

# Prisma Migration Guide

This guide explains how to create, manage, and troubleshoot **Prisma migrations** for the Job Matching Platform.

---

## Overview

Prisma migrations track changes to your database schema over time. All schema changes should be made in `apps/backend/prisma/schema.prisma`, then applied via migrations.

---

## Creating a Migration

### 1. Edit the Prisma Schema

Open `apps/backend/prisma/schema.prisma` and make your changes (add models, fields, relations, etc.).

### 2. Create and Apply the Migration

```bash
docker exec job_matching_backend npx prisma migrate dev --name <migration_name>
```

Replace `<migration_name>` with a descriptive name (e.g., `add_user_avatar`, `create_notifications_table`).

This command will:
- Generate SQL migration files in `prisma/migrations/`
- Apply the migration to your local database
- Regenerate the Prisma Client

### 3. Review the Generated Migration

Check the generated `migration.sql` file in `prisma/migrations/<timestamp>_<name>/` to ensure it matches your intended changes.

---

## Common Migration Commands

### Apply Pending Migrations

```bash
docker exec job_matching_backend npx prisma migrate deploy
```

Use this to apply migrations that haven't been run yet (e.g., after pulling new code).

### Check Migration Status

```bash
docker exec job_matching_backend npx prisma migrate status
```

Shows which migrations have been applied and which are pending.

### Reset Database

```bash
docker exec job_matching_backend npx prisma migrate reset --force
```

This will:
- Drop all tables
- Re-run all migrations from scratch
- Run the seed script

**Warning:** This deletes all data. Only use in development.

### Regenerate Prisma Client

```bash
docker exec job_matching_backend npx prisma generate
```

Run this after pulling changes to `schema.prisma` if you're not running a migration.

---

## Viewing the Database

### Prisma Studio (GUI)

```bash
docker exec -it job_matching_backend npx prisma studio
```

Opens a web-based database browser at http://localhost:5555.

**Note:** You may need to access it via the container's IP if running in Docker. Alternatively, run Prisma Studio locally if you have Node.js installed:

```bash
cd apps/backend
npx prisma studio
```

### Direct Database Access

```bash
docker exec -it job_matching_db psql -U dev -d jobmatching
```

This opens a PostgreSQL shell where you can run SQL queries directly.

---

## Seeding the Database

The seed script (`apps/backend/prisma/seed.ts`) populates the database with demo data.

### Run Seed

```bash
docker exec job_matching_backend npx prisma db seed
```

### Reset and Re-seed

```bash
docker exec job_matching_backend npx prisma migrate reset --force
```

This automatically runs the seed script after resetting.

---

## Best Practices

1. **Always use migrations** – Never modify the database directly in production.

2. **Use descriptive names** – Migration names should describe what changed:
   - Good: `add_user_avatar_field`, `create_notifications_table`
   - Bad: `update`, `fix`, `changes`

3. **Review generated SQL** – Always check the `migration.sql` file before committing.

4. **Test locally first** – Apply and test migrations on your local database before pushing.

5. **Commit migration files** – Migration files in `prisma/migrations/` should be committed to version control.

6. **Don't edit applied migrations** – Once a migration is applied (especially in production), don't modify it. Create a new migration instead.

---

## Troubleshooting

### Migration Failed

If a migration fails partway through:

1. Check the error message in the logs
2. Fix the issue in your schema
3. Reset the database if needed: `docker exec job_matching_backend npx prisma migrate reset --force`

### Schema Drift

If your database schema doesn't match the Prisma schema:

```bash
docker exec job_matching_backend npx prisma db push --force-reset
```

**Warning:** This resets the database. Only use in development.

### Prisma Client Out of Sync

If you get type errors after schema changes:

```bash
docker exec job_matching_backend npx prisma generate
```

Then restart the backend container:

```bash
docker-compose restart backend
```

---

## Migration Files Structure

```
apps/backend/prisma/
├── schema.prisma          # Database schema definition
├── seed.ts                # Seed data script
└── migrations/
    ├── 20231001_init/
    │   └── migration.sql
    ├── 20231015_add_user_profile/
    │   └── migration.sql
    └── migration_lock.toml
```

Each migration folder contains:
- `migration.sql` – The SQL commands that were executed
- Timestamp prefix for ordering

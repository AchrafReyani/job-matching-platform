# Prisma Migration Guide – Local Development

This guide explains how to properly create, test, and manage **Prisma migrations** for your project in a professional, repeatable way. It is intended as a general Prisma workflow guide for local development.

---

## 1. Edit Your Prisma Schema

- Open the `schema.prisma` file in your `backend/prisma` folder.  
- **Do not directly edit your database** in production services like Supabase; always make changes through the Prisma schema.  
- Make the necessary changes to models, fields, or relationships.

---

## 2. Create a Migration

From the `backend` folder, run:

```bash
npx prisma migrate dev --name <your_migration_name>
```

- Replace `<your_migration_name>` with a descriptive name for your migration (e.g., `add_user_profile`).  
- This command will generate SQL migration files under `prisma/migrations` and apply them to your **local database**.  
- Review the generated `migration.sql` file to ensure it matches your intended changes.

---

## 3. Start Your Local Database

If your local PostgreSQL container is not running, start it first:

```bash
docker start job_matching_db
```

Then apply the migration (if not already applied during migration creation):

```bash
npx prisma migrate dev
```

---

## 4. Verify Changes in Prisma Studio

- Open Prisma Studio to visually inspect your database:

```bash
npx prisma studio
```

- Check tables, fields, relationships, and test inserting/updating sample data to ensure the schema works as expected.

---

## 5. Testing Locally

- Test your backend functionality locally against the updated schema.  
- Ensure any queries, mutations, or relations work correctly.  

---

## 6. Committing Changes

- Once satisfied with the migration and local testing, commit your schema and migration files to version control:

> You can commit after verifying everything works locally.

---

## 7. Reverting or Rolling Back Migrations

### Rollback Last Migration

To revert the last migration, you can use:

```bash
npx prisma migrate reset
```

- This will **reset your local database**, apply all migrations from scratch, and is useful during development.  
- Alternatively, if you just want to go **back one migration manually**, you can delete the last folder in `prisma/migrations` and run:

```bash
npx prisma migrate dev
```

> Only do this on local or development databases. Never manually delete migrations on production.

---

## 8. Notes and Best Practices

- Always make schema changes in `schema.prisma`, never directly in the database.  
- Use descriptive migration names for clarity.  
- Review `migration.sql` files to ensure correctness before applying.  
- Test migrations with Prisma Studio and backend code before committing.  
- Treat local database resets carefully—ensure you are **not affecting production data**.

---

This guide provides a repeatable workflow for Prisma migrations in local development, making schema changes safe, testable, and version-controlled.


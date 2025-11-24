# Job Matching Platform – Local Backend Setup

This guide explains how to set up and run the **Job Matching Platform backend** locally using **NestJS**, **Prisma**, and **PostgreSQL**.

---

## 1. Prerequisites

Before you start, make sure you have installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)  
- [Docker](https://www.docker.com/)  
- [Docker Compose](https://docs.docker.com/compose/)  
- [pnpm](https://pnpm.io/) (or npm/yarn)  

---

## 2. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

---

## 3. Configure Environment Variables

Create a `.env` file at the root of the project with at least these variables:

```env
DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/<DB_NAME>"
JWT_SECRET="<your_jwt_secret_here>"
```

- `DATABASE_URL` – Connection string for your local PostgreSQL database.  
  - `<DB_USER>`, `<DB_PASSWORD>`, and `<DB_NAME>` must **match the credentials used in Docker Compose** (see next section).  
  - You can change these credentials if you like, but the backend `.env` and the Docker Compose configuration **must remain consistent**.  
- `JWT_SECRET` – Secret string used to sign JSON Web Tokens for authentication.  
  - You can use any string locally. Only production requires a strong secret.  

---

## 4. Set Up PostgreSQL with Docker

The project includes a `docker-compose.yml` file to run a local PostgreSQL database. Example:

```yaml
version: "3.8"
services:
  db:
    image: postgres:15
    container_name: job_matching_db
    restart: always
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: jobmatching
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

- The `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` **define the initial database credentials**.  
- You can change them to anything you like, but remember to update the `.env` file with the same values.  
- The database is initialized **the first time the container is started**. After that, changing the compose file has no effect on the running database.  

To start PostgreSQL:

```bash
docker-compose up -d
```

Check the container is running:

```bash
docker ps
```

---

## 5. Install Backend Dependencies

```bash
pnpm install
```

or with npm:

```bash
npm install
```

---

## 6. Prisma Setup

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:

- Create tables in the database according to your Prisma schema.  
- Keep your local database schema in sync with Prisma.  

### Optional: Open Prisma Studio

```bash
npx prisma studio
```

Prisma Studio allows you to explore and manipulate the database visually.

---

## 7. Start the Backend

```bash
pnpm start:dev
```

or with npm:

```bash
npm run start:dev
```

The backend should now be running at `http://localhost:3001`.

---

## 8. Verifying the Setup

- Ensure the PostgreSQL container is running (`docker ps`).  
- Check that migrations ran successfully (`npx prisma migrate status`).  
- Test backend endpoints using [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/).  

---

## 9. Key Notes

1. **Docker Compose credentials**  
   - Only used for **initializing the database**.  
   - Must be consistent with the `.env` file.  
   - After initialization, the database keeps running independently of the YAML file.  

2. **JWT_SECRET**  
   - Used locally to sign authentication tokens.  
   - Can be any string for development purposes.  

3. **Changing credentials**  
   - If you want custom credentials, update **both** the Docker Compose file **before first run** and the `.env` file accordingly.
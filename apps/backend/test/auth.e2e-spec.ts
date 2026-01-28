/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "../src/prisma/prisma.service";
import { AppModule } from "../src/app.module";

const request = require("supertest");

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Track created users for cleanup
  const createdUserEmails: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up created users
    for (const email of createdUserEmails) {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          await prisma.jobSeeker.deleteMany({ where: { userId: user.id } });
          await prisma.company.deleteMany({ where: { userId: user.id } });
          await prisma.user.delete({ where: { email } });
        }
      } catch {
        // User might already be deleted
      }
    }
    await app.close();
  });

  describe("POST /auth/register/job-seeker", () => {
    it("should register a new job seeker", async () => {
      const email = `e2e-jobseeker-${Date.now()}@example.com`;
      createdUserEmails.push(email);

      const response = await request(app.getHttpServer())
        .post("/auth/register/job-seeker")
        .send({
          email,
          password: "Password123!",
          fullName: "E2E Test Job Seeker",
        })
        .expect(201);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("registered");
    });

    it("should reject registration with existing email", async () => {
      const email = `e2e-duplicate-${Date.now()}@example.com`;
      createdUserEmails.push(email);

      // First registration
      await request(app.getHttpServer())
        .post("/auth/register/job-seeker")
        .send({
          email,
          password: "Password123!",
          fullName: "First User",
        })
        .expect(201);

      // Duplicate registration
      await request(app.getHttpServer())
        .post("/auth/register/job-seeker")
        .send({
          email,
          password: "Password123!",
          fullName: "Second User",
        })
        .expect(409);
    });

    it("should reject registration with invalid email", async () => {
      await request(app.getHttpServer())
        .post("/auth/register/job-seeker")
        .send({
          email: "invalid-email",
          password: "Password123!",
          fullName: "Test User",
        })
        .expect(400);
    });

    it("should reject registration with short password", async () => {
      await request(app.getHttpServer())
        .post("/auth/register/job-seeker")
        .send({
          email: "test@example.com",
          password: "short",
          fullName: "Test User",
        })
        .expect(400);
    });

    it("should reject registration without required fields", async () => {
      await request(app.getHttpServer())
        .post("/auth/register/job-seeker")
        .send({
          email: "test@example.com",
        })
        .expect(400);
    });
  });

  describe("POST /auth/register/company", () => {
    it("should register a new company", async () => {
      const email = `e2e-company-${Date.now()}@example.com`;
      createdUserEmails.push(email);

      const response = await request(app.getHttpServer())
        .post("/auth/register/company")
        .send({
          email,
          password: "Password123!",
          companyName: "E2E Test Company",
        })
        .expect(201);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("registered");
    });

    it("should reject company registration with existing email", async () => {
      const email = `e2e-company-dup-${Date.now()}@example.com`;
      createdUserEmails.push(email);

      // First registration
      await request(app.getHttpServer())
        .post("/auth/register/company")
        .send({
          email,
          password: "Password123!",
          companyName: "First Company",
        })
        .expect(201);

      // Duplicate registration
      await request(app.getHttpServer())
        .post("/auth/register/company")
        .send({
          email,
          password: "Password123!",
          companyName: "Second Company",
        })
        .expect(409);
    });
  });

  describe("POST /auth/login", () => {
    let testEmail: string;

    beforeAll(async () => {
      testEmail = `e2e-login-${Date.now()}@example.com`;
      createdUserEmails.push(testEmail);

      // Create test user
      await request(app.getHttpServer())
        .post("/auth/register/job-seeker")
        .send({
          email: testEmail,
          password: "TestPassword123!",
          fullName: "Login Test User",
        });
    });

    it("should login with valid credentials", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testEmail,
          password: "TestPassword123!",
        })
        .expect(201);

      expect(response.body).toHaveProperty("access_token");
      expect(typeof response.body.access_token).toBe("string");
    });

    it("should reject login with wrong password", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword123!",
        })
        .expect(401);
    });

    it("should reject login with non-existent email", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "Password123!",
        })
        .expect(401);
    });

    it("should reject login without credentials", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({})
        .expect(400);
    });
  });

  describe("GET /auth/profile", () => {
    let authToken: string;
    let testEmail: string;

    beforeAll(async () => {
      testEmail = `e2e-profile-${Date.now()}@example.com`;
      createdUserEmails.push(testEmail);

      // Register user
      await request(app.getHttpServer())
        .post("/auth/register/job-seeker")
        .send({
          email: testEmail,
          password: "TestPassword123!",
          fullName: "Profile Test User",
        });

      // Login to get token
      const loginResponse = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testEmail,
          password: "TestPassword123!",
        });

      authToken = loginResponse.body.access_token;
    });

    it("should return profile for authenticated user", async () => {
      const response = await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("email", testEmail);
      expect(response.body).toHaveProperty("role", "JOB_SEEKER");
    });

    it("should reject without auth token", async () => {
      await request(app.getHttpServer()).get("/auth/profile").expect(401);
    });

    it("should reject with invalid token", async () => {
      await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });
  });

  describe("PUT /auth/profile", () => {
    let authToken: string;
    let testEmail: string;

    beforeAll(async () => {
      testEmail = `e2e-update-profile-${Date.now()}@example.com`;
      createdUserEmails.push(testEmail);

      // Register user
      await request(app.getHttpServer())
        .post("/auth/register/job-seeker")
        .send({
          email: testEmail,
          password: "TestPassword123!",
          fullName: "Update Profile Test",
        });

      // Login to get token
      const loginResponse = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testEmail,
          password: "TestPassword123!",
        });

      authToken = loginResponse.body.access_token;
    });

    it("should update profile for job seeker", async () => {
      const response = await request(app.getHttpServer())
        .put("/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          fullName: "Updated Name",
          experienceSummary: "Updated experience summary",
        })
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("updated");
      expect(response.body.updated.fullName).toBe("Updated Name");
    });

    it("should reject profile update without auth", async () => {
      await request(app.getHttpServer())
        .put("/auth/profile")
        .send({ fullName: "Hacker" })
        .expect(401);
    });
  });
});

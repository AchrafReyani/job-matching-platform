/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../src/prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { AppModule } from "../src/app.module";

const request = require("supertest");

describe("Admin (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test users
  let adminUserId: string;
  let adminToken: string;
  let jobSeekerUserId: string;
  let jobSeekerToken: string;
  let companyUserId: string;
  let companyToken: string;
  let companyId: number;
  let vacancyId: number;

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
    jwtService = moduleFixture.get<JwtService>(JwtService);

    const passwordHash = await bcrypt.hash("TestPassword123", 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: "e2e-admin@example.com",
        passwordHash,
        role: "ADMIN",
        notificationPreferences: {},
      },
    });
    adminUserId = adminUser.id;
    adminToken = jwtService.sign({ sub: adminUserId, role: "ADMIN" });

    // Create job seeker user
    const jobSeekerUser = await prisma.user.create({
      data: {
        email: "e2e-jobseeker@example.com",
        passwordHash,
        role: "JOB_SEEKER",
        notificationPreferences: {},
      },
    });
    jobSeekerUserId = jobSeekerUser.id;
    jobSeekerToken = jwtService.sign({
      sub: jobSeekerUserId,
      role: "JOB_SEEKER",
    });

    await prisma.jobSeeker.create({
      data: {
        userId: jobSeekerUserId,
        fullName: "E2E Test Job Seeker",
        experienceSummary: "Test experience",
      },
    });

    // Create company user
    const companyUser = await prisma.user.create({
      data: {
        email: "e2e-company@example.com",
        passwordHash,
        role: "COMPANY",
        notificationPreferences: {},
      },
    });
    companyUserId = companyUser.id;
    companyToken = jwtService.sign({ sub: companyUserId, role: "COMPANY" });

    const company = await prisma.company.create({
      data: {
        userId: companyUserId,
        companyName: "E2E Test Company",
        description: "Test company description",
      },
    });
    companyId = company.id;

    // Create a vacancy
    const vacancy = await prisma.vacancy.create({
      data: {
        companyId: companyId,
        title: "E2E Test Vacancy",
        salaryRange: "$50,000 - $70,000",
        role: "Developer",
        jobDescription: "Test job description",
      },
    });
    vacancyId = vacancy.id;
  });

  afterAll(async () => {
    // Clean up test data in correct order
    try {
      await prisma.archivedApplication.deleteMany({});
      await prisma.archivedVacancy.deleteMany({});
      await prisma.archivedUser.deleteMany({});
      await prisma.application.deleteMany({
        where: { vacancy: { companyId } },
      });
      await prisma.vacancy.deleteMany({ where: { companyId } });
      await prisma.company.deleteMany({ where: { userId: companyUserId } });
      await prisma.jobSeeker.deleteMany({ where: { userId: jobSeekerUserId } });
      await prisma.notification.deleteMany({
        where: {
          userId: { in: [adminUserId, jobSeekerUserId, companyUserId] },
        },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [adminUserId, jobSeekerUserId, companyUserId] } },
      });
    } catch {
      // Some records might already be deleted by tests
    }
    await app.close();
  });

  describe("GET /admin/stats", () => {
    it("should return admin stats for admin user", async () => {
      const response = await request(app.getHttpServer())
        .get("/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("totalJobSeekers");
      expect(response.body).toHaveProperty("totalCompanies");
      expect(response.body).toHaveProperty("totalVacancies");
      expect(response.body).toHaveProperty("totalApplications");
      expect(response.body).toHaveProperty("activeVacancies");
      expect(response.body).toHaveProperty("pendingApplications");
      expect(response.body).toHaveProperty("newUsersThisWeek");
      expect(response.body).toHaveProperty("applicationsThisMonth");
      expect(typeof response.body.totalJobSeekers).toBe("number");
      expect(typeof response.body.totalCompanies).toBe("number");
    });

    it("should reject non-admin users (job seeker)", () => {
      return request(app.getHttpServer())
        .get("/admin/stats")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(403);
    });

    it("should reject non-admin users (company)", () => {
      return request(app.getHttpServer())
        .get("/admin/stats")
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(403);
    });

    it("should reject without auth token", () => {
      return request(app.getHttpServer()).get("/admin/stats").expect(401);
    });
  });

  describe("GET /admin/users", () => {
    it("should return paginated users for admin", async () => {
      const response = await request(app.getHttpServer())
        .get("/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page");
      expect(response.body).toHaveProperty("pageSize");
      expect(response.body).toHaveProperty("totalPages");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter users by role", async () => {
      const response = await request(app.getHttpServer())
        .get("/admin/users?role=JOB_SEEKER")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(
        response.body.data.every(
          (u: { role: string }) => u.role === "JOB_SEEKER",
        ),
      ).toBe(true);
    });

    it("should search users by email", async () => {
      const response = await request(app.getHttpServer())
        .get("/admin/users?search=e2e-jobseeker")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].email).toContain("e2e-jobseeker");
    });

    it("should paginate results", async () => {
      const response = await request(app.getHttpServer())
        .get("/admin/users?page=1&pageSize=5")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it("should reject non-admin users", () => {
      return request(app.getHttpServer())
        .get("/admin/users")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(403);
    });
  });

  describe("GET /admin/users/:id", () => {
    it("should return user details for admin", async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/users/${jobSeekerUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id", jobSeekerUserId);
      expect(response.body).toHaveProperty(
        "email",
        "e2e-jobseeker@example.com",
      );
      expect(response.body).toHaveProperty("role", "JOB_SEEKER");
      expect(response.body).toHaveProperty("profile");
    });

    it("should return 404 for non-existent user", () => {
      return request(app.getHttpServer())
        .get("/admin/users/non-existent-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });

    it("should reject non-admin users", () => {
      return request(app.getHttpServer())
        .get(`/admin/users/${jobSeekerUserId}`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(403);
    });
  });

  describe("PATCH /admin/users/:id", () => {
    it("should update user for admin", async () => {
      await request(app.getHttpServer())
        .patch(`/admin/users/${jobSeekerUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Updated Name" })
        .expect(200);

      // Verify update
      const user = await prisma.jobSeeker.findUnique({
        where: { userId: jobSeekerUserId },
      });
      expect(user?.fullName).toBe("Updated Name");
    });

    it("should reject non-admin users", () => {
      return request(app.getHttpServer())
        .patch(`/admin/users/${jobSeekerUserId}`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .send({ name: "Hacker Name" })
        .expect(403);
    });
  });

  describe("GET /admin/vacancies", () => {
    it("should return paginated vacancies for admin", async () => {
      const response = await request(app.getHttpServer())
        .get("/admin/vacancies")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should search vacancies by title", async () => {
      const response = await request(app.getHttpServer())
        .get("/admin/vacancies?search=E2E Test")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should reject non-admin users", () => {
      return request(app.getHttpServer())
        .get("/admin/vacancies")
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(403);
    });
  });

  describe("GET /admin/vacancies/:id", () => {
    it("should return vacancy details for admin", async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/vacancies/${vacancyId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id", vacancyId);
      expect(response.body).toHaveProperty("title", "E2E Test Vacancy");
      expect(response.body).toHaveProperty("companyName", "E2E Test Company");
    });

    it("should return 404 for non-existent vacancy", () => {
      return request(app.getHttpServer())
        .get("/admin/vacancies/999999")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });

    it("should reject non-admin users", () => {
      return request(app.getHttpServer())
        .get(`/admin/vacancies/${vacancyId}`)
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(403);
    });
  });

  describe("PATCH /admin/vacancies/:id", () => {
    it("should update vacancy for admin", async () => {
      await request(app.getHttpServer())
        .patch(`/admin/vacancies/${vacancyId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Updated Vacancy Title" })
        .expect(200);

      // Verify update
      const vacancy = await prisma.vacancy.findUnique({
        where: { id: vacancyId },
      });
      expect(vacancy?.title).toBe("Updated Vacancy Title");
    });

    it("should reject non-admin users", () => {
      return request(app.getHttpServer())
        .patch(`/admin/vacancies/${vacancyId}`)
        .set("Authorization", `Bearer ${companyToken}`)
        .send({ title: "Hacker Title" })
        .expect(403);
    });
  });

  describe("DELETE /admin/vacancies/:id", () => {
    let testVacancyId: number;

    beforeEach(async () => {
      // Create a vacancy to delete
      const vacancy = await prisma.vacancy.create({
        data: {
          companyId: companyId,
          title: "Vacancy to Delete",
          salaryRange: "$40,000 - $60,000",
          role: "Tester",
          jobDescription: "Test vacancy for deletion",
        },
      });
      testVacancyId = vacancy.id;
    });

    it("should delete vacancy for admin", async () => {
      await request(app.getHttpServer())
        .delete(`/admin/vacancies/${testVacancyId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      // Verify deletion
      const vacancy = await prisma.vacancy.findUnique({
        where: { id: testVacancyId },
      });
      expect(vacancy).toBeNull();

      // Verify archived
      const archived = await prisma.archivedVacancy.findFirst({
        where: { originalId: testVacancyId },
      });
      expect(archived).not.toBeNull();
    });

    it("should reject non-admin users", () => {
      return request(app.getHttpServer())
        .delete(`/admin/vacancies/${testVacancyId}`)
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(403);
    });
  });

  describe("DELETE /admin/users/:id", () => {
    let testDeleteUserId: string;

    beforeEach(async () => {
      // Create a user to delete
      const passwordHash = await bcrypt.hash("TestPassword123", 10);
      const user = await prisma.user.create({
        data: {
          email: `delete-test-${Date.now()}@example.com`,
          passwordHash,
          role: "JOB_SEEKER",
          notificationPreferences: {},
        },
      });
      testDeleteUserId = user.id;

      await prisma.jobSeeker.create({
        data: {
          userId: testDeleteUserId,
          fullName: "User to Delete",
        },
      });
    });

    it("should delete user for admin", async () => {
      await request(app.getHttpServer())
        .delete(`/admin/users/${testDeleteUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      // Verify deletion
      const user = await prisma.user.findUnique({
        where: { id: testDeleteUserId },
      });
      expect(user).toBeNull();

      // Verify archived
      const archived = await prisma.archivedUser.findFirst({
        where: { originalId: testDeleteUserId },
      });
      expect(archived).not.toBeNull();
    });

    it("should reject non-admin users", () => {
      return request(app.getHttpServer())
        .delete(`/admin/users/${testDeleteUserId}`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(403);
    });
  });
});

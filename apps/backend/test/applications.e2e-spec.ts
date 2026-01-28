/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../src/prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { AppModule } from "../src/app.module";

const request = require("supertest");

describe("Applications (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test data
  let jobSeekerUserId: string;
  let jobSeekerToken: string;
  let jobSeekerId: number;
  let companyUserId: string;
  let companyToken: string;
  let companyId: number;
  let vacancyId: number;
  let applicationId: number;

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

    // Create job seeker user
    const jobSeekerUser = await prisma.user.create({
      data: {
        email: `e2e-app-jobseeker-${Date.now()}@example.com`,
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

    const jobSeeker = await prisma.jobSeeker.create({
      data: {
        userId: jobSeekerUserId,
        fullName: "E2E Application Test User",
        experienceSummary: "Test experience",
      },
    });
    jobSeekerId = jobSeeker.id;

    // Create company user
    const companyUser = await prisma.user.create({
      data: {
        email: `e2e-app-company-${Date.now()}@example.com`,
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
    // Clean up in correct order
    try {
      await prisma.message.deleteMany({
        where: { application: { jobSeekerId } },
      });
      await prisma.application.deleteMany({ where: { jobSeekerId } });
      await prisma.vacancy.deleteMany({ where: { companyId } });
      await prisma.company.deleteMany({ where: { userId: companyUserId } });
      await prisma.jobSeeker.deleteMany({ where: { userId: jobSeekerUserId } });
      await prisma.notification.deleteMany({
        where: { userId: { in: [jobSeekerUserId, companyUserId] } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [jobSeekerUserId, companyUserId] } },
      });
    } catch {
      // Some records might already be deleted
    }
    await app.close();
  });

  describe("POST /applications", () => {
    it("should create application for job seeker", async () => {
      const response = await request(app.getHttpServer())
        .post("/applications")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .send({ vacancyId })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("status", "APPLIED");
      applicationId = response.body.id;
    });

    it("should reject duplicate application", async () => {
      await request(app.getHttpServer())
        .post("/applications")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .send({ vacancyId })
        .expect(409);
    });

    it("should reject application from company user", async () => {
      await request(app.getHttpServer())
        .post("/applications")
        .set("Authorization", `Bearer ${companyToken}`)
        .send({ vacancyId })
        .expect(403);
    });

    it("should reject without auth token", async () => {
      await request(app.getHttpServer())
        .post("/applications")
        .send({ vacancyId })
        .expect(401);
    });

    it("should reject for non-existent vacancy", async () => {
      await request(app.getHttpServer())
        .post("/applications")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .send({ vacancyId: 999999 })
        .expect(404);
    });
  });

  describe("GET /applications/me", () => {
    it("should return applications for job seeker", async () => {
      const response = await request(app.getHttpServer())
        .get("/applications/me")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0]).toHaveProperty("vacancy");
    });

    it("should reject for company user", async () => {
      await request(app.getHttpServer())
        .get("/applications/me")
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(403);
    });

    it("should reject without auth", async () => {
      await request(app.getHttpServer()).get("/applications/me").expect(401);
    });
  });

  describe("GET /applications/company", () => {
    it("should return applications for company", async () => {
      const response = await request(app.getHttpServer())
        .get("/applications/company")
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0]).toHaveProperty("jobSeeker");
    });

    it("should reject for job seeker user", async () => {
      await request(app.getHttpServer())
        .get("/applications/company")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(403);
    });
  });

  describe("GET /applications/details/:id", () => {
    it("should return application details for job seeker", async () => {
      const response = await request(app.getHttpServer())
        .get(`/applications/details/${applicationId}`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id", applicationId);
      expect(response.body).toHaveProperty("vacancy");
    });

    it("should return application details for company", async () => {
      const response = await request(app.getHttpServer())
        .get(`/applications/details/${applicationId}`)
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id", applicationId);
    });

    it("should reject without auth", async () => {
      await request(app.getHttpServer())
        .get(`/applications/details/${applicationId}`)
        .expect(401);
    });
  });

  describe("PATCH /applications/:id", () => {
    it("should update application status for company", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/applications/${applicationId}`)
        .set("Authorization", `Bearer ${companyToken}`)
        .send({ status: "ACCEPTED" })
        .expect(200);

      expect(response.body).toHaveProperty("status", "ACCEPTED");
    });

    it("should reject status update from job seeker", async () => {
      await request(app.getHttpServer())
        .patch(`/applications/${applicationId}`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .send({ status: "REJECTED" })
        .expect(403);
    });
  });

  describe("DELETE /applications/:id/match", () => {
    let deleteTestApplicationId: number;

    beforeEach(async () => {
      // Create a new vacancy and accepted application for delete test
      const vacancy = await prisma.vacancy.create({
        data: {
          companyId: companyId,
          title: "Delete Test Vacancy",
          salaryRange: "$40,000",
          role: "Tester",
          jobDescription: "Delete test",
        },
      });

      const application = await prisma.application.create({
        data: {
          jobSeekerId: jobSeekerId,
          vacancyId: vacancy.id,
          status: "ACCEPTED",
        },
      });
      deleteTestApplicationId = application.id;
    });

    it("should delete match for job seeker", async () => {
      await request(app.getHttpServer())
        .delete(`/applications/${deleteTestApplicationId}/match`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(200);

      // Verify deletion
      const deleted = await prisma.application.findUnique({
        where: { id: deleteTestApplicationId },
      });
      expect(deleted).toBeNull();
    });

    it("should delete match for company", async () => {
      // Create another application for company delete test
      const vacancy = await prisma.vacancy.create({
        data: {
          companyId: companyId,
          title: "Company Delete Test",
          salaryRange: "$40,000",
          role: "Tester",
          jobDescription: "Delete test",
        },
      });
      const application = await prisma.application.create({
        data: {
          jobSeekerId: jobSeekerId,
          vacancyId: vacancy.id,
          status: "ACCEPTED",
        },
      });

      await request(app.getHttpServer())
        .delete(`/applications/${application.id}/match`)
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(200);
    });
  });
});

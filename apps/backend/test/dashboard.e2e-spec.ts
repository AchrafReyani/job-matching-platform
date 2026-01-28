/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../src/prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { AppModule } from "../src/app.module";

const request = require("supertest");

describe("Dashboard (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let jobSeekerUserId: string;
  let jobSeekerToken: string;
  let jobSeekerId: number;
  let companyUserId: string;
  let companyToken: string;
  let companyId: number;
  let adminUserId: string;
  let adminToken: string;

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

    // Create job seeker with applications
    const jobSeekerUser = await prisma.user.create({
      data: {
        email: `e2e-dash-jobseeker-${Date.now()}@example.com`,
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
        fullName: "E2E Dashboard Test User",
      },
    });
    jobSeekerId = jobSeeker.id;

    // Create company with vacancies
    const companyUser = await prisma.user.create({
      data: {
        email: `e2e-dash-company-${Date.now()}@example.com`,
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
        companyName: "E2E Dashboard Test Company",
        description: "Test company",
      },
    });
    companyId = company.id;

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: `e2e-dash-admin-${Date.now()}@example.com`,
        passwordHash,
        role: "ADMIN",
        notificationPreferences: {},
      },
    });
    adminUserId = adminUser.id;
    adminToken = jwtService.sign({ sub: adminUserId, role: "ADMIN" });

    // Create vacancies and applications for stats
    const vacancy1 = await prisma.vacancy.create({
      data: {
        companyId: companyId,
        title: "E2E Dashboard Vacancy 1",
        salaryRange: "$50,000",
        role: "Developer",
        jobDescription: "Test",
      },
    });

    const vacancy2 = await prisma.vacancy.create({
      data: {
        companyId: companyId,
        title: "E2E Dashboard Vacancy 2",
        salaryRange: "$60,000",
        role: "Designer",
        jobDescription: "Test",
      },
    });

    // Create applications
    await prisma.application.create({
      data: {
        jobSeekerId: jobSeekerId,
        vacancyId: vacancy1.id,
        status: "APPLIED",
      },
    });

    await prisma.application.create({
      data: {
        jobSeekerId: jobSeekerId,
        vacancyId: vacancy2.id,
        status: "ACCEPTED",
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.application.deleteMany({ where: { jobSeekerId } });
      await prisma.vacancy.deleteMany({ where: { companyId } });
      await prisma.company.deleteMany({ where: { userId: companyUserId } });
      await prisma.jobSeeker.deleteMany({ where: { userId: jobSeekerUserId } });
      await prisma.notification.deleteMany({
        where: {
          userId: { in: [jobSeekerUserId, companyUserId, adminUserId] },
        },
      });
      await prisma.user.deleteMany({
        where: {
          id: { in: [jobSeekerUserId, companyUserId, adminUserId] },
        },
      });
    } catch {
      // Cleanup errors ignored
    }
    await app.close();
  });

  describe("GET /dashboard/stats", () => {
    it("should return stats for job seeker", async () => {
      const response = await request(app.getHttpServer())
        .get("/dashboard/stats")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("pending");
      expect(response.body).toHaveProperty("accepted");
      expect(response.body).toHaveProperty("rejected");
      expect(response.body).toHaveProperty("totalSent");
      expect(typeof response.body.pending).toBe("number");
      expect(typeof response.body.accepted).toBe("number");
    });

    it("should return stats for company", async () => {
      const response = await request(app.getHttpServer())
        .get("/dashboard/stats")
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("activeVacancies");
      expect(response.body).toHaveProperty("totalApplicants");
      expect(response.body).toHaveProperty("pendingReview");
      expect(response.body).toHaveProperty("accepted");
      expect(response.body).toHaveProperty("rejected");
      expect(response.body).toHaveProperty("newThisWeek");
      expect(typeof response.body.activeVacancies).toBe("number");
    });

    it("should reject for admin role", async () => {
      await request(app.getHttpServer())
        .get("/dashboard/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(403);
    });

    it("should reject without auth", async () => {
      await request(app.getHttpServer()).get("/dashboard/stats").expect(401);
    });
  });

  describe("Job Seeker Dashboard Stats Accuracy", () => {
    it("should have correct application counts", async () => {
      const response = await request(app.getHttpServer())
        .get("/dashboard/stats")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(200);

      // We created 2 applications: 1 APPLIED, 1 ACCEPTED
      expect(response.body.totalSent).toBe(2);
      expect(response.body.pending).toBe(1);
      expect(response.body.accepted).toBe(1);
      expect(response.body.rejected).toBe(0);
    });
  });

  describe("Company Dashboard Stats Accuracy", () => {
    it("should have correct vacancy and applicant counts", async () => {
      const response = await request(app.getHttpServer())
        .get("/dashboard/stats")
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(200);

      // We created 2 vacancies and 2 applications
      expect(response.body.activeVacancies).toBe(2);
      expect(response.body.totalApplicants).toBe(2);
      expect(response.body.pendingReview).toBe(1); // 1 APPLIED
      expect(response.body.accepted).toBe(1);
    });
  });
});

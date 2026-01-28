/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../src/prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { AppModule } from "../src/app.module";

const request = require("supertest");

describe("Messages (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let jobSeekerUserId: string;
  let jobSeekerToken: string;
  let jobSeekerId: number;
  let companyUserId: string;
  let companyToken: string;
  let companyId: number;
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

    // Create job seeker
    const jobSeekerUser = await prisma.user.create({
      data: {
        email: `e2e-msg-jobseeker-${Date.now()}@example.com`,
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
        fullName: "E2E Message Test User",
      },
    });
    jobSeekerId = jobSeeker.id;

    // Create company
    const companyUser = await prisma.user.create({
      data: {
        email: `e2e-msg-company-${Date.now()}@example.com`,
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
        companyName: "E2E Message Test Company",
        description: "Test company",
      },
    });
    companyId = company.id;

    // Create vacancy and ACCEPTED application (required for messaging)
    const vacancy = await prisma.vacancy.create({
      data: {
        companyId: companyId,
        title: "E2E Message Test Vacancy",
        salaryRange: "$50,000",
        role: "Developer",
        jobDescription: "Test",
      },
    });

    const application = await prisma.application.create({
      data: {
        jobSeekerId: jobSeekerId,
        vacancyId: vacancy.id,
        status: "ACCEPTED", // Messages only work for accepted applications
      },
    });
    applicationId = application.id;
  });

  afterAll(async () => {
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
      // Cleanup errors ignored
    }
    await app.close();
  });

  describe("POST /messages", () => {
    it("should create message from job seeker", async () => {
      const response = await request(app.getHttpServer())
        .post("/messages")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .send({
          applicationId,
          messageText: "Hello from job seeker!",
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty(
        "messageText",
        "Hello from job seeker!",
      );
      expect(response.body).toHaveProperty("senderId", jobSeekerUserId);
    });

    it("should create message from company", async () => {
      const response = await request(app.getHttpServer())
        .post("/messages")
        .set("Authorization", `Bearer ${companyToken}`)
        .send({
          applicationId,
          messageText: "Hello from company!",
        })
        .expect(201);

      expect(response.body).toHaveProperty(
        "messageText",
        "Hello from company!",
      );
      expect(response.body).toHaveProperty("senderId", companyUserId);
    });

    it("should reject without auth", async () => {
      await request(app.getHttpServer())
        .post("/messages")
        .send({
          applicationId,
          messageText: "No auth message",
        })
        .expect(401);
    });

    it("should reject for non-existent application", async () => {
      await request(app.getHttpServer())
        .post("/messages")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .send({
          applicationId: 999999,
          messageText: "Invalid application",
        })
        .expect(404);
    });
  });

  describe("GET /messages/conversations", () => {
    it("should return conversations for job seeker", async () => {
      const response = await request(app.getHttpServer())
        .get("/messages/conversations")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return conversations for company", async () => {
      const response = await request(app.getHttpServer())
        .get("/messages/conversations")
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should reject without auth", async () => {
      await request(app.getHttpServer())
        .get("/messages/conversations")
        .expect(401);
    });
  });

  describe("GET /messages/:applicationId", () => {
    it("should return messages for job seeker", async () => {
      const response = await request(app.getHttpServer())
        .get(`/messages/${applicationId}`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it("should return messages for company", async () => {
      const response = await request(app.getHttpServer())
        .get(`/messages/${applicationId}`)
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should reject without auth", async () => {
      await request(app.getHttpServer())
        .get(`/messages/${applicationId}`)
        .expect(401);
    });
  });

  describe("PATCH /messages/:applicationId/read", () => {
    it("should mark messages as read", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/messages/${applicationId}/read`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("markedAsRead");
      expect(typeof response.body.markedAsRead).toBe("number");
    });

    it("should reject without auth", async () => {
      await request(app.getHttpServer())
        .patch(`/messages/${applicationId}/read`)
        .expect(401);
    });
  });
});

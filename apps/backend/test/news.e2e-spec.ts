/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../src/prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { AppModule } from "../src/app.module";

const request = require("supertest");

describe("News (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let adminUserId: string;
  let adminToken: string;
  let jobSeekerUserId: string;
  let jobSeekerToken: string;
  let companyUserId: string;
  let companyToken: string;
  let newsId: number;

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
        email: `e2e-news-admin-${Date.now()}@example.com`,
        passwordHash,
        role: "ADMIN",
        notificationPreferences: {},
      },
    });
    adminUserId = adminUser.id;
    adminToken = jwtService.sign({ sub: adminUserId, role: "ADMIN" });

    // Create job seeker
    const jobSeekerUser = await prisma.user.create({
      data: {
        email: `e2e-news-jobseeker-${Date.now()}@example.com`,
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
        fullName: "E2E News Test User",
      },
    });

    // Create company
    const companyUser = await prisma.user.create({
      data: {
        email: `e2e-news-company-${Date.now()}@example.com`,
        passwordHash,
        role: "COMPANY",
        notificationPreferences: {},
      },
    });
    companyUserId = companyUser.id;
    companyToken = jwtService.sign({ sub: companyUserId, role: "COMPANY" });

    await prisma.company.create({
      data: {
        userId: companyUserId,
        companyName: "E2E News Test Company",
        description: "Test",
      },
    });

    // Create test news items
    const news = await prisma.news.create({
      data: {
        title: "E2E Test Announcement",
        content: "This is a test announcement",
        category: "ANNOUNCEMENT",
        audience: "ALL",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    newsId = news.id;

    // Create news for job seekers only
    await prisma.news.create({
      data: {
        title: "Job Seeker Tips",
        content: "Tips for job seekers",
        category: "FEATURE_UPDATE",
        audience: "JOB_SEEKER",
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.newsRead.deleteMany({
        where: { userId: { in: [jobSeekerUserId, companyUserId] } },
      });
      await prisma.news.deleteMany({
        where: { title: { startsWith: "E2E" } },
      });
      await prisma.company.deleteMany({ where: { userId: companyUserId } });
      await prisma.jobSeeker.deleteMany({ where: { userId: jobSeekerUserId } });
      await prisma.user.deleteMany({
        where: {
          id: { in: [adminUserId, jobSeekerUserId, companyUserId] },
        },
      });
    } catch {
      // Cleanup errors ignored
    }
    await app.close();
  });

  // ========== Admin Endpoints ==========

  describe("POST /news (admin)", () => {
    it("should create news for admin", async () => {
      const response = await request(app.getHttpServer())
        .post("/news")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "E2E New Announcement",
          content: "Test content",
          category: "ANNOUNCEMENT",
          audience: "ALL",
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("title", "E2E New Announcement");
      expect(response.body).toHaveProperty("status", "DRAFT");
    });

    it("should reject for non-admin", async () => {
      await request(app.getHttpServer())
        .post("/news")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .send({
          title: "Hacker News",
          content: "Bad content",
          category: "ANNOUNCEMENT",
          audience: "ALL",
        })
        .expect(403);
    });
  });

  describe("GET /news/admin (admin)", () => {
    it("should return all news for admin", async () => {
      const response = await request(app.getHttpServer())
        .get("/news/admin")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should reject for non-admin", async () => {
      await request(app.getHttpServer())
        .get("/news/admin")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(403);
    });
  });

  describe("GET /news/admin/:id (admin)", () => {
    it("should return news by id for admin", async () => {
      const response = await request(app.getHttpServer())
        .get(`/news/admin/${newsId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id", newsId);
    });

    it("should reject for non-admin", async () => {
      await request(app.getHttpServer())
        .get(`/news/admin/${newsId}`)
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(403);
    });
  });

  describe("PATCH /news/:id (admin)", () => {
    it("should update news for admin", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/news/${newsId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "E2E Updated Announcement" })
        .expect(200);

      expect(response.body).toHaveProperty("title", "E2E Updated Announcement");
    });

    it("should reject for non-admin", async () => {
      await request(app.getHttpServer())
        .patch(`/news/${newsId}`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .send({ title: "Hacked" })
        .expect(403);
    });
  });

  describe("POST /news/:id/publish (admin)", () => {
    let draftNewsId: number;

    beforeEach(async () => {
      const news = await prisma.news.create({
        data: {
          title: "E2E Draft to Publish",
          content: "Draft content",
          category: "RELEASE",
          audience: "ALL",
          status: "DRAFT",
        },
      });
      draftNewsId = news.id;
    });

    it("should publish news for admin", async () => {
      const response = await request(app.getHttpServer())
        .post(`/news/${draftNewsId}/publish`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body).toHaveProperty("status", "PUBLISHED");
      expect(response.body).toHaveProperty("publishedAt");
    });

    it("should reject for non-admin", async () => {
      await request(app.getHttpServer())
        .post(`/news/${draftNewsId}/publish`)
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(403);
    });
  });

  // ========== User Endpoints ==========

  describe("GET /news (user)", () => {
    it("should return news for job seeker", async () => {
      const response = await request(app.getHttpServer())
        .get("/news")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return news for company", async () => {
      const response = await request(app.getHttpServer())
        .get("/news")
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
    });

    it("should reject for admin (admin uses /news/admin)", async () => {
      await request(app.getHttpServer())
        .get("/news")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(403);
    });
  });

  describe("GET /news/unread-count (user)", () => {
    it("should return unread count for user", async () => {
      const response = await request(app.getHttpServer())
        .get("/news/unread-count")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("count");
      expect(typeof response.body.count).toBe("number");
    });
  });

  describe("GET /news/:id (user)", () => {
    it("should return news by id for user", async () => {
      const response = await request(app.getHttpServer())
        .get(`/news/${newsId}`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id", newsId);
    });
  });

  describe("POST /news/:id/read (user)", () => {
    it("should mark news as read for user", async () => {
      const response = await request(app.getHttpServer())
        .post(`/news/${newsId}/read`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
    });
  });

  describe("DELETE /news/:id (admin)", () => {
    let deleteNewsId: number;

    beforeEach(async () => {
      const news = await prisma.news.create({
        data: {
          title: "E2E News to Delete",
          content: "Delete content",
          category: "RELEASE",
          audience: "ALL",
          status: "DRAFT",
        },
      });
      deleteNewsId = news.id;
    });

    it("should delete news for admin", async () => {
      await request(app.getHttpServer())
        .delete(`/news/${deleteNewsId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const deleted = await prisma.news.findUnique({
        where: { id: deleteNewsId },
      });
      expect(deleted).toBeNull();
    });

    it("should reject for non-admin", async () => {
      await request(app.getHttpServer())
        .delete(`/news/${deleteNewsId}`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(403);
    });
  });
});

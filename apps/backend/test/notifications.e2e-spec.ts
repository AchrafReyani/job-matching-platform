/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../src/prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { AppModule } from "../src/app.module";

const request = require("supertest");

describe("Notifications (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let userId: string;
  let authToken: string;
  let notificationId: number;

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

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `e2e-notif-${Date.now()}@example.com`,
        passwordHash,
        role: "JOB_SEEKER",
        notificationPreferences: {},
      },
    });
    userId = user.id;
    authToken = jwtService.sign({ sub: userId, role: "JOB_SEEKER" });

    await prisma.jobSeeker.create({
      data: {
        userId: userId,
        fullName: "E2E Notification Test User",
      },
    });

    // Create test notifications
    const notification1 = await prisma.notification.create({
      data: {
        userId: userId,
        type: "APPLICATION_ACCEPTED",
        title: "Application Accepted",
        message: "Your application was accepted!",
        isRead: false,
      },
    });
    notificationId = notification1.id;

    await prisma.notification.create({
      data: {
        userId: userId,
        type: "NEW_MESSAGE",
        title: "New Message",
        message: "You have a new message",
        isRead: false,
      },
    });

    await prisma.notification.create({
      data: {
        userId: userId,
        type: "APPLICATION_REJECTED",
        title: "Application Rejected",
        message: "Unfortunately...",
        isRead: true,
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.notification.deleteMany({ where: { userId } });
      await prisma.jobSeeker.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    } catch {
      // Cleanup errors ignored
    }
    await app.close();
  });

  describe("GET /notifications", () => {
    it("should return notifications for user", async () => {
      const response = await request(app.getHttpServer())
        .get("/notifications")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      expect(response.body[0]).toHaveProperty("title");
      expect(response.body[0]).toHaveProperty("message");
      expect(response.body[0]).toHaveProperty("isRead");
    });

    it("should support pagination", async () => {
      const response = await request(app.getHttpServer())
        .get("/notifications?limit=2&offset=0")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(2);
    });

    it("should reject without auth", async () => {
      await request(app.getHttpServer()).get("/notifications").expect(401);
    });
  });

  describe("GET /notifications/unread-count", () => {
    it("should return unread count", async () => {
      const response = await request(app.getHttpServer())
        .get("/notifications/unread-count")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("count");
      expect(typeof response.body.count).toBe("number");
      expect(response.body.count).toBeGreaterThanOrEqual(2); // At least 2 unread
    });

    it("should reject without auth", async () => {
      await request(app.getHttpServer())
        .get("/notifications/unread-count")
        .expect(401);
    });
  });

  describe("PATCH /notifications/:id/read", () => {
    it("should mark notification as read", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/notifications/${notificationId}/read`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("isRead", true);
    });

    it("should reject for non-existent notification", async () => {
      await request(app.getHttpServer())
        .patch("/notifications/999999/read")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    it("should reject without auth", async () => {
      await request(app.getHttpServer())
        .patch(`/notifications/${notificationId}/read`)
        .expect(401);
    });
  });

  describe("PATCH /notifications/read-all", () => {
    beforeEach(async () => {
      // Reset some notifications to unread
      await prisma.notification.updateMany({
        where: { userId },
        data: { isRead: false },
      });
    });

    it("should mark all notifications as read", async () => {
      const response = await request(app.getHttpServer())
        .patch("/notifications/read-all")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("markedCount");
      expect(response.body.markedCount).toBeGreaterThanOrEqual(0);

      // Verify all are read
      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
      });
      expect(unreadCount).toBe(0);
    });

    it("should reject without auth", async () => {
      await request(app.getHttpServer())
        .patch("/notifications/read-all")
        .expect(401);
    });
  });
});

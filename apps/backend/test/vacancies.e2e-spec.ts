/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../src/prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { AppModule } from "../src/app.module";

const request = require("supertest");

describe("Vacancies (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

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

    // Create job seeker user
    const jobSeekerUser = await prisma.user.create({
      data: {
        email: `e2e-vac-jobseeker-${Date.now()}@example.com`,
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
        fullName: "E2E Vacancy Test User",
      },
    });

    // Create company user
    const companyUser = await prisma.user.create({
      data: {
        email: `e2e-vac-company-${Date.now()}@example.com`,
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
        companyName: "E2E Vacancy Test Company",
        description: "Test company",
      },
    });
    companyId = company.id;
  });

  afterAll(async () => {
    try {
      await prisma.application.deleteMany({
        where: { vacancy: { companyId } },
      });
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

  describe("POST /vacancies", () => {
    it("should create vacancy for company", async () => {
      const response = await request(app.getHttpServer())
        .post("/vacancies")
        .set("Authorization", `Bearer ${companyToken}`)
        .send({
          title: "Software Engineer",
          salaryRange: "$80,000 - $120,000",
          role: "Backend",
          jobDescription: "Build amazing software",
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("title", "Software Engineer");
      vacancyId = response.body.id;
    });

    it("should reject vacancy creation from job seeker", async () => {
      await request(app.getHttpServer())
        .post("/vacancies")
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .send({
          title: "Hacker Vacancy",
          salaryRange: "$1",
          role: "Hacker",
          jobDescription: "Bad intentions",
        })
        .expect(403);
    });

    it("should reject without auth token", async () => {
      await request(app.getHttpServer())
        .post("/vacancies")
        .send({
          title: "Test",
          salaryRange: "$50,000",
          role: "Test",
          jobDescription: "Test",
        })
        .expect(401);
    });

    it("should reject with missing required fields", async () => {
      await request(app.getHttpServer())
        .post("/vacancies")
        .set("Authorization", `Bearer ${companyToken}`)
        .send({
          title: "Missing Fields",
        })
        .expect(400);
    });
  });

  describe("GET /vacancies", () => {
    it("should return all vacancies (public endpoint)", async () => {
      const response = await request(app.getHttpServer())
        .get("/vacancies")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET /vacancies/:id", () => {
    it("should return vacancy by id (public endpoint)", async () => {
      const response = await request(app.getHttpServer())
        .get(`/vacancies/${vacancyId}`)
        .expect(200);

      expect(response.body).toHaveProperty("id", vacancyId);
      expect(response.body).toHaveProperty("title", "Software Engineer");
      expect(response.body).toHaveProperty("companyId");
    });

    it("should return 404 for non-existent vacancy", async () => {
      await request(app.getHttpServer()).get("/vacancies/999999").expect(404);
    });
  });

  describe("GET /vacancies/company/:companyId", () => {
    it("should return vacancies for specific company", async () => {
      const response = await request(app.getHttpServer())
        .get(`/vacancies/company/${companyId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(
        response.body.every(
          (v: { companyId: number }) => v.companyId === companyId,
        ),
      ).toBe(true);
    });
  });

  describe("PATCH /vacancies/:id", () => {
    it("should update vacancy for company owner", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/vacancies/${vacancyId}`)
        .set("Authorization", `Bearer ${companyToken}`)
        .send({
          title: "Senior Software Engineer",
          salaryRange: "$100,000 - $150,000",
        })
        .expect(200);

      // Update returns batch payload with count
      expect(response.body).toHaveProperty("count", 1);

      // Verify update by fetching the vacancy
      const getResponse = await request(app.getHttpServer())
        .get(`/vacancies/${vacancyId}`)
        .expect(200);
      expect(getResponse.body.title).toBe("Senior Software Engineer");
    });

    it("should reject update from job seeker", async () => {
      await request(app.getHttpServer())
        .patch(`/vacancies/${vacancyId}`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .send({ title: "Hacked Title" })
        .expect(403);
    });

    it("should reject update without auth", async () => {
      await request(app.getHttpServer())
        .patch(`/vacancies/${vacancyId}`)
        .send({ title: "No Auth" })
        .expect(401);
    });
  });

  describe("DELETE /vacancies/:id", () => {
    let deleteVacancyId: number;

    beforeEach(async () => {
      const vacancy = await prisma.vacancy.create({
        data: {
          companyId: companyId,
          title: "Vacancy to Delete",
          salaryRange: "$40,000",
          role: "Tester",
          jobDescription: "Delete test",
        },
      });
      deleteVacancyId = vacancy.id;
    });

    it("should delete vacancy for company owner", async () => {
      await request(app.getHttpServer())
        .delete(`/vacancies/${deleteVacancyId}`)
        .set("Authorization", `Bearer ${companyToken}`)
        .expect(200);

      // Verify deletion
      const deleted = await prisma.vacancy.findUnique({
        where: { id: deleteVacancyId },
      });
      expect(deleted).toBeNull();
    });

    it("should reject delete from job seeker", async () => {
      await request(app.getHttpServer())
        .delete(`/vacancies/${deleteVacancyId}`)
        .set("Authorization", `Bearer ${jobSeekerToken}`)
        .expect(403);
    });

    it("should reject delete without auth", async () => {
      await request(app.getHttpServer())
        .delete(`/vacancies/${deleteVacancyId}`)
        .expect(401);
    });
  });
});

/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../src/app.module';

// Use require for supertest to handle both ESM and CJS
const request = require('supertest');

describe('Account Management (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let testUserId: string;
  let authToken: string;

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

    // Create a test user
    const passwordHash = await bcrypt.hash('TestPassword123', 10);
    const testUser = await prisma.user.create({
      data: {
        email: 'e2e-test-user@example.com',
        passwordHash,
        role: 'JOB_SEEKER',
        notificationPreferences: {},
      },
    });
    testUserId = testUser.id;

    // Create job seeker profile
    await prisma.jobSeeker.create({
      data: {
        userId: testUserId,
        fullName: 'E2E Test User',
      },
    });

    // Generate auth token
    authToken = jwtService.sign({ sub: testUserId, role: 'JOB_SEEKER' });
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await prisma.notification.deleteMany({ where: { userId: testUserId } });
      await prisma.jobSeeker.deleteMany({ where: { userId: testUserId } });
      await prisma.user.deleteMany({ where: { id: testUserId } });
    } catch {
      // User might already be deleted by delete account test
    }
    await app.close();
  });

  describe('PATCH /users/me/password', () => {
    it('should change password successfully', () => {
      return request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'TestPassword123',
          newPassword: 'NewPassword456',
        })
        .expect(204);
    });

    it('should reject with wrong current password', () => {
      return request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword789',
        })
        .expect(401);
    });

    it('should reject password less than 8 characters', () => {
      return request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'NewPassword456',
          newPassword: 'short',
        })
        .expect(400);
    });

    it('should reject without auth token', () => {
      return request(app.getHttpServer())
        .patch('/users/me/password')
        .send({
          currentPassword: 'password',
          newPassword: 'newpassword123',
        })
        .expect(401);
    });
  });

  describe('GET /users/me/notification-preferences', () => {
    it('should return notification preferences', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('applicationAccepted');
      expect(response.body).toHaveProperty('applicationRejected');
      expect(response.body).toHaveProperty('newMessages');
    });

    it('should reject without auth token', () => {
      return request(app.getHttpServer())
        .get('/users/me/notification-preferences')
        .expect(401);
    });
  });

  describe('PATCH /users/me/notification-preferences', () => {
    it('should update notification preferences', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me/notification-preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          applicationAccepted: false,
          newMessages: true,
        })
        .expect(200);

      expect(response.body.applicationAccepted).toBe(false);
      expect(response.body.newMessages).toBe(true);
    });

    it('should reject without auth token', () => {
      return request(app.getHttpServer())
        .patch('/users/me/notification-preferences')
        .send({ applicationAccepted: true })
        .expect(401);
    });
  });

  describe('POST /users/me/delete', () => {
    let deleteTestUserId: string;
    let deleteAuthToken: string;

    beforeEach(async () => {
      // Create a separate user for delete tests
      const passwordHash = await bcrypt.hash('DeleteTestPassword123', 10);
      const deleteUser = await prisma.user.create({
        data: {
          email: `delete-test-${Date.now()}@example.com`,
          passwordHash,
          role: 'JOB_SEEKER',
          notificationPreferences: {},
        },
      });
      deleteTestUserId = deleteUser.id;

      await prisma.jobSeeker.create({
        data: {
          userId: deleteTestUserId,
          fullName: 'Delete Test User',
        },
      });

      deleteAuthToken = jwtService.sign({
        sub: deleteTestUserId,
        role: 'JOB_SEEKER',
      });
    });

    it('should reject with wrong confirmation text', () => {
      return request(app.getHttpServer())
        .post('/users/me/delete')
        .set('Authorization', `Bearer ${deleteAuthToken}`)
        .send({
          password: 'DeleteTestPassword123',
          confirmation: 'delete', // lowercase should fail
        })
        .expect(400);
    });

    it('should reject with wrong password', () => {
      return request(app.getHttpServer())
        .post('/users/me/delete')
        .set('Authorization', `Bearer ${deleteAuthToken}`)
        .send({
          password: 'WrongPassword',
          confirmation: 'DELETE',
        })
        .expect(401);
    });

    it('should delete account successfully', async () => {
      await request(app.getHttpServer())
        .post('/users/me/delete')
        .set('Authorization', `Bearer ${deleteAuthToken}`)
        .send({
          password: 'DeleteTestPassword123',
          confirmation: 'DELETE',
        })
        .expect(204);

      // Verify user is deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: deleteTestUserId },
      });
      expect(deletedUser).toBeNull();

      // Verify user is archived
      const archivedUser = await prisma.archivedUser.findFirst({
        where: { originalId: deleteTestUserId },
      });
      expect(archivedUser).not.toBeNull();
    });

    it('should reject without auth token', () => {
      return request(app.getHttpServer())
        .post('/users/me/delete')
        .send({
          password: 'password',
          confirmation: 'DELETE',
        })
        .expect(401);
    });
  });
});

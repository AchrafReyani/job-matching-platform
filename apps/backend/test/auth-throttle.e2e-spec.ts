import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('Auth Rate Limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login rate limiting', () => {
    it('should return 429 after 5 login attempts and include Retry-After header', async () => {
      const payload = {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      };

      // 5 attempts allowed within the window
      for (let i = 0; i < 5; i++) {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send(payload);
        expect(res.status).not.toBe(429);
      }

      // 6th attempt should be rate limited
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(payload)
        .expect(429);

      expect(response.headers['retry-after']).toBeDefined();
    });
  });
});

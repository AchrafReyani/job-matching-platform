/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { LineOidcService } from "../src/auth/line/line-oidc.service";

const request = require("supertest");

/**
 * LINE login endpoints. renkei itself is not part of the test environment,
 * so the OIDC service is replaced with a stub that behaves like a configured
 * instance; the real discovery + code exchange is covered by the manual
 * browser check against a local renkei.
 */
describe("LINE login (e2e)", () => {
  let app: INestApplication;
  const oidcStub = {
    enabled: true,
    start: jest.fn().mockResolvedValue({
      url: "https://renkei.example/oidc/auth?client_id=jobmatch",
      state: "state-1",
      nonce: "nonce-1",
      codeVerifier: "verifier-1",
    }),
    callbackUrl: jest.fn(),
    callback: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LineOidcService)
      .useValue(oidcStub)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /auth/line/start redirects to renkei and sets the login cookie", async () => {
    const response = await request(app.getHttpServer())
      .get("/auth/line/start?role=company")
      .expect(302);

    expect(response.headers.location).toBe(
      "https://renkei.example/oidc/auth?client_id=jobmatch",
    );
    const cookies: string[] = response.headers["set-cookie"] ?? [];
    expect(cookies.some((c) => c.startsWith("line_login="))).toBe(true);
    expect(cookies.some((c) => /HttpOnly/i.test(c))).toBe(true);
    expect(cookies.some((c) => /Path=\/auth\/line/i.test(c))).toBe(true);
  });

  it("GET /auth/line/callback without the cookie redirects back with an error", async () => {
    const response = await request(app.getHttpServer())
      .get("/auth/line/callback?code=x&state=y")
      .expect(302);

    expect(response.headers.location).toMatch(/\/login\?error=line$/);
  });

  it("GET /auth/line/start returns 503 when LINE login is not configured", async () => {
    oidcStub.enabled = false;
    await request(app.getHttpServer()).get("/auth/line/start").expect(503);
    oidcStub.enabled = true;
  });
});

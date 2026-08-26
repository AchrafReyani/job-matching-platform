import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import {
  LineAuthController,
  LINE_LOGIN_COOKIE,
  parseRole,
  readCookie,
} from './line-auth.controller';
import { LineOidcService } from '../line/line-oidc.service';
import { LineLoginUseCase } from '../usecase/line-login.usecase';

describe('LineAuthController', () => {
  let controller: LineAuthController;
  const oidc = {
    enabled: true,
    start: jest.fn(),
    callback: jest.fn(),
    callbackUrl: jest.fn(),
  };
  const useCase = { execute: jest.fn() };
  const jwt = { sign: jest.fn(), verify: jest.fn() };

  const makeRes = () =>
    ({
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    }) as unknown as Response & {
      cookie: jest.Mock;
      clearCookie: jest.Mock;
      redirect: jest.Mock;
    };

  beforeEach(async () => {
    oidc.enabled = true;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LineAuthController],
      providers: [
        { provide: LineOidcService, useValue: oidc },
        { provide: LineLoginUseCase, useValue: useCase },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    controller = module.get<LineAuthController>(LineAuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.FRONTEND_URL;
  });

  describe('helpers', () => {
    it('maps the role query to a signup role, defaulting to job seeker', () => {
      expect(parseRole('company')).toBe('COMPANY');
      expect(parseRole('job-seeker')).toBe('JOB_SEEKER');
      expect(parseRole(undefined)).toBe('JOB_SEEKER');
    });

    it('reads a named cookie from a Cookie header', () => {
      expect(readCookie('a=1; line_login=abc%3D; b=2', 'line_login')).toBe(
        'abc=',
      );
      expect(readCookie('a=1', 'line_login')).toBeUndefined();
      expect(readCookie(undefined, 'line_login')).toBeUndefined();
    });
  });

  describe('GET /auth/line/start', () => {
    it('sets the signed login cookie and redirects to renkei', async () => {
      oidc.start.mockResolvedValue({
        url: 'https://renkei.example/oidc/auth?x=1',
        state: 's',
        nonce: 'n',
        codeVerifier: 'v',
      });
      jwt.sign.mockReturnValue('signed-cookie');
      const res = makeRes();

      await controller.start('company', res);

      expect(jwt.sign).toHaveBeenCalledWith(
        { state: 's', nonce: 'n', codeVerifier: 'v', role: 'COMPANY' },
        { expiresIn: 600 },
      );
      expect(res.cookie).toHaveBeenCalledWith(
        LINE_LOGIN_COOKIE,
        'signed-cookie',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
          path: '/auth/line',
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith(
        302,
        'https://renkei.example/oidc/auth?x=1',
      );
    });

    it('returns 503 when LINE login is not configured', async () => {
      oidc.enabled = false;
      await expect(controller.start(undefined, makeRes())).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('GET /auth/line/callback', () => {
    const req = (cookie?: string) =>
      ({
        headers: cookie ? { cookie } : {},
        originalUrl: '/auth/line/callback?code=c&state=s',
      }) as unknown as Request;

    it('exchanges the code, mints the app token and redirects with it in the fragment', async () => {
      process.env.FRONTEND_URL = 'https://app.example/';
      jwt.verify.mockReturnValue({
        state: 's',
        nonce: 'n',
        codeVerifier: 'v',
        role: 'JOB_SEEKER',
      });
      const callbackUrl = new URL(
        'https://api.example/auth/line/callback?code=c&state=s',
      );
      oidc.callbackUrl.mockReturnValue(callbackUrl);
      oidc.callback.mockResolvedValue({ sub: 'sub-1', name: 'Achraf' });
      useCase.execute.mockResolvedValue({ access_token: 'app-jwt' });
      const res = makeRes();

      await controller.callback(req(`${LINE_LOGIN_COOKIE}=signed`), res);

      expect(jwt.verify).toHaveBeenCalledWith('signed');
      expect(oidc.callback).toHaveBeenCalledWith(callbackUrl, {
        state: 's',
        nonce: 'n',
        codeVerifier: 'v',
        role: 'JOB_SEEKER',
      });
      expect(useCase.execute).toHaveBeenCalledWith({
        claims: { sub: 'sub-1', name: 'Achraf' },
        requestedRole: 'JOB_SEEKER',
      });
      expect(res.clearCookie).toHaveBeenCalledWith(LINE_LOGIN_COOKIE, {
        path: '/auth/line',
      });
      expect(res.redirect).toHaveBeenCalledWith(
        302,
        'https://app.example/login/line#token=app-jwt',
      );
    });

    it('redirects to the login page with an error when the cookie is missing', async () => {
      const res = makeRes();

      await controller.callback(req(), res);

      expect(oidc.callback).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        302,
        'http://localhost:3000/login?error=line',
      );
    });

    it('redirects with an error when the token exchange fails', async () => {
      jwt.verify.mockReturnValue({
        state: 's',
        nonce: 'n',
        codeVerifier: 'v',
        role: 'COMPANY',
      });
      oidc.callbackUrl.mockReturnValue(new URL('https://api.example/x'));
      oidc.callback.mockRejectedValue(new Error('state mismatch'));
      const res = makeRes();

      await controller.callback(req(`${LINE_LOGIN_COOKIE}=signed`), res);

      expect(useCase.execute).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        302,
        'http://localhost:3000/login?error=line',
      );
    });
  });
});

import {
  Controller,
  Get,
  Logger,
  Query,
  Req,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import {
  LineOidcService,
  type PendingLineLogin,
} from '../line/line-oidc.service';
import {
  LineLoginUseCase,
  type LineSignupRole,
} from '../usecase/line-login.usecase';

/** Cookie carrying the in-flight login (state, nonce, PKCE verifier, chosen role), signed with JWT_SECRET. */
export const LINE_LOGIN_COOKIE = 'line_login';
const COOKIE_PATH = '/auth/line';
const COOKIE_TTL_SECONDS = 10 * 60;

interface PendingLoginCookie extends PendingLineLogin {
  role: LineSignupRole;
}

export function parseRole(value: unknown): LineSignupRole {
  return value === 'company' ? 'COMPANY' : 'JOB_SEEKER';
}

export function readCookie(
  header: string | undefined,
  name: string,
): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

/**
 * LINE login through renkei.
 *
 *   GET /auth/line/start?role=job-seeker|company
 *     -> 302 to renkei (-> LINE -> renkei -> back here). The role is only used
 *        when the LINE user is new; it is remembered in a signed cookie.
 *   GET /auth/line/callback?code=...&state=...
 *     -> verifies everything, mints the app's own JWT and sends the browser to
 *        <FRONTEND_URL>/login/line#token=... (fragment: never hits server logs).
 *        On any failure -> <FRONTEND_URL>/login?error=line
 */
@Controller('auth/line')
export class LineAuthController {
  private readonly logger = new Logger(LineAuthController.name);

  constructor(
    private readonly oidc: LineOidcService,
    private readonly lineLoginUseCase: LineLoginUseCase,
    private readonly jwtService: JwtService,
  ) {}

  private get frontendUrl(): string {
    return (process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    );
  }

  private ensureEnabled(): void {
    if (!this.oidc.enabled) {
      throw new ServiceUnavailableException('LINE login is not configured');
    }
  }

  @Get('start')
  async start(
    @Query('role') role: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    this.ensureEnabled();
    const { url, state, nonce, codeVerifier } = await this.oidc.start();
    const pending: PendingLoginCookie = {
      state,
      nonce,
      codeVerifier,
      role: parseRole(role),
    };
    res.cookie(
      LINE_LOGIN_COOKIE,
      this.jwtService.sign(pending, { expiresIn: COOKIE_TTL_SECONDS }),
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: url.startsWith('https://'),
        maxAge: COOKIE_TTL_SECONDS * 1000,
        path: COOKIE_PATH,
      },
    );
    res.redirect(302, url);
  }

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.ensureEnabled();
    try {
      const raw = readCookie(req.headers.cookie, LINE_LOGIN_COOKIE);
      if (!raw) {
        throw new Error('login cookie missing or expired');
      }
      const pending = this.jwtService.verify<PendingLoginCookie>(raw);
      const claims = await this.oidc.callback(
        this.oidc.callbackUrl(req.originalUrl),
        pending,
      );
      const { access_token } = await this.lineLoginUseCase.execute({
        claims,
        requestedRole: pending.role,
      });
      res.clearCookie(LINE_LOGIN_COOKIE, { path: COOKIE_PATH });
      res.redirect(
        302,
        `${this.frontendUrl}/login/line#token=${encodeURIComponent(access_token)}`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`LINE login failed: ${message}`);
      res.clearCookie(LINE_LOGIN_COOKIE, { path: COOKIE_PATH });
      res.redirect(302, `${this.frontendUrl}/login?error=line`);
    }
  }
}

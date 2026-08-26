import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Role } from '@prisma/client';
import * as authRepository from '../repository/auth.repository';
import type { LineClaims } from '../line/line-oidc.service';
import type { LoginResult } from './login.usecase';

export type LineSignupRole = Extract<Role, 'JOB_SEEKER' | 'COMPANY'>;

export interface LineLoginInput {
  claims: LineClaims;
  /** Role chosen before the redirect; only used when the LINE user is new. */
  requestedRole: LineSignupRole;
}

/** Fallback when renkei does not provide an email (no email permission and no placeholder domain). */
export function placeholderEmail(sub: string): string {
  return `line-${sub.toLowerCase()}@line.invalid`;
}

/**
 * Turns a verified renkei id_token into the app's own access token.
 * First login creates the user + role profile; later logins find the user
 * by the stable `sub`. The role stored on the user always wins over the
 * role requested on the login page.
 */
@Injectable()
export class LineLoginUseCase {
  constructor(
    @Inject(authRepository.AUTH_REPOSITORY)
    private readonly authRepository: authRepository.AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LineLoginInput): Promise<LoginResult> {
    const { claims, requestedRole } = input;

    let user = await this.authRepository.findUserByLineSub(claims.sub);

    if (!user) {
      const email = claims.email ?? placeholderEmail(claims.sub);
      const existing = await this.authRepository.findUserByEmail(email);
      if (existing) {
        throw new ConflictException(
          'An account with this email already exists. Log in with your password instead.',
        );
      }
      const displayName = claims.name?.trim() || 'LINE user';
      user = await this.authRepository.createLineUser({
        lineSub: claims.sub,
        email,
        role: requestedRole,
        displayName,
      });
    }

    const payload = { sub: user.id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }
}

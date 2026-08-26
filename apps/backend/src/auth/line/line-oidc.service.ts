import { Injectable, Logger } from '@nestjs/common';
import type * as oidcTypes from 'openid-client';

/**
 * Talks OpenID Connect to a renkei instance (https://github.com/AchrafReyani/renkei),
 * which brokers LINE Login. renkei is a standard OIDC provider, so this is
 * plain discovery + authorization code flow with PKCE; nothing LINE-specific
 * except the `line` scope that exposes the `line:*` claims.
 *
 * Configured entirely from the environment:
 *   RENKEI_ISSUER        e.g. https://renkei-demo.onrender.com
 *   RENKEI_CLIENT_ID     client registered in renkei's RENKEI_CLIENTS
 *   RENKEI_CLIENT_SECRET
 *   BACKEND_URL          this API's public URL; the callback is <BACKEND_URL>/auth/line/callback
 * When RENKEI_ISSUER / client id / secret are missing the feature is disabled.
 *
 * `openid-client` v6 is ESM-only while this app compiles to CommonJS, so it
 * is loaded with a dynamic import on first use (Node keeps `import()` as a
 * real ESM import here). Unit tests mock this service entirely.
 */

type Oidc = typeof oidcTypes;

export interface LineAuthSettings {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface LineStartResult {
  /** Where to send the browser. */
  url: string;
  state: string;
  nonce: string;
  codeVerifier: string;
}

export interface PendingLineLogin {
  state: string;
  nonce: string;
  codeVerifier: string;
}

export interface LineClaims {
  /** renkei's stable per-user subject. */
  sub: string;
  name?: string;
  picture?: string;
  /** Present when renkei is configured with a placeholderEmailDomain or LINE granted email. */
  email?: string;
  lineUserId?: string;
  lineFriend?: boolean;
}

const SCOPE = 'openid profile email line';

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function readLineAuthSettings(
  env: NodeJS.ProcessEnv = process.env,
): LineAuthSettings | null {
  const issuer = env.RENKEI_ISSUER;
  const clientId = env.RENKEI_CLIENT_ID;
  const clientSecret = env.RENKEI_CLIENT_SECRET;
  if (!issuer || !clientId || !clientSecret) {
    return null;
  }
  const backendUrl = (env.BACKEND_URL ?? 'http://localhost:3001').replace(
    /\/$/,
    '',
  );
  return {
    issuer: issuer.replace(/\/$/, ''),
    clientId,
    clientSecret,
    redirectUri: `${backendUrl}/auth/line/callback`,
  };
}

@Injectable()
export class LineOidcService {
  private readonly logger = new Logger(LineOidcService.name);
  private oidcModule?: Promise<Oidc>;
  private configuration?: Promise<oidcTypes.Configuration>;
  readonly settings: LineAuthSettings | null;

  constructor() {
    this.settings = readLineAuthSettings();
    if (!this.settings) {
      this.logger.log(
        'LINE login disabled (RENKEI_ISSUER / RENKEI_CLIENT_ID / RENKEI_CLIENT_SECRET not set)',
      );
    }
  }

  get enabled(): boolean {
    return this.settings !== null;
  }

  private requireSettings(): LineAuthSettings {
    if (!this.settings) {
      throw new Error('LINE login is not configured');
    }
    return this.settings;
  }

  private oidc(): Promise<Oidc> {
    this.oidcModule ??= import('openid-client');
    return this.oidcModule;
  }

  /** Discovery is done once and cached; a failed attempt is retried next time. */
  private async getConfiguration(): Promise<oidcTypes.Configuration> {
    const settings = this.requireSettings();
    if (this.configuration) {
      return this.configuration;
    }
    const oidc = await this.oidc();
    const insecure = settings.issuer.startsWith('http://');
    const pending = oidc
      .discovery(
        new URL(settings.issuer),
        settings.clientId,
        settings.clientSecret,
        undefined,
        insecure ? { execute: [oidc.allowInsecureRequests] } : undefined,
      )
      .catch((err: unknown) => {
        this.configuration = undefined;
        throw err;
      });
    this.configuration = pending;
    return pending;
  }

  /** Builds the authorization URL and the one-time values the callback must verify. */
  async start(): Promise<LineStartResult> {
    const settings = this.requireSettings();
    const oidc = await this.oidc();
    const config = await this.getConfiguration();
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const url = oidc.buildAuthorizationUrl(config, {
      redirect_uri: settings.redirectUri,
      scope: SCOPE,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      nonce,
    });
    return { url: url.href, state, nonce, codeVerifier };
  }

  /** The callback URL as renkei saw it: registered redirect URI + the query string we received. */
  callbackUrl(originalUrl: string): URL {
    const settings = this.requireSettings();
    const url = new URL(settings.redirectUri);
    url.search = new URL(originalUrl, 'http://placeholder').search;
    return url;
  }

  /** Exchanges the code, verifies state/nonce/PKCE and the id_token, returns its claims. */
  async callback(
    currentUrl: URL,
    pending: PendingLineLogin,
  ): Promise<LineClaims> {
    const oidc = await this.oidc();
    const config = await this.getConfiguration();
    const tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: pending.codeVerifier,
      expectedState: pending.state,
      expectedNonce: pending.nonce,
    });
    const claims = tokens.claims();
    if (!claims) {
      throw new Error('renkei returned no id_token');
    }
    const friend = claims['line:friend'];
    return {
      sub: claims.sub,
      name: optionalString(claims.name),
      picture: optionalString(claims.picture),
      email: optionalString(claims.email),
      lineUserId: optionalString(claims['line:user_id']),
      lineFriend: typeof friend === 'boolean' ? friend : undefined,
    };
  }
}

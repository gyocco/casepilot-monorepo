import { UnauthorizedError } from '@casepilot/abstractions';

export type AuthProvider = 'firebase';

export interface VerifiedIdentity {
  readonly provider: AuthProvider;
  readonly subject: string;
  readonly email: string | null;
  readonly emailVerified: boolean;
  readonly displayName: string | null;
}

export interface TokenVerifier {
  verify(token: string): Promise<VerifiedIdentity>;
  close?(): Promise<void>;
}

const BEARER_TOKEN_PATTERN = /^Bearer[ \t]+([A-Za-z0-9._~+/-]+=*)$/;

export function parseBearerToken(authorizationHeader: string | readonly string[] | undefined): string {
  if (typeof authorizationHeader !== 'string') {
    throw new UnauthorizedError('Authentication token is required.');
  }
  const match = BEARER_TOKEN_PATTERN.exec(authorizationHeader.trim());
  if (!match?.[1]) {
    throw new UnauthorizedError('Authorization header must use a valid Bearer token.');
  }
  return match[1];
}

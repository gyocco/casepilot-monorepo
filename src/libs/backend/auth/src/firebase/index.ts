import { randomUUID } from 'node:crypto';
import process from 'node:process';
import { deleteApp, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { UnauthorizedError } from '@casepilot/abstractions';
import type { TokenVerifier, VerifiedIdentity } from '../index.js';

export interface FirebaseTokenVerifierOptions {
  readonly projectId: string;
  readonly emulatorHost?: string | null;
  readonly checkRevoked?: boolean;
}

export class FirebaseTokenVerifier implements TokenVerifier {
  private readonly appName: string;
  private app: App | null = null;
  private auth: Auth | null = null;

  constructor(private readonly options: FirebaseTokenVerifierOptions) {
    if (!options.projectId || options.projectId.trim().length === 0) {
      throw new Error('Firebase projectId must be configured.');
    }
    this.appName = `casepilot-auth-${randomUUID()}`;
  }

  private getAuthClient(): Auth {
    if (this.auth) return this.auth;
    if (this.options.emulatorHost) {
      process.env.FIREBASE_AUTH_EMULATOR_HOST = this.options.emulatorHost;
    }
    this.app = initializeApp({ projectId: this.options.projectId }, this.appName);
    this.auth = getAuth(this.app);
    return this.auth;
  }

  async verify(token: string): Promise<VerifiedIdentity> {
    if (!token || token.trim().length === 0) {
      throw new UnauthorizedError('Authentication token is required.');
    }
    const checkRevoked = this.options.checkRevoked ?? !this.options.emulatorHost;
    try {
      const decoded = await this.getAuthClient().verifyIdToken(token, checkRevoked);
      const rawName: unknown = decoded.name;
      const displayName = typeof rawName === 'string' && rawName.trim().length > 0 ? rawName.trim() : null;
      return {
        provider: 'firebase',
        subject: decoded.uid,
        email: typeof decoded.email === 'string' && decoded.email.trim().length > 0 ? decoded.email.trim() : null,
        emailVerified: decoded.email_verified === true,
        displayName,
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Authentication token is invalid or expired.');
    }
  }

  async close(): Promise<void> {
    const current = this.app;
    this.app = null;
    this.auth = null;
    if (current) await deleteApp(current);
  }
}

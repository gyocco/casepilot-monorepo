import { InjectionToken } from '@angular/core';

export interface AuthSessionUser {
  readonly uid: string;
  readonly email: string | null;
  readonly emailVerified: boolean;
  readonly displayName: string | null;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthProviderAdapter {
  watchAuthState(callback: (user: AuthSessionUser | null) => void): () => void;
  signInWithEmail(email: string, password: string): Promise<AuthSessionUser>;
  signUpWithEmail(email: string, password: string, displayName: string): Promise<AuthSessionUser>;
  signOut(): Promise<void>;
  getIdToken(forceRefresh?: boolean): Promise<string | null>;
}

export const AUTH_PROVIDER_ADAPTER = new InjectionToken<AuthProviderAdapter>('CASEPILOT_AUTH_PROVIDER_ADAPTER');

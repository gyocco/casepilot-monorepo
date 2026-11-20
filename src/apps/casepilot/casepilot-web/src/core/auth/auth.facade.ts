import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { AUTH_PROVIDER_ADAPTER, type AuthSessionUser, type AuthStatus } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly adapter = inject(AUTH_PROVIDER_ADAPTER);
  private readonly destroyRef = inject(DestroyRef);

  private readonly stateStatus = signal<AuthStatus>('loading');
  private readonly stateUser = signal<AuthSessionUser | null>(null);
  private initialized = false;
  private readyResolve: ((authenticated: boolean) => void) | null = null;
  private readonly readyPromise: Promise<boolean>;

  readonly status = this.stateStatus.asReadonly();
  readonly user = this.stateUser.asReadonly();
  readonly isLoading = computed(() => this.stateStatus() === 'loading');
  readonly isAuthenticated = computed(() => this.stateStatus() === 'authenticated');

  constructor() {
    this.readyPromise = new Promise<boolean>(resolve => {
      this.readyResolve = resolve;
    });
    this.initialize();
  }

  private initialize(): void {
    if (this.initialized) return;
    this.initialized = true;
    const unsubscribe = this.adapter.watchAuthState(user => {
      this.stateUser.set(user);
      this.stateStatus.set(user ? 'authenticated' : 'unauthenticated');
      if (this.readyResolve) {
        this.readyResolve(user !== null);
        this.readyResolve = null;
      }
    });
    this.destroyRef.onDestroy(() => unsubscribe());
  }

  waitUntilReady(): Promise<boolean> {
    return this.readyPromise;
  }

  async signInWithEmail(email: string, password: string): Promise<AuthSessionUser> {
    const user = await this.adapter.signInWithEmail(email, password);
    this.stateUser.set(user);
    this.stateStatus.set('authenticated');
    return user;
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<AuthSessionUser> {
    const user = await this.adapter.signUpWithEmail(email, password, displayName);
    this.stateUser.set(user);
    this.stateStatus.set('authenticated');
    return user;
  }

  async signOut(): Promise<void> {
    await this.adapter.signOut();
    this.stateUser.set(null);
    this.stateStatus.set('unauthenticated');
  }

  getIdToken(forceRefresh = false): Promise<string | null> {
    return this.adapter.getIdToken(forceRefresh);
  }
}

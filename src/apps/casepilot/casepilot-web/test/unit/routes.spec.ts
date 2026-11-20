import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { providePilotThemes } from '@casepilot/pilot-ui-kit';
import { describe, expect, it } from 'vitest';
import { APP_ROUTES } from '../../src/app/app.routes';
import { AUTH_PROVIDER_ADAPTER, type AuthProviderAdapter, type AuthSessionUser } from '../../src/core/auth/auth.models';
import { APP_CONFIG, DEFAULT_LOCAL_APP_CONFIG } from '../../src/core/config/app-config';
import { CASEPILOT_THEMES } from '../../src/theme/casepilot.theme';

function createStubAdapter(initialUser: AuthSessionUser | null): AuthProviderAdapter {
  return {
    watchAuthState: callback => {
      callback(initialUser);
      return () => {};
    },
    signInWithEmail: () => Promise.resolve(initialUser ?? { uid: 'u1', email: 'ada@casepilot.test', emailVerified: true, displayName: 'Ada' }),
    signUpWithEmail: () => Promise.resolve(initialUser ?? { uid: 'u1', email: 'ada@casepilot.test', emailVerified: true, displayName: 'Ada' }),
    signOut: () => Promise.resolve(),
    getIdToken: () => Promise.resolve(initialUser ? 'test-id-token' : null),
  };
}

describe('application routes and auth guards', () => {
  it.each(['/', '/auth', '/profile', '/unknown'])('redirects unauthenticated %s to /auth/login via lazy routes', async (url: string) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(APP_ROUTES),
        provideHttpClient(),
        providePilotThemes({ themes: CASEPILOT_THEMES, initialTheme: 'default' }),
        { provide: APP_CONFIG, useValue: DEFAULT_LOCAL_APP_CONFIG },
        { provide: AUTH_PROVIDER_ADAPTER, useValue: createStubAdapter(null) },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    expect(TestBed.inject(Router).url).toBe('/auth/login');
    expect(harness.routeNativeElement?.textContent).toContain('Inicio de sesión');
    expect(harness.routeNativeElement?.querySelector('form')).not.toBeNull();
  });

  it('redirects authenticated users away from /auth/login to /profile', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(APP_ROUTES),
        provideHttpClient(),
        providePilotThemes({ themes: CASEPILOT_THEMES, initialTheme: 'default' }),
        { provide: APP_CONFIG, useValue: DEFAULT_LOCAL_APP_CONFIG },
        {
          provide: AUTH_PROVIDER_ADAPTER,
          useValue: createStubAdapter({ uid: 'u1', email: 'ada@casepilot.test', emailVerified: true, displayName: 'Ada' }),
        },
      ],
    });
    await RouterTestingHarness.create('/auth/login');
    expect(TestBed.inject(Router).url).toBe('/profile');
  });
});

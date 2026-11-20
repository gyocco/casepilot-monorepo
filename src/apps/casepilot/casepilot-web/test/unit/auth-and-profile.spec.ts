import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { authTokenInterceptor } from '../../src/core/auth/auth-token.interceptor';
import { AUTH_PROVIDER_ADAPTER, type AuthProviderAdapter, type AuthSessionUser } from '../../src/core/auth/auth.models';
import { APP_CONFIG, DEFAULT_LOCAL_APP_CONFIG, validateAppConfig } from '../../src/core/config/app-config';
import { normalizeHttpError } from '../../src/core/http/problem-details';
import { ProfileFacade } from '../../src/features/profile/state/profile.facade';
import type { UserProfile } from '../../src/features/profile/models/profile.models';

function stubAdapter(user: AuthSessionUser | null, token: string | null): AuthProviderAdapter {
  return {
    watchAuthState: callback => {
      callback(user);
      return () => {};
    },
    signInWithEmail: () => Promise.resolve(user ?? { uid: 'u1', email: 'ada@casepilot.test', emailVerified: true, displayName: 'Ada' }),
    signUpWithEmail: () => Promise.resolve(user ?? { uid: 'u1', email: 'ada@casepilot.test', emailVerified: true, displayName: 'Ada' }),
    signOut: () => Promise.resolve(),
    getIdToken: () => Promise.resolve(token),
  };
}

const sampleProfile: UserProfile = {
  id: '00000000-0000-4000-8000-000000000010',
  email: 'ada@casepilot.test',
  emailVerifiedAt: '2026-11-20T12:00:00.000Z',
  firstName: 'Ada',
  lastName: 'Lovelace',
  displayName: 'Ada Lovelace',
  locale: 'es',
  timezone: 'UTC',
  status: 'ACTIVE',
  version: 1,
  memberships: [
    {
      memberId: '00000000-0000-4000-8000-000000000020',
      businessAccountId: '00000000-0000-4000-8000-000000000030',
      accountName: 'Ada Workspace',
      accountStatus: 'ACTIVE',
      role: 'OWNER',
      memberStatus: 'ACTIVE',
    },
  ],
};

describe('public config validation and RFC 9457 normalization', () => {
  it('accepts local emulator config and rejects emulator URL in non-local environments', () => {
    expect(validateAppConfig(DEFAULT_LOCAL_APP_CONFIG).authEmulatorUrl).toBe('http://127.0.0.1:9099');
    expect(() => validateAppConfig({
      ...DEFAULT_LOCAL_APP_CONFIG,
      environment: 'development',
      authEmulatorUrl: 'http://127.0.0.1:9099',
    })).toThrow(/only in local/);
    expect(validateAppConfig({
      ...DEFAULT_LOCAL_APP_CONFIG,
      environment: 'development',
      authEmulatorUrl: null,
    }).authEmulatorUrl).toBeNull();
  });

  it('normalizes RFC 9457 Problem Details responses cleanly', () => {
    const error = new HttpErrorResponse({
      status: 403,
      error: {
        type: 'about:blank',
        title: 'Forbidden',
        status: 403,
        code: 'FORBIDDEN_ERROR',
        detail: 'You do not have access to this business account.',
      },
    });
    const info = normalizeHttpError(error);
    expect(info.status).toBe(403);
    expect(info.code).toBe('FORBIDDEN_ERROR');
    expect(info.message).toContain('do not have access');
  });
});

describe('authTokenInterceptor and ProfileFacade', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('attaches Bearer token only to configured API origin and never to external origins', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: DEFAULT_LOCAL_APP_CONFIG },
        {
          provide: AUTH_PROVIDER_ADAPTER,
          useValue: stubAdapter({ uid: 'u1', email: 'ada@casepilot.test', emailVerified: true, displayName: 'Ada' }, 'firebase-jwt-token'),
        },
      ],
    });
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    const apiPromise = firstValueFrom(http.get(`${DEFAULT_LOCAL_APP_CONFIG.apiBaseUrl}/auth/me`));
    await Promise.resolve();
    const apiReq = controller.expectOne(`${DEFAULT_LOCAL_APP_CONFIG.apiBaseUrl}/auth/me`);
    expect(apiReq.request.headers.get('Authorization')).toBe('Bearer firebase-jwt-token');
    apiReq.flush({ profile: sampleProfile });
    await apiPromise;

    const extPromise = firstValueFrom(http.get('https://external.example.test/public'));
    const extReq = controller.expectOne('https://external.example.test/public');
    expect(extReq.request.headers.has('Authorization')).toBe(false);
    extReq.flush({ ok: true });
    await extPromise;
    controller.verify();
  });

  it('bootstraps profile, saves changes and distinguishes 200 authorized vs 403 forbidden account checks', async () => {
    TestBed.configureTestingModule({
      providers: [
        ProfileFacade,
        provideRouter([{ path: 'auth/login', children: [] }]),
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: DEFAULT_LOCAL_APP_CONFIG },
        {
          provide: AUTH_PROVIDER_ADAPTER,
          useValue: stubAdapter({ uid: 'u1', email: 'ada@casepilot.test', emailVerified: true, displayName: 'Ada' }, 'firebase-jwt-token'),
        },
      ],
    });

    const facade = TestBed.inject(ProfileFacade);
    const controller = TestBed.inject(HttpTestingController);

    const loadPromise = facade.load();
    await Promise.resolve();
    const bootstrapReq = controller.expectOne(`${DEFAULT_LOCAL_APP_CONFIG.apiBaseUrl}/auth/me/bootstrap`);
    expect(bootstrapReq.request.method).toBe('POST');
    expect(bootstrapReq.request.headers.get('Authorization')).toBe('Bearer firebase-jwt-token');
    bootstrapReq.flush({ profile: sampleProfile, provisioned: true });
    await loadPromise;

    expect(facade.profile()?.email).toBe('ada@casepilot.test');
    expect(facade.profile()?.memberships.length).toBe(1);

    facade.firstName.set('Augusta');
    const savePromise = facade.save();
    await Promise.resolve();
    const patchReq = controller.expectOne(`${DEFAULT_LOCAL_APP_CONFIG.apiBaseUrl}/auth/me`);
    expect(patchReq.request.method).toBe('PATCH');
    patchReq.flush({ profile: { ...sampleProfile, firstName: 'Augusta', version: 2 } });
    await savePromise;
    expect(facade.profile()?.version).toBe(2);

    const allowedPromise = facade.verifyAuthorizedAccount(sampleProfile.memberships[0]!.businessAccountId);
    await Promise.resolve();
    const accReq = controller.expectOne(`${DEFAULT_LOCAL_APP_CONFIG.apiBaseUrl}/business-accounts/${sampleProfile.memberships[0]!.businessAccountId}`);
    accReq.flush({ item: { id: sampleProfile.memberships[0]!.businessAccountId, name: 'Ada Workspace', status: 'ACTIVE', currency: 'USD', timezone: 'UTC', version: 1 } });
    await allowedPromise;
    expect(facade.authzResult()?.allowed).toBe(true);
    expect(facade.authzResult()?.status).toBe(200);

    const forbiddenPromise = facade.verifyForbiddenAccount();
    await Promise.resolve();
    const foreignReq = controller.expectOne(`${DEFAULT_LOCAL_APP_CONFIG.apiBaseUrl}/business-accounts/00000000-0000-4000-8000-000000000999`);
    foreignReq.flush(
      { type: 'about:blank', title: 'Forbidden', status: 403, code: 'FORBIDDEN_ERROR', detail: 'You do not have access to this business account.' },
      { status: 403, statusText: 'Forbidden' },
    );
    await forbiddenPromise;
    expect(facade.authzResult()?.allowed).toBe(false);
    expect(facade.authzResult()?.status).toBe(403);

    await facade.signOut();
    expect(TestBed.inject(Router).url).toBe('/auth/login');
    controller.verify();
  });
});

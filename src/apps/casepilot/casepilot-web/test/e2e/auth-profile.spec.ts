import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ACCOUNT_ID = '00000000-0000-4000-8000-000000000030';
const FOREIGN_ACCOUNT_ID = '00000000-0000-4000-8000-000000000999';

function createFakeJwt(uid: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: 'https://securetoken.google.com/demo-casepilot-local',
    aud: 'demo-casepilot-local',
    sub: uid,
    user_id: uid,
    email,
    email_verified: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  })).toString('base64url');
  return `${header}.${payload}.`;
}

test('full authenticated SPA-API profile and authorization check (200 and 403) with axe accessibility', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  const fakeIdToken = createFakeJwt('e2e-uid-ada', 'ada@casepilot.test');
  let profile = {
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
        businessAccountId: ACCOUNT_ID,
        accountName: 'Ada Workspace',
        accountStatus: 'ACTIVE',
        role: 'OWNER',
        memberStatus: 'ACTIVE',
      },
    ],
  };

  // Intercept Firebase Auth Emulator REST calls made by firebase/auth SDK
  await page.route('http://127.0.0.1:9099/**', async route => {
    const url = route.request().url();
    if (url.includes('accounts:signInWithPassword')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#VerifyPasswordResponse',
          localId: 'e2e-uid-ada',
          email: 'ada@casepilot.test',
          displayName: 'Ada Lovelace',
          idToken: fakeIdToken,
          registered: true,
          refreshToken: 'e2e-refresh-token',
          expiresIn: '3600',
        }),
      });
      return;
    }
    if (url.includes('accounts:lookup')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#GetAccountInfoResponse',
          users: [{
            localId: 'e2e-uid-ada',
            email: 'ada@casepilot.test',
            emailVerified: true,
            displayName: 'Ada Lovelace',
            providerUserInfo: [{ providerId: 'password', email: 'ada@casepilot.test' }],
          }],
        }),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  // Intercept CasePilot API calls and verify Bearer token is always sent
  await page.route('http://127.0.0.1:3000/**', async route => {
    const req = route.request();
    const authHeader = req.headers()['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await route.fulfill({
        status: 401,
        contentType: 'application/problem+json',
        body: JSON.stringify({ type: 'about:blank', title: 'Unauthorized', status: 401, code: 'UNAUTHORIZED_ERROR' }),
      });
      return;
    }

    const url = new URL(req.url());
    if (url.pathname === '/auth/me/bootstrap' && req.method() === 'POST') {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ profile, provisioned: true }) });
      return;
    }
    if (url.pathname === '/auth/me' && req.method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ profile }) });
      return;
    }
    if (url.pathname === '/auth/me' && req.method() === 'PATCH') {
      const patch = req.postDataJSON() as { firstName?: string; displayName?: string };
      profile = { ...profile, firstName: patch.firstName ?? profile.firstName, displayName: patch.displayName ?? profile.displayName, version: profile.version + 1 };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ profile }) });
      return;
    }
    if (url.pathname === `/business-accounts/${ACCOUNT_ID}` && req.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ item: { id: ACCOUNT_ID, name: 'Ada Workspace', status: 'ACTIVE', currency: 'USD', timezone: 'UTC', version: 1 } }),
      });
      return;
    }
    if (url.pathname === `/business-accounts/${FOREIGN_ACCOUNT_ID}` && req.method() === 'GET') {
      await route.fulfill({
        status: 403,
        contentType: 'application/problem+json',
        body: JSON.stringify({
          type: 'about:blank',
          title: 'Forbidden',
          status: 403,
          code: 'FORBIDDEN_ERROR',
          detail: 'You do not have access to this business account.',
        }),
      });
      return;
    }
    await route.fulfill({ status: 404, contentType: 'application/problem+json', body: JSON.stringify({ status: 404, code: 'NOT_FOUND_ERROR' }) });
  });

  await page.goto('/profile');
  await expect(page).toHaveURL(/\/auth\/login$/);

  await page.fill('#login-email', 'ada@casepilot.test');
  await page.fill('#login-password', 'Password123!');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Perfil y autorización' })).toBeVisible();
  await expect(page.getByText('ada@casepilot.test')).toBeVisible();
  await expect(page.getByText('Ada Workspace')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // Save profile edit
  await page.fill('#profile-first-name', 'Augusta');
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await expect(page.getByText('Perfil actualizado (versión 2).')).toBeVisible();

  // Verify authorized account access (200 OK)
  await page.getByRole('button', { name: 'Verificar acceso (200)' }).click();
  await expect(page.getByText('Acceso autorizado (200 OK): Ada Workspace')).toBeVisible();

  // Verify unauthorized foreign account access (403 Forbidden)
  await page.getByRole('button', { name: 'Probar cuenta ajena (403)' }).click();
  await expect(page.getByRole('alert')).toContainText('Acceso denegado (403 FORBIDDEN_ERROR)');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // Sign out returns to login
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
  expect(errors).toEqual([]);
});

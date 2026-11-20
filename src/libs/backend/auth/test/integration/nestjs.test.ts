import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UnauthorizedError } from '@casepilot/abstractions';
import { ExceptionHandlerModule, type ProblemDetails } from '@casepilot/exception-handler/nestjs';
import type { TokenVerifier, VerifiedIdentity } from '../../src/index.js';
import { CurrentIdentity, NestAuthModule, PublicEndpoint } from '../../src/nestjs/index.js';

@Controller('auth-test')
class AuthTestController {
  @Get('public')
  @PublicEndpoint()
  getPublic(): { status: string } {
    return { status: 'public' };
  }

  @Get('protected')
  getProtected(@CurrentIdentity() identity: VerifiedIdentity): VerifiedIdentity {
    return identity;
  }
}

@Module({ controllers: [AuthTestController] })
class TestModule {}

void test('NestAuthModule enforces Bearer authentication by default, allows PublicEndpoint and maps failures to RFC 9457 401', async context => {
  let closed = false;
  const verifier: TokenVerifier = {
    verify(token: string): Promise<VerifiedIdentity> {
      if (token === 'valid-token') {
        return Promise.resolve({
          provider: 'firebase',
          subject: 'uid-123',
          email: 'user@example.com',
          emailVerified: true,
          displayName: 'Test User',
        });
      }
      if (token === 'boom-token') {
        return Promise.reject(new Error('private firebase sdk secret diagnostic'));
      }
      return Promise.reject(new UnauthorizedError('Invalid token.'));
    },
    close(): Promise<void> {
      closed = true;
      return Promise.resolve();
    },
  };

  const app = await NestFactory.create({
    module: TestModule,
    imports: [
      ExceptionHandlerModule.register({ exposeDetails: false }),
      NestAuthModule.register({ verifier }),
    ],
  }, { logger: false, abortOnError: false });
  context.after(async () => {
    await app.close();
    assert.equal(closed, true);
  });
  await app.listen(0, '127.0.0.1');
  const url = await app.getUrl();

  const pub = await fetch(`${url}/auth-test/public`, { signal: AbortSignal.timeout(5000) });
  assert.equal(pub.status, 200);
  assert.deepEqual(await pub.json(), { status: 'public' });

  for (const headers of [
    {},
    { Authorization: 'Basic abc' },
    { Authorization: 'Bearer invalid-token' },
    { Authorization: 'Bearer boom-token' },
  ] as Record<string, string>[]) {
    const res = await fetch(`${url}/auth-test/protected`, { headers, signal: AbortSignal.timeout(5000) });
    assert.equal(res.status, 401);
    assert.match(res.headers.get('content-type') ?? '', /^application\/problem\+json\b/);
    const body = await res.json() as ProblemDetails;
    assert.equal(body.code, 'UNAUTHORIZED_ERROR');
    assert.doesNotMatch(JSON.stringify(body), /private|secret|firebase/);
  }

  const ok = await fetch(`${url}/auth-test/protected`, {
    headers: { Authorization: 'Bearer valid-token' },
    signal: AbortSignal.timeout(5000),
  });
  assert.equal(ok.status, 200);
  assert.deepEqual(await ok.json(), {
    provider: 'firebase',
    subject: 'uid-123',
    email: 'user@example.com',
    emailVerified: true,
    displayName: 'Test User',
  });
});

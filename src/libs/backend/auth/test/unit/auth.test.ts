import assert from 'node:assert/strict';
import { test } from 'node:test';
import { UnauthorizedError } from '@casepilot/abstractions';
import { parseBearerToken } from '../../src/index.js';
import { FirebaseTokenVerifier } from '../../src/firebase/index.js';

void test('parseBearerToken extracts valid Bearer tokens and rejects missing or malformed headers', () => {
  assert.equal(parseBearerToken('Bearer header.payload.signature'), 'header.payload.signature');
  assert.equal(parseBearerToken('  Bearer   abc123._~+/-=  '), 'abc123._~+/-=');
  for (const invalid of [undefined, '', '   ', 'Basic dXNlcjpwYXNz', 'Bearer', 'Bearer ', 'Bearer a b', ['Bearer a']]) {
    assert.throws(() => parseBearerToken(invalid), UnauthorizedError);
  }
});

void test('FirebaseTokenVerifier validates options and rejects blank tokens with UnauthorizedError', async () => {
  assert.throws(() => new FirebaseTokenVerifier({ projectId: '   ' }), /projectId/);
  const verifier = new FirebaseTokenVerifier({ projectId: 'demo-casepilot-test', emulatorHost: '127.0.0.1:9099' });
  await assert.rejects(verifier.verify('   '), UnauthorizedError);
  await verifier.close();
});

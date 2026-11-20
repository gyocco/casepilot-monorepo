import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('../../../src/apps/casepilot/casepilot-web/', import.meta.url));
const require = createRequire(new URL('../../../src/apps/casepilot/casepilot-web/package.json', import.meta.url));
const { ESLint } = require('eslint');
const eslint = new ESLint({ cwd: appRoot, overrideConfigFile: `${appRoot}/eslint.config.mjs` });
async function messages(file, code) {
  const results = await eslint.lintText(code, { filePath: file });
  return results.flatMap(result => result.messages.map(message => message.message));
}

test('FRT-007 permits technical adapters while rejecting HTTP/providers in components and state', async () => {
  const code = "export { HttpClient as Network } from '@angular/common/http';";
  assert.deepEqual(await messages('src/core/api/client.ts', code), []);
  assert.deepEqual(await messages('src/features/auth/data-access/client.ts', code), []);
  for (const file of ['src/features/auth/pages/login/login.page.ts', 'src/features/auth/state/session.ts']) {
    assert.ok((await messages(file, code)).some(message => message.includes('FRT-007')));
  }
  const firebaseCode = "export { getAuth } from 'firebase/auth';";
  assert.deepEqual(await messages('src/core/auth/firebase-auth.adapter.ts', firebaseCode), []);
  for (const file of ['src/features/auth/data-access/client.ts', 'src/features/auth/pages/login/login.page.ts']) {
    assert.ok((await messages(file, firebaseCode)).some(message => message.includes('FRT-007')), file);
  }
});

test('FRT-007 rejects browser capabilities and global fetch outside adapters', async () => {
  assert.ok((await messages('src/features/auth/pages/login/login.page.ts', 'export const value = window.location.href;')).some(message => message.includes('FRT-007')));
  assert.ok((await messages('src/features/auth/pages/login/login.page.ts', 'export const value = fetch("/api");')).some(message => message.includes('FRT-007')));
  assert.deepEqual(await messages('src/core/platform/location.ts', 'export const value = window.location.href;'), []);
  assert.deepEqual(await messages('src/features/auth/pages/login/login.page.ts', 'export function name(window: { title: string }): string { return window.title; }'), []);
});

test('FRT-001/FRT-008/FRT-012 reject private kit imports, unsafe SDKs and direct Material', async () => {
  const file = 'src/features/auth/pages/login/login.page.ts';
  assert.deepEqual(await messages(file, "export { PilotSurfaceComponent } from '@casepilot/pilot-ui-kit';"), []);
  for (const [code, id] of [
    ["export { PilotSurfaceComponent } from '@casepilot/pilot-ui-kit/src/components/surface';", 'FRT-001'],
    ["export { MatCardModule } from '@angular/material/card';", 'FRT-012'],
    ["export { app } from 'firebase-admin';", 'FRT-008'],
    ['export function render(sanitizer: { bypassSecurityTrustHtml(text: string): string }): string { return sanitizer.bypassSecurityTrustHtml("<p>unsafe</p>"); }', 'FRT-008'],
  ]) assert.ok((await messages(file, code)).some(message => message.includes(id)), code);
});

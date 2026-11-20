import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import configuration from '../../eslint.config.mjs';

const directory = fileURLToPath(new URL('../../', import.meta.url));
const eslint = new ESLint({
  cwd: directory,
  overrideConfigFile: true,
  overrideConfig: [...configuration, tseslint.configs.disableTypeChecked],
});

void test('BCK-008 keeps root auth entry pure and isolates NestJS and Firebase adapters', async () => {
  for (const source of [
    "export { Injectable } from '@nestjs/common';",
    "export { getAuth } from 'firebase-admin/auth';",
    "export { randomUUID } from 'node:crypto';",
    "export { NestAuthModule } from './nestjs/index.js';",
    "export { FirebaseTokenVerifier } from './firebase/index.js';",
  ]) {
    const results = await eslint.lintText(source, { filePath: join(directory, 'src/index.ts') });
    assert.ok(results.flatMap(result => result.messages).some(message => message.message.includes('BCK-008')), source);
  }
  const nestFirebase = await eslint.lintText("export { getAuth } from 'firebase-admin/auth';", {
    filePath: join(directory, 'src/nestjs/example.ts'),
  });
  assert.ok(nestFirebase.flatMap(result => result.messages).some(message => message.message.includes('BCK-003/BCK-008')));

  for (const [path, source] of [
    ['src/index.ts', "export { UnauthorizedError } from '@casepilot/abstractions';"],
    ['src/firebase/example.ts', "export { getAuth } from 'firebase-admin/auth';"],
    ['src/nestjs/example.ts', "export { Injectable } from '@nestjs/common';"],
  ]) {
    const results = await eslint.lintText(source, { filePath: join(directory, path) });
    assert.deepEqual(results.flatMap(result => result.messages), [], path);
  }
});

void test('BCK-015 rejects app imports from auth library', async () => {
  const results = await eslint.lintText("export { AppModule } from '../../../../../apps/casepilot/casepilot-api/src/app.module.js';", {
    filePath: join(directory, 'src/nestjs/example.ts'),
  });
  assert.ok(results.flatMap(result => result.messages).some(message => message.message.includes('BCK-015')));
});

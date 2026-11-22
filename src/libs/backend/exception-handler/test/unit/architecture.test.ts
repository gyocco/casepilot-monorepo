import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import configuration from '../../eslint.config.mjs';

const directory = fileURLToPath(new URL('../../', import.meta.url));
const eslint = new ESLint({ cwd: directory, overrideConfigFile: true,
  overrideConfig: [...configuration, tseslint.configs.disableTypeChecked] });

void test('BCK-008 keeps the root error entry pure and permits NestJS only in the adapter', async () => {
  for (const source of [
    "export { HttpException } from '@nestjs/common';",
    "export { randomUUID } from 'node:crypto';",
    "export { ExceptionHandlerModule } from './nestjs/index.js';",
    "export { TypeOrmUnitOfWork } from '@casepilot/persistence/typeorm';",
    "export { UnexpectedError } from '@casepilot/abstractions/dist/errors.js';",
  ]) {
    const results = await eslint.lintText(source, { filePath: join(directory, 'src/index.ts') });
    assert.ok(results.flatMap(result => result.messages).some(message => message.message.includes('BCK-008')));
  }
  for (const [path, source] of [
    ['src/index.ts', "export { ValidationError } from '@casepilot/abstractions';"],
    ['src/nestjs/example.ts', "export { HttpException } from '@nestjs/common';"],
  ]) {
    const results = await eslint.lintText(source, { filePath: join(directory, path) });
    assert.deepEqual(results.flatMap(result => result.messages), []);
  }
});

void test('BCK-015 rejects app imports from the reusable adapter', async () => {
  const results = await eslint.lintText("export { AppModule } from '../../../../../apps/casepilot/casepilot-api/src/app.module.js';", {
    filePath: join(directory, 'src/nestjs/example.ts'),
  });
  assert.ok(results.flatMap(result => result.messages).some(message => message.message.includes('BCK-015')));
});

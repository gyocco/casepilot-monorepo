import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import configuration from '../../eslint.config.mjs';

const directory = fileURLToPath(new URL('../../', import.meta.url));
const eslint = new ESLint({ cwd: directory, overrideConfigFile: true, overrideConfig: [...configuration, tseslint.configs.disableTypeChecked] });

void test('BCK-015/CPA-005 TypeORM persistence adapter depends only on @casepilot/abstractions, TypeORM and local modules', async () => {
  for (const code of [
    "export { AppModule } from '../../../../apps/casepilot/casepilot-api/src/app.module.js';",
    "export { Injectable } from '@nestjs/common';",
    "export { randomUUID } from 'node:crypto';",
  ]) {
    const result = await eslint.lintText(code, { filePath: join(directory, 'src/typeorm/index.ts') });
    assert.ok(result.flatMap(item => item.messages).some(item => item.message.includes('BCK-015')));
  }
  const allowed = await eslint.lintText("export type { UnitOfWork } from '@casepilot/abstractions';", { filePath: join(directory, 'src/typeorm/index.ts') });
  assert.deepEqual(allowed.flatMap(item => item.messages), []);
});

void test('BCK-009/BCK-010 shared SQL repositories cannot manage transactions or composed reads', async () => {
  for (const method of ['transaction', 'commitTransaction', 'findAndCount', 'findAndCountBy']) {
    const result = await eslint.lintText(`export function act(manager: { ${method}(): void }): void { manager.${method}(); }`, { filePath: join(directory, 'src/typeorm/sample.repository.ts') });
    assert.ok(result.flatMap(item => item.messages).some(item => item.message.includes('BCK-009')));
  }
});

import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import configuration from '../eslint.config.mjs';

const directory = fileURLToPath(new URL('../', import.meta.url));
const eslint = new ESLint({ cwd: directory, overrideConfigFile: true, overrideConfig: [...configuration, tseslint.configs.disableTypeChecked] });
void test('CPA-005 validation remains pure and cannot import apps or runtime adapters', async () => {
  for (const source of [
    "export { randomUUID } from 'node:crypto';",
    "export { TypeOrmDataRepository } from '@casepilot/persistence/typeorm';",
    "export { AppModule } from '../../../../apps/casepilot/casepilot-api/src/app.module.js';",
    "export { systemCrudRuntime } from '@casepilot/abstractions/node';",
  ]) {
    const result = await eslint.lintText(source, { filePath: join(directory, 'src/index.ts') });
    assert.ok(result.flatMap(item => item.messages).some(item => item.message.includes('CPA-005')));
  }
  const result = await eslint.lintText("export { ValidationError } from '@casepilot/abstractions';", { filePath: join(directory, 'src/index.ts') });
  assert.deepEqual(result.flatMap(item => item.messages), []);
});

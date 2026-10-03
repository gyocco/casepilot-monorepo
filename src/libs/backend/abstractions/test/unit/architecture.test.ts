import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import configuration from '../../eslint.config.mjs';

const directory = fileURLToPath(new URL('../../', import.meta.url));
const eslint = new ESLint({ cwd: directory, overrideConfigFile: true, overrideConfig: [...configuration, tseslint.configs.disableTypeChecked] });
void test('BCK-008/BCK-015 pure contracts cannot reexport runtime adapters or consume apps', async () => {
  for (const [path, code] of [
    ['src/index.ts', "export { systemCrudRuntime } from './node/index.js';"],
    ['src/index.ts', "export { TypeOrmUnitOfWork } from './dataaccess/typeorm/index.js';"],
    ['src/dataaccess/typeorm/index.ts', "export { AppModule } from '../../../../../apps/casepilot/casepilot-api/src/app.module.js';"],
    ['src/node/index.ts', "export { AppModule } from '../../../../apps/casepilot/casepilot-api/src/app.module.js';"],
  ]) {
    const result = await eslint.lintText(code, { filePath: join(directory, path) });
    assert.ok(result.flatMap(item => item.messages).some(item => item.message.includes('BCK-008') || item.message.includes('BCK-015')));
  }
  const result = await eslint.lintText("export { randomUUID } from 'node:crypto';", { filePath: join(directory, 'src/node/index.ts') });
  assert.deepEqual(result.flatMap(item => item.messages), []);
});
void test('BCK-009/BCK-010 shared repositories cannot manage transactions or composed reads', async () => {
  for (const method of ['transaction', 'commitTransaction', 'findAndCount', 'findAndCountBy']) {
    const result = await eslint.lintText(`export function act(manager: { ${method}(): void }): void { manager.${method}(); }`, { filePath: join(directory, 'src/dataaccess/typeorm/sample.repository.ts') });
    assert.ok(result.flatMap(item => item.messages).some(item => item.message.includes('BCK-009')));
  }
});

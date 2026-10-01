import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import configuration from '../../eslint.config.mjs';

const apiDirectory = fileURLToPath(new URL('../../', import.meta.url));
const eslint = new ESLint({
  cwd: apiDirectory,
  overrideConfigFile: true,
  // Synthetic snippets need no TS program; the production architecture selectors stay active.
  overrideConfig: [...configuration, tseslint.configs.disableTypeChecked],
});

async function messages(path: string, code: string): Promise<string[]> {
  const results = await eslint.lintText(code, { filePath: join(apiDirectory, path) });
  return results.flatMap(result => result.messages.map(message => message.message));
}

void test('ESLint rejects framework imports and direct runtime APIs in the core', async () => {
  const path = 'src/contexts/cases/application/queries/sample.ts';
  assert.ok((await messages(path, "import { Injectable } from '@nestjs/common'; export const value = Injectable;")).some(message => message.includes('BCK-008')));
  assert.ok((await messages(path, 'export const value = process.env.APP_ENV;')).some(message => message.includes('BCK-008')));
});

void test('ESLint blocks repository transaction APIs and composed reads', async () => {
  const path = 'src/contexts/cases/infrastructure/persistence/repositories/sample.ts';
  for (const [method, rule] of [['transaction', 'BCK-010'], ['startTransaction', 'BCK-010'], ['commitTransaction', 'BCK-010'], ['rollbackTransaction', 'BCK-010'], ['findAndCount', 'BCK-009'], ['findAndCountBy', 'BCK-009']]) {
    assert.ok((await messages(path, `export function act(repository: { ${method}(): void }): void { repository.${method}(); }`)).some(message => message.includes(rule)));
  }
  assert.ok((await messages(path, 'export function act(repository: { transaction(): void }): void { repository["transaction"](); }')).some(message => message.includes('BCK-010')));
});

void test('ESLint rejects literal hidden persistence effects while accepting safe options', async () => {
  const path = 'src/contexts/cases/infrastructure/persistence/schemas/sample.ts';
  for (const option of ['cascade: true', 'cascade: ["insert"]', '"cascade": true', 'lazy: true', 'onDelete: "CASCADE"', 'orphanedRowAction: "delete"', 'orphanedRowAction: "soft-delete"']) {
    assert.ok((await messages(path, `export const options = { ${option} };`)).some(message => message.includes('BCK-012')), option);
  }
  assert.deepEqual(await messages(path, 'export const options = { cascade: false, lazy: false, onDelete: "RESTRICT", orphanedRowAction: "disable" };'), []);
  assert.ok((await messages('src/database/options.ts', 'export const options = { synchronize: true };')).some(message => message.includes('BCK-017')));
});

void test('inline eslint-disable comments cannot suppress architecture rules', async () => {
  const results = await messages('src/contexts/cases/application/queries/sample.ts', '// eslint-disable-next-line no-restricted-globals\nexport const value = process.env.APP_ENV;');
  assert.ok(results.some(message => message.includes('BCK-008')));
  assert.ok(results.some(message => message.includes('noInlineConfig')));
});

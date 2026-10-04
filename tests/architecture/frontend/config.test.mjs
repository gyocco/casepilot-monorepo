import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { checkCompilerConfiguration } from '../../../tools/frontend-architecture/config-rules.mjs';

test('FRT-003 checks inherited strict options/templates and rejects empty source scopes', () => {
  const build = fileURLToPath(new URL('../../../build/frontend-architecture/', import.meta.url));
  mkdirSync(build, { recursive: true });
  const root = mkdtempSync(join(build, 'config-'));
  try {
    writeFileSync(join(root, 'base.json'), JSON.stringify({ compilerOptions: { strict: true, noUncheckedIndexedAccess: true }, angularCompilerOptions: { strictTemplates: true, strictInputAccessModifiers: true, strictInjectionParameters: true } }));
    writeFileSync(join(root, 'entry.ts'), 'export const value = true;');
    const config = join(root, 'tsconfig.json');
    const baseline = { extends: './base.json', include: ['entry.ts'] };
    writeFileSync(config, JSON.stringify(baseline));
    assert.deepEqual(checkCompilerConfiguration(config), []);
    for (const override of [{ compilerOptions: { strict: false } }, { compilerOptions: { noImplicitAny: false } }, { angularCompilerOptions: { strictTemplates: false } }]) {
      writeFileSync(config, JSON.stringify({ ...baseline, ...override }));
      assert.ok(checkCompilerConfiguration(config).some(error => error.includes('FRT-003')));
    }
    writeFileSync(config, JSON.stringify({ ...baseline, include: ['absent/**/*.ts'] }));
    assert.ok(checkCompilerConfiguration(config).some(error => error.includes('FRT-010')));
  } finally {
    const owned = relative(build, root);
    assert.ok(owned && !owned.startsWith('..') && !isAbsolute(owned), 'Cleanup must stay inside the intended build root.');
    rmSync(root, { recursive: true, force: true });
  }
});

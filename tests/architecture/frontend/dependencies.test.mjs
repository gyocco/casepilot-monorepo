import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { DEPENDENCY_CRUISER_CLI as cli } from '../../../tools/frontend-architecture/dependency-rules.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const rules = new URL('../../../tools/frontend-architecture/dependency-rules.mjs', import.meta.url).href;
const web = 'src/apps/casepilot/casepilot-web/src';
const kit = 'src/libs/frontend/pilot-ui-kit/src';

function assertOwned(parent, target) {
  const owned = relative(parent, target);
  assert.ok(owned && !owned.startsWith('..') && !isAbsolute(owned), 'Fixture files/cleanup must stay in the intended build root.');
}

function cruise(files) {
  const build = join(root, 'build/frontend-architecture');
  mkdirSync(build, { recursive: true });
  const directory = mkdtempSync(join(build, 'fixture-'));
  assertOwned(build, directory);
  try {
    const inputs = {
      [`${web}/main.ts`]: 'export const initialized = true;',
      [`${kit}/public-api.ts`]: 'export const ui = true;',
      ...files,
      'package.json': JSON.stringify({ type: 'module' }),
      'graph.config.mjs': `import { dependencyConfiguration } from ${JSON.stringify(rules)}; export default dependencyConfiguration(['auth', 'cases']);`,
      'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ES2022', moduleResolution: 'bundler', baseUrl: '.', paths: { '@casepilot/pilot-ui-kit': [`${kit}/public-api.ts`], '@auth/*': [`${web}/features/auth/*`] } }, include: ['src/**/*.ts'] }),
    };
    for (const [file, contents] of Object.entries(inputs)) {
      const target = join(directory, file);
      assertOwned(directory, target);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, contents);
    }
    const result = spawnSync(process.execPath, [cli, '--config', 'graph.config.mjs', '--ts-config', join(directory, 'tsconfig.json'), '--output-type', 'err-long', web, kit],
      { cwd: directory, encoding: 'utf8', windowsHide: true, timeout: 30_000 });
    if (result.error) throw result.error;
    return { status: result.status, output: result.stdout + result.stderr };
  } finally {
    assertOwned(build, directory);
    rmSync(directory, { recursive: true, force: true });
  }
}

test('FRT-001/FRT-002 allow public UI imports and page -> state -> data-access dependencies', () => {
  const result = cruise({
    [`${web}/features/auth/pages/login.ts`]: "import { ui } from '@casepilot/pilot-ui-kit'; import { state } from '../state/session'; export const page = [ui, state];",
    [`${web}/features/auth/state/session.ts`]: "export { value as state } from '../data-access/client';",
    [`${web}/features/auth/data-access/client.ts`]: 'export const value = true;',
  });
  assert.equal(result.status, 0, result.output);
});

test('FRT-002 rejects cross-feature types/aliases/reexports and shared dependencies on features', () => {
  for (const origin of [`${web}/features/cases/page.ts`, `${web}/shared/notification.ts`, `${web}/core/auth/state.ts`, `${web}/shell/bridge.ts`]) {
    const result = cruise({
      [origin]: "export type { Session } from '@auth/bridge';",
      [`${web}/features/auth/bridge.ts`]: "export type { Session } from './models/session';",
      [`${web}/features/auth/models/session.ts`]: 'export interface Session { id: string; }',
    });
    assert.notEqual(result.status, 0, result.output);
    assert.match(result.output, /FRT-002/);
    assert.doesNotMatch(result.output, /resolvable-imports/);
  }
});

test('FRT-002 rejects direct page data-access imports while allowing facade orchestration', () => {
  const result = cruise({
    [`${web}/features/auth/pages/login.ts`]: "export { value } from '../data-access/client';",
    [`${web}/features/auth/data-access/client.ts`]: 'export const value = true;',
  });
  assert.match(result.output, /FRT-002-ui-no-direct-data-access/);
});

test('FRT-001 rejects private kit paths, backend transitives and libraries importing apps', () => {
  for (const [files, rule] of [
    [{ [`${web}/features/auth/page.ts`]: `export { ui } from '../../../../../../libs/frontend/pilot-ui-kit/src/components/private';`, [`${kit}/components/private.ts`]: 'export const ui = true;' }, 'FRT-001-kit-public-entry'],
    [{ [`${kit}/public-api.ts`]: `export { data } from '../../../backend/example/src/index';`, 'src/libs/backend/example/src/index.ts': 'export const data = true;' }, 'FRT-001-no-backend'],
    [{ [`${kit}/public-api.ts`]: `export { value } from '../../../../apps/casepilot/casepilot-web/src/core/value';`, [`${web}/core/value.ts`]: 'export const value = true;' }, 'FRT-001-libraries-no-apps'],
    [{ [`${web}/features/auth/page.ts`]: "export { readFileSync } from 'node:fs';" }, 'FRT-001-no-node'],
  ]) {
    const result = cruise(files);
    assert.match(result.output, new RegExp(rule), result.output);
    assert.doesNotMatch(result.output, /resolvable-imports/);
  }
});

test('FRT-010 rejects cycles and unresolved dependencies instead of silently skipping them', () => {
  const cycle = cruise({ [`${web}/core/a.ts`]: "export { b } from './b'; export const a = 1;", [`${web}/core/b.ts`]: "export { a } from './a'; export const b = 2;" });
  assert.match(cycle.output, /FRT-010-no-cycles/);
  const unresolved = cruise({ [`${web}/core/a.ts`]: "export { value } from './missing';" });
  assert.match(unresolved.output, /FRT-010-resolvable-imports/);
});

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative } from 'node:path';
import process from 'node:process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const apiDirectory = fileURLToPath(new URL('../../', import.meta.url));
const cli = fileURLToPath(new URL('../../bin/dependency-cruiser.mjs', import.meta.resolve('dependency-cruiser')));

function cruise(files: Readonly<Record<string, string>>): { status: number | null; output: string } {
  const buildDirectory = join(apiDirectory, 'build');
  mkdirSync(buildDirectory, { recursive: true });
  const fixture = mkdtempSync(join(buildDirectory, 'architecture-'));
  const directory = join(fixture, 'src/apps/casepilot/casepilot-api');
  mkdirSync(directory, { recursive: true });
  try {
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ type: 'module', dependencies: { typeorm: '0.3.31' }, devDependencies: { 'ts-morph': '27.0.2' } }));
    writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', baseUrl: '.', paths: { '@infra/*': ['src/contexts/cases/infrastructure/*'] } } }));
    for (const [path, text] of Object.entries(files)) {
      const target = join(directory, path);
      const ownedPath = relative(fixture, target);
      assert.ok(!ownedPath.startsWith('..') && !isAbsolute(ownedPath), 'Fixture writes must stay inside their temporary root.');
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, text);
    }
    const result = spawnSync(process.execPath, [cli, '--config', join(apiDirectory, 'dependency-cruiser.config.mjs'), '--output-type', 'err-long', 'src'], {
      cwd: directory, encoding: 'utf8', windowsHide: true, timeout: 30_000,
    });
    if (result.error) throw result.error;
    return { status: result.status, output: result.stdout + result.stderr };
  } finally {
    const ownedPath = relative(buildDirectory, fixture);
    assert.ok(ownedPath.length > 0 && !ownedPath.startsWith('..') && !isAbsolute(ownedPath), 'Cleanup must stay inside the API build directory.');
    rmSync(fixture, { recursive: true, force: true });
  }
}

void test('dependency-cruiser accepts directed layers and imports through another context public API', () => {
  const result = cruise({
    'src/contexts/cases/domain/model.ts': 'export interface Model { id: string }',
    'src/contexts/cases/application/query.ts': "export type { Model } from '../domain/model.js'; export type { Customer } from '../../customers/public.js';",
    'src/contexts/cases/presentation/controller.ts': "export type { Model } from '../application/query.js';",
    'src/contexts/cases/infrastructure/adapter.ts': "export type { Model } from '../domain/model.js';",
    'src/contexts/customers/public.ts': "export type { Customer } from './domain/customer.js';",
    'src/contexts/customers/domain/customer.ts': 'export interface Customer { id: string }',
  });
  assert.equal(result.status, 0, result.output);
});

void test('dependency-cruiser resolves .js specifiers, type-only imports and aliases before checking boundaries', () => {
  for (const specifier of ['../infrastructure/adapter.js', '@infra/adapter']) {
    const result = cruise({
      'src/contexts/cases/application/query.ts': `export type { Adapter } from '${specifier}';`,
      'src/contexts/cases/infrastructure/adapter.ts': 'export interface Adapter {}',
    });
    assert.notEqual(result.status, 0);
    assert.match(result.output, /BCK-008-application-layers/);
    assert.doesNotMatch(result.output, /BCK-019-resolvable-imports/);
  }
});

void test('a barrel cannot conceal an Application dependency on Infrastructure', () => {
  const result = cruise({
    'src/contexts/cases/application/query.ts': "export { Adapter } from '../bridge.js';",
    'src/contexts/cases/bridge.ts': "export { Adapter } from './infrastructure/adapter.js';",
    'src/contexts/cases/infrastructure/adapter.ts': 'export class Adapter {}',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.output, /BCK-008-application-layers/);
});

void test('private cross-context imports and dependency cycles fail', () => {
  const crossContext = cruise({
    'src/contexts/cases/application/query.ts': "export type { Customer } from '../../customers/domain/customer.js';",
    'src/contexts/customers/domain/customer.ts': 'export interface Customer {}',
  });
  assert.notEqual(crossContext.status, 0);
  assert.match(crossContext.output, /BCK-014-context-public-api/);
  const cycle = cruise({
    'src/contexts/cases/application/one.ts': "export { two } from './two.js'; export const one = 1;",
    'src/contexts/cases/application/two.ts': "export { one } from './one.js'; export const two = 2;",
  });
  assert.notEqual(cycle.status, 0);
  assert.match(cycle.output, /BCK-008-no-cycles/);
});

void test('runtime cannot depend on dev tools, test files or unresolved modules', () => {
  for (const [source, target, rule] of [
    ["export type { Project } from 'ts-morph';", {}, 'BCK-019-no-dev-dependencies-in-runtime'],
    ["export { fixture } from '../test/fixture.js';", { 'test/fixture.ts': 'export const fixture = 1;' }, 'BCK-019-no-tests-or-tools-in-runtime'],
    ["export { missing } from './missing.js';", {}, 'BCK-019-resolvable-imports'],
  ] as const) {
    const result = cruise({ 'src/main.ts': source, ...target });
    assert.notEqual(result.status, 0);
    assert.ok(result.output.includes(rule), result.output);
  }
});

void test('core cannot import drivers or Node APIs, even with a bare Node specifier', () => {
  for (const [source, rule] of [
    ["export type { EntityManager } from 'typeorm';", 'BCK-008-core-frameworks-and-providers'],
    ["export type { Stats } from 'fs';", 'BCK-008-core-node-apis'],
  ] as const) {
    const result = cruise({ 'src/contexts/cases/application/query.ts': source });
    assert.notEqual(result.status, 0);
    assert.ok(result.output.includes(rule), result.output);
  }
});

void test('API can consume backend libraries and contracts, but cannot import another app or client libraries', () => {
  const allowed = cruise({
    'src/main.ts': "export { logger } from '../../../../libs/backend/logger/index.js'; export type { Contract } from '../../../../../contracts/contract.js';",
    '../../../libs/backend/logger/index.ts': 'export const logger = 1;',
    '../../../../contracts/contract.ts': 'export interface Contract {}',
  });
  assert.equal(allowed.status, 0, allowed.output);
  const forbidden = cruise({
    'src/main.ts': "export { screen } from '../../casepilot-web/src/screen.js'; export { ui } from '../../../../libs/frontend/ui/index.js';",
    '../casepilot-web/src/screen.ts': 'export const screen = 1;',
    '../../../libs/frontend/ui/index.ts': 'export const ui = 1;',
  });
  assert.notEqual(forbidden.status, 0);
  assert.match(forbidden.output, /BCK-015-no-other-apps/);
  assert.match(forbidden.output, /BCK-015-backend-no-client-libs/);
});

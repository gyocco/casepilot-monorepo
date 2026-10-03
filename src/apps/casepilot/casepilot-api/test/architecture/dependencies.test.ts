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
    writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', baseUrl: '.', paths: { '@infra/*': ['src/infrastructure/*'], '@casepilot/cqrs': ['../../../libs/backend/cqrs/src/index.ts'], '@casepilot/abstractions': ['../../../libs/backend/abstractions/src/index.ts'], '@casepilot/abstractions/typeorm': ['../../../libs/backend/abstractions/src/dataaccess/typeorm/index.ts'], '@casepilot/abstractions/node': ['../../../libs/backend/abstractions/src/node/index.ts'], '@casepilot/validation': ['../../../libs/backend/validation/src/index.ts'], '@casepilot/validation/nestjs': ['../../../libs/backend/validation/src/nestjs/index.ts'] } } }));
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

void test('CPA-003 permits public abstractions entries and rejects private modules', () => {
  const library = '../../../libs/backend/abstractions/src/';
  const files = {
    [library + 'index.ts']: "export type { Entity } from './dataaccess/models/entity.js';",
    [library + 'dataaccess/models/entity.ts']: 'export interface Entity { readonly id: string }',
    [library + 'dataaccess/typeorm/index.ts']: "export { TypeOrmUnitOfWork } from './adapter.js';",
    [library + 'dataaccess/typeorm/adapter.ts']: 'export class TypeOrmUnitOfWork {}',
  };
  const permitted = cruise({
    ...files,
    'src/domain/model.ts': "export type { Entity } from '@casepilot/abstractions';",
    'src/infrastructure/transactions.ts': "export { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';",
  });
  assert.equal(permitted.status, 0, permitted.output);
  const privateImport = cruise({
    ...files,
    'src/domain/model.ts': "export type { Entity } from '../../../../../libs/backend/abstractions/src/dataaccess/models/entity.js';",
  });
  assert.notEqual(privateImport.status, 0);
  assert.match(privateImport.output, /CPA-003-abstractions-public-entry/);
  assert.doesNotMatch(privateImport.output, /BCK-019-resolvable-imports/);
});

void test('BCK-008 rejects the abstractions TypeORM adapter through a core barrel', () => {
  const result = cruise({
    'src/application/orders/run.ts': "export { TypeOrmUnitOfWork } from './bridge.js';",
    'src/application/orders/bridge.ts': "export { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';",
    '../../../libs/backend/abstractions/src/dataaccess/typeorm/index.ts': 'export class TypeOrmUnitOfWork {}',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.output, /BCK-008-abstractions-core-no-typeorm/);
  assert.doesNotMatch(result.output, /BCK-019-resolvable-imports/);
});

void test('CPA-005 public pure validation is allowed; private modules and runtime barrels are rejected', () => {
  const files = {
    '../../../libs/backend/validation/src/index.ts': "export { validateId } from './identifiers.js';",
    '../../../libs/backend/validation/src/identifiers.ts': 'export function validateId(): void {}',
    '../../../libs/backend/validation/src/nestjs/index.ts': 'export function readBody(): void {}',
    '../../../libs/backend/abstractions/src/node/index.ts': 'export const systemCrudRuntime = {};',
  };
  const allowed = cruise({ ...files,
    'src/application/orders/id.ts': "export { validateId } from '@casepilot/validation';",
    'src/infrastructure/runtime.ts': "export { systemCrudRuntime } from '@casepilot/abstractions/node';",
    'src/presentation/orders/input.ts': "export { readBody } from '@casepilot/validation/nestjs';",
  });
  assert.equal(allowed.status, 0, allowed.output);
  const privateModule = cruise({ ...files,
    'src/application/orders/id.ts': "export { validateId } from '../../../../../../libs/backend/validation/src/identifiers.js';",
  });
  assert.match(privateModule.output, /CPA-005-validation-public-entry/);
  assert.doesNotMatch(privateModule.output, /BCK-019-resolvable-imports/);
  for (const [specifier, rule, symbol] of [
    ['@casepilot/abstractions/node', 'BCK-008-abstractions-core-no-node', 'systemCrudRuntime'],
    ['@casepilot/validation/nestjs', 'BCK-008-validation-core-no-nestjs', 'readBody'],
  ]) {
    const rejected = cruise({ ...files,
      'src/application/orders/run.ts': `export { ${symbol} } from './bridge.js';`,
      'src/application/orders/bridge.ts': `export { ${symbol} } from '${specifier}';`,
    });
    assert.notEqual(rejected.status, 0);
    assert.ok(rejected.output.includes(rule), rejected.output);
    assert.doesNotMatch(rejected.output, /BCK-019-resolvable-imports/);
  }
});

void test('BCK-008 permits pure errors and rejects the NestJS adapter through a core barrel', () => {
  const errors = '../../../libs/backend/exception-handler/src/';
  const files = {
    [errors + 'index.ts']: "export { ValidationError } from '@casepilot/abstractions';",
    '../../../libs/backend/abstractions/src/index.ts': "export { ValidationError } from './errors.js';",
    '../../../libs/backend/abstractions/src/errors.ts': 'export class ValidationError extends Error {}',
    [errors + 'nestjs/index.ts']: 'export class ExceptionHandlerModule {}',
  };
  const allowed = cruise({
    ...files,
    'src/application/users/errors.ts': "export { ValidationError } from '../../../../../../libs/backend/exception-handler/src/index.js';",
    'src/application/health/errors.ts': "export { ValidationError } from '@casepilot/abstractions';",
    'src/app.module.ts': "export { ExceptionHandlerModule } from '../../../../libs/backend/exception-handler/src/nestjs/index.js';",
  });
  assert.equal(allowed.status, 0, allowed.output);
  const rejected = cruise({
    ...files,
    'src/application/users/errors.ts': "export { ExceptionHandlerModule } from './bridge.js';",
    'src/application/users/bridge.ts': "export { ExceptionHandlerModule } from '../../../../../../libs/backend/exception-handler/src/nestjs/index.js';",
  });
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.output, /BCK-008-errors-core-no-nestjs/);
  assert.doesNotMatch(rejected.output, /BCK-019-resolvable-imports/);
});

void test('dependency-cruiser accepts shared domain relationships and directed application layers', () => {
  const result = cruise({
    'src/domain/model.ts': "import type { Customer } from './customer.js'; export interface Model { id: string; customer: Customer }",
    'src/application/orders/query.ts': "export type { Model } from '../../domain/model.js'; export type { Customer } from '../../domain/customer.js';",
    'src/presentation/controller.ts': "export type { Model } from '../application/orders/query.js';",
    'src/infrastructure/adapter.ts': "export type { Model } from '../domain/model.js';",
    'src/domain/customer.ts': 'export interface Customer { id: string }',
    'src/infrastructure/database/options.ts': "export type { Model } from '../persistence/schema.js';",
    'src/infrastructure/persistence/schema.ts': "export type { Model } from '../../domain/model.js';",
  });
  assert.equal(result.status, 0, result.output);
});

void test('CPA-004 permits resource module bindings and Application delegation from transport', () => {
  const result = cruise({
    'src/api.module.ts': "export { HealthModule } from './presentation/health/health.module.js';",
    'src/presentation/health/health.module.ts': "export { HealthController } from './health.controller.js'; export { Adapter } from '@infra/adapter'; export type { Model } from '../../domain/model.js'; export class HealthModule {}",
    'src/presentation/health/health.controller.ts': "export type { Model } from '../../application/health/query.js';",
    'src/application/health/query.ts': "export type { Model } from '../../domain/model.js';",
    'src/domain/model.ts': 'export interface Model { id: string }',
    'src/infrastructure/adapter.ts': "export type { Model } from '../domain/model.js'; export class Adapter {}",
  });
  assert.equal(result.status, 0, result.output);
});

void test('CPA-004 blocks composition from transport directly and through Presentation barrels', () => {
  for (const throughBarrel of [false, true]) {
    const result = cruise({
      'src/presentation/health/health.controller.ts': `export { HealthModule } from '${throughBarrel ? './bridge.js' : './health.module.js'}';`,
      'src/presentation/health/bridge.ts': "export { HealthModule } from './health.module.js';",
      'src/presentation/health/health.module.ts': 'export class HealthModule {}',
    });
    assert.notEqual(result.status, 0);
    assert.match(result.output, /CPA-004-transport-no-composition/);
    assert.doesNotMatch(result.output, /BCK-019-resolvable-imports/);
  }
});

void test('CPA-004 keeps persistence and core boundaries around resource composition', () => {
  for (const [source, target, rule] of [
    ['src/presentation/health/health.controller.ts', 'src/infrastructure/adapter.ts', 'BCK-003-presentation-delegates-to-application'],
    ['src/presentation/health/health-http.response.ts', 'src/domain/model.ts', 'BCK-003-presentation-delegates-to-application'],
    ['src/presentation/health/other.module.ts', 'src/infrastructure/adapter.ts', 'BCK-003-presentation-delegates-to-application'],
    ['src/presentation/health/nested/health.module.ts', 'src/infrastructure/adapter.ts', 'BCK-003-presentation-delegates-to-application'],
    ['src/application/health/query.ts', 'src/presentation/health/health.module.ts', 'BCK-008-application-layers'],
    ['src/domain/model.ts', 'src/presentation/health/health.module.ts', 'BCK-008-domain-layers'],
    ['src/infrastructure/adapter.ts', 'src/presentation/health/health.module.ts', 'BCK-008-infrastructure-no-presentation'],
  ] as const) {
    const specifier = relative(dirname(source), target).replaceAll('\\', '/').replace(/\.ts$/, '.js');
    const result = cruise({ [source]: `export type { Target } from '${specifier}';`, [target]: 'export interface Target {}' });
    assert.notEqual(result.status, 0, `${source} -> ${target}`);
    assert.ok(result.output.includes(rule), result.output);
    assert.doesNotMatch(result.output, /BCK-019-resolvable-imports/);
  }
});

void test('dependency-cruiser resolves .js specifiers, type-only imports and aliases before checking boundaries', () => {
  for (const specifier of ['../../infrastructure/adapter.js', '@infra/adapter']) {
    const result = cruise({
      'src/application/orders/query.ts': `export type { Adapter } from '${specifier}';`,
      'src/infrastructure/adapter.ts': 'export interface Adapter {}',
    });
    assert.notEqual(result.status, 0);
    assert.match(result.output, /BCK-008-application-layers/);
    assert.doesNotMatch(result.output, /BCK-019-resolvable-imports/);
  }
});

void test('a barrel cannot conceal an Application dependency on Infrastructure', () => {
  const result = cruise({
    'src/application/orders/query.ts': "export { Adapter } from './bridge.js';",
    'src/application/orders/bridge.ts': "export { Adapter } from '../../infrastructure/adapter.js';",
    'src/infrastructure/adapter.ts': 'export class Adapter {}',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.output, /BCK-008-application-layers/);
});

void test('dependency cycles in the shared Application layer fail', () => {
  const cycle = cruise({
    'src/application/orders/one.ts': "export { two } from '../payments/two.js'; export const one = 1;",
    'src/application/payments/two.ts': "export { one } from '../orders/one.js'; export const two = 2;",
  });
  assert.notEqual(cycle.status, 0);
  assert.match(cycle.output, /BCK-008-no-cycles/);
});

void test('shared layers retain Domain, Presentation, Infrastructure and database boundaries', () => {
  for (const [source, target, rule] of [
    ['src/domain/model.ts', 'src/application/orders/query.ts', 'BCK-008-domain-layers'],
    ['src/domain/model.ts', 'src/app.module.ts', 'BCK-008-domain-layers'],
    ['src/application/orders/query.ts', 'src/infrastructure/database/connection.ts', 'BCK-008-application-layers'],
    ['src/application/orders/query.ts', 'src/infrastructure/config/config.ts', 'BCK-008-application-layers'],
    ['src/application/orders/query.ts', 'src/app.module.ts', 'BCK-008-application-layers'],
    ['src/presentation/controller.ts', 'src/domain/model.ts', 'BCK-003-presentation-delegates-to-application'],
    ['src/presentation/controller.ts', 'src/infrastructure/database/connection.ts', 'BCK-003-presentation-delegates-to-application'],
    ['src/infrastructure/database/connection.ts', 'src/presentation/controller.ts', 'BCK-008-infrastructure-no-presentation'],
  ] as const) {
    const specifier = relative(dirname(source), target).replaceAll('\\', '/').replace(/\.ts$/, '.js');
    const result = cruise({
      [source]: `export type { Target } from '${specifier.startsWith('.') ? specifier : './' + specifier}';`,
      [target]: 'export interface Target {}',
    });
    assert.notEqual(result.status, 0, `${source} -> ${target}`);
    assert.ok(result.output.includes(rule), result.output);
    assert.doesNotMatch(result.output, /BCK-019-resolvable-imports/);
  }
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
    const result = cruise({ 'src/application/users/query.ts': source });
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

void test('CPA-002 permits the CQRS public entry and rejects direct private modules', () => {
  const contracts = {
    '../../../libs/backend/cqrs/src/index.ts': "export type { Handler } from './handler.js';",
    '../../../libs/backend/cqrs/src/handler.ts': 'export interface Handler { execute(request: object): Promise<object> }',
  };
  const allowed = cruise({
    ...contracts,
    'src/application/orders/query.ts': "export type { Handler } from '@casepilot/cqrs';",
  });
  assert.equal(allowed.status, 0, allowed.output);
  const forbidden = cruise({
    ...contracts,
    'src/application/orders/query.ts': "export type { Handler } from '../../../../../../libs/backend/cqrs/src/handler.js';",
  });
  assert.notEqual(forbidden.status, 0);
  assert.match(forbidden.output, /CPA-002-cqrs-public-entry/);
  assert.doesNotMatch(forbidden.output, /BCK-019-resolvable-imports/);
});

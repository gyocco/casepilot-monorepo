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
  for (const path of ['src/application/health/sample.ts', 'src/application/users/create-user/sample.ts', 'src/domain/entities/sample.ts']) {
    assert.ok((await messages(path, "import { Injectable } from '@nestjs/common'; export const value = Injectable;")).some(message => message.includes('BCK-008')));
    assert.ok((await messages(path, 'export const value = process.env.APP_ENV;')).some(message => message.includes('BCK-008')));
  }
});

void test('BCK-008 permits pure errors but rejects the NestJS error adapter in core layers', async () => {
  for (const path of ['src/application/users/errors.ts', 'src/domain/model.ts']) {
    assert.deepEqual(await messages(path, "export { ValidationError } from '@casepilot/exception-handler';"), []);
    assert.ok((await messages(path, "export { ExceptionHandlerModule } from '@casepilot/exception-handler/nestjs';")).some(message => message.includes('BCK-008')));
  }
  assert.deepEqual(await messages('src/app.module.ts', "export { ExceptionHandlerModule } from '@casepilot/exception-handler/nestjs';"), []);
});

void test('ESLint applies Presentation restrictions and permits shared Domain models', async () => {
  assert.ok((await messages('src/presentation/http/sample.ts', "export { DatabaseConnection } from '../../infrastructure/database/database-connection.js';")).some(message => message.includes('BCK-003')));
  assert.deepEqual(await messages('src/domain/entities/order.ts', "export type { Product } from './product.js';"), []);
  assert.deepEqual(await messages('src/infrastructure/database/options.ts', 'export const options = { synchronize: false };'), []);
});

void test('ESLint blocks repository transaction APIs and composed reads', async () => {
  const path = 'src/infrastructure/persistence/repositories/sample.ts';
  for (const [method, rule] of [['transaction', 'BCK-010'], ['startTransaction', 'BCK-010'], ['commitTransaction', 'BCK-010'], ['rollbackTransaction', 'BCK-010'], ['findAndCount', 'BCK-009'], ['findAndCountBy', 'BCK-009']]) {
    assert.ok((await messages(path, `export function act(repository: { ${method}(): void }): void { repository.${method}(); }`)).some(message => message.includes(rule)));
  }
  assert.ok((await messages(path, 'export function act(repository: { transaction(): void }): void { repository["transaction"](); }')).some(message => message.includes('BCK-010')));
  assert.ok((await messages(path, 'export function act(repository: { findAndCount(): void }): void { repository["findAndCount"](); }')).some(message => message.includes('BCK-009')));
});

void test('CPA-003 permits public abstractions but rejects private imports and core ORM adapters', async () => {
  for (const path of ['src/domain/entities/sample.ts', 'src/application/orders/sample.ts', 'src/infrastructure/persistence/repositories/sample.ts']) {
    assert.deepEqual(await messages(path, "export type { Entity, CrudRepository, UnitOfWork } from '@casepilot/abstractions';"), []);
    for (const specifier of ['@casepilot/abstractions/dist/dataaccess/models/entity.js', '../../../../libs/backend/abstractions/src/index.js']) {
      assert.ok((await messages(path, `export type { Entity } from '${specifier}';`)).some(message => message.includes('CPA-003')));
    }
  }
  for (const path of ['src/domain/model.ts', 'src/application/orders/sample.ts']) {
    assert.ok((await messages(path, "export { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';")).some(message => message.includes('BCK-008')));
  }
  assert.deepEqual(await messages('src/infrastructure/persistence/unit-of-work.ts', "export { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';"), []);
});

void test('ESLint rejects literal hidden persistence effects while accepting safe options', async () => {
  const path = 'src/infrastructure/persistence/schemas/sample.ts';
  for (const option of ['cascade: true', 'cascade: ["insert"]', '"cascade": true', 'lazy: true', 'onDelete: "CASCADE"', 'orphanedRowAction: "delete"', 'orphanedRowAction: "soft-delete"']) {
    assert.ok((await messages(path, `export const options = { ${option} };`)).some(message => message.includes('BCK-012')), option);
  }
  assert.deepEqual(await messages(path, 'export const options = { cascade: false, lazy: false, onDelete: "RESTRICT", orphanedRowAction: "disable" };'), []);
  assert.ok((await messages('src/infrastructure/database/options.ts', 'export const options = { synchronize: true };')).some(message => message.includes('BCK-017')));
});

void test('inline eslint-disable comments cannot suppress architecture rules', async () => {
  const results = await messages('src/application/health/sample.ts', '// eslint-disable-next-line no-restricted-globals\nexport const value = process.env.APP_ENV;');
  assert.ok(results.some(message => message.includes('BCK-008')));
  assert.ok(results.some(message => message.includes('noInlineConfig')));
});

void test('CPA-002 accepts runtime bases and type-only Handler imports; rejects runtime Handler and private modules', async () => {
  const path = 'src/application/health/contracts.ts';
  for (const code of [
    "import type { Handler } from '@casepilot/cqrs'; export type Contract = Handler<never, never>;",
    "import { Request, Response, type Handler } from '@casepilot/cqrs'; export { Request, Response }; export type Contract = Handler<Request, Response>;",
    "import type * as Cqrs from '@casepilot/cqrs'; export type Contract = Cqrs.Handler<never, never>;",
    "export type { Handler } from '@casepilot/cqrs';",
    "export { type Handler, Request, Response } from '@casepilot/cqrs';",
  ]) assert.deepEqual(await messages(path, code), []);
  for (const code of [
    "import { Handler } from '@casepilot/cqrs'; export type Contract = Handler<never, never>;",
    "import { Handler as UseCase } from '@casepilot/cqrs'; export type Contract = UseCase<never, never>;",
    "export { Handler } from '@casepilot/cqrs';",
    "export type { Handler } from '@casepilot/cqrs/handler';",
    "import type { Handler } from '../../../../../../libs/backend/cqrs/src/handler.js'; export type Contract = Handler<never, never>;",
  ]) assert.ok((await messages(path, code)).some(message => message.includes('CPA-002')), code);
});

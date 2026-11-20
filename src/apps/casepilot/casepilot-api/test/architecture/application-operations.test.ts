import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { Project, ts } from 'ts-morph';
import { validateApplicationOperations } from '../../tools/architecture/application-operation-rules.js';

const apiDirectory = resolve('build/operation-fixture');
const directory = 'src/application/cases/read-case';

function fixture(): Project {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { strict: true, target: ts.ScriptTarget.ES2022, lib: ['lib.es2022.d.ts'], module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler },
  });
  project.createSourceFile(resolve(apiDirectory, directory, 'read-case.request.ts'), 'export class ReadCaseRequest { id = "case"; }');
  project.createSourceFile(resolve(apiDirectory, directory, 'read-case.response.ts'), 'export class ReadCaseResponse { found = true; }');
  project.createSourceFile(resolve(apiDirectory, directory, 'read-case.handler.ts'), `
    import type { ReadCaseRequest } from './read-case.request.js';
    import { ReadCaseResponse } from './read-case.response.js';
    export class ReadCaseHandler {
      async execute(request: ReadCaseRequest): Promise<ReadCaseResponse> { return new ReadCaseResponse(); }
    }
  `);
  return project;
}

function check(project: Project) { return validateApplicationOperations(project, apiDirectory); }

void test('BCK-023 accepts complete operation folders, shared response data/rules and exclusive request data', () => {
  const project = fixture();
  project.createSourceFile(resolve(apiDirectory, 'src/application/cases/shared/case.response.ts'), 'export class CaseResponse { id = "case"; }');
  project.createSourceFile(resolve(apiDirectory, 'src/application/cases/shared/case.rules.ts'), 'export const limit = 10;');
  project.createSourceFile(resolve(apiDirectory, 'src/application/shared/policy.ts'), 'export const value = 1;');
  project.createSourceFile(resolve(apiDirectory, 'src/application/ports/clock.ts'), 'export interface Clock { now(): string; }');
  project.getSourceFileOrThrow('read-case.request.ts').addInterface({ name: 'ReadCaseData', isExported: true, properties: [{ name: 'id', type: 'string' }] });
  project.getSourceFileOrThrow('read-case.response.ts').replaceWithText(`
    import type { CaseResponse } from '../shared/case.response.js';
    export class ReadCaseResponse { constructor(public readonly item?: CaseResponse) {} }
  `);
  project.createSourceFile(resolve(apiDirectory, directory, 'helpers/format.ts'), 'export const value = 1;');
  assert.deepEqual(project.getPreEmitDiagnostics().map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.compilerObject.messageText, '\n')), []);
  assert.deepEqual(check(project), []);
});

void test('BCK-023 rejects the previous loose handlers and aggregate models even without imports', () => {
  for (const path of ['src/application/cases/read-case.handler.ts', 'src/application/cases/case.models.ts', 'src/application/cases/case.rules.ts', 'src/application/read-case.ts']) {
    const project = fixture();
    project.createSourceFile(resolve(apiDirectory, path), 'export const value = 1;');
    assert.deepEqual(project.getPreEmitDiagnostics().map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.compilerObject.messageText, '\n')), []);
    assert.ok(check(project).some(finding => finding.file === path && finding.rule === 'BCK-023'), path);
  }
});

void test('BCK-023 rejects incomplete operations, including orphan request/response/helper folders', () => {
  for (const kind of ['handler', 'request', 'response']) {
    const project = fixture();
    const file = project.getSourceFileOrThrow(`read-case.${kind}.ts`);
    const declaration = file.getClasses()[0];
    assert.ok(declaration);
    const name = declaration.getName();
    file.move(resolve(apiDirectory, directory, 'legacy.ts'));
    assert.deepEqual(project.getPreEmitDiagnostics().map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.compilerObject.messageText, '\n')), []);
    assert.ok(check(project).some(finding => finding.message.includes(`read-case.${kind}.ts`) && finding.message.includes(name ?? '')), kind);
  }
  const orphan = fixture();
  orphan.createSourceFile(resolve(apiDirectory, 'src/application/users/create-user/helper.ts'), 'export const value = 1;');
  assert.equal(check(orphan).filter(finding => finding.message.includes('users/create-user')).length, 3);
});

void test('BCK-023 rejects empty files, reexports, abstract classes and non-exported contracts without compiler errors', () => {
  for (const kind of ['handler', 'request', 'response']) {
    for (const scenario of ['empty', 'reexport', 'abstract', 'private']) {
      const project = fixture();
      const file = project.getSourceFileOrThrow(`read-case.${kind}.ts`);
      const declaration = file.getClasses()[0];
      assert.ok(declaration);
      const name = declaration.getName() ?? '';
      if (scenario === 'empty' || scenario === 'reexport' || scenario === 'private') {
        // The fixture still compiles: its implementation is declared in an exclusive helper.
        const legacy = project.createSourceFile(resolve(apiDirectory, directory, 'legacy.ts'), file.getFullText());
        file.replaceWithText(scenario === 'private' ? `class ${name} {}` : scenario === 'reexport' ? `export { ${name} } from './legacy.js';` : 'export {};');
        for (const source of project.getSourceFiles()) {
          if (source === file || source === legacy) continue;
          for (const dependency of source.getImportDeclarations()) {
            if (dependency.getModuleSpecifierValue() === `./read-case.${kind}.js`) dependency.setModuleSpecifier('./legacy.js');
          }
        }
      } else {
        declaration.setIsAbstract(true);
        if (kind === 'response') {
          const handler = project.getSourceFileOrThrow('read-case.handler.ts');
          handler.getClassOrThrow('ReadCaseHandler').getMethodOrThrow('execute').setBodyText('throw new Error("failed");');
        }
      }
      assert.deepEqual(project.getPreEmitDiagnostics().map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.compilerObject.messageText, '\n')), [], `${kind}/${scenario}`);
      assert.ok(check(project).some(finding => finding.message.includes(`concrete ${name} class`)), `${kind}/${scenario}`);
    }
  }
});

void test('BCK-023 compares sibling models by declaration identity, accepting import aliases and rejecting lookalikes', () => {
  const aliased = fixture();
  const handler = aliased.getSourceFileOrThrow('read-case.handler.ts');
  handler.getImportDeclarations()[0]?.getNamedImports()[0]?.renameAlias('Input');
  handler.getImportDeclarations()[1]?.getNamedImports()[0]?.renameAlias('Output');
  assert.deepEqual(aliased.getPreEmitDiagnostics().map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.compilerObject.messageText, '\n')), []);
  assert.deepEqual(check(aliased), []);
  for (const kind of ['request', 'response']) {
    const project = fixture();
    const file = project.getSourceFileOrThrow(`read-case.${kind}.ts`);
    project.createSourceFile(resolve(apiDirectory, 'src/application/cases/shared/lookalike.ts'), file.getFullText());
    project.getSourceFileOrThrow('read-case.handler.ts').getImportDeclarations().find(declaration => declaration.getModuleSpecifierValue() === `./read-case.${kind}.js`)?.setModuleSpecifier('../shared/lookalike.js');
    assert.deepEqual(project.getPreEmitDiagnostics().map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.compilerObject.messageText, '\n')), [], kind);
    assert.ok(check(project).some(finding => finding.message.includes('by symbol identity')), kind);
  }
});

void test('BCK-023 requires directory names and direct siblings to match the operation', () => {
  for (const path of ['src/application/cases/other-operation/read-case.handler.ts', 'src/application/cases/read-case/nested/read-case.handler.ts', 'src/application/Cases/read-case/read-case.handler.ts', 'src/application/cases/readCase/read-case.handler.ts']) {
    const project = fixture();
    project.getSourceFileOrThrow('read-case.handler.ts').move(resolve(apiDirectory, path));
    if (path.includes('/Cases/')) {
      for (const dependency of project.getSourceFileOrThrow('read-case.handler.ts').getImportDeclarations()) {
        dependency.setModuleSpecifier(dependency.getModuleSpecifierValue().replace('./read-case.', '../../cases/read-case/read-case.'));
      }
    }
    assert.deepEqual(project.getPreEmitDiagnostics().map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.compilerObject.messageText, '\n')), [], path);
    assert.ok(check(project).length > 0, path);
  }
});

void test('BCK-023 rejects handlers and concrete requests in shared or ports while allowing abstract request bases', () => {
  for (const path of ['src/application/shared/read-case.handler.ts', 'src/application/cases/shared/read-case.handler.ts', 'src/application/ports/read-case.handler.ts', 'src/application/cases/shared/helper.ts']) {
    const project = fixture();
    project.getSourceFileOrThrow('read-case.handler.ts').move(resolve(apiDirectory, path));
    assert.deepEqual(project.getPreEmitDiagnostics().map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.compilerObject.messageText, '\n')), [], path);
    assert.ok(check(project).some(finding => finding.file === path && finding.message.includes('never handlers')), path);
  }
  const project = fixture();
  const file = project.createSourceFile(resolve(apiDirectory, 'src/application/shared/base.ts'), 'export abstract class CommonRequest {}');
  assert.deepEqual(check(project), []);
  file.getClassOrThrow('CommonRequest').setIsAbstract(false);
  assert.ok(check(project).some(finding => finding.file.endsWith('shared/base.ts')));
});

void test('BCK-023 requires cross-operation helper/data reuse to go through shared, including aliases and barrels', () => {
  for (const dependency of [
    "import type { ReadCaseData as Input } from '../../cases/read-case/read-case.request.js'; export type Data = Input;",
    "export type { ReadCaseData } from '../../cases/read-case/read-case.request.js';",
    "export * from '../../cases/read-case/bridge.js';",
  ]) {
    const project = fixture();
    project.getSourceFileOrThrow('read-case.request.ts').addInterface({ name: 'ReadCaseData', isExported: true });
    project.createSourceFile(resolve(apiDirectory, directory, 'bridge.ts'), "export type { ReadCaseData } from './read-case.request.js';");
    const other = 'src/application/users/create-user';
    project.createSourceFile(resolve(apiDirectory, other, 'helper.ts'), dependency);
    assert.deepEqual(project.getPreEmitDiagnostics().map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.compilerObject.messageText, '\n')), [], dependency);
    assert.ok(check(project).some(finding => finding.message.startsWith('Move collaborators reused')), dependency);
  }
  const allowed = fixture();
  allowed.createSourceFile(resolve(apiDirectory, 'src/application/users/create-user/collaboration.ts'), "export { ReadCaseHandler as Collaborator } from '../../cases/read-case/read-case.handler.js';");
  assert.ok(!check(allowed).some(finding => finding.message.startsWith('Move collaborators reused')));
});

void test('BCK-023 only scans Application sources of its owning API', () => {
  const project = fixture();
  for (const path of ['test/application/legacy.models.ts', 'src/domain/entities/model.ts', '../other-api/src/application/users/legacy.models.ts']) {
    project.createSourceFile(resolve(apiDirectory, path), 'export const value = 1;');
  }
  assert.deepEqual(check(project), []);
});

void test('BCK-023 covers all 144 real operations and detects a missing sibling without changing disk files', () => {
  const directory = fileURLToPath(new URL('../../', import.meta.url));
  const project = new Project({ tsConfigFilePath: resolve(directory, 'tsconfig.json') });
  const handlers = project.getSourceFiles().filter(source => source.getFilePath().includes('/src/application/') && source.getBaseName().endsWith('.handler.ts'));
  assert.equal(handlers.length, 144);
  assert.equal(new Set(handlers.map(source => source.getFilePath().split('/application/')[1]?.split('/')[0])).size, 30);
  assert.deepEqual(validateApplicationOperations(project, directory), []);
  project.getSourceFileOrThrow(resolve(directory, 'src/application/activities/create-activity/create-activity.response.ts')).move(resolve(directory, 'src/application/activities/shared/create-activity.response.ts'));
  assert.ok(validateApplicationOperations(project, directory).some(finding => finding.message.includes('create-activity.response.ts')));
});

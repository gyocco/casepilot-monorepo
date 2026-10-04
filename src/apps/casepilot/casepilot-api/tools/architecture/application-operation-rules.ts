import { relative, resolve } from 'node:path';
import { Node, type ClassDeclaration, type Project, type SourceFile, type Type } from 'ts-morph';

export interface ApplicationOperationFinding {
  readonly rule: 'BCK-023';
  readonly file: string;
  readonly line: number;
  readonly message: string;
}

function concreteClass(type: Type | undefined): ClassDeclaration | undefined {
  return type?.getSymbol()?.getDeclarations().find(Node.isClassDeclaration);
}

/** Check operation ownership using analyzed files and resolved model declarations. */
export function validateApplicationOperations(project: Project, apiDirectory: string): ApplicationOperationFinding[] {
  const root = resolve(apiDirectory, 'src/application').replaceAll('\\', '/') + '/';
  const sources = project.getSourceFiles().filter(source => source.getFilePath().startsWith(root));
  const byPath = new Map<string, SourceFile>(sources.map(source => [source.getFilePath(), source]));
  const operations = new Map<string, SourceFile[]>();
  const findings: ApplicationOperationFinding[] = [];
  const kebabCase = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

  function report(node: Node, message: string): void {
    findings.push({ rule: 'BCK-023', file: relative(apiDirectory, node.getSourceFile().getFilePath()).replaceAll('\\', '/'), line: node.getStartLineNumber(), message });
  }

  function owner(source: SourceFile): string | undefined {
    if (!source.getFilePath().startsWith(root)) return undefined;
    const [resource, operation, filename] = source.getFilePath().slice(root.length).split('/');
    if (!filename || resource === 'shared' || resource === 'ports' || operation === 'shared') return undefined;
    return `${resource}/${operation}`;
  }

  for (const source of sources) {
    const parts = source.getFilePath().slice(root.length).split('/');
    const directories = parts.slice(0, -1);
    const [resource, operation] = directories;
    const shared = resource === 'shared' || resource === 'ports' || operation === 'shared';
    if (!resource || !kebabCase.test(resource) || !shared && (!operation || !kebabCase.test(operation))) {
      report(source, 'Place Application files in application/<resource>/<operation>/ or shared/, using kebab-case resource and operation names.');
      continue;
    }
    if (shared) {
      if (/\.(?:handler|command|query)\.ts$/.test(source.getBaseName())
        || source.getClasses().some(declaration => /(?:Handler|Command|Query)$/.test(declaration.getName() ?? '')
          || declaration.getInstanceMethod('execute') !== undefined
          || !declaration.isAbstract() && /Request$/.test(declaration.getName() ?? ''))) {
        report(source, 'Shared folders contain reusable data, rules and collaborators, never handlers or concrete operation requests.');
      }
      continue;
    }
    const key = `${resource}/${operation}`;
    const members = operations.get(key) ?? [];
    members.push(source);
    operations.set(key, members);
  }

  for (const [key, members] of operations) {
    const witness = members[0];
    if (!witness) continue;
    const operation = key.split('/')[1] ?? '';
    const className = operation.split('-').map(part => part[0]?.toUpperCase() + part.slice(1)).join('');
    const contracts = new Map<string, ClassDeclaration>();
    for (const kind of ['handler', 'request', 'response']) {
      const path = `${root}${key}/${operation}.${kind}.ts`;
      const file = byPath.get(path);
      const name = className + kind[0]?.toUpperCase() + kind.slice(1);
      const declaration = file?.getClass(name);
      if (!declaration || declaration.isAbstract() || !declaration.isExported()) {
        report(file ?? witness, `Operation ${key} requires ${operation}.${kind}.ts declaring and exporting its concrete ${name} class; empty files and reexports do not satisfy the contract.`);
      } else contracts.set(kind, declaration);
    }
    for (const source of members) {
      for (const declaration of source.getClasses()) {
        const name = declaration.getName() ?? '';
        const kind = name.endsWith('Request') ? 'request' : /(?:Handler|Command|Query)$/.test(name) ? 'handler' : undefined;
        if (kind && declaration !== contracts.get(kind)) {
          report(declaration, `Declare only this operation's ${className}${kind === 'request' ? 'Request' : 'Handler'} in its matching sibling file; other operations require their own folder.`);
        }
      }
    }
    const method = contracts.get('handler')?.getInstanceMethod('execute');
    if (method) {
      const request = concreteClass(method.getParameters()[0]?.getType());
      const returned = method.getReturnType();
      const response = concreteClass(returned.getSymbol()?.getName() === 'Promise' ? returned.getTypeArguments()[0] : returned);
      if (request !== contracts.get('request') || response !== contracts.get('response')) {
        report(method, `The handler for ${key} must use the Request and Response classes declared in its own sibling files, by symbol identity.`);
      }
    }
  }

  // Cross-operation collaboration is allowed through the explicit use-case trio.
  // Reusable auxiliary declarations must be extracted to shared instead.
  for (const source of sources) {
    const caller = owner(source);
    if (!caller) continue;
    for (const dependency of [...source.getImportDeclarations(), ...source.getExportDeclarations()]) {
      const target = dependency.getModuleSpecifierSourceFile();
      const targetOwner = target && owner(target);
      if (!target || !targetOwner || caller === targetOwner) continue;
      const operation = targetOwner.split('/')[1] ?? '';
      const className = operation.split('-').map(part => part[0]?.toUpperCase() + part.slice(1)).join('');
      const named = Node.isImportDeclaration(dependency) ? dependency.getNamedImports() : dependency.getNamedExports();
      const selected = named.length > 0 ? named.map(item => item.getName()) : [...target.getExportedDeclarations().keys()];
      const exported = target.getExportedDeclarations();
      if (selected.some(name => !(exported.get(name) ?? []).every(declaration =>
        Node.isClassDeclaration(declaration) && ['handler', 'request', 'response'].some(kind =>
          declaration.getName() === className + kind[0]?.toUpperCase() + kind.slice(1)
          && declaration.getSourceFile().getFilePath() === `${root}${targetOwner}/${operation}.${kind}.ts`)))) {
        report(dependency, `Move collaborators reused by ${caller} and ${targetOwner} to resource shared/ (or application/shared/ across resources). Only explicit Handler/Request/Response contracts remain owned by another operation.`);
      }
    }
  }
  return findings.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line || left.message.localeCompare(right.message));
}

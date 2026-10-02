import { relative, resolve } from 'node:path';
import { Node, Scope, SyntaxKind, ts, type ArrowFunction, type FunctionDeclaration, type FunctionExpression, type Project, type Type } from 'ts-morph';

export interface DataAccessFinding {
  readonly rule: 'BCK-009' | 'BCK-021' | 'BCK-022' | 'CPA-003';
  readonly file: string;
  readonly line: number;
  readonly message: string;
}

/** Signatures are checked by resolved types; structural lookalikes are insufficient. */
export function validateDataAccess(project: Project, apiDirectory: string): DataAccessFinding[] {
  const findings: DataAccessFinding[] = [];
  const sourceRoot = resolve(apiDirectory, 'src').replaceAll('\\', '/') + '/';
  const libraryRoot = resolve(apiDirectory, '../../../libs/backend/abstractions').replaceAll('\\', '/') + '/';
  const files = project.getSourceFiles().filter(file => file.getFilePath().startsWith(sourceRoot));
  const stems: Record<string, string> = {
    Entity: 'models/entity', PageRequest: 'models/page-request', PageResponse: 'models/page-response',
    Repository: 'repository', CrudRepository: 'crud-repository', UnitOfWork: 'unit-of-work',
  };

  function report(node: Node, rule: DataAccessFinding['rule'], message: string): void {
    findings.push({ rule, file: relative(apiDirectory, node.getSourceFile().getFilePath()).replaceAll('\\', '/'), line: node.getStartLineNumber(), message });
  }

  function isShared(type: Type, name: string): boolean {
    return type.getSymbol()?.getName() === name && (type.getSymbol()?.getDeclarations().some(node =>
      [libraryRoot + `src/dataaccess/${stems[name]}.ts`, libraryRoot + `dist/dataaccess/${stems[name]}.d.ts`].includes(node.getSourceFile().getFilePath())) ?? false);
  }

  function derives(type: Type, name: string, seen = new Set<Type>()): boolean {
    if (seen.has(type) || type.isAny() || type.isUnknown()) return false;
    seen.add(type);
    if (isShared(type, name)) return true;
    const constraint = type.getConstraint();
    if (constraint && derives(constraint, name, seen)) return true;
    // getBaseTypes alone excludes class implements clauses.
    for (const declaration of type.getSymbol()?.getDeclarations() ?? []) {
      const bases = Node.isClassDeclaration(declaration)
        ? [...(declaration.getExtends() ? [declaration.getExtendsOrThrow()] : []), ...declaration.getImplements()]
        : Node.isInterfaceDeclaration(declaration) ? declaration.getExtends() : [];
      if (bases.some(base => derives(base.getType(), name, seen))) return true;
    }
    return false;
  }

  function repository(type: Type): boolean { return derives(type, 'Repository') || derives(type, 'CrudRepository'); }
  function unitOfWork(type: Type): boolean { return derives(type, 'UnitOfWork'); }

  function native(type: Type, name: string): boolean {
    return type.getSymbol()?.getName() === name && (type.getSymbol()?.getDeclarations().some(node =>
      /^lib\..*\.d\.ts$/.test(node.getSourceFile().getBaseName())) ?? false);
  }

  function allowed(type: Type, output: boolean, seen = new Set<Type>()): boolean {
    if (seen.has(type)) return false;
    const next = new Set(seen).add(type);
    if (type.isAny() || type.isUnknown() || type.isNever() || type.isIntersection()) return false;
    if (type.isUnion()) return type.getUnionTypes().every(item => allowed(item, output, next));
    const constraint = type.getConstraint();
    if (type.isTypeParameter()) return constraint !== undefined && allowed(constraint, output, next);
    if (type.getFlags() & (ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike | ts.TypeFlags.BigIntLike | ts.TypeFlags.ESSymbolLike | ts.TypeFlags.Null | ts.TypeFlags.Undefined)) return true;
    if (type.isVoid()) return output;
    if (type.isTuple()) return false;
    if (native(type, 'Promise')) return output && type.getTypeArguments().length === 1 && allowed(type.getTypeArguments()[0], true, next);
    if (native(type, 'Array') || native(type, 'ReadonlyArray')) {
      const item = type.getArrayElementType() ?? type.getTypeArguments()[0];
      return item !== undefined && !item.isVoid() && allowed(item, false, next);
    }
    if (repository(type) || unitOfWork(type)) return false;
    if (isShared(type, 'PageRequest')) return true;
    if (isShared(type, 'PageResponse')) {
      const item = type.getTypeArguments()[0];
      return item !== undefined && !item.isAny() && !item.isUnknown() && derives(item, 'Entity');
    }
    return derives(type, 'Entity');
  }

  for (const file of files) {
    const local = file.getFilePath().slice(sourceRoot.length);
    for (const declaration of [...file.getInterfaces(), ...file.getClasses(), ...file.getTypeAliases()]) {
      const type = declaration.getType();
      const name = declaration.getName() ?? '';
      const isRepository = repository(type) || /Repository$/.test(name)
        || (Node.isInterfaceDeclaration(declaration) && local.startsWith('domain/repositories/'))
        || (Node.isClassDeclaration(declaration) && local.startsWith('infrastructure/persistence/repositories/'));
      if (isRepository) {
        if (!repository(type)) report(declaration, 'CPA-003', 'Repository declarations must extend/implement the real @casepilot/abstractions Repository or CrudRepository contract.');
        if (Node.isTypeAliasDeclaration(declaration)) report(declaration, 'CPA-003', 'Declare repository contracts as interfaces, not object/utility type aliases.');
        if (Node.isInterfaceDeclaration(declaration) && (declaration.getCallSignatures().length || declaration.getConstructSignatures().length || declaration.getIndexSignatures().length)) {
          report(declaration, 'BCK-021', 'Repository operations must be named methods, without callable, constructable or dictionary signatures.');
        }
        for (const member of type.getProperties()) {
          const definitions = member.getDeclarations();
          if (definitions.some(node => (Node.isMethodDeclaration(node) || Node.isPropertyDeclaration(node)) && node.getScope() !== Scope.Public)) continue;
          const location = definitions[0] ?? declaration;
          for (const signature of member.getTypeAtLocation(declaration).getCallSignatures()) {
            const invalidInput = signature.getParameters().some(parameter => !allowed(parameter.getTypeAtLocation(declaration), false));
            if (invalidInput || !allowed(signature.getReturnType(), true)) {
              report(declaration, 'BCK-021', `${name}.${member.getName()}: use only primitives, explicit Entity implementations and shared PageRequest/PageResponse, with constrained generics; custom objects/DTOs/ORM types are forbidden.`);
            }
            if (signature.getDeclaration() && Node.isMethodDeclaration(location) && !location.getReturnTypeNode()) {
              report(location, 'BCK-021', 'Repository methods must declare their return type explicitly.');
            }
          }
        }
        if (Node.isClassDeclaration(declaration)) {
          for (const node of declaration.getDescendantsOfKind(SyntaxKind.Parameter)) {
            if (unitOfWork(node.getType())) report(node, 'BCK-022', 'Repositories cannot depend on UnitOfWork; Application owns the transaction callback.');
          }
          for (const call of declaration.getDescendantsOfKind(SyntaxKind.CallExpression)) {
            const expression = call.getExpression();
            const receiver = Node.isPropertyAccessExpression(expression) || Node.isElementAccessExpression(expression) ? expression.getExpression() : undefined;
            if (receiver && !Node.isThisExpression(receiver) && repository(receiver.getType())) report(call, 'BCK-009', 'A repository cannot call another repository; coordinate operations in Application.');
            if (receiver && unitOfWork(receiver.getType())) report(call, 'BCK-022', 'Repositories cannot execute UnitOfWork transactions.');
          }
        }
      }
      if (unitOfWork(type) || /UnitOfWork$/.test(name)) {
        if (!unitOfWork(type)) report(declaration, 'CPA-003', 'Transaction ports/adapters must extend/implement the real shared UnitOfWork contract.');
        const execute = type.getProperty('execute')?.getTypeAtLocation(declaration).getCallSignatures()[0];
        const callback = execute?.getParameters()[0]?.getTypeAtLocation(declaration).getCallSignatures()[0];
        const scope = callback?.getParameters()[0]?.getTypeAtLocation(declaration);
        const constrainedScope = scope?.getConstraint() ?? scope;
        if (!constrainedScope || constrainedScope.isAny() || constrainedScope.isUnknown()
          || constrainedScope.getProperties().length === 0
          || constrainedScope.getProperties().some(member => !repository(member.getTypeAtLocation(declaration)))) {
          report(declaration, 'BCK-022', 'UnitOfWork must expose a non-empty typed scope containing only repository contracts, without ORM resources.');
        }
      }
    }
  }

  function scoped(node: Node, parameter: Node, seen = new Set<Node>()): boolean {
    if (seen.has(node)) return false;
    seen.add(node);
    if (Node.isPropertyAccessExpression(node) || Node.isElementAccessExpression(node)) return scoped(node.getExpression(), parameter, seen);
    if (Node.isParenthesizedExpression(node)) return scoped(node.getExpression(), parameter, seen);
    const declarations = node.getSymbol()?.getDeclarations() ?? [];
    return declarations.some(declaration => {
      if (declaration === parameter || declaration.getFirstAncestorByKind(SyntaxKind.Parameter) === parameter) return true;
      if (Node.isVariableDeclaration(declaration)) {
        const initializer = declaration.getInitializer();
        return initializer !== undefined && scoped(initializer, parameter, seen);
      }
      if (Node.isBindingElement(declaration)) {
        const variable = declaration.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
        const initializer = variable?.getInitializer();
        return initializer !== undefined && scoped(initializer, parameter, seen);
      }
      return false;
    });
  }

  for (const file of files) {
    for (const call of file.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      const expression = call.getExpression();
      if (!Node.isPropertyAccessExpression(expression) && !Node.isElementAccessExpression(expression)) continue;
      if (!unitOfWork(expression.getExpression().getType())) continue;
      if (!file.getFilePath().startsWith(sourceRoot + 'application/')) report(call, 'BCK-022', 'UnitOfWork execution belongs to Application.');
      const argument = call.getArguments()[0];
      const callback = argument ? resolveCallback(argument) : undefined;
      // Unresolvable indirect callbacks retain manual review; no extra inline-only convention.
      if (!callback) continue;
      if (!callback.getSourceFile().getFilePath().startsWith(sourceRoot + 'application/')) report(callback, 'BCK-022', 'The transaction operations callback must be declared in Application.');
      const parameter = callback.getParameters()[0];
      for (const nested of callback.getDescendantsOfKind(SyntaxKind.CallExpression)) {
        const member = nested.getExpression();
        if (!Node.isPropertyAccessExpression(member) && !Node.isElementAccessExpression(member)) continue;
        const receiver = member.getExpression();
        if (unitOfWork(receiver.getType())) report(nested, 'BCK-022', 'Do not nest UnitOfWork executions; use the repositories of the current scope.');
        if (repository(receiver.getType()) && (!parameter || !scoped(receiver, parameter))) {
          report(nested, 'BCK-022', 'Transaction operations must use repositories from this callback scope, not captured/global repositories.');
        }
      }
    }
  }
  return findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule));
}

function resolveCallback(node: Node, seen = new Set<Node>()): ArrowFunction | FunctionExpression | FunctionDeclaration | undefined {
  if (seen.has(node)) return undefined;
  seen.add(node);
  if (Node.isArrowFunction(node) || Node.isFunctionExpression(node) || Node.isFunctionDeclaration(node)) return node;
  const symbol = node.getSymbol();
  const original = symbol?.isAlias() ? symbol.getAliasedSymbol() : symbol;
  for (const declaration of original?.getDeclarations() ?? []) {
    if (Node.isFunctionDeclaration(declaration)) return declaration;
    if (Node.isVariableDeclaration(declaration)) {
      const initializer = declaration.getInitializer();
      const result = initializer ? resolveCallback(initializer, seen) : undefined;
      if (result) return result;
    }
  }
  return undefined;
}

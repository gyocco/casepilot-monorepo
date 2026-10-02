import { relative, resolve } from 'node:path';
import { Node, Scope, SyntaxKind, type ClassDeclaration, type Project, type Type } from 'ts-morph';

export interface ArchitectureFinding {
  readonly rule: 'BCK-004' | 'BCK-005' | 'CPA-002';
  readonly file: string;
  readonly line: number;
  readonly message: string;
}

function concreteClass(type: Type): ClassDeclaration | undefined {
  if (type.isUnion() || type.isIntersection() || type.isAny() || type.isUnknown()) return undefined;
  return type.getSymbol()?.getDeclarations().find(Node.isClassDeclaration);
}

function promiseResult(type: Type): Type | undefined {
  const symbol = type.getSymbol();
  const libraryPromise = symbol?.getName() === 'Promise'
    && symbol.getDeclarations().some(declaration => /^lib\..*\.d\.ts$/.test(declaration.getSourceFile().getBaseName()));
  return libraryPromise ? type.getTypeArguments()[0] : undefined;
}

function unwrapPromise(type: Type): Type { return promiseResult(type) ?? type; }

/** Validate the API's class-based command/query contracts using resolved symbols. */
export function validateUseCases(project: Project, apiDirectory: string): ArchitectureFinding[] {
  const findings: ArchitectureFinding[] = [];
  const sourceRoot = resolve(apiDirectory, 'src').replaceAll('\\', '/') + '/';
  const cqrsRoot = resolve(apiDirectory, '../../../libs/backend/cqrs').replaceAll('\\', '/') + '/';

  function report(node: Node, rule: ArchitectureFinding['rule'], message: string): void {
    findings.push({ rule, file: relative(apiDirectory, node.getSourceFile().getFilePath()).replaceAll('\\', '/'), line: node.getStartLineNumber(), message });
  }

  function matchesModel(type: Type, name: string): boolean {
    const declaration = concreteClass(type);
    return declaration !== undefined && !declaration.isAbstract()
      && declaration.getName() === name
      && declaration.getSourceFile().getFilePath().startsWith(`${sourceRoot}application/`);
  }

  function isLibraryDeclaration(declaration: Node | undefined, name: string, stem: string): boolean {
    return declaration !== undefined && declaration.getSymbol()?.getName() === name
      && [cqrsRoot + 'src/' + stem + '.ts', cqrsRoot + 'dist/' + stem + '.d.ts'].includes(declaration.getSourceFile().getFilePath());
  }

  function inheritsModelContract(declaration: ClassDeclaration, kind: 'Request' | 'Response'): boolean {
    const visited = new Set<ClassDeclaration>();
    let base = declaration.getBaseClass();
    while (base && !visited.has(base)) {
      if (isLibraryDeclaration(base, kind, kind.toLowerCase())) return true;
      visited.add(base);
      base = base.getBaseClass();
    }
    return false;
  }

  function handlerContracts(declaration: ClassDeclaration) {
    return declaration.getImplements().filter(clause => {
      const symbol = clause.getExpression().getSymbol();
      const original = symbol?.isAlias() ? symbol.getAliasedSymbol() : symbol;
      return original?.getDeclarations().some(contract => isLibraryDeclaration(contract, 'Handler', 'handler')) ?? false;
    });
  }

  function checkCqrsContract(declaration: ClassDeclaration, localPath: string, requestClass: ClassDeclaration | undefined, responseClass: ClassDeclaration | undefined): void {
    const contracts = handlerContracts(declaration);
    const argumentsList = contracts[0]?.getTypeArguments() ?? [];
    const method = declaration.getInstanceMethod('execute');
    const name = declaration.getName() ?? '';
    const filename = name.replace(/Handler$/, '').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase() + '.handler.ts';
    if (!/^.+Handler$/.test(name) || !localPath.endsWith('/' + filename)
      || contracts.length !== 1 || argumentsList.length !== 2 || !requestClass || !responseClass
      || concreteClass(argumentsList[0]?.getType() ?? declaration.getType()) !== requestClass
      || concreteClass(argumentsList[1]?.getType() ?? declaration.getType()) !== responseClass
      || !method || !promiseResult(method.getReturnType())) {
      report(declaration, 'CPA-002', `Name the operation <Operation>Handler in ${filename} and implement @casepilot/cqrs Handler<Request, Response> explicitly with the concrete execute models; execute must return Promise<Response>.`);
    }
  }

  for (const sourceFile of project.getSourceFiles()) {
    const localPath = sourceFile.getFilePath().slice(sourceRoot.length);
    if (!sourceFile.getFilePath().startsWith(sourceRoot)) continue;
    if (!localPath.startsWith('application/')) continue;

    const classes = sourceFile.getClasses();
    if (/\.(command|query|handler)\.ts$/.test(localPath) && classes.length === 0) {
      report(sourceFile, 'BCK-004', 'An operation file must declare its command/query handler class.');
    }
    for (const declaration of classes) {
      const name = declaration.getName() ?? '';
      const modelKind = name.match(/(Request|Response)$/)?.[1];
      if ((modelKind === 'Request' || modelKind === 'Response') && !inheritsModelContract(declaration, modelKind)) {
        report(declaration, 'CPA-002', `Extend the shared @casepilot/cqrs ${modelKind} base; structural or locally declared substitutes are not the library contract.`);
      }
      const method = declaration.getInstanceMethod('execute');
      if (!method && !/(Command|Query|Handler)$/.test(name) && handlerContracts(declaration).length === 0) continue;
      const operation = name.replace(/(?:(?:Command|Query)?Handler|Command|Query)$/, '');
      if (!method || method.getScope() !== Scope.Public || method.isAbstract()) {
        checkCqrsContract(declaration, localPath, undefined, undefined);
        report(declaration, 'BCK-004', `${name} must expose a public instance execute(request) implementation.`);
        continue;
      }
      const parameters = method.getParameters();
      const request = parameters[0];
      const requestClass = request ? concreteClass(request.getType()) : undefined;
      const responseClass = concreteClass(unwrapPromise(method.getReturnType()));
      checkCqrsContract(declaration, localPath, requestClass, responseClass);
      if (method.getOverloads().length > 0 || parameters.length !== 1 || !request
        || request.isOptional() || request.isRestParameter() || request.getInitializer()
        || !request.getTypeNode() || !matchesModel(request.getType(), `${operation}Request`)) {
        report(method, 'BCK-004', `${name}.execute requires exactly one explicit, required ${operation}Request class parameter, without overloads, defaults or rest parameters.`);
      }

      if (!method.getReturnTypeNode() || !matchesModel(unwrapPromise(method.getReturnType()), `${operation}Response`)) {
        report(method, 'BCK-005', `${name}.execute must explicitly return the concrete ${operation}Response class or Promise<${operation}Response>.`);
      }
      for (const statement of method.getDescendantsOfKind(SyntaxKind.ReturnStatement)) {
        // A mapping callback's return is not a return from execute.
        const owner = statement.getFirstAncestor(node => Node.isMethodDeclaration(node)
          || Node.isArrowFunction(node) || Node.isFunctionExpression(node) || Node.isFunctionDeclaration(node));
        if (owner !== method) continue;
        const expression = statement.getExpression();
        if (!expression || !responseClass || concreteClass(unwrapPromise(expression.getType())) !== responseClass) {
          report(statement, 'BCK-005', `Successful returns must have the concrete ${operation}Response type; structural lookalikes, primitives and empty returns are invalid.`);
        }
      }

      for (const reference of project.getLanguageService().findReferencesAsNodes(method.getNameNode())) {
        const member = reference.getParent();
        const call = member?.getParent();
        if (!member || !Node.isPropertyAccessExpression(member) || !call || !Node.isCallExpression(call)
          || call.getExpression() !== member) continue;
        // TypeScript references can group structurally equivalent execute methods.
        // Only this receiver's resolved declaration identifies a direct call to this handler.
        const receiverMethod = member.getExpression().getType().getProperty(member.getName());
        if (!receiverMethod?.getDeclarations().some(target => target === method)) continue;
        const argumentsList = call.getArguments();
        const argument = argumentsList[0];
        if (argumentsList.length !== 1 || !argument || Node.isSpreadElement(argument)
          || !requestClass || concreteClass(argument.getType()) !== requestClass) {
          report(call, 'BCK-004', `Invoke ${name}.execute with exactly one ${operation}Request argument.`);
        }
      }
    }
  }
  return findings.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line || left.rule.localeCompare(right.rule));
}

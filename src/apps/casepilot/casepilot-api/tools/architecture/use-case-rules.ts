import { relative, resolve } from 'node:path';
import { Node, Scope, SyntaxKind, type ClassDeclaration, type Project, type Type } from 'ts-morph';

export interface ArchitectureFinding {
  readonly rule: 'BCK-004' | 'BCK-005';
  readonly file: string;
  readonly line: number;
  readonly message: string;
}

function concreteClass(type: Type): ClassDeclaration | undefined {
  if (type.isUnion() || type.isIntersection() || type.isAny() || type.isUnknown()) return undefined;
  return type.getSymbol()?.getDeclarations().find(Node.isClassDeclaration);
}

function unwrapPromise(type: Type): Type {
  const symbol = type.getSymbol();
  const libraryPromise = symbol?.getName() === 'Promise'
    && symbol.getDeclarations().some(declaration => /^lib\..*\.d\.ts$/.test(declaration.getSourceFile().getBaseName()));
  return libraryPromise ? type.getTypeArguments()[0] ?? type : type;
}

/** Validate the API's class-based command/query contracts using resolved symbols. */
export function validateUseCases(project: Project, apiDirectory: string): ArchitectureFinding[] {
  const findings: ArchitectureFinding[] = [];
  const sourceRoot = resolve(apiDirectory, 'src').replaceAll('\\', '/') + '/';

  function report(node: Node, rule: ArchitectureFinding['rule'], message: string): void {
    findings.push({ rule, file: relative(apiDirectory, node.getSourceFile().getFilePath()).replaceAll('\\', '/'), line: node.getStartLineNumber(), message });
  }

  function matchesModel(type: Type, name: string, context: string): boolean {
    const declaration = concreteClass(type);
    return declaration !== undefined && !declaration.isAbstract()
      && declaration.getName() === name
      && declaration.getSourceFile().getFilePath().startsWith(`${sourceRoot}contexts/${context}/application/`);
  }

  for (const sourceFile of project.getSourceFiles()) {
    const localPath = sourceFile.getFilePath().slice(sourceRoot.length);
    if (!sourceFile.getFilePath().startsWith(sourceRoot)) continue;
    const context = /^contexts\/([^/]+)\/application\/(commands|queries)\//.exec(localPath)?.[1];
    if (!context) continue;

    const classes = sourceFile.getClasses();
    if (/\.(command|query|handler)\.ts$/.test(localPath) && classes.length === 0) {
      report(sourceFile, 'BCK-004', 'An operation file must declare its command/query handler class.');
    }
    for (const declaration of classes) {
      const name = declaration.getName() ?? '';
      const method = declaration.getInstanceMethod('execute');
      if (!method && !/(Command|Query|Handler)$/.test(name)) continue;
      const operation = name.replace(/(Command|Query|Handler)$/, '');
      if (!method || method.getScope() !== Scope.Public || method.isAbstract()) {
        report(declaration, 'BCK-004', `${name} must expose a public instance execute(request) implementation.`);
        continue;
      }
      const parameters = method.getParameters();
      const request = parameters[0];
      const requestClass = request ? concreteClass(request.getType()) : undefined;
      const responseClass = concreteClass(unwrapPromise(method.getReturnType()));
      if (method.getOverloads().length > 0 || parameters.length !== 1 || !request
        || request.isOptional() || request.isRestParameter() || request.getInitializer()
        || !request.getTypeNode() || !matchesModel(request.getType(), `${operation}Request`, context)) {
        report(method, 'BCK-004', `${name}.execute requires exactly one explicit, required ${operation}Request class parameter, without overloads, defaults or rest parameters.`);
      }

      if (!method.getReturnTypeNode() || !matchesModel(unwrapPromise(method.getReturnType()), `${operation}Response`, context)) {
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

import { relative, resolve } from 'node:path';
import type { Project } from 'ts-morph';

export interface PresentationAuthFinding {
  readonly rule: 'BCK-006';
  readonly file: string;
  readonly line: number;
  readonly message: string;
}

/** Ensures only technical health probes use @PublicEndpoint() and AppModule registers NestAuthModule. */
export function validatePresentationAuth(project: Project, apiDirectory: string): PresentationAuthFinding[] {
  const sourceRoot = resolve(apiDirectory, 'src').replaceAll('\\', '/') + '/';
  const healthPrefix = `${sourceRoot}presentation/health/`;
  const presentationPrefix = `${sourceRoot}presentation/`;
  const findings: PresentationAuthFinding[] = [];

  for (const source of project.getSourceFiles()) {
    const filePath = source.getFilePath();
    if (!filePath.startsWith(presentationPrefix) || filePath.startsWith(healthPrefix)) continue;
    for (const declaration of source.getClasses()) {
      for (const decorator of declaration.getDecorators()) {
        if (decorator.getName() === 'PublicEndpoint') {
          findings.push({
            rule: 'BCK-006',
            file: relative(apiDirectory, filePath).replaceAll('\\', '/'),
            line: decorator.getStartLineNumber(),
            message: '@PublicEndpoint() is restricted to technical health probes; product endpoints require authentication by default.',
          });
        }
      }
      for (const method of declaration.getMethods()) {
        for (const decorator of method.getDecorators()) {
          if (decorator.getName() === 'PublicEndpoint') {
            findings.push({
              rule: 'BCK-006',
              file: relative(apiDirectory, filePath).replaceAll('\\', '/'),
              line: decorator.getStartLineNumber(),
              message: '@PublicEndpoint() is restricted to technical health probes; product endpoints require authentication by default.',
            });
          }
        }
      }
    }
  }

  const appModule = project.getSourceFile(`${sourceRoot}app.module.ts`);
  if (appModule) {
    const hasAuthImport = appModule.getImportDeclarations().some(
      imp => imp.getModuleSpecifierValue() === '@casepilot/auth/nestjs'
        && imp.getNamedImports().some(named => named.getName() === 'NestAuthModule'),
    );
    if (!hasAuthImport) {
      findings.push({
        rule: 'BCK-006',
        file: relative(apiDirectory, appModule.getFilePath()).replaceAll('\\', '/'),
        line: 1,
        message: 'AppModule must register NestAuthModule from @casepilot/auth/nestjs to enforce default authentication.',
      });
    }
  }

  return findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

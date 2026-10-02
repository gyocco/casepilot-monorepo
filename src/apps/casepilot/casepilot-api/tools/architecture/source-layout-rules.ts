import { relative, resolve } from 'node:path';
import type { Project } from 'ts-morph';

export interface SourceLayoutFinding {
  readonly rule: 'BCK-014' | 'BCK-017' | 'CPA-001' | 'CPA-004';
  readonly file: string;
  readonly line: number;
  readonly message: string;
}

/** Check the paths of analyzed sources, including files with no imports. */
export function validateSourceLayout(project: Project, apiDirectory: string): SourceLayoutFinding[] {
  const sourceRoot = resolve(apiDirectory, 'src').replaceAll('\\', '/') + '/';
  const layers = new Set(['application', 'domain', 'infrastructure', 'presentation']);
  const findings: SourceLayoutFinding[] = [];
  const sources = project.getSourceFiles();
  const sourcePaths = new Set<string>(sources.map(source => source.getFilePath()));
  for (const source of sources) {
    const path = source.getFilePath();
    if (!path.startsWith(sourceRoot)) continue;
    const sourcePath = path.slice(sourceRoot.length);
    const directories = sourcePath.split('/').slice(0, -1);
    const fileName = source.getBaseName();
    const isModule = fileName.endsWith('.module.ts');
    const isRootModule = directories.length === 0 && ['app.module.ts', 'api.module.ts'].includes(fileName);
    const isTechnicalModule = directories[0] === 'infrastructure';
    const resource = directories[1];
    const hasOwner = resource !== undefined && sourcePaths.has(`${sourceRoot}presentation/${resource}/${resource}.module.ts`);
    const isResourceModule = directories[0] === 'presentation' && directories.length === 2
      && fileName === `${resource}.module.ts`;
    if ((isModule && !isRootModule && !isTechnicalModule && !isResourceModule)
      || (fileName.endsWith('.controller.ts') && directories[0] !== 'presentation')
      || (directories[0] === 'presentation' && (directories.length < 2 || !hasOwner))) {
      findings.push({
        rule: 'CPA-004', file: relative(apiDirectory, path).replaceAll('\\', '/'), line: 1,
        message: 'Group Presentation under src/presentation/<resource>/ with <resource>.module.ts alongside its controllers and transport models; only app/api root modules and Infrastructure technical modules stay elsewhere.',
      });
    }
    if (directories.length === 0) continue;
    if (!layers.has(directories[0] ?? '') || directories.includes('contexts')
      || directories.slice(1).some(directory => layers.has(directory))) {
      findings.push({
        rule: 'BCK-014', file: relative(apiDirectory, path).replaceAll('\\', '/'), line: 1,
        message: 'Use the single application/domain/infrastructure/presentation layers directly under src, without contexts or repeated feature layers.',
      });
    }
    if (directories.includes('database') && (directories[0] !== 'infrastructure' || directories[1] !== 'database')) {
      findings.push({
        rule: 'BCK-017', file: relative(apiDirectory, path).replaceAll('\\', '/'), line: 1,
        message: 'Database connection, DataSource, options and migrations belong in src/infrastructure/database/.',
      });
    }
    if (directories[0] === 'application' && (directories.length < 2
      || directories.slice(1).some(directory => /^(commands|queries)$/i.test(directory)))) {
      findings.push({
        rule: 'CPA-001', file: relative(apiDirectory, path).replaceAll('\\', '/'), line: 1,
        message: 'Group Application files under src/application/<resource>/ (for example health, users, orders or payments), without commands/queries directories at any level.',
      });
    }
  }
  return findings.sort((left, right) => left.file.localeCompare(right.file) || left.rule.localeCompare(right.rule));
}

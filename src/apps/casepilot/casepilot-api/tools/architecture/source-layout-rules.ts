import { relative, resolve } from 'node:path';
import type { Project } from 'ts-morph';

export interface SourceLayoutFinding {
  readonly rule: 'BCK-014' | 'BCK-017' | 'CPA-001';
  readonly file: string;
  readonly line: number;
  readonly message: string;
}

/** Check the paths of analyzed sources, including files with no imports. */
export function validateSourceLayout(project: Project, apiDirectory: string): SourceLayoutFinding[] {
  const sourceRoot = resolve(apiDirectory, 'src').replaceAll('\\', '/') + '/';
  const layers = new Set(['application', 'domain', 'infrastructure', 'presentation']);
  const findings: SourceLayoutFinding[] = [];
  for (const source of project.getSourceFiles()) {
    const path = source.getFilePath();
    if (!path.startsWith(sourceRoot)) continue;
    const directories = path.slice(sourceRoot.length).split('/').slice(0, -1);
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

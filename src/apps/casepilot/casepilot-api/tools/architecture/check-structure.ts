import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { validateUseCases } from './use-case-rules.js';
import { validateSourceLayout } from './source-layout-rules.js';
import { validateDataAccess } from './data-access-rules.js';

const apiDirectory = fileURLToPath(new URL('../../', import.meta.url));
const project = new Project({
  tsConfigFilePath: fileURLToPath(new URL('../../tsconfig.json', import.meta.url)),
});
if (project.getSourceFiles().length === 0) throw new Error('No API sources found; architecture validation cannot run.');

// Native tsc is the compilation gate in check:architecture. ts-morph's source
// wrappers do not preserve all NodeNext implied module formats for diagnostics.
const findings = [...validateSourceLayout(project, apiDirectory), ...validateUseCases(project, apiDirectory), ...validateDataAccess(project, apiDirectory)];
for (const finding of findings) {
  process.stderr.write(`${finding.file}:${finding.line}: error ${finding.rule}: ${finding.message}\n`);
}
if (findings.length > 0) {
  process.exitCode = 1;
} else {
  process.stdout.write(`CasePilot API structure: BCK-004/BCK-005/BCK-009/BCK-014/BCK-017/BCK-021/BCK-022/CPA-001/CPA-002/CPA-003/CPA-004 checks passed (${project.getSourceFiles().length} source files).\n`);
}

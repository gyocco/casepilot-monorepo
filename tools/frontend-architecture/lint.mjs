import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const eslint = new ESLint({ cwd: root, overrideConfigFile: fileURLToPath(new URL('./eslint.config.mjs', import.meta.url)) });
const results = await eslint.lintFiles(['tools/frontend-architecture/*.mjs', 'tests/architecture/frontend/*.mjs']);
const output = await (await eslint.loadFormatter('stylish')).format(results);
if (output) console.error(output);
if (results.some(result => result.errorCount || result.warningCount)) process.exitCode = 1;

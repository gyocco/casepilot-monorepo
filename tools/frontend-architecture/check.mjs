import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSources } from './source-rules.mjs';
import { checkCompilerConfiguration } from './config-rules.mjs';
import { WEB_SOURCE, KIT_SOURCE } from './dependency-rules.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const files = {};
function collect(directory) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = join(directory, entry.name);
    if (entry.isDirectory()) collect(target);
    else if (/\.(?:ts|html|css|scss|svg)$/.test(entry.name)) files[relative(root, target).replaceAll('\\', '/')] = readFileSync(target, 'utf8');
  }
}
for (const directory of [WEB_SOURCE, KIT_SOURCE, 'src/apps/casepilot/casepilot-web/public/themes']) collect(join(root, directory));
const errors = checkSources(files);
for (const config of ['src/apps/casepilot/casepilot-web/tsconfig.app.json', 'src/libs/frontend/pilot-ui-kit/tsconfig.lib.json']) {
  errors.push(...checkCompilerConfiguration(join(root, config)));
}
const cli = fileURLToPath(new URL('../../bin/dependency-cruiser.mjs', import.meta.resolve('dependency-cruiser')));
const graph = spawnSync(process.execPath, [cli, '--config', fileURLToPath(new URL('./dependency-cruiser.config.mjs', import.meta.url)),
  '--ts-config', fileURLToPath(new URL('./tsconfig.graph.json', import.meta.url)), '--output-type', 'err-long', WEB_SOURCE, KIT_SOURCE],
{ cwd: root, encoding: 'utf8', windowsHide: true, timeout: 60_000 });
if (graph.error) throw graph.error;
if (graph.status !== 0) errors.push(graph.stdout + graph.stderr);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Frontend architecture: ${Object.keys(files).length} source/template/style/resource files; graph and FRT checks passed.`);

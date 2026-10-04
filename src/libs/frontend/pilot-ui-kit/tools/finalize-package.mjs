import { readFileSync, writeFileSync } from 'node:fs';
import { URL } from 'node:url';

// Workspace exports address dist; an installable APF package addresses its own root.
const target = new URL('../dist/package.json', import.meta.url);
const manifest = JSON.parse(readFileSync(target, 'utf8'));
manifest.exports['./theme.scss'] = { sass: './styles/theme.scss', default: './styles/theme.scss' };
manifest.exports['./tailwind.css'] = './styles/tailwind.css';
writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`);

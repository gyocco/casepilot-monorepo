import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const envFile = new URL('../../infra/docker/.env', import.meta.url);
const exampleFile = new URL('../../infra/docker/.env.example', import.meta.url);
const template = await readFile(exampleFile, 'utf8');
const contents = template.replace(
  'CASEPILOT_POSTGRES_PASSWORD=replace-with-local-password',
  `CASEPILOT_POSTGRES_PASSWORD=${randomBytes(24).toString('hex')}`,
);

try {
  await writeFile(envFile, contents, { flag: 'wx', mode: 0o600 });
  console.log('Created infra/docker/.env with a generated local database password.');
} catch (error) {
  if (error.code !== 'EEXIST') {
    throw error;
  }

  console.log('Using the existing infra/docker/.env without changing its values.');
}

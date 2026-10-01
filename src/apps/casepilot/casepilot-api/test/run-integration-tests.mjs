import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const suiteDirectory = fileURLToPath(new URL('./integration/', import.meta.url));
const files = readdirSync(suiteDirectory, { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.test.js'))
  .map(entry => resolve(entry.parentPath, entry.name))
  .sort();
if (files.length === 0) throw new Error('No compiled CasePilot API endpoint tests were found.');

const environment = { ...process.env };
const localWindowsDocker = process.platform === 'win32'
  && (!environment.DOCKER_HOST || environment.DOCKER_HOST.startsWith('npipe:'));
if (localWindowsDocker && !environment.TESTCONTAINERS_HOST_OVERRIDE) {
  // Docker Desktop can publish IPv4 ports while Windows resolves localhost only to ::1.
  environment.TESTCONTAINERS_HOST_OVERRIDE = '127.0.0.1';
}

const child = spawn(process.execPath, ['--test', '--test-concurrency=1', ...files], {
  env: environment,
  stdio: 'inherit',
  shell: false,
  windowsHide: true,
});
child.once('error', () => {
  process.stderr.write('Unable to start the endpoint test runner.\n');
  process.exitCode = 1;
});
child.once('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });

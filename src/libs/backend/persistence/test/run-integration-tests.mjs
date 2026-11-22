import { spawn } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const environment = { ...process.env };
if (process.platform === 'win32' && (!environment.DOCKER_HOST || environment.DOCKER_HOST.startsWith('npipe:')) && !environment.TESTCONTAINERS_HOST_OVERRIDE) {
  environment.TESTCONTAINERS_HOST_OVERRIDE = '127.0.0.1';
}
const child = spawn(process.execPath, ['--test', '--test-concurrency=1', fileURLToPath(new URL('./integration/unit-of-work.test.js', import.meta.url))], {
  env: environment, stdio: 'inherit', shell: false, windowsHide: true,
});
child.once('error', () => { process.exitCode = 1; });
child.once('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });

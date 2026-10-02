import 'reflect-metadata';
import { loadBackendConfig } from './infrastructure/config/load-backend-config.js';
import { createApp } from './create-app.js';

async function bootstrap(): Promise<void> {
  const config = loadBackendConfig();
  const app = await createApp(config);
  await app.listen(config.http.port, config.http.host);
}

void bootstrap().catch(() => {
  // Configuration and driver exceptions can contain credentials: never dump them here.
  process.stderr.write('CasePilot API could not start. Check environment configuration and the HTTP port.\n');
  process.exitCode = 1;
});

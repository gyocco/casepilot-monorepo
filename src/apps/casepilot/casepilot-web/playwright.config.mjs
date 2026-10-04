import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4200', trace: 'retain-on-failure' },
  webServer: { command: 'pnpm dev', url: 'http://127.0.0.1:4200', reuseExistingServer: false, timeout: 120_000 },
  projects: [
    { name: 'mobile', use: { viewport: { width: 360, height: 740 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
});

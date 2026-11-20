// e2e runs against the live site by default; BASE_URL=local serves the checkout instead.
import { defineConfig } from '@playwright/test';
const local = process.env.BASE_URL === 'local';
export default defineConfig({
  testDir: '.',
  use: { baseURL: local ? 'http://localhost:4173' : process.env.BASE_URL || 'https://halftime-timer.vercel.app' },
  webServer: local ? { command: 'node serve.mjs', port: 4173, reuseExistingServer: true } : undefined,
});

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  // The target is an external production site that sometimes fails to render in time.
  // Retried tests are reported as "flaky" in the report, so instability stays visible.
  retries: process.env.CI ? 2 : 1,
  // Low default parallelism: the target is a real production site.
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : 2,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://app.ramp.com',
    // Native validation messages are localized by the browser.
    locale: 'en-US',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

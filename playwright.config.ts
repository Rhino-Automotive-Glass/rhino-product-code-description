import { defineConfig, devices } from '@playwright/test';
import { execFileSync } from 'node:child_process';

/**
 * Playwright Configuration for Rhino Code Generator
 *
 * Tests run against a LOCAL Supabase (started by `npm run e2e:db`), never the
 * production project: they sign in and save product codes, so pointing them
 * at production would write junk rows into the live catalog.
 */

/** Port for the app under test. Not 3000, so a dev server you already have
 *  running (wired to production via .env.local) is never reused by accident. */
const PORT = 3100;

/** Reads the local stack's URL and keys from the Supabase CLI and refuses
 *  anything that is not localhost. */
function localSupabaseEnv(): Record<string, string> {
  let raw: string;
  try {
    raw = execFileSync('supabase', ['status', '-o', 'env'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    throw new Error('Local Supabase is not running. Start it with `npm run e2e:db` (needs Docker).');
  }

  const vars = Object.fromEntries(
    raw
      .split('\n')
      .map((line) => line.match(/^([A-Z_]+)="(.*)"$/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => [m[1], m[2]]),
  );

  if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(vars.API_URL ?? '')) {
    throw new Error(`Refusing to run e2e tests against non-local Supabase: ${vars.API_URL}`);
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: vars.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: vars.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: vars.SERVICE_ROLE_KEY,
  };
}

export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Limit workers */
  workers: process.env.CI ? 1 : 4,

  /* Reporter to use */
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',

  /* Global timeout for each test */
  timeout: 30000,

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://localhost:${PORT}`,

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects - Chromium only for now */
  projects: [
    // Signs in once as the seeded editor and saves the session for the rest.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/editor.json',
      },
      dependencies: ['setup'],
    },

    // Commented out for now - uncomment when ready to test cross-browser
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
    // {
    //   name: 'iPad',
    //   use: { ...devices['iPad Pro'] },
    // },
  ],

  /* Run the dev server against the local Supabase before starting the tests */
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    // Always start a fresh server so its env is the local Supabase one.
    reuseExistingServer: false,
    timeout: 120 * 1000,
    // Process env beats .env.local in Next.js, so these override production.
    env: localSupabaseEnv(),
  },
});

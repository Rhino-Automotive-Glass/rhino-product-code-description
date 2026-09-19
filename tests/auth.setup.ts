import { test as setup, expect } from '@playwright/test';

/**
 * Signs in once as the e2e editor seeded by supabase/e2e/seed.sql and saves
 * the session; every other test starts already logged in (see
 * playwright.config.ts `storageState`).
 */

const AUTH_FILE = 'playwright/.auth/editor.json';

// Local-only credentials — see supabase/e2e/seed.sql.
const EMAIL = 'e2e-editor@example.test';
const PASSWORD = 'e2e-local-password';

setup('sign in as e2e editor', async ({ page, context }) => {
  await page.goto('/login');
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();

  // signIn() redirects to / on success.
  await page.waitForURL((url) => url.pathname === '/');

  // Safety net: Supabase names its session cookie after the project host. A
  // local stack yields `sb-127-auth-token`; anything else means the app is
  // talking to a real project, and the suite must stop before writing to it.
  const cookies = await context.cookies();
  const sessionCookie = cookies.find((c) => /^sb-.*-auth-token/.test(c.name));
  expect(sessionCookie?.name, 'app must use the local Supabase').toMatch(/^sb-(127|localhost)-/);

  await context.storageState({ path: AUTH_FILE });
});

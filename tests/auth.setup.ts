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
  // Record any sign-in error that is rendered, even for a moment: a successful
  // login used to flash "Unable to sign in. NEXT_REDIRECT" before redirecting.
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __signInErrors: string[] }).__signInErrors = seen;
    new MutationObserver(() => {
      const text = document.body?.innerText ?? '';
      if (text.includes('Unable to sign in')) seen.push(text.slice(text.indexOf('Unable to sign in'), text.indexOf('Unable to sign in') + 60));
    }).observe(document, { childList: true, subtree: true, characterData: true });
  });

  await page.goto('/login');
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();

  // signIn() redirects to / on success.
  await page.waitForURL((url) => url.pathname === '/');

  const signInErrors = await page.evaluate(
    () => (window as unknown as { __signInErrors: string[] }).__signInErrors,
  );
  expect(signInErrors, 'a successful login must not show a sign-in error').toEqual([]);

  // Safety net: Supabase names its session cookie after the project host. A
  // local stack yields `sb-127-auth-token`; anything else means the app is
  // talking to a real project, and the suite must stop before writing to it.
  const cookies = await context.cookies();
  const sessionCookie = cookies.find((c) => /^sb-.*-auth-token/.test(c.name));
  expect(sessionCookie?.name, 'app must use the local Supabase').toMatch(/^sb-(127|localhost)-/);

  await context.storageState({ path: AUTH_FILE });
});

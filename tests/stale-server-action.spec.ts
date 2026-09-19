import { test, expect } from '@playwright/test';
import { actionErrorMessage, STALE_PAGE_MESSAGE } from '../app/lib/auth/actionErrorMessage';

/**
 * A page loaded before a deploy calls server actions by IDs the new build no
 * longer has. The auth forms must tell the user to reload rather than show
 * Next.js's internal error.
 */

test.describe('actionErrorMessage', () => {
  test('maps the "Server Action not found" error to a reload message', () => {
    const error = new Error(
      'Server Action "6031b4d1c7c75c5e9db9a1e73bac0dad06ae116e1a" was not found on the server. ' +
        'Read more: https://nextjs.org/docs/messages/failed-to-find-server-action',
    );
    expect(actionErrorMessage(error, 'Unable to create account.')).toBe(STALE_PAGE_MESSAGE);
  });

  test('keeps other errors, with the prefix', () => {
    expect(actionErrorMessage(new Error('Network down'), 'Unable to sign in.')).toBe(
      'Unable to sign in. Network down',
    );
  });
});

test.describe('Stale page after a deploy', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const { path, fill, button } of [
    {
      path: '/signup',
      fill: { '#email': 'stale-page@example.test', '#password': 'stale-page-password', '#confirmPassword': 'stale-page-password' },
      button: /create account|sign up/i,
    },
    {
      path: '/login',
      fill: { '#email': 'e2e-editor@example.test', '#password': 'e2e-local-password' },
      button: /sign in/i,
    },
  ]) {
    test(`${path} asks to reload instead of showing the Next.js error`, async ({ page }) => {
      // Simulate a page from an older build: send an action ID this build lacks.
      await page.route(`**${path}`, async (route) => {
        const headers = route.request().headers();
        if (route.request().method() === 'POST' && headers['next-action']) {
          await route.continue({ headers: { ...headers, 'next-action': 'f'.repeat(42) } });
        } else {
          await route.continue();
        }
      });

      await page.goto(path);
      for (const [selector, value] of Object.entries(fill)) {
        const field = page.locator(selector);
        if (await field.count()) await field.fill(value);
      }
      await page.getByRole('button', { name: button }).click();

      await expect(page.getByText(STALE_PAGE_MESSAGE)).toBeVisible();
      await expect(page.getByText(/was not found on the server/)).toHaveCount(0);
    });
  }
});

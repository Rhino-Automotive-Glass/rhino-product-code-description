import { test, expect } from '@playwright/test';

/**
 * Accounts without a role (e.g. self-signups not yet approved in rhino-access)
 * must be shown as pending, not as viewers. Access itself is enforced by the
 * database (migration 018); this covers what the user is told.
 */

test.describe('Pending approval', () => {
  test.describe('account without a role', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('is labelled "Pending approval", not viewer, and stays read-only', async ({ page }) => {
      await page.goto('/login');
      await page.locator('#email').fill('e2e-pending@example.test'); // seed.sql
      await page.locator('#password').fill('e2e-local-password');
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL((url) => url.pathname === '/');

      await expect(page.getByText('Pending approval')).toBeVisible();
      await expect(page.getByRole('status')).toContainText('waiting for an administrator to assign a role');
      await expect(page.getByText(/^viewer$/i)).toHaveCount(0);

      // Read-only: the catalog tab is there, the Agregar (create) tab is not.
      await expect(page.getByRole('tab', { name: 'BD Códigos' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Agregar' })).toHaveCount(0);
    });
  });

  test('an account with a role is not shown as pending', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/^editor$/i)).toBeVisible(); // badge is CSS-uppercased
    await expect(page.getByText('Pending approval')).toHaveCount(0);
  });
});

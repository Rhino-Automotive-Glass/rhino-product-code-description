import { test, expect } from '@playwright/test';

// Start signed out (the chromium project otherwise reuses the editor session).
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test('a wrong password shows an error and stays on /login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill('e2e-editor@example.test');
    await page.locator('#password').fill('not-the-password');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('NEXT_REDIRECT')).toHaveCount(0);
  });
});

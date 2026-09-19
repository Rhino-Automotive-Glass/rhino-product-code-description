import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

/**
 * /api/auth/confirm verifies the token_hash carried by Supabase Auth email
 * links. Every test starts from a browser with no cookies — the "opened the
 * email on another device" case that the PKCE (?code=) callback cannot handle.
 *
 * Tokens are generated with the local stack's admin API, exactly as Supabase
 * generates them for the emails.
 */

test.use({ storageState: { cookies: [], origins: [] } });

function localAdmin() {
  const env = Object.fromEntries(
    execFileSync('supabase', ['status', '-o', 'env'], { encoding: 'utf8' })
      .split('\n')
      .map((l) => l.match(/^([A-Z_]+)="(.*)"$/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => [m[1], m[2]]),
  );
  if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(env.API_URL ?? '')) {
    throw new Error(`Refusing to use a non-local Supabase: ${env.API_URL}`);
  }
  return createClient(env.API_URL, env.SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe('Email link confirmation (/api/auth/confirm)', () => {
  test('a signup confirmation link confirms the account and signs in, on any device', async ({ page }) => {
    const admin = localAdmin();
    const email = `confirm-${Date.now()}@example.test`;
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'signup',
      email,
      password: 'confirm-local-password',
    });
    expect(error).toBeNull();
    const userId = data.user!.id;

    try {
      await page.goto(`/api/auth/confirm?token_hash=${data.properties!.hashed_token}&type=signup`);

      // Signed in, as a new account without a role (migration 018)
      await expect(page).toHaveURL((url) => url.pathname === '/');
      await expect(page.getByText('Pending approval')).toBeVisible();

      const { data: after } = await admin.auth.admin.getUserById(userId);
      expect(after.user?.email_confirmed_at).toBeTruthy();
    } finally {
      await admin.auth.admin.deleteUser(userId);
    }
  });

  test('a magic link signs an existing user in', async ({ page }) => {
    const { data, error } = await localAdmin().auth.admin.generateLink({
      type: 'magiclink',
      email: 'e2e-pending@example.test', // seed.sql
    });
    expect(error).toBeNull();

    await page.goto(`/api/auth/confirm?token_hash=${data.properties!.hashed_token}&type=magiclink`);

    await expect(page).toHaveURL((url) => url.pathname === '/');
    await expect(page.getByText('Pending approval')).toBeVisible();
  });

  test('a used or invalid token sends the user to login with an explanation', async ({ page }) => {
    await page.goto('/api/auth/confirm?token_hash=not-a-real-token&type=signup');

    await expect(page).toHaveURL(/\/login\?error=/);
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });

  test('an incomplete link is rejected', async ({ page }) => {
    await page.goto('/api/auth/confirm?type=signup');

    await expect(page).toHaveURL(/\/login\?error=/);
    await expect(page.getByText(/link is incomplete/i)).toBeVisible();
  });

  test('`next` cannot redirect to another site', async ({ page }) => {
    const { data } = await localAdmin().auth.admin.generateLink({
      type: 'magiclink',
      email: 'e2e-pending@example.test',
    });

    await page.goto(
      `/api/auth/confirm?token_hash=${data.properties!.hashed_token}&type=magiclink&next=//evil.example`,
    );

    await expect(page).toHaveURL((url) => url.hostname === 'localhost' && url.pathname === '/');
  });
});

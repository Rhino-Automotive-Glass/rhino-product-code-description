import { test, expect, Page } from '@playwright/test';
import { RhinoCodeGeneratorPage } from './page-objects/RhinoCodeGeneratorPage';

/**
 * Número suggestion for Rhino (R) codes: choosing R with an empty Número
 * pre-fills the next free number (highest R Número + 1), which the user can
 * change. The expected value comes from the same API the form uses, so the
 * tests hold whatever codes earlier tests saved to the local database.
 */

async function expectedSuggestion(page: Page): Promise<string> {
  const response = await page.request.get('/api/products/next-numero');
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body.numero).toMatch(/^\d{1,5}$/);
  return body.numero;
}

test.describe('Número suggestion (R)', () => {
  let rhinoPage: RhinoCodeGeneratorPage;

  test.beforeEach(async ({ page }) => {
    rhinoPage = new RhinoCodeGeneratorPage(page);
    await rhinoPage.goto();
  });

  test('choosing R fills the next free number and says it is a suggestion', async ({ page }) => {
    const suggestion = await expectedSuggestion(page);

    await rhinoPage.clasificacionRhino.click();

    await expect(rhinoPage.numeroInput).toHaveValue(suggestion);
    await expect(page.getByText('Sugerido: siguiente número Rhino disponible')).toBeVisible();
  });

  test('the suggestion can be overwritten', async ({ page }) => {
    const suggestion = await expectedSuggestion(page);
    await rhinoPage.clasificacionRhino.click();
    await expect(rhinoPage.numeroInput).toHaveValue(suggestion);

    await rhinoPage.numeroInput.fill('42');

    await expect(rhinoPage.numeroInput).toHaveValue('42');
    await expect(page.getByText('Sugerido: siguiente número Rhino disponible')).toBeHidden();
  });

  test('a number typed before choosing R is kept', async ({ page }) => {
    await rhinoPage.clasificacionDomestico.click();
    await rhinoPage.numeroInput.fill('555');

    await rhinoPage.clasificacionRhino.click();

    // Give the suggestion request time to come back; it must not overwrite.
    await page.waitForLoadState('networkidle');
    await expect(rhinoPage.numeroInput).toHaveValue('555');
    await expect(page.getByText('Sugerido: siguiente número Rhino disponible')).toBeHidden();
  });

  test('leaving R clears an untouched suggestion', async () => {
    await rhinoPage.clasificacionRhino.click();
    await expect(rhinoPage.numeroInput).not.toHaveValue('');

    await rhinoPage.clasificacionForanea.click();

    await expect(rhinoPage.numeroInput).toHaveValue('');
  });

  test('leaving R keeps a number the user changed', async () => {
    await rhinoPage.clasificacionRhino.click();
    await expect(rhinoPage.numeroInput).not.toHaveValue('');
    await rhinoPage.numeroInput.fill('777');

    await rhinoPage.clasificacionForanea.click();

    await expect(rhinoPage.numeroInput).toHaveValue('777');
  });
});

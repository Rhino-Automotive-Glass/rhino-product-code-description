import { test, expect } from '@playwright/test';
import { RhinoCodeGeneratorPage } from './page-objects/RhinoCodeGeneratorPage';

/**
 * End-to-end save through the real API route and RLS, as the seeded editor.
 *
 * Regression guard: on 2026-09-19 editors could not insert product codes in
 * production for ~2.5h. A broken legacy policy on user_roles errored whenever
 * an admin-check subquery on product_codes read other users' rows (fixed by
 * migration 014). No other test wrote to the database, so nothing caught it.
 */
test.describe('Save to database', () => {
  test('editor can save a product code', async ({ page }) => {
    const rhinoPage = new RhinoCodeGeneratorPage(page);
    await rhinoPage.goto();

    // Unique per run so repeated runs against the same local DB never collide
    const numero = String(Date.now() % 100000).padStart(5, '0');
    await rhinoPage.fillCodeGenerator({ clasificacion: 'R', parte: 's', numero });
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');

    await page.getByRole('button', { name: 'Agregar', exact: true }).click();

    // "¿Guardar 1 producto(s)...?" is a window.confirm(); Playwright dismisses
    // dialogs by default, which cancels the save.
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Guardar todo en Base de Datos' }).click();

    await expect(page.getByText('Todos los productos fueron guardados')).toBeVisible();
    await expect(page.getByText('1 producto(s) guardado(s) exitosamente.')).toBeVisible();
  });
});

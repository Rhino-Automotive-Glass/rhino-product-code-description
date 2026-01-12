import { test, expect, Page } from '@playwright/test';
import { RhinoCodeGeneratorPage } from './page-objects/RhinoCodeGeneratorPage';

test.describe('Agregar Feature (formerly Guardar)', () => {
  let rhinoPage: RhinoCodeGeneratorPage;

  test.beforeEach(async ({ page }) => {
    rhinoPage = new RhinoCodeGeneratorPage(page);
    await rhinoPage.goto();
  });

  test.describe('Button Visibility and Layout', () => {
    test('should display Agregar button in generated output section', async ({ page }) => {
      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      await expect(agregarButton).toBeVisible();
    });

    test('should display Agregar button to the left of Limpiar button', async ({ page }) => {
      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      const limpiarButton = page.getByRole('button', { name: 'Limpiar' });

      const agregarBox = await agregarButton.boundingBox();
      const limpiarBox = await limpiarButton.boundingBox();

      expect(agregarBox).not.toBeNull();
      expect(limpiarBox).not.toBeNull();
      
      // Agregar should be to the left (smaller x position)
      expect(agregarBox!.x).toBeLessThan(limpiarBox!.x);
    });

    test('should have primary styling on Agregar button', async ({ page }) => {
      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      
      // Check if button has primary class (blue background)
      const className = await agregarButton.getAttribute('class');
      expect(className).toContain('btn-primary');
    });

    test('should have secondary styling on Limpiar button', async ({ page }) => {
      const limpiarButton = page.getByRole('button', { name: 'Limpiar' });
      
      // Check if button has secondary class (gray background)
      const className = await limpiarButton.getAttribute('class');
      expect(className).toContain('btn-secondary');
    });
  });

  test.describe('Console Logging - Empty Data', () => {
    test('should log warning when clicking Agregar with no data', async ({ page }) => {
      const consoleMessages: string[] = [];
      
      // Capture console messages
      page.on('console', msg => {
        if (msg.type() === 'warning') {
          consoleMessages.push(msg.text());
        }
      });

      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      await agregarButton.click();

      // Wait a bit for console message
      await page.waitForTimeout(100);

      // Should have warning about no data
      expect(consoleMessages).toContain('No data to save - all fields are empty');
    });
  });

  test.describe('Console Logging - With Data', () => {
    test('should log ProductData when Agregar is clicked with code generator data', async ({ page }) => {
      const consoleLogs: any[] = [];
      
      // Capture console.log messages
      page.on('console', msg => {
        if (msg.type() === 'log' && msg.text().includes('Product Data')) {
          consoleLogs.push(msg.text());
        }
      });

      // Fill some code generator fields
      await rhinoPage.fillCodeGenerator({
        clasificacion: 'R',
        parte: 's',
        numero: '123',
        color: 'GT',
        aditamento: 'Y'
      });

      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      await agregarButton.click();

      // Wait for console message
      await page.waitForTimeout(200);

      // Should have logged something
      expect(consoleLogs.length).toBeGreaterThan(0);
      expect(consoleLogs[0]).toContain('Product Data');
    });

    test('should log ProductData when Agregar is clicked with compatibility data', async ({ page }) => {
      const consoleLogs: any[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'log' && msg.text().includes('Product Data')) {
          consoleLogs.push(msg.text());
        }
      });

      // Add a compatibility - Use Honda instead of Toyota
      await rhinoPage.addCompatibility('Honda', 'Accord', '2020');

      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      await agregarButton.click();

      await page.waitForTimeout(200);

      expect(consoleLogs.length).toBeGreaterThan(0);
      expect(consoleLogs[0]).toContain('Product Data');
    });

    test('should log ProductData when Agregar is clicked with description data', async ({ page }) => {
      const consoleLogs: any[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'log' && msg.text().includes('Product Data')) {
          consoleLogs.push(msg.text());
        }
      });

      // Fill description fields
      await rhinoPage.fillProductDescription({
        posicion: 'Front',
        lado: 'Left'
      });

      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      await agregarButton.click();

      await page.waitForTimeout(200);

      expect(consoleLogs.length).toBeGreaterThan(0);
      expect(consoleLogs[0]).toContain('Product Data');
    });

    test('should log complete ProductData with all sections filled', async ({ page }) => {
      const consoleLogs: any[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'log' && msg.text().includes('Product Data')) {
          consoleLogs.push(msg.text());
        }
      });

      // Fill all three sections
      await rhinoPage.fillCodeGenerator({
        clasificacion: 'R',
        parte: 's',
        numero: '123',
        color: 'GT',
        aditamento: 'Y'
      });

      // Use Honda instead of Toyota
      await rhinoPage.addCompatibility('Honda', 'Accord', '2020');

      await rhinoPage.fillProductDescription({
        posicion: 'Front',
        lado: 'Left'
      });

      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      await agregarButton.click();

      await page.waitForTimeout(200);

      expect(consoleLogs.length).toBeGreaterThan(0);
      expect(consoleLogs[0]).toContain('Product Data');
    });
  });

  test.describe('Button Interaction', () => {
    test('should not clear data after clicking Agregar', async ({ page }) => {
      // Fill code generator
      await rhinoPage.fillCodeGenerator({
        clasificacion: 'R',
        parte: 's',
        numero: '123'
      });

      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      await agregarButton.click();

      // Data should still be there
      const generatedCode = await rhinoPage.getGeneratedCodeText();
      expect(generatedCode).toBe('RS00123--');
    });

    test('should work independently from Limpiar button', async ({ page }) => {
      // Fill some data
      await rhinoPage.fillCodeGenerator({
        clasificacion: 'R',
        parte: 's'
      });

      // Click Agregar
      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      await agregarButton.click();

      // Data should still be there
      let generatedCode = await rhinoPage.getGeneratedCodeText();
      expect(generatedCode).toContain('RS');

      // Now click Limpiar
      await rhinoPage.clickLimpiar();

      // Data should be cleared - 9 dashes for code without F aditamento
      generatedCode = await rhinoPage.getGeneratedCodeText();
      expect(generatedCode).toBe('---------');
    });

    test('should be clickable multiple times', async ({ page }) => {
      const consoleLogs: any[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'log' && msg.text().includes('Product Data')) {
          consoleLogs.push(msg.text());
        }
      });

      await rhinoPage.fillCodeGenerator({ clasificacion: 'R' });

      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      
      // Click multiple times
      await agregarButton.click();
      await page.waitForTimeout(100);
      
      await agregarButton.click();
      await page.waitForTimeout(100);
      
      await agregarButton.click();
      await page.waitForTimeout(100);

      // Should have logged 3 times
      expect(consoleLogs.length).toBe(3);
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should display buttons on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size

      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      const limpiarButton = page.getByRole('button', { name: 'Limpiar' });

      await expect(agregarButton).toBeVisible();
      await expect(limpiarButton).toBeVisible();
    });

    test('should display buttons on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad size

      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      const limpiarButton = page.getByRole('button', { name: 'Limpiar' });

      await expect(agregarButton).toBeVisible();
      await expect(limpiarButton).toBeVisible();
    });

    test('should display buttons on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop size

      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      const limpiarButton = page.getByRole('button', { name: 'Limpiar' });

      await expect(agregarButton).toBeVisible();
      await expect(limpiarButton).toBeVisible();
    });
  });

  test.describe('Keyboard Accessibility', () => {
    test('should be accessible via keyboard navigation', async ({ page }) => {
      // Tab to focus on buttons
      await page.keyboard.press('Tab');
      
      // Check if Agregar button can receive focus
      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      
      // Continue tabbing until we reach Agregar button
      let focused = await agregarButton.evaluate(el => el === document.activeElement);
      let attempts = 0;
      
      while (!focused && attempts < 20) {
        await page.keyboard.press('Tab');
        focused = await agregarButton.evaluate(el => el === document.activeElement);
        attempts++;
      }
      
      expect(focused).toBe(true);
    });

    test('should be clickable via Enter key', async ({ page }) => {
      const consoleLogs: any[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'log' && msg.text().includes('Product Data')) {
          consoleLogs.push(msg.text());
        }
      });

      await rhinoPage.fillCodeGenerator({ clasificacion: 'R' });

      const agregarButton = page.getByRole('button', { name: 'Agregar' });
      await agregarButton.focus();
      await page.keyboard.press('Enter');

      await page.waitForTimeout(200);

      expect(consoleLogs.length).toBeGreaterThan(0);
    });
  });
});

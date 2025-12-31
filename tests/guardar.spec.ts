import { test, expect, Page } from '@playwright/test';
import { RhinoCodeGeneratorPage } from './page-objects/RhinoCodeGeneratorPage';

test.describe('Guardar Feature', () => {
  let rhinoPage: RhinoCodeGeneratorPage;

  test.beforeEach(async ({ page }) => {
    rhinoPage = new RhinoCodeGeneratorPage(page);
    await rhinoPage.goto();
  });

  test.describe('Button Visibility and Layout', () => {
    test('should display Guardar button in header', async ({ page }) => {
      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      await expect(guardarButton).toBeVisible();
    });

    test('should display Guardar button to the left of Clean All button', async ({ page }) => {
      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      const cleanAllButton = page.getByRole('button', { name: 'Clean All' });

      const guardarBox = await guardarButton.boundingBox();
      const cleanAllBox = await cleanAllButton.boundingBox();

      expect(guardarBox).not.toBeNull();
      expect(cleanAllBox).not.toBeNull();
      
      // Guardar should be to the left (smaller x position)
      expect(guardarBox!.x).toBeLessThan(cleanAllBox!.x);
    });

    test('should have primary styling on Guardar button', async ({ page }) => {
      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      
      // Check if button has primary class (blue background)
      const className = await guardarButton.getAttribute('class');
      expect(className).toContain('btn-primary');
    });

    test('should have secondary styling on Clean All button', async ({ page }) => {
      const cleanAllButton = page.getByRole('button', { name: 'Clean All' });
      
      // Check if button has secondary class (gray background)
      const className = await cleanAllButton.getAttribute('class');
      expect(className).toContain('btn-secondary');
    });
  });

  test.describe('Console Logging - Empty Data', () => {
    test('should log warning when clicking Guardar with no data', async ({ page }) => {
      const consoleMessages: string[] = [];
      
      // Capture console messages
      page.on('console', msg => {
        if (msg.type() === 'warning') {
          consoleMessages.push(msg.text());
        }
      });

      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      await guardarButton.click();

      // Wait a bit for console message
      await page.waitForTimeout(100);

      // Should have warning about no data
      expect(consoleMessages).toContain('No data to save - all fields are empty');
    });
  });

  test.describe('Console Logging - With Data', () => {
    test('should log ProductData when Guardar is clicked with code generator data', async ({ page }) => {
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

      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      await guardarButton.click();

      // Wait for console message
      await page.waitForTimeout(200);

      // Should have logged something
      expect(consoleLogs.length).toBeGreaterThan(0);
      expect(consoleLogs[0]).toContain('Product Data');
    });

    test('should log ProductData when Guardar is clicked with compatibility data', async ({ page }) => {
      const consoleLogs: any[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'log' && msg.text().includes('Product Data')) {
          consoleLogs.push(msg.text());
        }
      });

      // Add a compatibility - Use Honda instead of Toyota
      await rhinoPage.addCompatibility('Honda', 'Accord', '2020');

      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      await guardarButton.click();

      await page.waitForTimeout(200);

      expect(consoleLogs.length).toBeGreaterThan(0);
      expect(consoleLogs[0]).toContain('Product Data');
    });

    test('should log ProductData when Guardar is clicked with description data', async ({ page }) => {
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

      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      await guardarButton.click();

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

      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      await guardarButton.click();

      await page.waitForTimeout(200);

      expect(consoleLogs.length).toBeGreaterThan(0);
      expect(consoleLogs[0]).toContain('Product Data');
    });
  });

  test.describe('Button Interaction', () => {
    test('should not clear data after clicking Guardar', async ({ page }) => {
      // Fill code generator
      await rhinoPage.fillCodeGenerator({
        clasificacion: 'R',
        parte: 's',
        numero: '123'
      });

      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      await guardarButton.click();

      // Data should still be there
      const generatedCode = await rhinoPage.getGeneratedCodeText();
      expect(generatedCode).toBe('RS00123--');
    });

    test('should work independently from Clean All button', async ({ page }) => {
      // Fill some data
      await rhinoPage.fillCodeGenerator({
        clasificacion: 'R',
        parte: 's'
      });

      // Click Guardar
      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      await guardarButton.click();

      // Data should still be there
      let generatedCode = await rhinoPage.getGeneratedCodeText();
      expect(generatedCode).toContain('RS');

      // Now click Clean All
      await rhinoPage.clickCleanAll();

      // Data should be cleared - FIXED: 9 dashes not 12
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

      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      
      // Click multiple times
      await guardarButton.click();
      await page.waitForTimeout(100);
      
      await guardarButton.click();
      await page.waitForTimeout(100);
      
      await guardarButton.click();
      await page.waitForTimeout(100);

      // Should have logged 3 times
      expect(consoleLogs.length).toBe(3);
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should display buttons on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size

      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      const cleanAllButton = page.getByRole('button', { name: 'Clean All' });

      await expect(guardarButton).toBeVisible();
      await expect(cleanAllButton).toBeVisible();
    });

    test('should display buttons on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad size

      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      const cleanAllButton = page.getByRole('button', { name: 'Clean All' });

      await expect(guardarButton).toBeVisible();
      await expect(cleanAllButton).toBeVisible();
    });

    test('should display buttons on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop size

      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      const cleanAllButton = page.getByRole('button', { name: 'Clean All' });

      await expect(guardarButton).toBeVisible();
      await expect(cleanAllButton).toBeVisible();
    });
  });

  test.describe('Keyboard Accessibility', () => {
    test('should be accessible via keyboard navigation', async ({ page }) => {
      // Tab to focus on buttons
      await page.keyboard.press('Tab');
      
      // Check if Guardar button can receive focus
      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      
      // Continue tabbing until we reach Guardar button
      let focused = await guardarButton.evaluate(el => el === document.activeElement);
      let attempts = 0;
      
      while (!focused && attempts < 20) {
        await page.keyboard.press('Tab');
        focused = await guardarButton.evaluate(el => el === document.activeElement);
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

      const guardarButton = page.getByRole('button', { name: 'Guardar' });
      await guardarButton.focus();
      await page.keyboard.press('Enter');

      await page.waitForTimeout(200);

      expect(consoleLogs.length).toBeGreaterThan(0);
    });
  });
});

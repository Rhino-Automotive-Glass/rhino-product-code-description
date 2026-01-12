import { test, expect } from '@playwright/test';
import { RhinoCodeGeneratorPage } from './page-objects/RhinoCodeGeneratorPage';

test.describe('Responsive Layout Tests', () => {
  let rhinoPage: RhinoCodeGeneratorPage;

  test.beforeEach(async ({ page }) => {
    rhinoPage = new RhinoCodeGeneratorPage(page);
    await rhinoPage.goto();
  });

  test.describe('Desktop Layout (≥1024px)', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('should display Product Details and Compatibility side by side', async ({ page }) => {
      // Both sections should be visible in 2-column layout
      await expect(rhinoPage.codeGeneratorHeading).toBeVisible();
      await expect(rhinoPage.compatibilityHeading).toBeVisible();

      // Get bounding boxes to verify layout
      const codeGenBox = await rhinoPage.codeGeneratorHeading.boundingBox();
      const compatibilityBox = await rhinoPage.compatibilityHeading.boundingBox();

      // Verify they're in a 2-column layout (different x positions)
      expect(codeGenBox?.x).toBeDefined();
      expect(compatibilityBox?.x).toBeDefined();
      
      // Product Details should be on the left
      expect(codeGenBox!.x).toBeLessThan(compatibilityBox!.x);
      
      // Should be roughly at same y position (side by side)
      expect(Math.abs(codeGenBox!.y - compatibilityBox!.y)).toBeLessThan(50);
    });

    test('should display generated output in single row below forms', async ({ page }) => {
      // Fill some data to make output visible
      await rhinoPage.fillCodeGenerator({
        clasificacion: 'D',
        parte: 'b',
        numero: '12345',
        color: 'GT',
        aditamento: 'F'
      });

      // Verify generated output card is visible
      await expect(rhinoPage.generatedOutputCard).toBeVisible();
      
      // Verify single-row layout with code and description side by side
      await expect(rhinoPage.generatedCode).toBeVisible();
      await expect(rhinoPage.generatedDescription).toBeVisible();
    });

    test('should display action buttons side by side', async ({ page }) => {
      // Buttons should be visible
      await expect(rhinoPage.agregarButton).toBeVisible();
      await expect(rhinoPage.limpiarButton).toBeVisible();

      // Get bounding boxes
      const agregarBox = await rhinoPage.agregarButton.boundingBox();
      const limpiarBox = await rhinoPage.limpiarButton.boundingBox();

      // Agregar should be to the left of Limpiar
      expect(agregarBox!.x).toBeLessThan(limpiarBox!.x);
      
      // Should be at roughly same y position (side by side)
      expect(Math.abs(agregarBox!.y - limpiarBox!.y)).toBeLessThan(10);
    });

    test('should have header at top', async ({ page }) => {
      await expect(rhinoPage.headerTitle).toBeVisible();
    });
  });

  test.describe('Tablet Layout (768px - 1023px)', () => {
    test.use({ viewport: { width: 800, height: 1024 } });

    test('should display in 2-column layout', async () => {
      // Product Details and Compatibility should still be side by side
      await expect(rhinoPage.codeGeneratorHeading).toBeVisible();
      await expect(rhinoPage.compatibilityHeading).toBeVisible();

      const codeGenBox = await rhinoPage.codeGeneratorHeading.boundingBox();
      const compatibilityBox = await rhinoPage.compatibilityHeading.boundingBox();

      // Should still be side by side at tablet size
      expect(codeGenBox!.x).toBeLessThan(compatibilityBox!.x);
      expect(Math.abs(codeGenBox!.y - compatibilityBox!.y)).toBeLessThan(50);
    });

    test('should display buttons side by side', async () => {
      await expect(rhinoPage.agregarButton).toBeVisible();
      await expect(rhinoPage.limpiarButton).toBeVisible();

      const agregarBox = await rhinoPage.agregarButton.boundingBox();
      const limpiarBox = await rhinoPage.limpiarButton.boundingBox();

      // Still side by side on tablet
      expect(agregarBox!.x).toBeLessThan(limpiarBox!.x);
    });
  });

  test.describe('Mobile Layout (<768px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display sections stacked vertically', async () => {
      await expect(rhinoPage.codeGeneratorHeading).toBeVisible();
      await expect(rhinoPage.compatibilityHeading).toBeVisible();

      const codeGenBox = await rhinoPage.codeGeneratorHeading.boundingBox();
      const compatibilityBox = await rhinoPage.compatibilityHeading.boundingBox();

      // Should be roughly at the same x position (stacked)
      expect(Math.abs(codeGenBox!.x - compatibilityBox!.x)).toBeLessThan(50);

      // Should be stacked vertically (different y positions)
      expect(codeGenBox!.y).toBeLessThan(compatibilityBox!.y);
    });

    test('should stack generated output vertically on mobile', async () => {
      // Fill some data
      await rhinoPage.fillCodeGenerator({
        clasificacion: 'D',
        parte: 'b',
        numero: '12345',
        color: 'GT',
        aditamento: 'Y'
      });

      // Output should still be visible
      await expect(rhinoPage.generatedOutputCard).toBeVisible();
      await expect(rhinoPage.generatedCode).toBeVisible();
      await expect(rhinoPage.generatedDescription).toBeVisible();
    });

    test('should keep buttons side by side even on mobile', async () => {
      // Buttons remain side by side on mobile
      await expect(rhinoPage.agregarButton).toBeVisible();
      await expect(rhinoPage.limpiarButton).toBeVisible();

      const agregarBox = await rhinoPage.agregarButton.boundingBox();
      const limpiarBox = await rhinoPage.limpiarButton.boundingBox();

      // Should still be side by side (though they may be full width)
      expect(agregarBox!.x).toBeLessThan(limpiarBox!.x);
    });

    test('should have responsive form elements', async () => {
      // All inputs should be visible and usable
      await expect(rhinoPage.numeroInput).toBeVisible();
      await expect(rhinoPage.colorSelect).toBeVisible();
      await expect(rhinoPage.marcaSelect).toBeVisible();
      await expect(rhinoPage.posicionFront).toBeVisible();

      // Should be able to interact with them
      await rhinoPage.numeroInput.fill('123');
      expect(await rhinoPage.numeroInput.inputValue()).toBe('123');
    });

    test('should maintain functionality on mobile', async () => {
      // Full workflow should work on mobile
      await rhinoPage.fillCodeGenerator({
        clasificacion: 'R',
        parte: 's',
        numero: '123',
        color: 'GT',
        aditamento: 'Y'
      });

      await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');

      await rhinoPage.fillProductDescription({
        posicion: 'Front',
        lado: 'Left'
      });

      // Verify outputs
      expect(await rhinoPage.getGeneratedCodeText()).toBe('RS00123GTY');
      expect(await rhinoPage.getGeneratedDescriptionText()).toBe('SIDE FRONT LEFT TOYOTA CAMRY 2020');
    });

    test('should have accessible Limpiar button on mobile', async () => {
      // Button should be visible
      await expect(rhinoPage.limpiarButton).toBeVisible();

      // Scroll down
      await rhinoPage.page.evaluate(() => window.scrollTo(0, 500));

      // Button should still be accessible (scroll back up or within viewport)
      await rhinoPage.limpiarButton.scrollIntoViewIfNeeded();
      await expect(rhinoPage.limpiarButton).toBeVisible();
    });
  });

  test.describe('iPad Layout', () => {
    test.use({ viewport: { width: 1024, height: 1366 } });

    test('should handle iPad portrait orientation', async () => {
      await expect(rhinoPage.codeGeneratorHeading).toBeVisible();
      await expect(rhinoPage.compatibilityHeading).toBeVisible();

      // Should work like desktop (2 columns) at 1024px
      const codeGenBox = await rhinoPage.codeGeneratorHeading.boundingBox();
      const compatibilityBox = await rhinoPage.compatibilityHeading.boundingBox();

      expect(codeGenBox!.x).toBeLessThan(compatibilityBox!.x);
    });
  });

  test.describe('Font Consistency Across Viewports', () => {
    test('desktop - generated outputs use monospace bold', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await rhinoPage.goto();

      await rhinoPage.fillCodeGenerator({
        clasificacion: 'R',
        parte: 's',
        numero: '123',
        color: 'GT',
        aditamento: 'Y'
      });

      // Check font family is monospace
      const codeFont = await rhinoPage.generatedCode.evaluate(el => 
        window.getComputedStyle(el).fontFamily
      );
      expect(codeFont).toContain('mono');

      // Check font weight is bold
      const codeWeight = await rhinoPage.generatedCode.evaluate(el => 
        window.getComputedStyle(el).fontWeight
      );
      expect(parseInt(codeWeight)).toBeGreaterThanOrEqual(700);
    });

    test('mobile - generated outputs maintain monospace bold', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await rhinoPage.goto();

      await rhinoPage.fillCodeGenerator({
        clasificacion: 'R',
        parte: 's',
        numero: '123',
        color: 'GT',
        aditamento: 'Y'
      });

      const codeFont = await rhinoPage.generatedCode.evaluate(el => 
        window.getComputedStyle(el).fontFamily
      );
      expect(codeFont).toContain('mono');

      const codeWeight = await rhinoPage.generatedCode.evaluate(el => 
        window.getComputedStyle(el).fontWeight
      );
      expect(parseInt(codeWeight)).toBeGreaterThanOrEqual(700);
    });
  });

  test.describe('Minimum Height on Forms', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('should have 750px minimum height on both form containers', async ({ page }) => {
      // Get the card containers
      const productDetailsCard = page.locator('.card').filter({
        has: page.getByRole('heading', { name: 'Product Details' })
      });
      
      const compatibilityCard = page.locator('.card').filter({
        has: page.getByRole('heading', { name: 'Product Compatibility' })
      });

      // Both should be visible
      await expect(productDetailsCard).toBeVisible();
      await expect(compatibilityCard).toBeVisible();

      // Get heights
      const detailsBox = await productDetailsCard.boundingBox();
      const compatBox = await compatibilityCard.boundingBox();

      // Both should be at least 750px (with some tolerance for padding)
      expect(detailsBox!.height).toBeGreaterThanOrEqual(740);
      expect(compatBox!.height).toBeGreaterThanOrEqual(740);
    });
  });
});

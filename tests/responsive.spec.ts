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

    test('should display all three sections side by side', async ({ page }) => {
      // All three sections should be visible
      await expect(rhinoPage.codeGeneratorHeading).toBeVisible();
      await expect(rhinoPage.compatibilityHeading).toBeVisible();
      await expect(rhinoPage.descriptionHeading).toBeVisible();

      // Get bounding boxes to verify layout
      const codeGenBox = await rhinoPage.codeGeneratorHeading.boundingBox();
      const compatibilityBox = await rhinoPage.compatibilityHeading.boundingBox();
      const descriptionBox = await rhinoPage.descriptionHeading.boundingBox();

      // Verify they're in a 3-column layout (different x positions)
      expect(codeGenBox?.x).toBeDefined();
      expect(compatibilityBox?.x).toBeDefined();
      expect(descriptionBox?.x).toBeDefined();
      
      // Code Gen should be leftmost
      expect(codeGenBox!.x).toBeLessThan(compatibilityBox!.x);
      // Compatibility should be in middle
      expect(compatibilityBox!.x).toBeLessThan(descriptionBox!.x);
    });

    test('should keep header sticky on scroll', async ({ page }) => {
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));

      // Header should still be visible
      await expect(rhinoPage.headerTitle).toBeVisible();
      await expect(rhinoPage.cleanAllButton).toBeVisible();
    });
  });

  test.describe('Tablet Layout (768px - 1023px)', () => {
    test.use({ viewport: { width: 800, height: 1024 } });

    test('should display in 2-column layout with description below', async () => {
      await expect(rhinoPage.codeGeneratorHeading).toBeVisible();
      await expect(rhinoPage.compatibilityHeading).toBeVisible();
      await expect(rhinoPage.descriptionHeading).toBeVisible();

      const codeGenBox = await rhinoPage.codeGeneratorHeading.boundingBox();
      const compatibilityBox = await rhinoPage.compatibilityHeading.boundingBox();
      const descriptionBox = await rhinoPage.descriptionHeading.boundingBox();

      // First row: Code Gen and Compatibility side by side
      expect(codeGenBox!.x).toBeLessThan(compatibilityBox!.x);
      expect(codeGenBox!.y).toBeCloseTo(compatibilityBox!.y, 50);

      // Second row: Description should be below both
      expect(descriptionBox!.y).toBeGreaterThan(codeGenBox!.y);
      expect(descriptionBox!.y).toBeGreaterThan(compatibilityBox!.y);
    });
  });

  test.describe('Mobile Layout (<768px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display sections stacked vertically', async () => {
      await expect(rhinoPage.codeGeneratorHeading).toBeVisible();
      await expect(rhinoPage.compatibilityHeading).toBeVisible();
      await expect(rhinoPage.descriptionHeading).toBeVisible();

      const codeGenBox = await rhinoPage.codeGeneratorHeading.boundingBox();
      const compatibilityBox = await rhinoPage.compatibilityHeading.boundingBox();
      const descriptionBox = await rhinoPage.descriptionHeading.boundingBox();

      // All should be roughly at the same x position (stacked)
      expect(codeGenBox!.x).toBeCloseTo(compatibilityBox!.x, 50);
      expect(compatibilityBox!.x).toBeCloseTo(descriptionBox!.x, 50);

      // Should be stacked vertically (different y positions)
      expect(codeGenBox!.y).toBeLessThan(compatibilityBox!.y);
      expect(compatibilityBox!.y).toBeLessThan(descriptionBox!.y);
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

      // Scroll to see Product Description
      await rhinoPage.descriptionHeading.scrollIntoViewIfNeeded();
      
      await rhinoPage.fillProductDescription({
        posicion: 'Front',
        lado: 'Left'
      });

      // Verify outputs
      expect(await rhinoPage.getGeneratedCodeText()).toBe('RS00123GTY');
      expect(await rhinoPage.getGeneratedDescriptionText()).toBe('SIDE FRONT LEFT TOYOTA CAMRY 2020');
    });

    test('should have accessible Clean All button on mobile', async () => {
      // Header should be sticky and visible
      await expect(rhinoPage.cleanAllButton).toBeVisible();

      // Scroll down
      await rhinoPage.page.evaluate(() => window.scrollTo(0, 500));

      // Button should still be visible (sticky header)
      await expect(rhinoPage.cleanAllButton).toBeVisible();
    });
  });

  test.describe('iPad Layout', () => {
    test.use({ viewport: { width: 1024, height: 1366 } });

    test('should handle iPad portrait orientation', async () => {
      await expect(rhinoPage.codeGeneratorHeading).toBeVisible();
      await expect(rhinoPage.compatibilityHeading).toBeVisible();
      await expect(rhinoPage.descriptionHeading).toBeVisible();

      // Should work like desktop (3 columns) at 1024px
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
});

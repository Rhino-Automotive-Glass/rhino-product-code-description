import { test, expect } from '@playwright/test';
import { RhinoCodeGeneratorPage } from './page-objects/RhinoCodeGeneratorPage';

test.describe('Product Compatibility Section', () => {
  let rhinoPage: RhinoCodeGeneratorPage;

  test.beforeEach(async ({ page }) => {
    rhinoPage = new RhinoCodeGeneratorPage(page);
    await rhinoPage.goto();
  });

  test('should display all compatibility fields', async () => {
    await expect(rhinoPage.compatibilityHeading).toBeVisible();
    await expect(rhinoPage.marcaSelect).toBeVisible();
    await expect(rhinoPage.subModeloSelect).toBeVisible();
    await expect(rhinoPage.modeloSelect).toBeVisible();
    await expect(rhinoPage.addCompatibilityButton).toBeVisible();
  });

  test('should show empty state when no compatibilities added', async () => {
    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilities Added (0)');
    await expect(rhinoPage.page.getByText('No compatibilities added yet')).toBeVisible();
    
    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('---');
  });

  test('should disable sub-modelo until marca is selected', async () => {
    await expect(rhinoPage.subModeloSelect).toBeDisabled();
    
    await rhinoPage.marcaSelect.selectOption('Toyota');
    await expect(rhinoPage.subModeloSelect).toBeEnabled();
  });

  test('should add compatibility to list', async () => {
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');

    // Check count updated
    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilities Added (1)');
    
    // Check item appears in list (scoped to avoid finding it in other sections)
    await expect(rhinoPage.getCompatibilityInList('Toyota Camry 2020')).toBeVisible();
    
    // Check generated compatibility string
    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('TOYOTA CAMRY 2020');
  });

  test('should add multiple compatibilities', async () => {
    // Using brands that exist in carBrands.tsx: Toyota, Nissan, Chevrolet
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    await rhinoPage.addCompatibility('Nissan', 'Altima', '2021');
    await rhinoPage.addCompatibility('Chevrolet', 'Malibu', '2022');

    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilities Added (3)');
    
    await expect(rhinoPage.getCompatibilityInList('Toyota Camry 2020')).toBeVisible();
    await expect(rhinoPage.getCompatibilityInList('Nissan Altima 2021')).toBeVisible();
    await expect(rhinoPage.getCompatibilityInList('Chevrolet Malibu 2022')).toBeVisible();

    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('TOYOTA CAMRY 2020, NISSAN ALTIMA 2021, CHEVROLET MALIBU 2022');
  });

  test('should keep form fields populated after adding compatibility', async () => {
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');

    // Fields should still have values
    const marcaValue = await rhinoPage.marcaSelect.inputValue();
    const subModeloValue = await rhinoPage.subModeloSelect.inputValue();
    const modeloValue = await rhinoPage.modeloSelect.inputValue();

    expect(marcaValue).toBe('Toyota');
    expect(subModeloValue).toBe('Camry');
    expect(modeloValue).toBe('2020');
  });

  test('should show alert when trying to add incomplete compatibility', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Please select all fields');
      await dialog.accept();
    });

    await rhinoPage.marcaSelect.selectOption('Toyota');
    // Don't select sub-modelo or modelo
    await rhinoPage.addCompatibilityButton.click();
  });

  test('should prevent duplicate compatibilities', async ({ page }) => {
    // Add first compatibility
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');

    // Try to add same compatibility again
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('already exists');
      await dialog.accept();
    });

    await rhinoPage.addCompatibilityButton.click();

    // Should still only have 1
    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilities Added (1)');
  });

  test('should delete compatibility from list', async () => {
    // Using brands that exist: Toyota and Nissan
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    await rhinoPage.addCompatibility('Nissan', 'Altima', '2021');

    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilities Added (2)');

    // Delete first item
    await rhinoPage.deleteCompatibilityByIndex(0);

    // Check count decreased
    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilities Added (1)');
    
    // Check first item is gone
    await expect(rhinoPage.getCompatibilityInList('Toyota Camry 2020')).not.toBeVisible();
    
    // Check second item still exists
    await expect(rhinoPage.getCompatibilityInList('Nissan Altima 2021')).toBeVisible();

    // Check generated compatibility updated
    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('NISSAN ALTIMA 2021');
  });

  test('should display compatibility in uppercase', async () => {
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');

    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toEqual(compatibilityText?.toUpperCase());
  });

  test('should handle various car brands', async () => {
    // Test with different brands that exist in carBrands.tsx
    await rhinoPage.addCompatibility('BMW', '3 Series', '2023');
    await expect(rhinoPage.getCompatibilityInList('BMW 3 Series 2023')).toBeVisible();

    await rhinoPage.addCompatibility('Mercedes-Benz', 'C-Class', '2022');
    await expect(rhinoPage.getCompatibilityInList('Mercedes-Benz C-Class 2022')).toBeVisible();

    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toContain('BMW 3 SERIES 2023');
    expect(compatibilityText).toContain('MERCEDES-BENZ C-CLASS 2022');
  });
});

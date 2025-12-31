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
    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilidades Añadidas (0)');
    await expect(rhinoPage.page.getByText('No se han añadido compatibilidades')).toBeVisible();
    
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
    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilidades Añadidas (1)');
    
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

    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilidades Añadidas (3)');
    
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
      expect(dialog.message()).toContain('Por favor selecciona todos los campos');
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
      expect(dialog.message()).toContain('ya existe');
      await dialog.accept();
    });

    await rhinoPage.addCompatibilityButton.click();

    // Should still only have 1
    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilidades Añadidas (1)');
  });

  test('should delete compatibility from list', async () => {
    // Using brands that exist: Toyota and Nissan
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    await rhinoPage.addCompatibility('Nissan', 'Altima', '2021');

    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilidades Añadidas (2)');

    // Delete first item
    await rhinoPage.deleteCompatibilityByIndex(0);

    // Check count decreased
    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilidades Añadidas (1)');
    
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

test.describe('Product Compatibility - "Otro" (Custom) Feature', () => {
  let rhinoPage: RhinoCodeGeneratorPage;

  test.beforeEach(async ({ page }) => {
    rhinoPage = new RhinoCodeGeneratorPage(page);
    await rhinoPage.goto();
  });

  test('should show "Otro" option in Marca dropdown', async () => {
    // Check that "Otro (Personalizado)" option exists in the dropdown
    const otroOption = rhinoPage.marcaSelect.locator('option[value="Otro"]');
    await expect(otroOption).toBeAttached();
  });

  test('should hide Sub-Modelo and show custom input when "Otro" is selected', async () => {
    // Initially, Sub-Modelo should be visible (though disabled)
    await expect(rhinoPage.subModeloSelect).toBeVisible();
    
    // Custom input should not be visible initially
    expect(await rhinoPage.isCustomMarcaInputVisible()).toBe(false);

    // Select "Otro"
    await rhinoPage.marcaSelect.selectOption('Otro');

    // Now custom input should be visible
    await expect(rhinoPage.customMarcaInput).toBeVisible();
    
    // Sub-Modelo should be hidden (not just disabled)
    expect(await rhinoPage.isSubModeloSelectVisible()).toBe(false);
  });

  test('should add custom compatibility entry', async () => {
    await rhinoPage.addCustomCompatibility('Fuso Canter', '2020');

    // Check count updated
    await expect(rhinoPage.compatibilityCount).toContainText('(1)');
    
    // Check item appears in list - use the compatibility list to scope the search
    const customItem = rhinoPage.compatibilitySection
      .locator('.space-y-2') // The list container
      .getByText('Fuso Canter 2020', { exact: false });
    await expect(customItem.first()).toBeVisible();
    
    // Check the "Personalizado" badge is visible in the list
    const personalizadoBadge = rhinoPage.compatibilitySection
      .locator('.space-y-2')
      .getByText('Personalizado');
    await expect(personalizadoBadge).toBeVisible();

    // Check generated compatibility string
    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('FUSO CANTER 2020');
  });

  test('should add multiple custom compatibility entries', async () => {
    await rhinoPage.addCustomCompatibility('Fuso Canter', '2020');
    await rhinoPage.addCustomCompatibility('Howo Sinotruk', '2021');
    await rhinoPage.addCustomCompatibility('Shacman X3000', '2022');

    await expect(rhinoPage.compatibilityCount).toContainText('(3)');

    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('FUSO CANTER 2020, HOWO SINOTRUK 2021, SHACMAN X3000 2022');
  });

  test('should mix regular and custom compatibility entries', async () => {
    // Add a regular compatibility
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2023');
    
    // Add a custom compatibility
    await rhinoPage.addCustomCompatibility('Fuso Canter', '2020');
    
    // Add another regular compatibility
    await rhinoPage.addCompatibility('Nissan', 'Sentra', '2022');

    await expect(rhinoPage.compatibilityCount).toContainText('(3)');

    // Verify all entries are in the list
    await expect(rhinoPage.getCompatibilityInList('Toyota Camry 2023')).toBeVisible();
    // For custom entries, scope to the list container
    const customItem = rhinoPage.compatibilitySection
      .locator('.space-y-2')
      .getByText('Fuso Canter 2020', { exact: false });
    await expect(customItem.first()).toBeVisible();
    await expect(rhinoPage.getCompatibilityInList('Nissan Sentra 2022')).toBeVisible();

    // Check generated string includes all
    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toContain('TOYOTA CAMRY 2023');
    expect(compatibilityText).toContain('FUSO CANTER 2020');
    expect(compatibilityText).toContain('NISSAN SENTRA 2022');
  });

  test('should show alert when custom marca is empty', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('marca/modelo personalizado');
      await dialog.accept();
    });

    // Select "Otro" but don't fill in custom marca
    await rhinoPage.marcaSelect.selectOption('Otro');
    await rhinoPage.modeloSelect.selectOption('2020');
    
    // Try to add without filling custom marca
    await rhinoPage.addCompatibilityButton.click();
  });

  test('should clear custom input after adding but keep "Otro" selected', async () => {
    // Add a custom compatibility
    await rhinoPage.addCustomCompatibility('Fuso Canter', '2020');

    // After adding, "Otro" should still be selected
    const marcaValue = await rhinoPage.marcaSelect.inputValue();
    expect(marcaValue).toBe('Otro');

    // Custom input should be cleared
    const customInputValue = await rhinoPage.customMarcaInput.inputValue();
    expect(customInputValue).toBe('');

    // Modelo (year) should also be cleared
    const modeloValue = await rhinoPage.modeloSelect.inputValue();
    expect(modeloValue).toBe('');
  });

  test('should prevent duplicate custom entries', async ({ page }) => {
    // Add first custom compatibility
    await rhinoPage.addCustomCompatibility('Fuso Canter', '2020');

    // Try to add the same custom compatibility again
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('ya existe');
      await dialog.accept();
    });

    await rhinoPage.customMarcaInput.fill('Fuso Canter');
    await rhinoPage.modeloSelect.selectOption('2020');
    await rhinoPage.addCompatibilityButton.click();

    // Should still only have 1
    await expect(rhinoPage.compatibilityCount).toContainText('(1)');
  });

  test('should delete custom compatibility entry', async () => {
    await rhinoPage.addCustomCompatibility('Fuso Canter', '2020');
    await rhinoPage.addCustomCompatibility('Howo Sinotruk', '2021');

    await expect(rhinoPage.compatibilityCount).toContainText('(2)');

    // Delete first custom item
    await rhinoPage.deleteCompatibilityByIndex(0);

    await expect(rhinoPage.compatibilityCount).toContainText('(1)');
    
    // First item should be gone - scope to the list container
    const deletedItem = rhinoPage.compatibilitySection
      .locator('.space-y-2')
      .getByText('Fuso Canter 2020', { exact: false });
    await expect(deletedItem).not.toBeVisible();
    
    // Second item should still exist - scope to the list container
    const remainingItem = rhinoPage.compatibilitySection
      .locator('.space-y-2')
      .getByText('Howo Sinotruk 2021', { exact: false });
    await expect(remainingItem.first()).toBeVisible();
  });

  test('should switch back to Sub-Modelo when selecting a regular brand after "Otro"', async () => {
    // First select "Otro"
    await rhinoPage.marcaSelect.selectOption('Otro');
    await expect(rhinoPage.customMarcaInput).toBeVisible();
    expect(await rhinoPage.isSubModeloSelectVisible()).toBe(false);

    // Now select a regular brand
    await rhinoPage.marcaSelect.selectOption('Toyota');

    // Sub-Modelo should be visible again
    await expect(rhinoPage.subModeloSelect).toBeVisible();
    await expect(rhinoPage.subModeloSelect).toBeEnabled();
    
    // Custom input should be hidden
    expect(await rhinoPage.isCustomMarcaInputVisible()).toBe(false);
  });

  test('should display custom compatibility in uppercase', async () => {
    await rhinoPage.addCustomCompatibility('fuso canter', '2020');

    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('FUSO CANTER 2020');
  });

  test('should trim whitespace from custom marca input', async () => {
    await rhinoPage.marcaSelect.selectOption('Otro');
    await rhinoPage.customMarcaInput.fill('  Fuso Canter  ');
    await rhinoPage.modeloSelect.selectOption('2020');
    await rhinoPage.addCompatibilityButton.click();

    // The displayed text should be trimmed
    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('FUSO CANTER 2020');
  });
});

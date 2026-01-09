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
    await expect(rhinoPage.versionSelect).toBeVisible();
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

  test('should disable version until sub-modelo is selected', async () => {
    await expect(rhinoPage.versionSelect).toBeDisabled();
    
    await rhinoPage.marcaSelect.selectOption('Toyota');
    await expect(rhinoPage.versionSelect).toBeDisabled();
    
    await rhinoPage.subModeloSelect.selectOption('Camry');
    // Version should still be disabled because Camry has no versions
    await expect(rhinoPage.versionSelect).toBeDisabled();
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

test.describe('Product Compatibility - Version Field', () => {
  let rhinoPage: RhinoCodeGeneratorPage;

  test.beforeEach(async ({ page }) => {
    rhinoPage = new RhinoCodeGeneratorPage(page);
    await rhinoPage.goto();
  });

  test('should show version dropdown disabled when sub-modelo has no versions', async () => {
    await rhinoPage.marcaSelect.selectOption('Toyota');
    await rhinoPage.subModeloSelect.selectOption('Camry');
    
    // Version should be disabled because Camry has no versions defined
    await expect(rhinoPage.versionSelect).toBeDisabled();
    
    // Check placeholder text
    const versionPlaceholder = await rhinoPage.versionSelect.locator('option:checked').textContent();
    expect(versionPlaceholder).toContain('No hay versiones disponibles');
  });

  test('should enable version dropdown when sub-modelo has versions', async () => {
    await rhinoPage.marcaSelect.selectOption('Ram');
    await rhinoPage.subModeloSelect.selectOption('ProMaster');
    
    // Version should be enabled because ProMaster has versions
    await expect(rhinoPage.versionSelect).toBeEnabled();
  });

  test('should add compatibility with version', async () => {
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2020');

    // Check count updated
    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilidades Añadidas (1)');
    
    // Check item appears in list with version format (SUBMODELO-VERSION)
    await expect(rhinoPage.getCompatibilityInList('Ram ProMaster-1500 2020')).toBeVisible();
    
    // Check generated compatibility string
    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('RAM PROMASTER-1500 2020');
  });

  test('should add compatibility without version when version is optional', async () => {
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '', '2020');

    // Check item appears in list without version
    await expect(rhinoPage.getCompatibilityInList('Ram ProMaster 2020')).toBeVisible();
    
    // Check generated compatibility string (no hyphen)
    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('RAM PROMASTER 2020');
  });

  test('should handle multiple compatibilities with different versions', async () => {
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2020');
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '2500', '2020');
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '3500', '2021');

    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilidades Añadidas (3)');
    
    await expect(rhinoPage.getCompatibilityInList('Ram ProMaster-1500 2020')).toBeVisible();
    await expect(rhinoPage.getCompatibilityInList('Ram ProMaster-2500 2020')).toBeVisible();
    await expect(rhinoPage.getCompatibilityInList('Ram ProMaster-3500 2021')).toBeVisible();

    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toContain('RAM PROMASTER-1500 2020');
    expect(compatibilityText).toContain('RAM PROMASTER-2500 2020');
    expect(compatibilityText).toContain('RAM PROMASTER-3500 2021');
  });

  test('should mix compatibilities with and without versions', async () => {
    // Add compatibility with version
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2020');
    
    // Add compatibility without version (regular car)
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2021');
    
    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilidades Añadidas (2)');
    
    await expect(rhinoPage.getCompatibilityInList('Ram ProMaster-1500 2020')).toBeVisible();
    await expect(rhinoPage.getCompatibilityInList('Toyota Camry 2021')).toBeVisible();

    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toContain('RAM PROMASTER-1500 2020');
    expect(compatibilityText).toContain('TOYOTA CAMRY 2021');
  });

  test('should prevent duplicate compatibilities with same version', async ({ page }) => {
    // Add first compatibility with version
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2020');

    // Try to add same compatibility again
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('ya existe');
      await dialog.accept();
    });

    await rhinoPage.addCompatibilityButton.click();

    // Should still only have 1
    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilidades Añadidas (1)');
  });

  test('should allow same submodel with different versions', async () => {
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2020');
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '2500', '2020');

    // Should have 2 different entries
    await expect(rhinoPage.compatibilityCount).toContainText('Compatibilidades Añadidas (2)');
  });

  test('should reset version when sub-modelo changes', async () => {
    await rhinoPage.marcaSelect.selectOption('Ram');
    await rhinoPage.subModeloSelect.selectOption('ProMaster');
    await rhinoPage.versionSelect.selectOption('1500');
    
    // Change sub-modelo
    await rhinoPage.subModeloSelect.selectOption('1500');
    
    // Version should be reset
    const versionValue = await rhinoPage.versionSelect.inputValue();
    expect(versionValue).toBe('');
  });

  test('should reset version and sub-modelo when marca changes', async () => {
    await rhinoPage.marcaSelect.selectOption('Ram');
    await rhinoPage.subModeloSelect.selectOption('ProMaster');
    await rhinoPage.versionSelect.selectOption('1500');
    
    // Change marca
    await rhinoPage.marcaSelect.selectOption('Toyota');
    
    // Sub-modelo and version should be reset
    const subModeloValue = await rhinoPage.subModeloSelect.inputValue();
    const versionValue = await rhinoPage.versionSelect.inputValue();
    expect(subModeloValue).toBe('');
    expect(versionValue).toBe('');
  });

  test('should test Ford Transit versions', async () => {
    await rhinoPage.addCompatibilityWithVersion('Ford', 'Transit', '350', '2022');
    
    await expect(rhinoPage.getCompatibilityInList('Ford Transit-350 2022')).toBeVisible();
    
    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('FORD TRANSIT-350 2022');
  });

  test('should test Mercedes-Benz Sprinter versions', async () => {
    await rhinoPage.addCompatibilityWithVersion('Mercedes-Benz', 'Sprinter', '2500', '2023');
    
    await expect(rhinoPage.getCompatibilityInList('Mercedes-Benz Sprinter-2500 2023')).toBeVisible();
    
    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('MERCEDES-BENZ SPRINTER-2500 2023');
  });

  test('should test Chevrolet Silverado versions', async () => {
    await rhinoPage.addCompatibilityWithVersion('Chevrolet', 'Silverado', '1500', '2024');
    
    await expect(rhinoPage.getCompatibilityInList('Chevrolet Silverado-1500 2024')).toBeVisible();
    
    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('CHEVROLET SILVERADO-1500 2024');
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

  test('should hide Sub-Modelo and Version, show custom input when "Otro" is selected', async () => {
    // Initially, Sub-Modelo and Version should be visible (though disabled)
    await expect(rhinoPage.subModeloSelect).toBeVisible();
    await expect(rhinoPage.versionSelect).toBeVisible();
    
    // Custom input should not be visible initially
    expect(await rhinoPage.isCustomMarcaInputVisible()).toBe(false);

    // Select "Otro"
    await rhinoPage.marcaSelect.selectOption('Otro');

    // Now custom input should be visible
    await expect(rhinoPage.customMarcaInput).toBeVisible();
    
    // Sub-Modelo and Version should be hidden (not just disabled)
    expect(await rhinoPage.isSubModeloSelectVisible()).toBe(false);
    expect(await rhinoPage.isVersionSelectVisible()).toBe(false);
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

  test('should mix regular, versioned, and custom compatibility entries', async () => {
    // Add a regular compatibility (no version)
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2023');
    
    // Add a versioned compatibility
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2022');
    
    // Add a custom compatibility
    await rhinoPage.addCustomCompatibility('Fuso Canter', '2020');
    
    // Add another regular compatibility
    await rhinoPage.addCompatibility('Nissan', 'Sentra', '2021');

    await expect(rhinoPage.compatibilityCount).toContainText('(4)');

    // Verify all entries are in the list
    await expect(rhinoPage.getCompatibilityInList('Toyota Camry 2023')).toBeVisible();
    await expect(rhinoPage.getCompatibilityInList('Ram ProMaster-1500 2022')).toBeVisible();
    // For custom entries, scope to the list container
    const customItem = rhinoPage.compatibilitySection
      .locator('.space-y-2')
      .getByText('Fuso Canter 2020', { exact: false });
    await expect(customItem.first()).toBeVisible();
    await expect(rhinoPage.getCompatibilityInList('Nissan Sentra 2021')).toBeVisible();

    // Check generated string includes all
    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toContain('TOYOTA CAMRY 2023');
    expect(compatibilityText).toContain('RAM PROMASTER-1500 2022');
    expect(compatibilityText).toContain('FUSO CANTER 2020');
    expect(compatibilityText).toContain('NISSAN SENTRA 2021');
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

  test('should switch back to Sub-Modelo and Version when selecting a regular brand after "Otro"', async () => {
    // First select "Otro"
    await rhinoPage.marcaSelect.selectOption('Otro');
    await expect(rhinoPage.customMarcaInput).toBeVisible();
    expect(await rhinoPage.isSubModeloSelectVisible()).toBe(false);
    expect(await rhinoPage.isVersionSelectVisible()).toBe(false);

    // Now select a regular brand
    await rhinoPage.marcaSelect.selectOption('Toyota');

    // Sub-Modelo and Version should be visible again
    await expect(rhinoPage.subModeloSelect).toBeVisible();
    await expect(rhinoPage.subModeloSelect).toBeEnabled();
    await expect(rhinoPage.versionSelect).toBeVisible();
    
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

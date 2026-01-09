import { test, expect } from '@playwright/test';
import { RhinoCodeGeneratorPage } from './page-objects/RhinoCodeGeneratorPage';

test.describe('Integration Tests - Cross-Section Functionality', () => {
  let rhinoPage: RhinoCodeGeneratorPage;

  test.beforeEach(async ({ page }) => {
    rhinoPage = new RhinoCodeGeneratorPage(page);
    await rhinoPage.goto();
  });

  test('should complete full workflow from code generation to description', async () => {
    // Step 1: Fill Code Generator
    await rhinoPage.fillCodeGenerator({
      clasificacion: 'R',
      parte: 's',
      numero: '12345',
      color: 'GT',
      aditamento: 'Y'
    });

    const codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toBe('RS12345GTY');

    // Step 2: Add Compatibilities
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2021');

    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('TOYOTA CAMRY 2020, TOYOTA CAMRY 2021');

    // Step 3: Fill Product Description
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });

    // Step 4: Verify complete description includes everything
    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toBe('SIDE FRONT LEFT TOYOTA CAMRY 2020, 2021');
  });

  test('should complete full workflow with versioned compatibilities', async () => {
    // Step 1: Fill Code Generator
    await rhinoPage.fillCodeGenerator({
      clasificacion: 'R',
      parte: 's',
      numero: '54321',
      color: 'YT',
      aditamento: 'N'
    });

    const codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toBe('RS54321YTN');

    // Step 2: Add Compatibilities with versions
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2020');
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2021');

    const compatibilityText = await rhinoPage.getGeneratedCompatibilityText();
    expect(compatibilityText).toBe('RAM PROMASTER-1500 2020, RAM PROMASTER-1500 2021');

    // Step 3: Fill Product Description
    await rhinoPage.fillProductDescription({
      posicion: 'Rear',
      lado: 'Right'
    });

    // Step 4: Verify complete description includes version with hyphen format
    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toBe('SIDE REAR RIGHT RAM PROMASTER-1500 2020, 2021');
  });

  test('should update description when parte changes in Code Generator', async () => {
    // Fill description fields first
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });
    // Using Nissan instead of Honda (Honda doesn't exist in carBrands.tsx)
    await rhinoPage.addCompatibility('Nissan', 'Altima', '2022');

    // Change parte in Code Generator
    await rhinoPage.parteSide.click();
    let descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('SIDE');

    // Change to Door
    await rhinoPage.parteDoor.click();
    descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('DOOR');
    expect(descriptionText).not.toContain('SIDE');
  });

  test('should handle complex compatibility scenarios', async () => {
    await rhinoPage.parteSide.click();
    await rhinoPage.fillProductDescription({
      posicion: 'Rear',
      lado: 'Right'
    });

    // Add various compatibilities - using brands that exist in carBrands.tsx
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2022');
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2021'); // Out of order
    await rhinoPage.addCompatibility('Nissan', 'Altima', '2023');
    await rhinoPage.addCompatibility('Chevrolet', 'Malibu', '2024');

    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    
    // Verify grouping and sorting
    expect(descriptionText).toContain('TOYOTA CAMRY 2020, 2021, 2022');
    expect(descriptionText).toContain('NISSAN ALTIMA 2023');
    expect(descriptionText).toContain('CHEVROLET MALIBU 2024');
  });

  test('should handle complex compatibility scenarios with versions', async () => {
    await rhinoPage.parteSide.click();
    await rhinoPage.fillProductDescription({
      posicion: 'Rear',
      lado: 'Right'
    });

    // Add various compatibilities with versions
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2020');
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2022');
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2021'); // Out of order
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '2500', '2023');
    await rhinoPage.addCompatibilityWithVersion('Ford', 'Transit', '350', '2024');

    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    
    // Verify grouping and sorting - each version is grouped separately
    expect(descriptionText).toContain('RAM PROMASTER-1500 2020, 2021, 2022');
    expect(descriptionText).toContain('RAM PROMASTER-2500 2023');
    expect(descriptionText).toContain('FORD TRANSIT-350 2024');
  });

  test('should handle mixed compatibilities (regular, versioned, custom)', async () => {
    await rhinoPage.parteSide.click();
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });

    // Regular compatibility (no version)
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    
    // Versioned compatibility
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2021');
    
    // Custom compatibility
    await rhinoPage.addCustomCompatibility('Fuso Canter', '2022');

    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    
    expect(descriptionText).toContain('TOYOTA CAMRY 2020');
    expect(descriptionText).toContain('RAM PROMASTER-1500 2021');
    expect(descriptionText).toContain('FUSO CANTER 2022');
  });

  test('Global Clean All button should clear everything', async () => {
    // Fill all sections
    await rhinoPage.fillCodeGenerator({
      clasificacion: 'R',
      parte: 'v',
      numero: '99999',
      color: 'CL',
      aditamento: 'N'
    });

    // Using brands that exist in carBrands.tsx - including versioned
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2021');

    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });

    // Verify everything is filled
    expect(await rhinoPage.getGeneratedCodeText()).toBe('RV99999CLN');
    expect(await rhinoPage.compatibilityCount.textContent()).toContain('(2)');
    expect(await rhinoPage.getGeneratedDescriptionText()).toContain('VENT FRONT LEFT');

    // Click Clean All
    await rhinoPage.clickCleanAll();

    // Verify everything is cleared
    const codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toMatch(/[-]{5,}/); // Should have dashes

    expect(await rhinoPage.compatibilityCount.textContent()).toContain('(0)');
    expect(await rhinoPage.getGeneratedCompatibilityText()).toBe('---');

    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('-');

    // Verify Code Generator form fields are cleared
    expect(await rhinoPage.numeroInput.inputValue()).toBe('');
    
    // Verify ProductCompatibility form fields are also cleared
    expect(await rhinoPage.marcaSelect.inputValue()).toBe('');
  });

  test('should maintain state consistency across sections', async () => {
    // Set parte in Code Generator
    await rhinoPage.parteSide.click();

    // Verify it appears in description immediately
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });
    let descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('SIDE');

    // Change parte
    await rhinoPage.parteBack.click();

    // Description should update
    descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('BACK');
    expect(descriptionText).not.toContain('SIDE');
  });

  test('should handle deletion of compatibility and update description', async () => {
    await rhinoPage.parteSide.click();
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });

    // Using brands that exist in carBrands.tsx
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    await rhinoPage.addCompatibility('Nissan', 'Altima', '2021');

    // Verify both in description
    let descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('TOYOTA CAMRY 2020');
    expect(descriptionText).toContain('NISSAN ALTIMA 2021');

    // Delete first compatibility
    await rhinoPage.deleteCompatibilityByIndex(0);

    // Description should update
    descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).not.toContain('TOYOTA CAMRY 2020');
    expect(descriptionText).toContain('NISSAN ALTIMA 2021');
  });

  test('should handle deletion of versioned compatibility and update description', async () => {
    await rhinoPage.parteSide.click();
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });

    // Add versioned compatibilities
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2020');
    await rhinoPage.addCompatibilityWithVersion('Ford', 'Transit', '350', '2021');

    // Verify both in description
    let descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('RAM PROMASTER-1500 2020');
    expect(descriptionText).toContain('FORD TRANSIT-350 2021');

    // Delete first compatibility
    await rhinoPage.deleteCompatibilityByIndex(0);

    // Description should update
    descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).not.toContain('RAM PROMASTER-1500 2020');
    expect(descriptionText).toContain('FORD TRANSIT-350 2021');
  });

  test('should generate realistic complete product spec', async () => {
    // Realistic scenario: Creating a spec for a Toyota Camry windshield
    
    // Code Generation
    await rhinoPage.fillCodeGenerator({
      clasificacion: 'R',
      parte: 's',
      numero: '50001',
      color: 'GT',
      aditamento: 'Y'
    });

    // Compatibilities - Multiple years of Camry
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2018');
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2019');
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2021');

    // Description
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });

    // Verify complete outputs
    expect(await rhinoPage.getGeneratedCodeText()).toBe('RS50001GTY');
    expect(await rhinoPage.getGeneratedCompatibilityText()).toBe('TOYOTA CAMRY 2018, TOYOTA CAMRY 2019, TOYOTA CAMRY 2020, TOYOTA CAMRY 2021');
    expect(await rhinoPage.getGeneratedDescriptionText()).toBe('SIDE FRONT LEFT TOYOTA CAMRY 2018, 2019, 2020, 2021');
  });

  test('should generate realistic complete product spec for commercial van', async () => {
    // Realistic scenario: Creating a spec for a Ram ProMaster cargo van windshield
    
    // Code Generation
    await rhinoPage.fillCodeGenerator({
      clasificacion: 'R',
      parte: 's',
      numero: '60001',
      color: 'CL',
      aditamento: 'N'
    });

    // Compatibilities - Multiple years of ProMaster 1500
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2019');
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2020');
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2021');
    await rhinoPage.addCompatibilityWithVersion('Ram', 'ProMaster', '1500', '2022');

    // Description
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Right'
    });

    // Verify complete outputs
    expect(await rhinoPage.getGeneratedCodeText()).toBe('RS60001CLN');
    expect(await rhinoPage.getGeneratedCompatibilityText()).toBe('RAM PROMASTER-1500 2019, RAM PROMASTER-1500 2020, RAM PROMASTER-1500 2021, RAM PROMASTER-1500 2022');
    expect(await rhinoPage.getGeneratedDescriptionText()).toBe('SIDE FRONT RIGHT RAM PROMASTER-1500 2019, 2020, 2021, 2022');
  });
});

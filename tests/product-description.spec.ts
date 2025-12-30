import { test, expect } from '@playwright/test';
import { RhinoCodeGeneratorPage } from './page-objects/RhinoCodeGeneratorPage';

test.describe('Product Description Section', () => {
  let rhinoPage: RhinoCodeGeneratorPage;

  test.beforeEach(async ({ page }) => {
    rhinoPage = new RhinoCodeGeneratorPage(page);
    await rhinoPage.goto();
  });

  test('should display all description fields', async () => {
    await expect(rhinoPage.descriptionHeading).toBeVisible();
    await expect(rhinoPage.posicionFront).toBeVisible();
    await expect(rhinoPage.posicionRear).toBeVisible();
    await expect(rhinoPage.ladoLeft).toBeVisible();
    await expect(rhinoPage.ladoRight).toBeVisible();
    await expect(rhinoPage.generatedDescription).toBeVisible();
  });

  test('should show dashes for empty fields', async () => {
    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('-');
  });

  test('should generate description with posicion and lado', async () => {
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });

    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('FRONT');
    expect(descriptionText).toContain('LEFT');
  });

  test('should include parte from Code Generator', async () => {
    // Select parte in Code Generator
    await rhinoPage.parteSide.click();

    // Fill Product Description
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });

    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toBe('SIDE FRONT LEFT');
  });

  test('should include single compatibility in description', async () => {
    // Select parte
    await rhinoPage.parteSide.click();

    // Fill description fields
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });

    // Add compatibility
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');

    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toBe('SIDE FRONT LEFT TOYOTA CAMRY 2020');
  });

  test('should group multiple years of same model intelligently', async () => {
    await rhinoPage.parteSide.click();
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });

    // Add multiple years of same model
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2021');
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2022');

    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toBe('SIDE FRONT LEFT TOYOTA CAMRY 2020, 2021, 2022');
  });

  test('should group compatibilities by marca and sub-modelo', async () => {
    await rhinoPage.parteSide.click();
    await rhinoPage.fillProductDescription({
      posicion: 'Rear',
      lado: 'Right'
    });

    // Add different models - using brands that exist in carBrands.tsx
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2021');
    await rhinoPage.addCompatibility('Nissan', 'Altima', '2022');
    await rhinoPage.addCompatibility('Nissan', 'Altima', '2023');

    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    
    // Should group by marca + subModelo
    expect(descriptionText).toContain('TOYOTA CAMRY 2020, 2021');
    expect(descriptionText).toContain('NISSAN ALTIMA 2022, 2023');
    expect(descriptionText).toBe('SIDE REAR RIGHT TOYOTA CAMRY 2020, 2021 NISSAN ALTIMA 2022, 2023');
  });

  test('should sort years in ascending order within groups', async () => {
    await rhinoPage.parteDoor.click();
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Right'
    });

    // Add years out of order
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2023');
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2021');

    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    // Should be sorted ascending
    expect(descriptionText).toBe('DOOR FRONT RIGHT TOYOTA CAMRY 2020, 2021, 2023');
  });

  test('should update description in real-time when compatibility changes', async () => {
    await rhinoPage.parteSide.click();
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });

    // Initial state
    let descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toBe('SIDE FRONT LEFT');

    // Add compatibility
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toBe('SIDE FRONT LEFT TOYOTA CAMRY 2020');

    // Add another
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2021');
    descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toBe('SIDE FRONT LEFT TOYOTA CAMRY 2020, 2021');

    // Delete first compatibility
    await rhinoPage.deleteCompatibilityByIndex(0);
    descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toBe('SIDE FRONT LEFT TOYOTA CAMRY 2021');
  });

  test('should display description in uppercase', async () => {
    await rhinoPage.parteVent.click();
    await rhinoPage.fillProductDescription({
      posicion: 'Rear',
      lado: 'Left'
    });
    // Using Nissan instead of Honda (Honda doesn't exist in carBrands.tsx)
    await rhinoPage.addCompatibility('Nissan', 'Altima', '2022');

    const descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toEqual(descriptionText?.toUpperCase());
  });

  test('should handle all parte options correctly', async () => {
    await rhinoPage.fillProductDescription({
      posicion: 'Front',
      lado: 'Left'
    });

    // Test Side
    await rhinoPage.parteSide.click();
    let descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('SIDE');

    // Test Back
    await rhinoPage.parteBack.click();
    descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('BACK');

    // Test Door
    await rhinoPage.parteDoor.click();
    descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('DOOR');

    // Test Quarter
    await rhinoPage.parteQuarter.click();
    descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('QUARTER');

    // Test Vent
    await rhinoPage.parteVent.click();
    descriptionText = await rhinoPage.getGeneratedDescriptionText();
    expect(descriptionText).toContain('VENT');
  });
});

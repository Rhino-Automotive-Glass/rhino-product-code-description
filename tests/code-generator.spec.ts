import { test, expect } from '@playwright/test';
import { RhinoCodeGeneratorPage } from './page-objects/RhinoCodeGeneratorPage';

test.describe('Code Generator Section', () => {
  let rhinoPage: RhinoCodeGeneratorPage;

  test.beforeEach(async ({ page }) => {
    rhinoPage = new RhinoCodeGeneratorPage(page);
    await rhinoPage.goto();
  });

  test('should display all code generator fields', async () => {
    await expect(rhinoPage.codeGeneratorHeading).toBeVisible();
    await expect(rhinoPage.clasificacionDomestico).toBeVisible();
    await expect(rhinoPage.numeroInput).toBeVisible();
    await expect(rhinoPage.colorSelect).toBeVisible();
    await expect(rhinoPage.generatedCode).toBeVisible();
  });

  test('should show dashes for empty generated code', async () => {
    const codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toMatch(/[-]{5,}/); // Should contain dashes
  });

  test('should generate code in real-time as fields are filled', async () => {
    // Fill clasificacion
    await rhinoPage.clasificacionRhino.click();
    let codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toContain('R');

    // Fill parte
    await rhinoPage.parteVent.click();
    codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toContain('RV');

    // Fill numero
    await rhinoPage.numeroInput.fill('123');
    codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toContain('00123'); // Should be padded

    // Fill color
    await rhinoPage.colorSelect.selectOption('GT');
    codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toContain('GT');

    // Fill aditamento
    await rhinoPage.aditamentoY.click();
    codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toBe('RV00123GTY');
  });

  test('should pad numbers with leading zeros', async () => {
    await rhinoPage.clasificacionRhino.click();
    await rhinoPage.parteSide.click();
    await rhinoPage.numeroInput.fill('1');
    await rhinoPage.colorSelect.selectOption('CL');
    await rhinoPage.aditamentoN.click();

    const codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toBe('RS00001CLN');
  });

  test('should only allow 5 digits in numero field', async () => {
    await rhinoPage.numeroInput.fill('123456789');
    const value = await rhinoPage.numeroInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(5);
  });

  test('should generate uppercase code', async () => {
    await rhinoPage.fillCodeGenerator({
      clasificacion: 'R',
      parte: 'v',
      numero: '12345',
      color: 'GT',
      aditamento: 'Y'
    });

    const codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toBe('RV12345GTY');
    expect(codeText).toEqual(codeText?.toUpperCase());
  });

  test('should generate complete code with all options', async () => {
    // Test Doméstico
    await rhinoPage.fillCodeGenerator({
      clasificacion: 'D',
      parte: 'b',
      numero: '99999',
      color: 'YT',
      aditamento: 'N'
    });
    let codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toBe('DB99999YTN');

    // Test Foránea
    await rhinoPage.fillCodeGenerator({
      clasificacion: 'F',
      parte: 'q',
      numero: '54321',
      color: 'YP',
      aditamento: 'Y'
    });
    codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toBe('FQ54321YPY');
  });

  test('should support F (Fixed) aditamento option - code stops at color', async () => {
    await rhinoPage.fillCodeGenerator({
      clasificacion: 'D',
      parte: 'b',
      numero: '12345',
      color: 'GT',
      aditamento: 'F'
    });
    const codeText = await rhinoPage.getGeneratedCodeText();
    expect(codeText).toBe('DB12345GT'); // No aditamento suffix
  });

  test('should display Aditamento options with descriptive labels', async () => {
    await expect(rhinoPage.aditamentoY).toBeVisible();
    await expect(rhinoPage.aditamentoN).toBeVisible();
    await expect(rhinoPage.aditamentoF).toBeVisible();
  });
});

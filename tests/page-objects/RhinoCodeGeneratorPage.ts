import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Rhino Code Generator Application
 * This class provides methods to interact with all three sections of the app
 * 
 * SELECTOR STRATEGY:
 * - Uses getByRole() for semantic elements (buttons, headings, radios)
 * - Uses data-testid attributes for form elements (most robust approach)
 * - Scopes selects to their parent section to avoid ambiguity
 */
export class RhinoCodeGeneratorPage {
  readonly page: Page;

  // Header elements
  readonly headerTitle: Locator;

  // Action Buttons (now in main content, below forms)
  readonly agregarButton: Locator;
  readonly limpiarButton: Locator;

  // Generated Output Display (single row with code, description, and buttons)
  readonly generatedOutputCard: Locator;
  readonly generatedCode: Locator;
  readonly generatedDescription: Locator;

  // Code Generator elements (now includes Product Description fields)
  readonly codeGeneratorHeading: Locator;
  readonly clasificacionDomestico: Locator;
  readonly clasificacionForanea: Locator;
  readonly clasificacionRhino: Locator;
  readonly parteSide: Locator;
  readonly parteBack: Locator;
  readonly parteDoor: Locator;
  readonly parteQuarter: Locator;
  readonly parteVent: Locator;
  readonly numeroInput: Locator;
  readonly colorSelect: Locator;
  readonly aditamentoY: Locator;
  readonly aditamentoN: Locator;
  readonly aditamentoF: Locator;
  readonly posicionFront: Locator;
  readonly posicionRear: Locator;
  readonly ladoLeft: Locator;
  readonly ladoRight: Locator;

  // Product Compatibility elements
  readonly compatibilityHeading: Locator;
  readonly compatibilitySection: Locator;
  readonly marcaSelect: Locator;
  readonly subModeloSelect: Locator;
  readonly subModeloContainer: Locator;
  readonly versionSelect: Locator;
  readonly versionContainer: Locator;
  readonly modeloSelect: Locator;
  readonly customMarcaInput: Locator;
  readonly customMarcaContainer: Locator;
  readonly addCompatibilityButton: Locator;
  readonly compatibilityList: Locator;
  readonly compatibilityCount: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.headerTitle = page.getByRole('heading', { name: 'Rhino Code' });

    // Action Buttons (in main content area, next to generated output)
    this.agregarButton = page.getByRole('button', { name: 'Agregar' });
    this.limpiarButton = page.getByRole('button', { name: 'Limpiar' });

    // Generated Output Display (single horizontal row)
    // More specific locators to avoid ambiguity
    this.generatedOutputCard = page.locator('.card').filter({ 
      has: page.getByText('CÓDIGO RHINO', { exact: false }) 
    });
    // Use more specific selectors based on the actual structure
    this.generatedCode = page.getByText('Código Rhino').locator('..').locator('p.font-mono').first();
    this.generatedDescription = page.getByText('Descripción del Producto').locator('..').locator('p.font-mono').first();

    // Code Generator (now includes Product Description fields)
    this.codeGeneratorHeading = page.getByRole('heading', { name: 'Product Details' });
    this.clasificacionDomestico = page.getByRole('radio', { name: /D - Doméstico/ });
    this.clasificacionForanea = page.getByRole('radio', { name: /F - Foránea/ });
    this.clasificacionRhino = page.getByRole('radio', { name: /R - Rhino Automotive/ });
    this.parteSide = page.getByRole('radio', { name: /S - Side/ });
    this.parteBack = page.getByRole('radio', { name: /B - Back/ });
    this.parteDoor = page.getByRole('radio', { name: /D - Door/ });
    this.parteQuarter = page.getByRole('radio', { name: /Q - Quarter/ });
    this.parteVent = page.getByRole('radio', { name: /V - Vent/ });
    this.numeroInput = page.getByPlaceholder('00000');
    this.colorSelect = page.locator('select').filter({ hasText: 'Select...GT' });
    this.aditamentoY = page.getByRole('radio', { name: /Y - Yes/ });
    this.aditamentoN = page.getByRole('radio', { name: /N - No/ });
    this.aditamentoF = page.getByRole('radio', { name: /F - Fixed/ });
    this.posicionFront = page.getByRole('radio', { name: 'Front' });
    this.posicionRear = page.getByRole('radio', { name: 'Rear' });
    this.ladoLeft = page.getByRole('radio', { name: 'Left' });
    this.ladoRight = page.getByRole('radio', { name: 'Right' });

    // Product Compatibility - Using data-testid attributes (most robust approach)
    this.compatibilityHeading = page.getByRole('heading', { name: 'Product Compatibility' });
    
    // Scope to Product Compatibility section using the card container
    this.compatibilitySection = page.locator('.card').filter({ 
      has: page.getByRole('heading', { name: 'Product Compatibility' }) 
    });
    
    // Use data-testid attributes for reliable element selection
    this.marcaSelect = page.getByTestId('marca-select');
    this.subModeloSelect = page.getByTestId('sub-modelo-select');
    this.subModeloContainer = page.getByTestId('sub-modelo-container');
    this.versionSelect = page.getByTestId('version-select');
    this.versionContainer = page.getByTestId('version-container');
    this.modeloSelect = page.getByTestId('modelo-select');
    this.customMarcaInput = page.getByTestId('custom-marca-input');
    this.customMarcaContainer = page.getByTestId('custom-marca-container');

    this.addCompatibilityButton = page.getByRole('button', { name: 'Añadir Compatibilidad' });
    this.compatibilityList = page.locator('div').filter({ hasText: /Compatibilidades Añadidas/ });
    this.compatibilityCount = page.getByText(/Compatibilidades Añadidas \(\d+\)/);
  }

  // Navigation
  async goto() {
    await this.page.goto('/', { waitUntil: 'networkidle' });
    // Wait for the page to be fully loaded - just check the heading is visible
    await this.compatibilityHeading.waitFor({ state: 'visible' });
    // Wait for at least one combobox to be visible in the compatibility section
    await this.marcaSelect.waitFor({ state: 'visible' });
  }

  // Code Generator actions
  async fillCodeGenerator(options: {
    clasificacion?: 'D' | 'F' | 'R';
    parte?: 's' | 'b' | 'd' | 'q' | 'v';
    numero?: string;
    color?: 'GT' | 'YT' | 'YP' | 'CL';
    aditamento?: 'Y' | 'N' | 'F';
  }) {
    if (options.clasificacion === 'D') await this.clasificacionDomestico.click();
    if (options.clasificacion === 'F') await this.clasificacionForanea.click();
    if (options.clasificacion === 'R') await this.clasificacionRhino.click();

    if (options.parte === 's') await this.parteSide.click();
    if (options.parte === 'b') await this.parteBack.click();
    if (options.parte === 'd') await this.parteDoor.click();
    if (options.parte === 'q') await this.parteQuarter.click();
    if (options.parte === 'v') await this.parteVent.click();

    if (options.numero) await this.numeroInput.fill(options.numero);
    if (options.color) await this.colorSelect.selectOption(options.color);

    if (options.aditamento === 'Y') await this.aditamentoY.click();
    if (options.aditamento === 'N') await this.aditamentoN.click();
    if (options.aditamento === 'F') await this.aditamentoF.click();
  }

  /**
   * Add a compatibility entry (without version)
   * 
   * This method includes explicit waits between select operations
   * to handle React's state updates and re-renders properly.
   */
  async addCompatibility(marca: string, subModelo: string, modelo: string) {
    // Step 1: Select Marca
    await this.marcaSelect.selectOption(marca);
    
    // Step 2: Wait for Sub-Modelo to be enabled (React needs to re-render after brand selection)
    await expect(this.subModeloSelect).toBeEnabled({ timeout: 5000 });
    
    // Step 3: Select Sub-Modelo
    await this.subModeloSelect.selectOption(subModelo);
    
    // Step 4: Select Modelo (Year) - skip version (it's optional)
    await this.modeloSelect.selectOption(modelo);
    
    // Step 5: Click the Add button
    await this.addCompatibilityButton.click();
    
    // Small buffer for React state update
    await this.page.waitForTimeout(100);
  }

  /**
   * Add a compatibility entry with version
   * 
   * This method includes explicit waits between select operations
   * to handle React's state updates and re-renders properly.
   */
  async addCompatibilityWithVersion(marca: string, subModelo: string, version: string, modelo: string) {
    // Step 1: Select Marca
    await this.marcaSelect.selectOption(marca);
    
    // Step 2: Wait for Sub-Modelo to be enabled (React needs to re-render after brand selection)
    await expect(this.subModeloSelect).toBeEnabled({ timeout: 5000 });
    
    // Step 3: Select Sub-Modelo
    await this.subModeloSelect.selectOption(subModelo);
    
    // Step 4: Wait for Version to be enabled (if it has versions)
    await this.page.waitForTimeout(100); // Small buffer for React state update
    
    // Step 5: Select Version (if enabled)
    const isVersionEnabled = await this.versionSelect.isEnabled();
    if (isVersionEnabled && version) {
      await this.versionSelect.selectOption(version);
    }
    
    // Step 6: Select Modelo (Year)
    await this.modeloSelect.selectOption(modelo);
    
    // Step 7: Click the Add button
    await this.addCompatibilityButton.click();
    
    // Small buffer for React state update
    await this.page.waitForTimeout(100);
  }

  /**
   * Add a custom compatibility entry using "Otro" option
   * 
   * This method selects "Otro" from the Marca dropdown,
   * fills in the custom brand/model input, and adds the compatibility.
   */
  async addCustomCompatibility(customMarcaText: string, modelo: string) {
    // Step 1: Select "Otro" from Marca dropdown
    await this.marcaSelect.selectOption('Otro');
    
    // Step 2: Wait for custom input to be visible
    await expect(this.customMarcaInput).toBeVisible({ timeout: 5000 });
    
    // Step 3: Fill in the custom marca/model
    await this.customMarcaInput.fill(customMarcaText);
    
    // Step 4: Select Modelo (Year)
    await this.modeloSelect.selectOption(modelo);
    
    // Step 5: Click the Add button
    await this.addCompatibilityButton.click();
    
    // Small buffer for React state update
    await this.page.waitForTimeout(100);
  }

  /**
   * Check if the custom marca input is visible
   */
  async isCustomMarcaInputVisible(): Promise<boolean> {
    return await this.customMarcaContainer.isVisible();
  }

  /**
   * Check if sub-modelo select is visible
   * Note: When "Otro" is selected, this element is removed from DOM entirely
   */
  async isSubModeloSelectVisible(): Promise<boolean> {
    return await this.subModeloContainer.isVisible();
  }

  /**
   * Check if version select is visible
   * Note: When "Otro" is selected, this element is removed from DOM entirely
   */
  async isVersionSelectVisible(): Promise<boolean> {
    return await this.versionContainer.isVisible();
  }

  /**
   * Delete a compatibility entry by its index
   * 
   * Uses getByRole to find all "Eliminar compatibilidad" buttons and clicks the one at the specified index
   */
  async deleteCompatibilityByIndex(index: number) {
    // Simple and direct: get all remove buttons and click the one at index
    const deleteButtons = this.compatibilitySection.getByRole('button', { name: 'Eliminar compatibilidad' });
    const targetButton = deleteButtons.nth(index);
    
    await expect(targetButton).toBeVisible({ timeout: 5000 });
    await targetButton.click();
    
    // Wait for the deletion to complete
    await this.page.waitForTimeout(100);
  }

  /**
   * Helper to get compatibility item text in the list
   */
  getCompatibilityInList(text: string) {
    return this.compatibilityList
      .locator('span.text-sm.font-medium.text-slate-900')
      .getByText(text, { exact: true });
  }

  // Product Description actions
  async fillProductDescription(options: {
    posicion?: 'Front' | 'Rear';
    lado?: 'Left' | 'Right';
  }) {
    if (options.posicion === 'Front') await this.posicionFront.click();
    if (options.posicion === 'Rear') await this.posicionRear.click();

    if (options.lado === 'Left') await this.ladoLeft.click();
    if (options.lado === 'Right') await this.ladoRight.click();
  }

  // Global actions
  async clickAgregar() {
    await this.agregarButton.click();
  }

  async clickLimpiar() {
    await this.limpiarButton.click();
  }

  // Assertions helpers
  async getGeneratedCodeText() {
    return await this.generatedCode.textContent();
  }

  async getGeneratedDescriptionText() {
    return await this.generatedDescription.textContent();
  }

  async getCompatibilityCountText() {
    return await this.compatibilityCount.textContent();
  }
}

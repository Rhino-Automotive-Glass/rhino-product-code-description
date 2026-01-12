# E2E Testing Guide

## Overview

This project uses **Playwright** for end-to-end testing. The test suite includes **61+ E2E tests** covering all application features.

**Last Updated:** January 2026 - After major UI restructure (v2.0)

## Test Coverage Summary

**Total: 61+ E2E tests** across **6 browser configurations**

| Test File | Tests | Status | Focus |
|-----------|-------|--------|-------|
| `code-generator.spec.ts` | 9 | ✅ Updated | Code generation + F aditamento |
| `guardar.spec.ts` | 20 | ✅ Updated | Agregar feature (renamed) |
| `product-compatibility.spec.ts` | 10 | ⚠️ Needs Review | Compatibility management |
| `product-description.spec.ts` | 10 | ⚠️ Needs Review | Description (merged component) |
| `integration.spec.ts` | 8 | ⚠️ Needs Review | Cross-section workflows |
| `responsive.spec.ts` | 8 | ⚠️ Needs Review | Layout responsiveness |

**Browser Coverage:**
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- iPad Pro

**Note:** By default, tests run on Chromium only for speed. Enable other browsers in `playwright.config.ts`.

---

## Quick Start

```bash
# Install dependencies (first time only)
npm install
npx playwright install

# Run all tests
npm test

# Run tests with UI (interactive mode) ⭐ RECOMMENDED
npm run test:ui

# Run tests with visible browser
npm run test:headed

# Debug mode (step through tests)
npm run test:debug

# View last test report
npm run test:report
```

---

## Recent Changes (v2.0)

### Major UI Restructure

The application underwent a major UI restructure that affects all tests:

**Button Changes:**
- ❌ `Guardar` → ✅ `Agregar` (Save → Add)
- ❌ `Clean All` → ✅ `Limpiar` (Clean)
- Buttons moved from header to generated output section
- Now side-by-side (not stacked)

**Component Changes:**
- ❌ `ProductDescription` component removed
- ✅ Fields merged into `CodeGenerator`
- ❌ `FloatingHeader` → ✅ `Header` (renamed)

**Layout Changes:**
- Forms: 3-column → 2-column grid
- Generated output: 2 separate boxes → 1 single-row layout
- Minimum height: 750px on both form containers

**New Features:**
- F (Fixed) aditamento option - code stops at color
- Descriptive labels: "Y - Yes", "N - No", "F - Fixed"
- Spanish labels: "Código Rhino", "Descripción del Producto"

---

## Test Files Breakdown

### ✅ `code-generator.spec.ts` (9 tests) - UPDATED
**Code Generator section functionality:**
- Field display validation
- Real-time code generation
- Number padding and validation
- Uppercase conversion
- Complete workflow
- **NEW:** F (Fixed) aditamento test
- **NEW:** Descriptive label visibility test
- Empty state handling

**Key Updates:**
```typescript
// New test for F (Fixed) aditamento
test('should support F (Fixed) aditamento option - code stops at color')

// Verifies all three aditamento options visible
test('should display Aditamento options with descriptive labels')
```

### ✅ `guardar.spec.ts` (20 tests) - RENAMED TO AGREGAR FEATURE
**Agregar (Add) feature functionality:**

**Button Visibility & Layout (4 tests):**
- Agregar button in generated output section (not header)
- Positioned left of Limpiar button
- Primary blue styling (`btn-primary`)
- Limpiar has secondary gray styling (`btn-secondary`)

**Console Logging - Empty Data (1 test):**
- Warning when clicking with no data

**Console Logging - With Data (4 tests):**
- Logs ProductData with code generator data
- Logs ProductData with compatibility data
- Logs ProductData with description data
- Logs complete ProductData with all sections

**Button Interactions (3 tests):**
- Data persists after add (doesn't clear)
- Works independently from Limpiar
- Can be clicked multiple times

**Responsive Behavior (3 tests):**
- Buttons visible on mobile (375px)
- Buttons visible on tablet (768px)
- Buttons visible on desktop (1920px)

**Keyboard Accessibility (2 tests):**
- Accessible via Tab navigation
- Clickable via Enter key

**Key Updates:**
```typescript
// All references updated
page.getByRole('button', { name: 'Agregar' })  // was 'Guardar'
page.getByRole('button', { name: 'Limpiar' })  // was 'Clean All'
await rhinoPage.clickAgregar();  // was clickGuardar()
await rhinoPage.clickLimpiar();  // was clickCleanAll()
```

### ⚠️ `product-compatibility.spec.ts` (10 tests) - NEEDS REVIEW
**Product Compatibility section functionality:**
- Form validation (all fields required)
- Add/delete compatibility entries
- Duplicate prevention
- Multi-brand support
- Custom compatibility ("Otro" option)
- Counter updates
- List display

**Potential Issues:**
- May reference old "generatedCompatibility" display (removed)
- Compatibility now only in main generated output
- Tests should focus on list within component

**Recommended Updates:**
- Remove inline generated compatibility display checks
- Verify compatibility list in component
- Check final description includes compatibility

### ⚠️ `product-description.spec.ts` (10 tests) - NEEDS REVIEW
**Product Description section functionality:**
- Description generation
- Parte field integration (shared with Code Generator)
- Intelligent compatibility grouping
- Year sorting (ascending order)
- Cross-section updates

**Potential Issues:**
- ProductDescription component no longer exists
- Fields merged into CodeGenerator
- Generated description in single-row output

**Recommended Updates:**
- Update locators to find Posición/Lado in CodeGenerator
- Remove ProductDescription heading references
- Verify description in single-row output card

### ⚠️ `integration.spec.ts` (8 tests) - NEEDS REVIEW
**Cross-section integration workflows:**
- End-to-end user flows
- State synchronization between sections
- Global Limpiar functionality (was Clean All)
- Complex multi-section scenarios
- Parte field sharing between sections

**Recommended Updates:**
- Update button names (Agregar/Limpiar)
- Update generated output location expectations
- Verify full workflow with new structure

### ⚠️ `responsive.spec.ts` (8 tests) - NEEDS REVIEW
**Responsive layout behavior:**
- Desktop layout (2 columns, ≥1024px) - was 3 columns
- Tablet layout (2 columns + wrapped, 768-1023px)
- Mobile layout (stacked, <768px)
- Font size consistency across viewports
- Button visibility on all screen sizes

**Recommended Updates:**
- Update grid assertions (3-col → 2-col)
- Verify single-row generated output on mobile
- Check buttons are side-by-side (not stacked)

---

## Test Structure

```
tests/
├── page-objects/
│   └── RhinoCodeGeneratorPage.ts   # Page Object Model (UPDATED)
├── code-generator.spec.ts           # ✅ Updated (9 tests)
├── guardar.spec.ts                  # ✅ Updated (20 tests)
├── product-compatibility.spec.ts    # ⚠️ Needs review (10 tests)
├── product-description.spec.ts      # ⚠️ Needs review (10 tests)
├── integration.spec.ts              # ⚠️ Needs review (8 tests)
└── responsive.spec.ts               # ⚠️ Needs review (8 tests)
```

---

## Updated Page Object Model

The `RhinoCodeGeneratorPage` class has been updated with new methods:

```typescript
const rhinoPage = new RhinoCodeGeneratorPage(page);
await rhinoPage.goto();

// Fill Code Generator (includes description fields now)
await rhinoPage.fillCodeGenerator({
  clasificacion: 'R',
  parte: 's',
  numero: '12345',
  color: 'GT',
  aditamento: 'F'  // NEW: F option available
});

// Description fields (now in CodeGenerator)
await rhinoPage.fillProductDescription({
  posicion: 'Front',
  lado: 'Left'
});

// Add Compatibility (unchanged)
await rhinoPage.addCompatibility('Honda', 'Accord', '2020');

// NEW: Updated button methods
await rhinoPage.clickAgregar();   // was clickGuardar()
await rhinoPage.clickLimpiar();   // was clickCleanAll()

// Get generated values (updated locators)
const code = await rhinoPage.getGeneratedCodeText();
const description = await rhinoPage.getGeneratedDescriptionText();
```

**New Locators:**
```typescript
// Aditamento options (updated labels)
rhinoPage.aditamentoY  // matches "Y - Yes"
rhinoPage.aditamentoN  // matches "N - No"
rhinoPage.aditamentoF  // NEW: matches "F - Fixed"

// Buttons (renamed)
rhinoPage.agregarButton  // was guardarButton
rhinoPage.limpiarButton  // was cleanAllButton

// Generated output (single row)
rhinoPage.generatedOutputCard  // single card container
rhinoPage.generatedCode        // código rhino text
rhinoPage.generatedDescription // descripción text
```

---

## Configuration

Configuration file: `playwright.config.ts`

Current settings:
- **Browser**: Chromium only (others commented out for speed)
- **Parallel**: Yes, with 4 workers locally
- **Timeout**: 30 seconds per test
- **Dev Server**: Auto-starts via `npm run dev`

### Enable Cross-Browser Testing

To test on multiple browsers, uncomment the projects in `playwright.config.ts`:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  // Uncomment these for cross-browser testing:
  // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  // { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  // { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  // { name: 'iPad', use: { ...devices['iPad Pro'] } },
],
```

---

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { RhinoCodeGeneratorPage } from './page-objects/RhinoCodeGeneratorPage';

test.describe('Feature Name', () => {
  let rhinoPage: RhinoCodeGeneratorPage;

  test.beforeEach(async ({ page }) => {
    rhinoPage = new RhinoCodeGeneratorPage(page);
    await rhinoPage.goto();
  });

  test('should do something specific', async () => {
    // Arrange
    await rhinoPage.fillCodeGenerator({ 
      parte: 's',
      aditamento: 'F'  // Use F for Fixed option
    });
    
    // Act
    await rhinoPage.addCompatibility('Honda', 'Accord', '2020');
    
    // Assert
    const code = await rhinoPage.getGeneratedCodeText();
    expect(code).toBe('RS00000GT'); // No aditamento with F
  });
});
```

### Testing F (Fixed) Aditamento

```typescript
test('should generate code without aditamento when F is selected', async () => {
  await rhinoPage.fillCodeGenerator({
    clasificacion: 'D',
    parte: 'b',
    numero: '12345',
    color: 'GT',
    aditamento: 'F'
  });
  
  const code = await rhinoPage.getGeneratedCodeText();
  expect(code).toBe('DB12345GT'); // Stops at color
});
```

### Testing New Button Names

```typescript
test('should add product when Agregar is clicked', async () => {
  await rhinoPage.fillCodeGenerator({
    clasificacion: 'D',
    parte: 's',
    numero: '123',
    color: 'GT',
    aditamento: 'Y'
  });
  
  await rhinoPage.clickAgregar(); // Not clickGuardar
  
  // Verify product added to table
  const tableRow = page.getByText('DS00123GTY');
  await expect(tableRow).toBeVisible();
});
```

---

## Running Specific Tests

```bash
# Run updated tests first
npm test -- code-generator.spec.ts
npm test -- guardar.spec.ts

# Run tests needing review
npm test -- product-compatibility.spec.ts
npm test -- product-description.spec.ts
npm test -- integration.spec.ts
npm test -- responsive.spec.ts

# Run tests matching pattern
npm test -- -g "should support F"
npm test -- -g "Agregar"

# Run specific test group
npm test -- guardar.spec.ts -g "Button Visibility"
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Button not found: "Guardar"

**Cause**: Button has been renamed to "Agregar"

**Solution**: 
```typescript
// ❌ Old
page.getByRole('button', { name: 'Guardar' })

// ✅ New
page.getByRole('button', { name: 'Agregar' })
```

#### 2. Button not found: "Clean All"

**Cause**: Button has been renamed to "Limpiar"

**Solution**:
```typescript
// ❌ Old
page.getByRole('button', { name: 'Clean All' })

// ✅ New
page.getByRole('button', { name: 'Limpiar' })
```

#### 3. Aditamento radio button not found

**Cause**: Labels now include descriptions

**Solution**:
```typescript
// ❌ Old
page.getByRole('radio', { name: 'Y', exact: true })

// ✅ New
page.getByRole('radio', { name: /Y - Yes/ })
```

#### 4. Generated code locator not working

**Cause**: Output structure changed to single-row layout

**Solution**:
```typescript
// ❌ Old (looking for separate boxes)
page.locator('div').filter({ hasText: /^Generated Rhino Code/ })

// ✅ New (single row card)
page.locator('.card').filter({ has: page.getByText('Código Rhino') })
  .locator('p.text-2xl, p.text-3xl').first()
```

#### 5. ProductDescription component not found

**Cause**: Component merged into CodeGenerator

**Solution**:
```typescript
// Fields are now in CodeGenerator component
await rhinoPage.fillCodeGenerator({
  posicion: 'Front',  // Was in ProductDescription
  lado: 'Left'        // Was in ProductDescription
})
```

#### 6. Empty code format error

**Issue**: Expected format has changed

**Solution**: Empty code with F aditamento option:
```typescript
// Standard (with Y or N): 9 characters
expect(generatedCode).toBe('---------'); // [C][P][-----][CC][A]

// Fixed (with F): 8 characters  
expect(generatedCode).toBe('--------'); // [C][P][-----][CC]
```

---

## Best Practices

### Selector Strategy (Priority Order)

1. **`getByRole()`** - Best for accessibility
   ```typescript
   page.getByRole('button', { name: 'Agregar' })
   page.getByRole('combobox').nth(0)
   ```

2. **`getByText()`** - For visible text
   ```typescript
   page.getByText('Honda Accord 2020')
   page.getByText('Código Rhino')
   ```

3. **`getByPlaceholder()`** - For inputs
   ```typescript
   page.getByPlaceholder('00000')
   ```

4. **Scoped selectors** - When elements repeat
   ```typescript
   const section = page.locator('.card').filter({ 
     has: page.getByRole('heading', { name: 'Product Compatibility' }) 
   });
   section.getByRole('combobox').nth(0)
   ```

### Waiting for State Changes

```typescript
// After selecting a brand, wait for sub-models to load
await marcaSelect.selectOption('Honda');
await expect(subModeloSelect).toBeEnabled();

// After clicking add, wait for list to update
await addButton.click();
await expect(page.getByText('Compatibilidades Añadidas (1)')).toBeVisible();

// After clicking Agregar, wait for console message
await rhinoPage.clickAgregar();
await page.waitForTimeout(200); // Small buffer for console.log
```

### Test Independence

Each test should:
- Start fresh (use `beforeEach` to navigate)
- Not depend on other tests
- Clean up after itself (or rely on page reload)
- Be runnable in isolation

---

## Migration Checklist

When updating remaining tests:

### For all test files:
- [ ] Replace `Guardar` with `Agregar`
- [ ] Replace `Clean All` with `Limpiar`
- [ ] Replace `clickGuardar()` with `clickAgregar()`
- [ ] Replace `clickCleanAll()` with `clickLimpiar()`
- [ ] Update aditamento selectors for new labels

### For product-description.spec.ts:
- [ ] Remove references to ProductDescription heading
- [ ] Update field locators to CodeGenerator section
- [ ] Update generated description locator (single-row)

### For responsive.spec.ts:
- [ ] Update grid assertions (3-col → 2-col)
- [ ] Verify single-row generated output layout
- [ ] Check button layout (side-by-side, not stacked)

### For integration.spec.ts:
- [ ] Update button references
- [ ] Update generated output expectations
- [ ] Verify cross-section state management still works

---

## CI/CD Integration

GitHub Actions workflow is configured in `.github/workflows/playwright.yml`:
- Runs on push to main/master
- Runs on pull requests
- Uploads test reports as artifacts
- Fails build if tests fail

---

## Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (61+ tests) |
| `npm run test:ui` | Interactive UI mode ⭐ RECOMMENDED |
| `npm run test:headed` | Run with visible browser |
| `npm run test:debug` | Debug mode (step through) |
| `npm run test:report` | View HTML report |
| `npm run test:codegen` | Record new tests |
| `npm run test:chromium` | Chrome/Edge only |
| `npm run test:firefox` | Firefox only |
| `npm run test:webkit` | Safari only |
| `npm run test:mobile` | Mobile devices only |

---

## Performance

**Test Execution Times** (approximate):
- Single test: 1-3 seconds
- Single file (9-20 tests): 10-40 seconds
- Full suite (61+ tests): ~50-60 seconds
- With all browsers (6 configs): ~5-6 minutes

**Tips for faster tests:**
- Run only changed test files during development
- Use `test.only()` to focus on specific tests
- Keep Chromium-only config for local development
- Enable cross-browser testing only before merging

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

---

## Additional Documentation

- **Test Updates**: `/TEST_UPDATES.md` (migration guide)
- **Project Spec**: `/docs/PROJECT_SPEC.md` (feature requirements)
- **Test Overview**: `/tests/README.md`
- **Button Updates**: `/BUTTON_UPDATES.md`
- **Layout Changes**: `/SINGLE_ROW_DESIGN.md`

---

**Last Updated:** January 2026  
**Version:** 2.0 (After UI restructure)

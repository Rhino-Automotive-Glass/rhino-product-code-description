# E2E Testing Guide

## Overview

This project uses **Playwright** for end-to-end testing. The test suite includes **59 E2E tests** covering all application features.

## Test Coverage Summary

**Total: 59 E2E tests** across **6 browser configurations**

| Test File | Tests | Focus |
|-----------|-------|-------|
| `code-generator.spec.ts` | 7 | Code generation logic |
| `product-compatibility.spec.ts` | 10 | Compatibility management |
| `product-description.spec.ts` | 10 | Description generation |
| `guardar.spec.ts` | 16 | Save functionality |
| `integration.spec.ts` | 8 | Cross-section workflows |
| `responsive.spec.ts` | 8 | Layout responsiveness |

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

## Test Files Breakdown

### `code-generator.spec.ts` (7 tests)
**Code Generator section functionality:**
- Field display validation
- Real-time code generation
- Number padding and validation
- Uppercase conversion
- Complete workflow
- Empty state handling

### `product-compatibility.spec.ts` (10 tests)
**Product Compatibility section functionality:**
- Form validation (all fields required)
- Add/delete compatibility entries
- Duplicate prevention
- Multi-brand support
- Real-time updates to Product Description
- Custom compatibility ("Otro" option)
- Counter updates
- List display

### `product-description.spec.ts` (10 tests)
**Product Description section functionality:**
- Description generation
- Parte field integration (shared with Code Generator)
- Intelligent compatibility grouping
- Year sorting (ascending order)
- Cross-section updates
- Multiple brands handling
- Real-time updates

### `guardar.spec.ts` (16 tests) ✨
**Guardar (Save) feature functionality:**

**Button Visibility & Layout (4 tests):**
- Guardar button appears in header
- Positioned left of Clean All button
- Primary blue styling (`btn-primary`)
- Clean All has secondary gray styling (`btn-secondary`)

**Console Logging - Empty Data (1 test):**
- Warning when clicking with no data

**Console Logging - With Data (4 tests):**
- Logs ProductData with code generator data
- Logs ProductData with compatibility data
- Logs ProductData with description data
- Logs complete ProductData with all sections

**Button Interactions (3 tests):**
- Data persists after save (doesn't clear)
- Works independently from Clean All
- Can be clicked multiple times

**Responsive Behavior (3 tests):**
- Buttons visible on mobile (375px)
- Buttons visible on tablet (768px)
- Buttons visible on desktop (1920px)

**Keyboard Accessibility (2 tests):**
- Accessible via Tab navigation
- Clickable via Enter key

### `integration.spec.ts` (8 tests)
**Cross-section integration workflows:**
- End-to-end user flows
- State synchronization between sections
- Global Clean All functionality
- Complex multi-section scenarios
- Parte field sharing between sections

### `responsive.spec.ts` (8 tests)
**Responsive layout behavior:**
- Desktop layout (3 columns, ≥1024px)
- Tablet layout (2 columns + wrapped, 768-1023px)
- Mobile layout (stacked, <768px)
- Font size consistency across viewports
- Button visibility on all screen sizes

---

## Test Structure

```
tests/
├── page-objects/
│   └── RhinoCodeGeneratorPage.ts   # Page Object Model
├── code-generator.spec.ts           # Code Generator tests (7)
├── product-compatibility.spec.ts    # Compatibility tests (10)
├── product-description.spec.ts      # Description tests (10)
├── guardar.spec.ts                  # Save feature tests (16)
├── integration.spec.ts              # Integration tests (8)
└── responsive.spec.ts               # Responsive tests (8)
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

## Page Object Model

The `RhinoCodeGeneratorPage` class provides reusable methods for interacting with the app:

```typescript
const rhinoPage = new RhinoCodeGeneratorPage(page);
await rhinoPage.goto();

// Fill Code Generator
await rhinoPage.fillCodeGenerator({
  clasificacion: 'R',
  parte: 's',
  numero: '12345',
  color: 'GT',
  aditamento: 'Y'
});

// Add Compatibility
await rhinoPage.addCompatibility('Honda', 'Accord', '2020');

// Fill Product Description
await rhinoPage.fillProductDescription({
  posicion: 'Front',
  lado: 'Left'
});

// Click Guardar button
await rhinoPage.clickGuardar();

// Click Clean All button
await rhinoPage.clickCleanAll();

// Get generated values
const code = await rhinoPage.getGeneratedCodeText();
const compatibility = await rhinoPage.getGeneratedCompatibilityText();
const description = await rhinoPage.getGeneratedDescriptionText();
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
    await rhinoPage.fillCodeGenerator({ parte: 's' });
    
    // Act
    await rhinoPage.addCompatibility('Honda', 'Accord', '2020');
    
    // Assert
    const text = await rhinoPage.getGeneratedCompatibilityText();
    expect(text).toBe('HONDA ACCORD 2020');
  });
});
```

### Available Test Data

Use brands from `carBrands.tsx`:
- **Honda** (Accord, Civic, CR-V, etc.) ✅ Use this for tests
- Toyota (Camry, Corolla, RAV4, etc.)
- Nissan (Altima, Sentra, Maxima, etc.)
- Chevrolet (Malibu, Silverado, etc.)
- BMW (3 Series, 5 Series, X5, etc.)
- Mercedes-Benz (C-Class, E-Class, etc.)
- Ford, Volkswagen, Hyundai, Kia, Mazda, etc.

**Important:** Brand names are case-sensitive. Use exact matches from `carBrands.tsx`.

---

## Running Specific Tests

```bash
# Run single test file
npm test -- guardar.spec.ts
npx playwright test product-compatibility.spec.ts

# Run tests matching pattern
npm test -- -g "should add compatibility"
npx playwright test -g "Guardar"

# Run specific test group
npm test -- guardar.spec.ts -g "Button Visibility"
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "did not find some options" Error

**Cause**: Trying to select an option that doesn't exist in the dropdown.

**Solution**: 
- Verify the brand/model exists in `carBrands.tsx`
- Check for typos in test data (case-sensitive!)
- Ensure you're waiting for options to load

```typescript
// ✅ Correct - Honda exists in carBrands.tsx
await rhinoPage.addCompatibility('Honda', 'Accord', '2020');

// ❌ Wrong - TOYOTA doesn't match "Toyota" (case sensitive)
await rhinoPage.addCompatibility('TOYOTA', 'CAMRY', '2020');
```

#### 2. Empty code format error

**Issue**: Expected `------------` but got `---------`

**Solution**: Empty code format is 9 characters, not 12:
- Format: `[C][P][-----][CC][A]`
- Example: `---------` (1 + 1 + 5 + 1 + 1 = 9 chars)

```typescript
// ✅ Correct
expect(generatedCode).toBe('---------');

// ❌ Wrong
expect(generatedCode).toBe('------------');
```

#### 3. "strict mode violation: resolved to N elements"

**Cause**: Selector matches multiple elements.

**Solution**: Make selector more specific or use `.nth(index)`:

```typescript
// Instead of finding multiple buttons
const deleteButtons = section.getByRole('button', { name: 'Remove' });
await deleteButtons.nth(0).click(); // Click first one
```

#### 4. Tests timeout waiting for element

**Cause**: Element not visible or selector is wrong.

**Solutions**:
- Run in headed mode to see what's happening: `npm run test:headed`
- Check the error screenshot in `test-results/`
- Verify selector matches the actual DOM structure
- Increase timeout if needed: `await element.waitFor({ timeout: 10000 })`

#### 5. Tests pass locally but fail in CI

**Cause**: Timing issues, slower CI machines.

**Solutions**:
- Increase timeouts in config
- Add explicit waits for state changes
- Reduce parallelism in CI
- Use `waitFor` for dynamic content

### Debugging Commands

```bash
# See the browser while tests run
npm run test:headed

# Step through tests interactively
npm run test:debug

# Run single test file
npx playwright test product-compatibility.spec.ts

# Run single test by name
npx playwright test -g "should add compatibility"

# Generate test by recording actions
npm run test:codegen

# Run in UI mode (best for debugging)
npm run test:ui
```

### Checking Failed Tests

1. **Screenshots**: Check `test-results/*/test-failed-*.png`
2. **Error Context**: Check `test-results/*/error-context.md` for DOM snapshot
3. **Traces**: Run `npx playwright show-trace test-results/*/trace.zip`
4. **HTML Report**: Run `npm run test:report` to view detailed results

---

## Best Practices

### Selector Strategy (Priority Order)

1. **`getByRole()`** - Best for accessibility
   ```typescript
   page.getByRole('button', { name: 'Guardar' })
   page.getByRole('combobox').nth(0)
   ```

2. **`getByText()`** - For visible text
   ```typescript
   page.getByText('Honda Accord 2020')
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

// After clicking Guardar, wait for console message
await rhinoPage.clickGuardar();
await page.waitForTimeout(200); // Small buffer for console.log
```

### Test Independence

Each test should:
- Start fresh (use `beforeEach` to navigate)
- Not depend on other tests
- Clean up after itself (or rely on page reload)
- Be runnable in isolation

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
| `npm test` | Run all tests (59 tests) |
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
- Single file (7-16 tests): 10-30 seconds
- Full suite (59 tests): ~45 seconds
- With all browsers (6 configs): ~4-5 minutes

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

- **Test Overview**: `/tests/README.md`
- **Guardar Testing Guide**: `/docs/GUARDAR_TESTING.md`
- **Quick Reference**: `/docs/GUARDAR_TESTING_QUICK_REF.md`
- **Project Spec**: `/docs/PROJECT_SPEC.md` (for feature requirements)

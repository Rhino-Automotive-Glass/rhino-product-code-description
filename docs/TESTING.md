# E2E Testing Guide

## Overview

This project uses **Playwright** for end-to-end testing. Tests run on Chromium by default, with the option to enable cross-browser testing.

## Quick Start

```bash
# Install dependencies (first time only)
npm install
npx playwright install

# Run all tests
npm test

# Run tests with UI (interactive mode)
npm run test:ui

# Run tests with visible browser
npm run test:headed

# Debug mode (step through tests)
npm run test:debug

# View last test report
npm run test:report
```

## Test Structure

```
tests/
├── page-objects/
│   └── RhinoCodeGeneratorPage.ts   # Page Object Model
├── code-generator.spec.ts           # Code Generator tests
├── product-compatibility.spec.ts    # Product Compatibility tests
├── product-description.spec.ts      # Product Description tests
├── integration.spec.ts              # Cross-section integration tests
└── responsive.spec.ts               # Responsive layout tests
```

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
await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');

// Fill Product Description
await rhinoPage.fillProductDescription({
  posicion: 'Front',
  lado: 'Left'
});

// Get generated values
const code = await rhinoPage.getGeneratedCodeText();
const compatibility = await rhinoPage.getGeneratedCompatibilityText();
const description = await rhinoPage.getGeneratedDescriptionText();
```

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
    await rhinoPage.addCompatibility('Toyota', 'Camry', '2020');
    
    // Assert
    const text = await rhinoPage.getGeneratedCompatibilityText();
    expect(text).toBe('TOYOTA CAMRY 2020');
  });
});
```

### Available Test Data

Use brands from `carBrands.tsx`:
- Toyota (Camry, Corolla, RAV4, etc.)
- Nissan (Altima, Sentra, Maxima, etc.)
- Chevrolet (Malibu, Silverado, etc.)
- BMW (3 Series, 5 Series, X5, etc.)
- Mercedes-Benz (C-Class, E-Class, etc.)
- Ford, Volkswagen, Hyundai, Kia, Mazda, etc.

**Note**: Honda is NOT in the brand list.

## Troubleshooting

### Common Issues and Solutions

#### 1. "did not find some options" Error

**Cause**: Trying to select an option that doesn't exist in the dropdown.

**Solution**: 
- Verify the brand/model exists in `carBrands.tsx`
- Check for typos in test data
- Ensure you're waiting for options to load

```typescript
// Wait for option to exist before selecting
await expect(select.locator('option[value="Toyota"]')).toBeAttached();
await select.selectOption('Toyota');
```

#### 2. "strict mode violation: resolved to N elements"

**Cause**: Selector matches multiple elements.

**Solution**: Make selector more specific or use `.nth(index)`:

```typescript
// Instead of finding multiple buttons
const deleteButtons = section.getByRole('button', { name: 'Remove' });
await deleteButtons.nth(0).click(); // Click first one
```

#### 3. Tests timeout waiting for element

**Cause**: Element not visible or selector is wrong.

**Solutions**:
- Run in headed mode to see what's happening: `npm run test:headed`
- Check the error screenshot in `test-results/`
- Verify selector matches the actual DOM structure

#### 4. Tests pass locally but fail in CI

**Cause**: Timing issues, slower CI machines.

**Solutions**:
- Increase timeouts in config
- Add explicit waits for state changes
- Reduce parallelism in CI

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
```

### Checking Failed Tests

1. **Screenshots**: Check `test-results/*/test-failed-*.png`
2. **Error Context**: Check `test-results/*/error-context.md` for DOM snapshot
3. **Traces**: Run `npx playwright show-trace test-results/*/trace.zip`

## Best Practices

### Selector Strategy (Priority Order)

1. **`getByRole()`** - Best for accessibility
   ```typescript
   page.getByRole('button', { name: 'Submit' })
   page.getByRole('combobox').nth(0)
   ```

2. **`getByText()`** - For visible text
   ```typescript
   page.getByText('Toyota Camry 2020')
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
await marcaSelect.selectOption('Toyota');
await expect(subModeloSelect).toBeEnabled();

// After clicking add, wait for list to update
await addButton.click();
await expect(page.getByText('Compatibilities Added (1)')).toBeVisible();
```

### Test Independence

Each test should:
- Start fresh (use `beforeEach` to navigate)
- Not depend on other tests
- Clean up after itself (or rely on page reload)

## CI/CD Integration

GitHub Actions workflow is configured in `.github/workflows/playwright.yml`:
- Runs on push to main/master
- Runs on pull requests
- Uploads test reports as artifacts

## Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:ui` | Interactive UI mode |
| `npm run test:headed` | Run with visible browser |
| `npm run test:debug` | Debug mode |
| `npm run test:report` | View HTML report |
| `npm run test:codegen` | Record new tests |

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

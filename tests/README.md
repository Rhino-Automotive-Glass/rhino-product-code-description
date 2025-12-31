# Tests Directory

This directory contains all E2E tests for the Rhino Code Generator application using Playwright.

## Quick Start

```bash
# Run all tests
npm test

# Interactive UI mode (recommended for development)
npm run test:ui

# See browser in action
npm run test:headed
```

## Test Files

### `page-objects/RhinoCodeGeneratorPage.ts`
**Page Object Model** - Centralized element selectors and helper methods for interacting with the application.

**Key Methods:**
- `goto()` - Navigate to home page
- `fillCodeGenerator(options)` - Fill code generator fields
- `addCompatibility(marca, subModelo, modelo)` - Add compatibility
- `fillProductDescription(options)` - Fill description fields
- `clickGuardar()` - Click Guardar button
- `clickCleanAll()` - Click global clean button
- `getGeneratedCodeText()` - Get generated code
- `getGeneratedCompatibilityText()` - Get compatibility string
- `getGeneratedDescriptionText()` - Get description string

### `code-generator.spec.ts`
**7 tests** covering Code Generator section:
- Field display validation
- Real-time code generation
- Number padding and validation
- Uppercase conversion
- Complete workflow

### `product-compatibility.spec.ts`
**10 tests** covering Product Compatibility section:
- Form validation
- Add/delete compatibility
- Duplicate prevention
- Multi-brand support
- Real-time updates

### `product-description.spec.ts`
**10 tests** covering Product Description section:
- Description generation
- Parte integration
- Intelligent grouping
- Year sorting
- Cross-section updates

### `guardar.spec.ts` ✨ NEW
**16 tests** covering Guardar (Save) feature:
- Button visibility and positioning
- Primary/secondary button styling
- Console logging (empty data)
- Console logging (with data)
- Data preservation after save
- Independence from Clean All
- Multiple clicks
- Responsive behavior (mobile/tablet/desktop)
- Keyboard accessibility

### `integration.spec.ts`
**8 tests** covering cross-section workflows:
- End-to-end user flows
- State synchronization
- Global Clean All
- Complex scenarios

### `responsive.spec.ts`
**8 tests** covering responsive layouts:
- Desktop (3 columns)
- Tablet (2 columns + wrapped)
- Mobile (stacked)
- Font consistency

## Total Coverage

**59 E2E tests** across **6 browser configurations**:
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- iPad Pro

## Documentation

- 📖 **Full Guide**: `/docs/TESTING.md`
- ⚡ **Quick Start**: `/TESTING_QUICKSTART.md`
- 📊 **Setup Summary**: `/docs/TESTING_SETUP_SUMMARY.md`
- 🎯 **Guardar Feature**: `/docs/GUARDAR_FEATURE.md`

## Adding New Tests

1. **Use the Page Object Model:**
```typescript
import { RhinoCodeGeneratorPage } from './page-objects/RhinoCodeGeneratorPage';

test('my test', async ({ page }) => {
  const rhinoPage = new RhinoCodeGeneratorPage(page);
  await rhinoPage.goto();
  
  // Use helper methods
  await rhinoPage.fillCodeGenerator({ parte: 's' });
});
```

2. **Follow naming conventions:**
- Descriptive names: `should do something specific`
- Group with `test.describe()`
- Use `beforeEach` for setup

3. **Write assertions:**
```typescript
expect(await rhinoPage.getGeneratedCodeText()).toBe('EXPECTED');
await expect(rhinoPage.codeGeneratorHeading).toBeVisible();
```

## Common Commands

```bash
npm run test:ui          # Interactive UI mode
npm run test:headed      # See browser
npm run test:debug       # Debug mode
npm run test:chromium    # Chrome only
npm run test:firefox     # Firefox only
npm run test:webkit      # Safari only
npm run test:mobile      # Mobile devices only
npm run test:report      # View HTML report
npm run test:codegen     # Generate tests by recording
```

## CI/CD

Tests automatically run on:
- Push to main/master
- Pull requests

See `.github/workflows/playwright.yml` for configuration.

## Need Help?

- Check `/docs/TESTING.md` for comprehensive guide
- Run `npm run test:ui` for interactive debugging
- Visit https://playwright.dev for Playwright documentation

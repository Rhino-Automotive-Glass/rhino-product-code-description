# Rhino Code Generator - Project Specification v2.0

**Last Updated:** January 2026  
**Version:** 2.0 (After major UI restructure)

Create a Next.js application for Rhino Auto Glass, an Automotive Glass production company.

This application consists of three main sections with a static header:
1. **Product Details** - Product code generation and description fields (merged component)
2. **Product Compatibility** - Vehicle compatibility management
3. **Generated Output & Actions** - Single-row display with action buttons

---

## HEADER

**UI Components:**
- Static header at top of page
- App title: "Rhino Code Generator"
- Subtitle: "Automotive Glass Production Catalog"
- **NO action buttons** (moved to main content)

**Styling:**
- Clean, minimal design
- White background with border bottom
- Consistent padding and typography
- Responsive layout

**Component:**
- `Header.tsx` component (renamed from FloatingHeader)
- No props needed (stateless)

---

## SECTION 1: PRODUCT DETAILS (Code Generator + Description)

**Component:** `CodeGenerator.tsx` (merged with former ProductDescription)

**UI Components:**
- Heading: "Product Details"
- Form with 7 fields (in order):
  a) **Clasificación Comercial** (radio buttons): D - Doméstico, F - Foránea, R - Rhino Automotive
  b) **Parte** (radio buttons): S - Side, B - Back, D - Door, Q - Quarter, V - Vent
  c) **Número** (text input): 5-digit number field, only accepts digits
  d) **Color** (dropdown): GT - Green Tint, YT - Gray Tint, YP - Gray Tint Privacy, CL - Clear
  e) **Aditamento** (radio buttons): Y - Yes, N - No, F - Fixed
  f) **Posición** (radio buttons): Front, Rear
  g) **Lado** (radio buttons): Left, Right
- **Minimum height:** 750px

**Functionality:**
- Real-time code generation on every field change
- Number input validation: Only digits, max 5 characters
- Auto-pad numbers with leading zeros (e.g., "1" becomes "00001")
- **Code format depends on Aditamento:**
  - **Y or N:** `[Clasificación][Parte][5-digit number][Color][Aditamento]`
    - Example: "DB12345GTN"
  - **F (Fixed):** `[Clasificación][Parte][5-digit number][Color]` (stops at color)
    - Example: "DB12345GT"
- Empty code format: "---------" (9 characters) or "--------" (8 with F)
- ALL generated codes must be UPPERCASE
- Parte field shared with description generation

**Styling:**
- Card container with padding
- 750px minimum height for visual balance
- Consistent spacing and typography
- Blue focus states on inputs

---

## SECTION 2: PRODUCT COMPATIBILITY

**Component:** `ProductCompatibility.tsx`

**UI Components:**
- Heading: "Product Compatibility"
- Subtitle: "Add vehicle compatibility information"
- Form with 4 fields:
  a) **Marca** (dropdown): Car brands from carBrands.tsx + "Otro (Personalizado)" option
  b) **Sub-Modelo** (dropdown): Dynamic based on Marca (hidden when "Otro" selected)
  c) **Versión** (dropdown): Optional, dynamic based on Sub-Modelo (hidden when "Otro" selected)
  d) **Modelo/Year** (dropdown): Years from 2000 to current year (reverse order)
  
  **When "Otro" selected:**
  - Custom text input replaces Marca/Sub-Modelo/Versión
  - Year selection still required
  
- "Añadir Compatibilidad" button
- Compatibility list display with:
  - Counter showing number of compatibilities
  - Each compatibility as a card with delete button (X icon)
  - Custom entries tagged with "Personalizado" badge
  - Empty state message when none exist
  - Scrollable area (max-height: 16rem)
- **Minimum height:** 750px

**Functionality:**
- Fields persist after adding (not cleared)
- Validation: All required fields must be filled
- Duplicate prevention: Same Marca + Sub-Modelo + Versión + Year
- Alert messages for validation errors
- Delete functionality: X button removes individual entries
- Real-time updates to description section
- **Compatibility format:**
  - Standard: `MARCA SUBMODELO-VERSION YEAR`
  - No version: `MARCA SUBMODELO YEAR`
  - Custom: `CUSTOM_TEXT YEAR`
- Shows "---" when no compatibilities exist
- ALL text in UPPERCASE

**Styling:**
- Card container with padding
- 750px minimum height for visual balance
- Compatibility cards with hover effects
- Red delete button with trash icon
- Orange badge for custom entries

---

## SECTION 3: GENERATED OUTPUT & ACTIONS

**Location:** Inline in `page.tsx` (not a separate component)

**Layout:** Single horizontal row with 3 sections:
```
[Código Rhino] | [Descripción del Producto] | [Agregar][Limpiar]
    flex-1              flex-[2]                  auto-width
```

**UI Components:**

### Left Section: Código Rhino (flex-1)
- Label: "CÓDIGO RHINO" (uppercase, small, gray)
- Value: Large monospace font (2xl-3xl)
- Real-time generation from Product Details

### Middle Section: Descripción del Producto (flex-[2])
- Label: "DESCRIPCIÓN DEL PRODUCTO" (uppercase, small, gray)
- Value: Medium monospace font (lg-xl)
- Real-time generation from all fields
- Format: `[PARTE] [POSICIÓN] [LADO] [COMPATIBILITIES]`
- Intelligent grouping:
  - Groups by Marca + Sub-Modelo + Versión
  - Shows years in ascending order
  - Example: "SIDE FRONT LEFT TOYOTA CAMRY-LE 2023, 2024, 2025"

### Right Section: Action Buttons (side by side)
- **Agregar Button** (Primary blue)
  - Icon: Circle with down arrow
  - Action: Adds product to table
  - Validates for duplicates
  - Logs ProductData to console
  
- **Limpiar Button** (Secondary gray)
  - Icon: Trash can
  - Action: Clears all forms
  - Resets compatibility list
  - Resets all fields

**Dividers:**
- Thin vertical lines (1px, 64px height)
- Between each section
- Only visible on desktop (hidden lg:block)

**Responsive:**
- Desktop (lg+): Horizontal row layout
- Mobile: Vertical stack
- Buttons remain side-by-side on mobile

**Styling:**
- Single card container with padding
- Subtle labels in gray
- Bold monospace fonts for values
- Consistent spacing with gaps
- Blue primary button (Agregar)
- Gray secondary button (Limpiar)

---

## SAVED PRODUCTS TABLE

**Component:** `SavedProductsTable.tsx`

**UI Components:**
- Heading: "Saved Products Table"
- Table columns:
  1. Product Code
  2. Compatibility
  3. Description
  4. Actions (Delete button)

**Functionality:**
- Displays all added products
- Delete individual products
- Real-time updates when products added
- Full-width display below generated output

**Styling:**
- Table with borders and hover effects
- Delete button with trash icon
- Responsive on all screen sizes

---

## LAYOUT STRUCTURE

**Desktop (≥1024px):**
```
[Header - Full Width]

Agregar Nuevos Códigos
─────────────────────────────────────

[Product Details]  [Product Compatibility]
   (750px min)         (750px min)
   2-column grid

[Generated Output & Actions - Single Row]
[Código] | [Descripción] | [Agregar][Limpiar]

[Saved Products Table - Full Width]
```

**Tablet (768px - 1023px):**
```
[Header - Full Width]

[Product Details]  [Product Compatibility]
   2-column grid

[Generated Output & Actions - Single Row]
(stacks vertically)

[Saved Products Table]
```

**Mobile (<768px):**
```
[Header]

[Product Details]
(stacked)

[Product Compatibility]
(stacked)

[Generated Output & Actions]
(stacked vertically)

[Saved Products Table]
(stacked)
```

---

## STYLING

- Professional industrial aesthetic with blue and orange accents
- Gradient background: `from-blue-50 via-white to-slate-50`
- White card containers: `.card` class with rounded corners and shadows
- Clean, modern form design
- Consistent spacing and typography
- Blue primary buttons (#2563eb - `btn btn-primary btn-md`)
- Gray secondary buttons (slate - `btn btn-secondary btn-md`)
- All generated outputs use monospace bold font
- Smooth transitions and hover effects
- Mobile responsive with adaptive layouts
- Tailwind CSS utility classes throughout
- 750px minimum height on form containers

---

## TECHNICAL STACK

- Next.js 14.2.20 with App Router
- React 18
- TypeScript for type safety
- Tailwind CSS for styling
- React hooks (useState) for state management
- Client-side components ('use client' directive)
- Controlled components pattern throughout
- Playwright for E2E testing

---

## STATE MANAGEMENT ARCHITECTURE

**Lifted State Pattern:**
All state managed in parent component (page.tsx) for global control.

**Parent Component (page.tsx) - Single Source of Truth:**

**Product Code State:**
```typescript
const [clasificacion, setClasificacion] = useState('');
const [parte, setParte] = useState('');
const [numero, setNumero] = useState('');
const [color, setColor] = useState('');
const [aditamento, setAditamento] = useState('');
```

**Product Description State:**
```typescript
const [posicion, setPosicion] = useState('');
const [lado, setLado] = useState('');
```

**Compatibility State:**
```typescript
const [compatibilities, setCompatibilities] = useState<Compatibility[]>([]);
const [compatibilityResetTrigger, setCompatibilityResetTrigger] = useState(0);
```

**Saved Products State:**
```typescript
const [savedProducts, setSavedProducts] = useState<ProductData[]>([]);
```

**Global Handlers:**
```typescript
// Add Handler (formerly Save)
const handleSave = () => {
  if (!hasAnyData()) {
    console.warn('No data to save - all fields are empty');
    return;
  }
  
  const productData: ProductData = {
    productCode: { /* ... */ },
    compatibility: { /* ... */ },
    description: { /* ... */ }
  };
  
  // Check for duplicate
  const isDuplicate = savedProducts.some(
    product => product.productCode.generated === productData.productCode.generated
  );
  
  if (isDuplicate) {
    alert(`Product code "${productData.productCode.generated}" already exists`);
    return;
  }
  
  // Add to table
  setSavedProducts(prev => [...prev, productData]);
  
  // Log to console
  console.log('Product Data:', productData);
};

// Clean Handler
const handleGlobalClean = () => {
  setClasificacion('');
  setParte('');
  setNumero('');
  setColor('');
  setAditamento('');
  setPosicion('');
  setLado('');
  setCompatibilities([]);
  setCompatibilityResetTrigger(prev => prev + 1);
};
```

**Helper Functions (in page.tsx):**
```typescript
// Generate product code
const generateProductCode = (): string => {
  const clasificacionCode = clasificacion || '-';
  const parteCode = parte || '-';
  const numeroCode = numero ? numero.padStart(5, '0') : '-----';
  const colorCode = color || '-';
  
  // F (Fixed) stops at color
  if (aditamento === 'F') {
    return `${clasificacionCode}${parteCode}${numeroCode}${colorCode}`.toUpperCase();
  }
  
  // Y/N includes aditamento
  const aditamentoCode = aditamento || '-';
  return `${clasificacionCode}${parteCode}${numeroCode}${colorCode}${aditamentoCode}`.toUpperCase();
};

// Generate compatibility string
const generateCompatibilityString = (): string => {
  if (compatibilities.length === 0) return '---';
  return compatibilities.map(formatEntry).join(', ').toUpperCase();
};

// Generate product description
const generateProductDescription = (): string => {
  // Complex logic with intelligent grouping
  // Format: PARTE POSICION LADO COMPATIBILITIES
};
```

**Data Flow:**
```
page.tsx (parent - owns all state)
│
├── Header (stateless)
│
├── CodeGenerator (controlled)
│   ├── Props: clasificacion, parte, numero, color, aditamento
│   │         posicion, lado + all setters
│   └── Renders: Form fields only
│
├── ProductCompatibility (controlled)
│   ├── Props: compatibilities, setCompatibilities, resetTrigger
│   ├── Local state: marca, subModelo, version, modelo (ephemeral)
│   └── Renders: Form and list
│
├── Generated Output (inline)
│   ├── Uses: generateProductCode(), generateProductDescription()
│   ├── Renders: Single-row display
│   └── Buttons: handleSave(), handleGlobalClean()
│
└── SavedProductsTable (controlled)
    ├── Props: products, onDelete
    └── Renders: Table of saved products
```

---

## DATA STRUCTURES

**Compatibility Interface:**
```typescript
interface Compatibility {
  marca: string;      // Brand name
  subModelo: string;  // Sub-model name (empty for custom)
  version: string;    // Version (empty if not applicable)
  modelo: string;     // Year as string
}
```

**ProductData Interface:**
```typescript
interface ProductData {
  productCode: {
    clasificacion: string;
    parte: string;
    numero: string;
    color: string;
    aditamento: string;
    generated: string;  // Formatted code: "DB12345GT"
  };
  compatibility: {
    items: Compatibility[];
    generated: string;  // Formatted: "TOYOTA CAMRY 2020, ..."
  };
  description: {
    parte: string;
    posicion: string;
    lado: string;
    generated: string;  // Formatted: "SIDE FRONT LEFT ..."
  };
}
```

**Console Output Example:**
```javascript
Product Data: {
  productCode: {
    clasificacion: "D",
    parte: "b",
    numero: "12345",
    color: "GT",
    aditamento: "F",
    generated: "DB12345GT"  // No suffix with F
  },
  compatibility: {
    items: [
      { marca: "Honda", subModelo: "Accord", version: "EX", modelo: "2020" },
      { marca: "Honda", subModelo: "Accord", version: "EX", modelo: "2021" }
    ],
    generated: "HONDA ACCORD-EX 2020, 2021"
  },
  description: {
    parte: "b",
    posicion: "Rear",
    lado: "Left",
    generated: "BACK REAR LEFT HONDA ACCORD-EX 2020, 2021"
  }
}
```

---

## FILE STRUCTURE

```
rhino-code-generator/
├── app/
│   ├── page.tsx (parent - owns all state)
│   ├── layout.tsx
│   ├── globals.css
│   └── components/
│       ├── Header.tsx (static header)
│       ├── CodeGenerator.tsx (code + description fields)
│       ├── ProductCompatibility.tsx (compatibility management)
│       └── SavedProductsTable.tsx (display saved products)
├── carBrands.ts (data file)
├── tests/
│   ├── page-objects/
│   │   └── RhinoCodeGeneratorPage.ts
│   └── *.spec.ts (test files)
├── docs/
│   ├── PROJECT_SPEC.md (this file)
│   └── TESTING.md (testing guide)
└── *.md (various documentation)
```

---

## COMPONENT PROPS (TypeScript Interfaces)

**Header:**
```typescript
// No props - stateless component
export default function Header() { /* ... */ }
```

**CodeGenerator:**
```typescript
interface CodeGeneratorProps {
  clasificacion: string;
  setClasificacion: (value: string) => void;
  parte: string;
  setParte: (value: string) => void;
  numero: string;
  setNumero: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  aditamento: string;
  setAditamento: (value: string) => void;
  posicion: string;
  setPosicion: (value: string) => void;
  lado: string;
  setLado: (value: string) => void;
}
```

**ProductCompatibility:**
```typescript
interface ProductCompatibilityProps {
  compatibilities: Compatibility[];
  setCompatibilities: (compatibilities: Compatibility[]) => void;
  resetTrigger?: number;
}
```

**SavedProductsTable:**
```typescript
interface SavedProductsTableProps {
  products: ProductData[];
  onDelete: (index: number) => void;
}
```

---

## USER EXPERIENCE

- All inputs provide immediate visual feedback
- Dropdowns start with "Select..." option
- Radio buttons clearly labeled with descriptions
- Number input has placeholder "00000"
- Sub-Modelo dropdown disabled until Marca selected
- Versión dropdown disabled until Sub-Modelo selected
- All generated outputs update in real-time
- Validation alerts for incomplete/duplicate entries
- Delete confirmation via X button
- Smooth animations and transitions
- Consistent button styling
- Clear visual hierarchy
- Single-row output for quick scanning
- 750px minimum height creates balanced forms
- Agregar adds to table and logs to console
- Limpiar resets all forms instantly

---

## FUTURE ENHANCEMENTS

**Immediate (when ready):**
1. Database integration (Supabase/PostgreSQL)
2. Success toast notifications
3. Error handling and recovery
4. Timestamps on products

**Medium-term:**
1. Edit saved products
2. Export to Excel/CSV/PDF
3. Import bulk products
4. Search/filter saved products
5. Product templates
6. Undo/Redo functionality

**Long-term:**
1. User authentication
2. Multi-user collaboration
3. Order management integration
4. Product history/audit trail
5. Analytics and reporting
6. API for external integrations

---

## VERSION HISTORY

**v2.0 (Current - January 2026)**
- Major UI restructure
- Merged ProductDescription into CodeGenerator
- Single-row generated output layout
- Renamed buttons: Guardar → Agregar, Clean All → Limpiar
- Added F (Fixed) aditamento option
- 750px minimum height on forms
- Spanish labels for generated output
- Renamed FloatingHeader → Header
- Moved buttons to main content area

**v1.0 (Previous)**
- Initial three-column layout
- Separate ProductDescription component
- FloatingHeader with action buttons
- Basic Y/N aditamento options
- Top-of-page generated outputs

---

## KEY DESIGN DECISIONS

**Why merge Product Details and Description?**
- Related fields logically grouped
- Reduces visual clutter
- Better horizontal space usage
- All product input in one place

**Why single-row generated output?**
- 66% reduction in vertical space
- All info visible at once
- Professional dashboard aesthetic
- Better scanning experience

**Why 750px minimum height?**
- Accommodates all fields comfortably
- Creates visual balance
- Professional aligned appearance
- No awkward gaps

**Why rename Guardar → Agregar?**
- More accurate (adds to table, doesn't save to file)
- Matches "Agregar Nuevos Códigos" heading
- Consistent Spanish interface
- Clearer user intent

**Why add F (Fixed) aditamento?**
- Supports legacy codes without suffix
- Provides product specification flexibility
- Cleaner codes when appropriate
- User-requested feature

---

## TESTING

See `/docs/TESTING.md` for comprehensive testing guide.

**Test Coverage:**
- 61+ E2E tests with Playwright
- Code generation logic
- Compatibility management
- Description generation
- Agregar/Limpiar functionality
- Responsive layout
- Integration workflows

**Key Tests:**
- F (Fixed) aditamento stops at color
- Descriptive labels visible
- Buttons in correct location
- Single-row output displays correctly
- All workflows end-to-end

---

## SUMMARY

This application provides a professional, efficient tool for Rhino Auto Glass to generate product codes, manage compatibility data, and create product descriptions. The v2.0 architecture improves upon v1.0 with better space efficiency, clearer UI organization, and enhanced functionality while maintaining React best practices with lifted state and controlled components.

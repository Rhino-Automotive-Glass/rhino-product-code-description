Create a Next.js 16.1.0 application under the folder dev for Rhino Auto Glass, an Automotive Glass production company.

This application consists of three main sections:
1. **Code Generation** - A catalog reference code creation tool based on NAGS naming conventions
2. **Product Description** - A form section for generating automotive glass product descriptions
3. **Product Compatibility** - A section for managing vehicle compatibility information that integrates with Product Description

## SECTION 1: CODE GENERATION (Código del producto)

**UI Components:**
- Heading: "Código del producto"
- Form with 5 fields (in order):
  a) Clasificación Comercial (radio buttons): D - Doméstico, F - Foránea, R - Rhino Automotive
  b) Parte (radio buttons): s - Side, b - Back, d - Door, q - Quarter, v - Vent
  c) Número (text input): 5-digit number field, only accepts digits
  d) Color (dropdown): GT - Green Tint, YT - Gray Tint, YP - Gray Tint Privacy, CL - Clear
  e) Aditamento (radio buttons): Y, N
- Single "Clean" button
- Result display area showing "Generated Rhino Code"

**Functionality:**
- Real-time code generation: Update the displayed code instantly whenever any field changes
- No generate button needed - automatic updates on every selection/input
- Number input validation: Only allow digits, max 5 characters, block additional input after 5 digits
- Auto-pad numbers with leading zeros (e.g., "1" becomes "00001")
- Final code format: [Clasificación][Parte][5-digit number][Color][Aditamento]
- Example output: "RV00001GTY"
- ALL generated codes must be UPPERCASE
- Generated code display always shows dashes for missing values (e.g., "-----", "R----", "RV---", "RV00123--")
- Clean button resets all fields and clears the result back to initial state with dashes
- Parte field is shared with Product Description section

## SECTION 2: PRODUCT DESCRIPTION

**UI Components:**
- Heading: "Product Description"
- Subtitle: "Generate automotive glass product descriptions"
- Form with 2 fields:
  a) Posición (radio buttons): Front, Rear
  b) Lado (radio buttons): Left, Right
- Single "Clean" button
- Result display area showing "Generated Product Description"

**Functionality:**
- Real-time description generation based on:
  - Parte (from Code Generation section)
  - Posición
  - Lado
  - Vehicle compatibility data (from Product Compatibility section)
- Intelligent grouping of compatibilities:
  - Groups by Marca + Sub-Modelo
  - Displays years in ascending order within each group
  - Example outputs:
    * Single compatibility: "SIDE FRONT LEFT TOYOTA CAMRY 2020"
    * Multiple years same model: "SIDE FRONT LEFT TOYOTA CAMRY 2020, 2021, 2022, 2023"
    * Multiple models: "SIDE FRONT LEFT TOYOTA CAMRY 2020, 2021 HONDA ACCORD 2022, 2023"
- Format: [PARTE] [POSICIÓN] [LADO] [MARCA SUB-MODELO YEARS]
- ALL text displayed in UPPERCASE
- Clean button resets Posición and Lado fields

## SECTION 3: PRODUCT COMPATIBILITY

**UI Components:**
- Heading: "Product Compatibility"
- Subtitle: "Add vehicle compatibility information"
- Form with 3 fields:
  a) Marca (dropdown): Car brands from carBrands.tsx data
  b) Sub-Modelo (dropdown): Dynamically populated based on selected Marca
  c) Modelo/Year (dropdown): Years from 2000 to current year (reverse order)
- "Añadir Compatibilidad" button
- Compatibility list display with:
  - Counter showing number of compatibilities added
  - Each compatibility displayed as a card with delete button
  - Empty state message when no compatibilities exist
  - Scrollable area (max-height: 16rem) for long lists
- Result display area showing "Generated Compatibility"

**Functionality:**
- Fields remain populated after adding compatibility (not cleared)
- Validation: All three fields must be selected before adding
- Duplicate prevention: Cannot add same Marca + Sub-Modelo + Year combination twice
- Delete functionality: X button to remove individual compatibilities
- Real-time updates: Changes immediately reflect in Product Description section
- Generated Compatibility string format: Comma-separated full entries
  - Example: "TOYOTA CAMRY 2020, TOYOTA CAMRY 2021, HONDA ACCORD 2022"
- Shows "---" when no compatibilities exist
- ALL text displayed in UPPERCASE
- No maximum limit on number of compatibilities

## LAYOUT STRUCTURE

**Desktop (≥1024px):** 3-column grid layout
```
[Code Generation] [Product Description] [Product Compatibility]
```

**Tablet (768px - 1023px):** 2-column grid with 3rd section wrapping
```
[Code Generation] [Product Description]
[Product Compatibility spans full width]
```

**Mobile (<768px):** Single column, stacked vertically
```
[Code Generation]
[Product Description]
[Product Compatibility]
```

## STYLING

- Professional industrial aesthetic with blue and orange accent colors
- Gradient background: from-blue-50 via-white to-slate-50
- White card containers with rounded corners and soft shadows
- Clean, modern form design
- Consistent spacing and typography
- Blue primary buttons (#2563eb)
- Smooth transitions and hover effects
- Mobile responsive with adaptive layouts
- Tailwind CSS utility classes

## TECHNICAL STACK

- Next.js 16.1.0 with App Router
- TypeScript
- Tailwind CSS for styling
- React hooks (useState, useEffect) for state management
- Client-side components ('use client')
- Shared state management between sections via props

## STATE MANAGEMENT

**Parent Component (page.tsx):**
- `parte` state: Shared between Code Generation and Product Description
- `compatibilities` state: Array of compatibility objects, shared between Product Compatibility and Product Description

**Data Flow:**
```
page.tsx (parent)
├── CodeGenerator
│   ├── Manages: clasificacion, numero, color, aditamento
│   └── Shares: parte (via props)
├── ProductDescription
│   ├── Receives: parte, compatibilities (via props)
│   ├── Manages: posicion, lado
│   └── Generates: Intelligent grouped description
└── ProductCompatibility
    ├── Receives: compatibilities, setCompatibilities (via props)
    ├── Manages: marca, subModelo, modelo (for form inputs)
    └── Updates: compatibilities array (via callback)
```

## USER EXPERIENCE

- Dropdowns start with "Select..." option
- Radio buttons clearly labeled, reset via Clean button
- Number input has placeholder "00000"
- Sub-Modelo dropdown disabled until Marca is selected
- All generated outputs update in real-time
- Validation alerts for incomplete or duplicate compatibility entries
- Delete confirmation via X button (no modal needed)
- Smooth animations and transitions
- Consistent button styling across all sections
- Clear visual hierarchy and sectioning

## DATA STRUCTURE

**Compatibility Interface:**
```typescript
interface Compatibility {
  marca: string;
  subModelo: string;
  modelo: string; // Year as string
}
```

**Car Brands Data:**
- Imported from `carBrands.tsx`
- Structure: Array of objects with `name`, `abbr`, `subModels[]`
- Used by both Product Compatibility and (previously) Product Description

## FILE STRUCTURE

```
app/
├── page.tsx (main parent component with state)
├── layout.tsx
├── globals.css
└── components/
    ├── CodeGenerator.tsx
    ├── ProductDescription.tsx
    └── ProductCompatibility.tsx
carBrands.tsx (data file)
docs/
├── PROJECT_SPEC.md
└── PRODUCT_COMPATIBILITY_IMPLEMENTATION.md
```

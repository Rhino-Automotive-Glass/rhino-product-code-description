Create a Next.js 16.1.0 application under the folder dev for Rhino Auto Glass, an Automotive Glass production company.

This application consists of three main sections with a global floating header:
1. **Code Generation** - A catalog reference code creation tool based on NAGS naming conventions
2. **Product Compatibility** - A section for managing vehicle compatibility information
3. **Product Description** - A form section for generating automotive glass product descriptions

## GLOBAL FLOATING HEADER

**UI Components:**
- Sticky header at top of page (always visible when scrolling)
- App title: "Rhino Code Generator"
- Subtitle: "Automotive Glass Production Catalog"
- "Clean All" button (blue primary button)

**Functionality:**
- Sticky positioning (stays at top when scrolling)
- Semi-transparent white background with backdrop blur
- Global "Clean All" button clears all form fields across all three sections:
  - Clears all Code Generator fields
  - Clears all Product Description fields
  - Clears all Product Compatibility entries
- One-click reset for entire application

**Styling:**
- `sticky top-0 z-50` positioning
- `bg-white/95 backdrop-blur-sm` for glassmorphism effect
- Border bottom with shadow for depth
- Responsive padding and layout

## SECTION 1: CODE GENERATION (Product Code)

**UI Components:**
- Heading: "Product Code"
- Form with 5 fields (in order):
  a) Clasificación Comercial (radio buttons): D - Doméstico, F - Foránea, R - Rhino Automotive
  b) Parte (radio buttons): s - Side, b - Back, d - Door, q - Quarter, v - Vent
  c) Número (text input): 5-digit number field, only accepts digits
  d) Color (dropdown): GT - Green Tint, YT - Gray Tint, YP - Gray Tint Privacy, CL - Clear
  e) Aditamento (radio buttons): Y, N
- NO individual clean button (removed - use global Clean All button)
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
- Parte field is shared with Product Description section

**Styling:**
- Generated code displayed in monospace bold font
- Font size: `text-3xl lg:text-4xl font-mono font-bold`

## SECTION 2: PRODUCT COMPATIBILITY

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
  - Each compatibility displayed as a card with delete button (X icon)
  - Empty state message when no compatibilities exist
  - Scrollable area (max-height: 16rem) for long lists
- Result display area showing "Generated Compatibility"

**Functionality:**
- Fields remain populated after adding compatibility (not cleared)
- Validation: All three fields must be selected before adding
- Duplicate prevention: Cannot add same Marca + Sub-Modelo + Year combination twice
- Alert messages for validation errors
- Delete functionality: X button to remove individual compatibilities
- Real-time updates: Changes immediately reflect in Product Description section
- Generated Compatibility string format: Comma-separated full entries
  - Example: "TOYOTA CAMRY 2020, TOYOTA CAMRY 2021, HONDA ACCORD 2022"
- Shows "---" when no compatibilities exist
- ALL text displayed in UPPERCASE
- No maximum limit on number of compatibilities

**Styling:**
- Generated compatibility displayed in monospace bold font
- Font size: `text-2xl lg:text-3xl font-mono font-bold`
- Compatibility cards with hover effects and red delete button

## SECTION 3: PRODUCT DESCRIPTION

**UI Components:**
- Heading: "Product Description"
- Subtitle: "Generate automotive glass product descriptions"
- Form with 2 fields:
  a) Posición (radio buttons): Front, Rear
  b) Lado (radio buttons): Left, Right
- NO individual clean button (removed - use global Clean All button)
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
    * Multiple brands: "SIDE FRONT LEFT TOYOTA CAMRY 2020, 2021 HONDA ACCORD 2022, 2023"
- Format: [PARTE] [POSICIÓN] [LADO] [MARCA SUB-MODELO YEARS]
- ALL text displayed in UPPERCASE

**Styling:**
- Generated description displayed in monospace bold font
- Font size: `text-2xl lg:text-3xl font-mono font-bold`

## LAYOUT STRUCTURE

**Desktop (≥1024px):** 3-column grid layout
```
[Global Floating Header - spans full width]
[Code Generation] [Product Compatibility] [Product Description]
     Column 1            Column 2              Column 3
```

**Tablet (768px - 1023px):** 2-column grid with 3rd section wrapping below
```
[Global Floating Header - spans full width]
[Code Generation] [Product Compatibility]
[Product Description - spans full width]
```

**Mobile (<768px):** Single column, stacked vertically
```
[Global Floating Header]
[Code Generation]
[Product Compatibility]
[Product Description]
```

## STYLING

- Professional industrial aesthetic with blue and orange accent colors
- Gradient background: `from-blue-50 via-white to-slate-50`
- White card containers with rounded corners and soft shadows
- Clean, modern form design
- Consistent spacing and typography
- Blue primary buttons (#2563eb - `btn btn-primary`)
- All generated outputs use monospace bold font for technical aesthetic
- Smooth transitions and hover effects
- Mobile responsive with adaptive layouts
- Tailwind CSS utility classes throughout

## TECHNICAL STACK

- Next.js 16.1.0 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React hooks (useState) for state management
- Client-side components ('use client' directive)
- Controlled components pattern throughout

## STATE MANAGEMENT ARCHITECTURE

**Lifted State Pattern (Best Practice):**
All clearable state is managed in the parent component (page.tsx) to enable the global "Clean All" functionality and ensure predictable data flow.

**Parent Component (page.tsx) - Single Source of Truth:**

**CodeGenerator State:**
- `clasificacion` - Classification (D/F/R)
- `parte` - Part type (s/b/d/q/v) - SHARED with ProductDescription
- `numero` - 5-digit number
- `color` - Color selection (GT/YT/YP/CL)
- `aditamento` - Accessory (Y/N)

**ProductDescription State:**
- `posicion` - Position (Front/Rear)
- `lado` - Side (Left/Right)
- Receives `parte` from parent (read-only)
- Receives `compatibilities` from parent (read-only)

**ProductCompatibility State:**
- `compatibilities` - Array of Compatibility objects
- Local form state: `marca`, `subModelo`, `modelo` (ephemeral inputs)

**Global Clean Handler:**
```typescript
const handleGlobalClean = () => {
  // Clear CodeGenerator
  setClasificacion('');
  setParte('');
  setNumero('');
  setColor('');
  setAditamento('');
  
  // Clear ProductDescription
  setPosicion('');
  setLado('');
  
  // Clear ProductCompatibility
  setCompatibilities([]);
};
```

**Data Flow Diagram:**
```
page.tsx (parent - owns all state)
│
├── Floating Header
│   └── "Clean All" button → handleGlobalClean()
│
├── CodeGenerator (controlled component)
│   ├── Props IN: clasificacion, parte, numero, color, aditamento + setters
│   └── Generates: Product code string
│
├── ProductCompatibility (controlled component)
│   ├── Props IN: compatibilities, setCompatibilities
│   ├── Local state: marca, subModelo, modelo (form inputs only)
│   ├── Manages: Adding/removing compatibilities
│   └── Generates: Compatibility string
│
└── ProductDescription (controlled component)
    ├── Props IN: parte, posicion, lado, compatibilities + setters
    ├── Computes: Intelligent grouping of compatibilities
    └── Generates: Product description string
```

**Key Principles:**
1. **Single Source of Truth** - All domain state lives in parent
2. **Unidirectional Data Flow** - Data flows down via props
3. **Controlled Components** - Children receive state and setters
4. **No Side Effects** - No useEffect for state synchronization
5. **Explicit Updates** - State changes are direct and synchronous

## USER EXPERIENCE

- All inputs provide immediate visual feedback
- Dropdowns start with "Select..." option
- Radio buttons clearly labeled
- Number input has placeholder "00000"
- Sub-Modelo dropdown disabled until Marca is selected
- All generated outputs update in real-time (no submit buttons)
- Validation alerts for incomplete or duplicate compatibility entries
- Delete confirmation via X button (no modal needed)
- Smooth animations and transitions
- Consistent button styling across all sections
- Clear visual hierarchy and sectioning
- Sticky header provides easy access to "Clean All" button

## DATA STRUCTURE

**Compatibility Interface:**
```typescript
interface Compatibility {
  marca: string;      // Car brand name
  subModelo: string;  // Sub-model name
  modelo: string;     // Year as string
}
```

**Car Brands Data:**
- Imported from `carBrands.tsx`
- Structure: Array of objects with `name`, `abbr`, `subModels[]`
- Used by Product Compatibility section
- Example:
```typescript
{
  name: "Toyota",
  abbr: "Toyota",
  subModels: ["Camry", "Corolla", "RAV4", ...]
}
```

## FILE STRUCTURE

```
app/
├── page.tsx (parent component - owns all state, renders layout + header)
├── layout.tsx (Next.js app layout)
├── globals.css (global styles and Tailwind config)
└── components/
    ├── CodeGenerator.tsx (controlled component - code generation logic)
    ├── ProductDescription.tsx (controlled component - description logic)
    └── ProductCompatibility.tsx (controlled component - compatibility management)

carBrands.tsx (data file - car brands and sub-models)

docs/
├── PROJECT_SPEC.md (this file)
├── PRODUCT_COMPATIBILITY_IMPLEMENTATION.md (compatibility feature docs)
└── STATE_MANAGEMENT_REFACTOR.md (state management architecture docs)
```

## COMPONENT PROPS (TypeScript Interfaces)

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
}
```

**ProductDescription:**
```typescript
interface ProductDescriptionProps {
  parte: string;
  posicion: string;
  setPosicion: (value: string) => void;
  lado: string;
  setLado: (value: string) => void;
  compatibilities: Compatibility[];
}
```

**ProductCompatibility:**
```typescript
interface ProductCompatibilityProps {
  compatibilities: Compatibility[];
  setCompatibilities: (compatibilities: Compatibility[]) => void;
}
```

## TESTING CONSIDERATIONS

With the lifted state architecture:
- Easy to test components by passing mock props
- No need to test useEffect side effects
- Clear separation of concerns
- Predictable state updates
- Simple snapshot testing for UI

## FUTURE ENHANCEMENT OPPORTUNITIES

With current architecture, these features are easy to add:
1. **Persistence** - Save/load state to localStorage or database
2. **Undo/Redo** - Keep history of parent state changes
3. **URL State** - Sync state with URL query parameters
4. **Export** - Serialize parent state to JSON/CSV
5. **Form Validation** - Centralized validation in parent
6. **Analytics** - Track state changes from one location
7. **Multi-language** - Centralized state makes i18n easier

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
- Two action buttons:
  - **"Guardar"** button (left, blue primary button) - saves current data
  - **"Clean All"** button (right, gray secondary button) - clears all data

**Functionality:**
- Sticky positioning (stays at top when scrolling)
- Semi-transparent white background with backdrop blur
- **Guardar button** collects all form data and logs to console:
  - Validates that at least some data exists
  - If empty: logs `console.warn('No data to save - all fields are empty')`
  - If data exists: logs structured ProductData object to console
  - Silent from user perspective (no visual feedback)
  - Data persists after save (does not clear form)
  - Designed as stepping stone for future Supabase database integration
- **Clean All button** clears all form fields across all three sections:
  - Clears all Code Generator fields
  - Clears all Product Description fields
  - Clears all Product Compatibility entries
- One-click reset for entire application

**Styling:**
- `sticky top-0 z-50` positioning
- `bg-white/95 backdrop-blur-sm` for glassmorphism effect
- Border bottom with shadow for depth
- Responsive padding and layout
- Guardar: `btn btn-primary btn-md` (blue background)
- Clean All: `btn btn-secondary btn-md` (gray background)

**Component:**
- Extracted into dedicated `FloatingHeader.tsx` component
- Accepts `onSave` and `onCleanAll` callback props

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
- Empty code format: "---------" (9 characters: - - ----- - -)
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
- Gray secondary buttons (#f1f5f9 - `btn btn-secondary`)
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
All clearable state is managed in the parent component (page.tsx) to enable global "Clean All" and "Guardar" functionality, ensuring predictable data flow.

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

**Global Handlers:**
```typescript
// Save Handler
const handleSave = () => {
  if (!hasAnyData()) {
    console.warn('No data to save - all fields are empty');
    return;
  }
  
  const productData: ProductData = {
    productCode: { clasificacion, parte, numero, color, aditamento, generated },
    compatibility: { items: compatibilities, generated },
    description: { parte, posicion, lado, generated }
  };
  
  console.log('Product Data:', productData);
};

// Clean Handler
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

**Helper Functions (in page.tsx):**
Three helper functions mirror generation logic from child components:
- `generateProductCode()` - Creates formatted code string
- `generateCompatibilityString()` - Creates comma-separated string
- `generateProductDescription()` - Creates description with intelligent grouping

**Validation:**
- `hasAnyData()` - Returns true if ANY field has data across all sections

**Data Flow Diagram:**
```
page.tsx (parent - owns all state)
│
├── FloatingHeader
│   ├── "Guardar" button → handleSave()
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

## GUARDAR FEATURE (SAVE)

**ProductData Interface:**
```typescript
export interface ProductData {
  productCode: {
    clasificacion: string;
    parte: string;
    numero: string;
    color: string;
    aditamento: string;
    generated: string;  // Formatted code: "RS00123GTY"
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

**Architecture Benefits:**
- Database-ready structure (maps to Supabase JSONB columns)
- Stores both raw values AND generated strings
- Easy to add metadata (timestamps, user IDs, order IDs)
- Testable helper functions (pure, no side effects)
- Follows existing lifted state pattern

**Console Output Example:**
```javascript
Product Data: {
  productCode: {
    clasificacion: "R",
    parte: "s",
    numero: "00123",
    color: "GT",
    aditamento: "Y",
    generated: "RS00123GTY"
  },
  compatibility: {
    items: [
      { marca: "Honda", subModelo: "Accord", modelo: "2020" },
      { marca: "Honda", subModelo: "Accord", modelo: "2021" }
    ],
    generated: "HONDA ACCORD 2020, HONDA ACCORD 2021"
  },
  description: {
    parte: "s",
    posicion: "Front",
    lado: "Left",
    generated: "SIDE FRONT LEFT HONDA ACCORD 2020, 2021"
  }
}
```

**Future Supabase Integration:**
When ready to connect database:
1. Create products table with JSONB columns
2. Replace `console.log()` with `await supabase.from('products').insert()`
3. Add success/error toast notifications
4. Add metadata fields (created_at, user_id, order_id, status)

**Suggested Database Schema:**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_code_data JSONB NOT NULL,
  compatibility_data JSONB NOT NULL,
  description_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  order_id UUID,
  status TEXT DEFAULT 'draft'
);
```

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
- Sticky header provides easy access to "Guardar" and "Clean All" buttons
- Guardar button silent operation (no visual feedback for now)

## DATA STRUCTURE

**Compatibility Interface:**
```typescript
interface Compatibility {
  marca: string;      // Car brand name
  subModelo: string;  // Sub-model name
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
    generated: string;
  };
  compatibility: {
    items: Compatibility[];
    generated: string;
  };
  description: {
    parte: string;
    posicion: string;
    lado: string;
    generated: string;
  };
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
├── page.tsx (parent - owns all state, save/clean handlers)
├── layout.tsx (Next.js app layout)
├── globals.css (global styles and Tailwind config)
└── components/
    ├── FloatingHeader.tsx (header with Guardar and Clean All buttons)
    ├── CodeGenerator.tsx (controlled component - code generation)
    ├── ProductDescription.tsx (controlled component - description)
    └── ProductCompatibility.tsx (controlled component - compatibility)

carBrands.tsx (data file - car brands and sub-models)

docs/
├── PROJECT_SPEC.md (this file)
├── STATE_MANAGEMENT_REFACTOR.md (state architecture documentation)
└── TESTING.md (comprehensive testing guide)
```

## COMPONENT PROPS (TypeScript Interfaces)

**FloatingHeader:**
```typescript
interface FloatingHeaderProps {
  onSave: () => void;
  onCleanAll: () => void;
}
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

## FUTURE ENHANCEMENT OPPORTUNITIES

With current architecture, these features are easy to add:

**Immediate (when Supabase ready):**
1. **Database Integration** - Replace console.log with Supabase insert
2. **Success Toast** - Visual feedback after successful save
3. **Error Handling** - Display errors if save fails
4. **Timestamps** - Add created_at, updated_at to ProductData

**Medium-term:**
1. **Persistence** - Save/load state to localStorage or database
2. **Undo/Redo** - Keep history of parent state changes
3. **URL State** - Sync state with URL query parameters
4. **Export** - Serialize parent state to JSON/CSV/PDF
5. **Form Validation** - Centralized validation in parent
6. **Analytics** - Track state changes from one location
7. **Multi-language** - Centralized state makes i18n easier

**Long-term:**
1. **User Authentication** - Link saved products to users
2. **Order Management** - Connect products to orders
3. **Product Library** - View/edit/delete saved products
4. **Batch Operations** - Save multiple products at once
5. **Product Templates** - Save common configurations
6. **Collaboration** - Share products between users
7. **Audit Trail** - Track who created/modified products

---

## SUMMARY

This application provides a professional, efficient tool for Rhino Auto Glass to generate product codes, manage compatibility data, and create product descriptions. The architecture follows React best practices with lifted state, controlled components, and a clear separation of concerns. The Guardar feature provides a foundation for future database integration while maintaining simple, testable code.

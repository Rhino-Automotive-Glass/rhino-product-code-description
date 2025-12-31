# Data Flow Architecture - Guardar Feature

## Component Hierarchy

```
page.tsx (Parent - owns all state)
│
├── FloatingHeader
│   ├── Guardar button → handleSave()
│   └── Clean All button → handleGlobalClean()
│
├── CodeGenerator (controlled)
│   ├── Receives: clasificacion, parte, numero, color, aditamento + setters
│   └── Displays: Generated product code
│
├── ProductCompatibility (controlled)
│   ├── Receives: compatibilities, setCompatibilities
│   └── Displays: Compatibility list + generated string
│
└── ProductDescription (controlled)
    ├── Receives: parte (shared), posicion, lado, compatibilities + setters
    └── Displays: Generated product description
```

---

## Save Flow Diagram

```
User clicks "Guardar"
       ↓
FloatingHeader.onSave() called
       ↓
page.tsx.handleSave() executes
       ↓
┌──────────────────────┐
│   hasAnyData()?      │ → NO → console.warn() → EXIT
└──────────────────────┘
       ↓ YES
       ↓
┌────────────────────────────────────────┐
│  Collect Raw State Values              │
│  - clasificacion, parte, numero, etc.  │
│  - compatibilities array               │
│  - posicion, lado                      │
└────────────────────────────────────────┘
       ↓
┌────────────────────────────────────────┐
│  Generate Formatted Strings            │
│  - generateProductCode()               │
│  - generateCompatibilityString()       │
│  - generateProductDescription()        │
└────────────────────────────────────────┘
       ↓
┌────────────────────────────────────────┐
│  Build ProductData Object              │
│  {                                     │
│    productCode: {...},                 │
│    compatibility: {...},               │
│    description: {...}                  │
│  }                                     │
└────────────────────────────────────────┘
       ↓
┌────────────────────────────────────────┐
│  console.log('Product Data:', data)    │
└────────────────────────────────────────┘
       ↓
    (Future: Save to Supabase)
```

---

## State Management Flow

### Current State (Lifted State Pattern)

```
┌─────────────────────────────────────────────────────┐
│                     page.tsx                         │
│                                                      │
│  State (Single Source of Truth):                    │
│  ├── clasificacion ────────────┐                    │
│  ├── parte ────────────────────┼──── SHARED ─────┐  │
│  ├── numero                    │                  │  │
│  ├── color                     │                  │  │
│  ├── aditamento                │                  │  │
│  ├── posicion                  │                  │  │
│  ├── lado                      │                  │  │
│  └── compatibilities           │                  │  │
│                                │                  │  │
│  Helper Functions:             │                  │  │
│  ├── generateProductCode() ────┘                  │  │
│  ├── generateCompatibilityString()                │  │
│  └── generateProductDescription() ────────────────┘  │
│                                                      │
│  Handlers:                                           │
│  ├── handleSave() ──────→ Uses all state + helpers  │
│  └── handleGlobalClean() ──→ Clears all state       │
└─────────────────────────────────────────────────────┘
           ↓ Props down                  ↓ Props down
    ┌──────────────┐              ┌─────────────────┐
    │ CodeGenerator│              │ ProductCompatib │
    │              │              │      ility      │
    └──────────────┘              └─────────────────┘
           ↓ Props down
    ┌────────────────────┐
    │ ProductDescription │
    └────────────────────┘
```

---

## Data Structure Deep Dive

### ProductData Interface

```typescript
interface ProductData {
  productCode: {
    // Raw state values
    clasificacion: string;  // User selection: 'R', 'D', 'F'
    parte: string;          // User selection: 's', 'b', 'd', 'q', 'v'
    numero: string;         // User input: '123'
    color: string;          // User selection: 'GT', 'YT', 'YP', 'CL'
    aditamento: string;     // User selection: 'Y', 'N'
    
    // Generated/computed value
    generated: string;      // Formatted code: 'RS00123GTY'
  };
  
  compatibility: {
    // Raw state values
    items: Array<{
      marca: string;        // e.g., 'TOYOTA'
      subModelo: string;    // e.g., 'CAMRY' (empty for custom)
      modelo: string;       // e.g., '2020'
    }>;
    
    // Generated/computed value
    generated: string;      // Formatted: 'TOYOTA CAMRY 2020, ...'
  };
  
  description: {
    // Raw state values
    parte: string;          // Shared with productCode.parte
    posicion: string;       // User selection: 'Front', 'Rear'
    lado: string;           // User selection: 'Left', 'Right'
    
    // Generated/computed value
    generated: string;      // Formatted: 'SIDE FRONT LEFT ...'
  };
}
```

---

## Validation Logic

```
hasAnyData() function checks:

┌─────────────────────────────────────────┐
│ CodeGenerator fields                    │
│ - clasificacion ||                      │
│ - parte ||                              │
│ - numero ||                             │
│ - color ||                              │
│ - aditamento                            │
└─────────────────────────────────────────┘
              ↓ OR
┌─────────────────────────────────────────┐
│ ProductCompatibility fields             │
│ - compatibilities.length > 0            │
└─────────────────────────────────────────┘
              ↓ OR
┌─────────────────────────────────────────┐
│ ProductDescription fields               │
│ - posicion ||                           │
│ - lado                                  │
└─────────────────────────────────────────┘
              ↓
       Returns boolean
       
If ANY field has data → true
If ALL fields empty → false
```

---

## Future Database Flow

### When Supabase is Integrated

```
User clicks "Guardar"
       ↓
handleSave() executes
       ↓
hasAnyData() validates
       ↓
Build ProductData object
       ↓
┌────────────────────────────────────────┐
│  Supabase Insert                       │
│                                        │
│  await supabase                        │
│    .from('products')                   │
│    .insert({                           │
│      product_code_data,                │
│      compatibility_data,               │
│      description_data,                 │
│      created_at: new Date()            │
│    })                                  │
└────────────────────────────────────────┘
       ↓
    Success? ────┬──── YES → Show toast, clear form
                 │
                 └──── NO → Show error toast, keep data
```

### Suggested Supabase Schema

```sql
products table:
┌──────────────────┬─────────────┬──────────────────────┐
│ Column           │ Type        │ Description          │
├──────────────────┼─────────────┼──────────────────────┤
│ id               │ uuid        │ Primary key          │
│ product_code_data│ jsonb       │ ProductCode object   │
│ compatibility... │ jsonb       │ Compatibility object │
│ description_data │ jsonb       │ Description object   │
│ created_at       │ timestamptz │ Auto-generated       │
│ updated_at       │ timestamptz │ Auto-updated         │
│ user_id          │ uuid        │ FK to auth.users     │
│ order_id         │ uuid        │ FK to orders table   │
│ status           │ text        │ draft/saved/ordered  │
└──────────────────┴─────────────┴──────────────────────┘

Indexes:
- id (primary)
- user_id (for user queries)
- order_id (for order queries)
- created_at (for date sorting)
- (product_code_data->>'generated') (for code search)
```

---

## Helper Functions Relationship

```
CodeGenerator component
       ↓ (mirrors logic)
generateProductCode() in page.tsx
       ↓ (uses)
State: clasificacion, parte, numero, color, aditamento
       ↓ (produces)
Generated string: 'RS00123GTY'

─────────────────────────────────────

ProductCompatibility component
       ↓ (mirrors logic)
generateCompatibilityString() in page.tsx
       ↓ (uses)
State: compatibilities array
       ↓ (produces)
Generated string: 'TOYOTA CAMRY 2020, TOYOTA CAMRY 2021'

─────────────────────────────────────

ProductDescription component
       ↓ (mirrors logic)
generateProductDescription() in page.tsx
       ↓ (uses)
State: parte, posicion, lado, compatibilities
       ↓ (produces)
Generated string: 'SIDE FRONT LEFT TOYOTA CAMRY 2020, 2021'
```

---

## Event Flow Timeline

```
Time    Event                           State Change
────────────────────────────────────────────────────────
0ms     User fills form                 State updates in real-time
        (CodeGenerator)                 via controlled components
                                        
100ms   User adds compatibility         compatibilities array
        (ProductCompatibility)          gets new item
                                        
200ms   User selects position           posicion state updates
        (ProductDescription)            
                                        
300ms   User clicks "Guardar"           No state change
        (FloatingHeader)                
                                        
301ms   handleSave() called             No state change
                                        
302ms   hasAnyData() validates          No state change
                                        
303ms   Helper functions called         No state change
        - generateProductCode()         (pure functions)
        - generateCompatibility...      
        - generateProductDesc...        
                                        
304ms   ProductData object built        No state change
                                        
305ms   console.log executed            No state change
                                        
        (Future: Supabase insert)       No state change
                                        (until we add that)
```

---

## Why This Architecture?

### ✅ Benefits

1. **Single Source of Truth**
   - All clearable state lives in page.tsx
   - Easy to see what handleSave() will collect
   - No hidden state in child components

2. **Predictable Data Flow**
   - Unidirectional: Parent → Children
   - Changes flow through props
   - No side effects or async state sync

3. **Easy Testing**
   - Helper functions are pure (same input → same output)
   - No mocking needed for validation
   - Clear separation of concerns

4. **Database Ready**
   - Data structure matches DB schema
   - Just swap console.log with DB insert
   - No refactoring needed

5. **Maintainable**
   - Logic mirrors UI components
   - Easy for new developers to understand
   - Self-documenting through structure

### 📊 Comparison with Alternatives

**Our Approach (Lifted State):**
```
Parent: Owns all state, builds ProductData
Children: Render UI, call setters
Result: Simple, predictable, testable
```

**Alternative 1 (Refs to children):**
```
Parent: Uses refs to call child methods
Children: Expose save methods via useImperativeHandle
Result: Complex, harder to test, tightly coupled
```

**Alternative 2 (Global state):**
```
Redux/Zustand: Store all state globally
Components: Connect to global store
Result: Overkill for this app size, boilerplate heavy
```

**Alternative 3 (Form library):**
```
React Hook Form: Manages all form state
Components: Register with form controller
Result: Learning curve, less control, abstraction
```

---

## Extensibility

### Easy to Add:

✅ **Timestamps**
```typescript
const productData: ProductData = {
  ...existing,
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date()
  }
};
```

✅ **User Tracking**
```typescript
const productData: ProductData = {
  ...existing,
  metadata: {
    userId: session.user.id,
    userName: session.user.name
  }
};
```

✅ **Order Linking**
```typescript
const productData: ProductData = {
  ...existing,
  orderId: currentOrder.id,
  orderStatus: 'pending'
};
```

✅ **Export to JSON**
```typescript
const handleExport = () => {
  const productData = buildProductData();
  const blob = new Blob([JSON.stringify(productData, null, 2)]);
  saveAs(blob, 'product-data.json');
};
```

✅ **Undo/Redo**
```typescript
const [history, setHistory] = useState<ProductData[]>([]);

const handleSave = () => {
  const productData = buildProductData();
  setHistory([...history, productData]);
  // ... rest of save logic
};
```

---

This architecture gives you maximum flexibility for future enhancements while keeping the codebase clean and maintainable! 🚀

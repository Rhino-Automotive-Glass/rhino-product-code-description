# Rhino Auto-Number Architecture

## Feature Overview
When a user selects "R - Rhino Automotive" in the clasificacion field, the numero field should automatically be filled with the next available sequential number (00001, 00002, etc.) from the database and become read-only.

---

## Architecture Design

### 1. Database Layer

#### Option A: Dedicated Counter Table (Recommended)
Create a new table to track auto-increment counters:

```sql
CREATE TABLE counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the Rhino counter
INSERT INTO counters (name, current_value)
VALUES ('rhino_auto_number', 0);

-- Function to get and increment atomically
CREATE OR REPLACE FUNCTION get_next_rhino_number()
RETURNS INTEGER AS $$
DECLARE
  next_val INTEGER;
BEGIN
  UPDATE counters
  SET current_value = current_value + 1,
      updated_at = NOW()
  WHERE name = 'rhino_auto_number'
  RETURNING current_value INTO next_val;

  RETURN next_val;
END;
$$ LANGUAGE plpgsql;
```

**Advantages:**
- Atomic operations (thread-safe)
- Fast lookups
- Easy to reset or manage
- No gaps in sequence even if products are deleted

#### Option B: Query Max from Products Table (Alternative)
Query the existing product_codes table:

```sql
SELECT COALESCE(
  MAX(CAST(product_code_data->>'numero' AS INTEGER)),
  0
) + 1 as next_number
FROM product_codes
WHERE product_code_data->>'clasificacion' = 'R'
AND product_code_data->>'numero' ~ '^[0-9]+$';
```

**Disadvantages:**
- Slower (table scan)
- Can create gaps if products are deleted
- Race conditions possible without proper locking

**Recommendation: Use Option A (Counter Table)**

---

### 2. API Layer

#### 2.1 New Endpoint: Get Next Rhino Number

**File:** `app/api/counters/rhino-next/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Call the stored function to get next number atomically
    const { data, error } = await supabase
      .rpc('get_next_rhino_number');

    if (error) {
      console.error('Error getting next Rhino number:', error);
      return NextResponse.json(
        { error: 'Failed to get next Rhino number' },
        { status: 500 }
      );
    }

    // Format as 5-digit string
    const formattedNumber = data.toString().padStart(5, '0');

    return NextResponse.json({
      number: formattedNumber,
      rawValue: data,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Response format:**
```json
{
  "number": "00001",
  "rawValue": 1
}
```

#### 2.2 Update Product Save Endpoint

**File:** `app/api/products/route.ts`

Add validation to ensure Rhino products use sequential numbers:

```typescript
// In POST handler, before saving:
if (productCode.clasificacion === 'R') {
  // Validate that numero is numeric and from our sequence
  const numeroValue = parseInt(productCode.numero);

  // Optional: Verify it's within expected range
  const { data: counterData } = await supabase
    .from('counters')
    .select('current_value')
    .eq('name', 'rhino_auto_number')
    .single();

  if (numeroValue > counterData.current_value) {
    return NextResponse.json(
      { error: 'Invalid Rhino number - number not reserved' },
      { status: 400 }
    );
  }
}
```

---

### 3. Frontend Layer

#### 3.1 State Management Updates

**File:** `app/page.tsx`

Add new state for tracking Rhino auto-number:

```typescript
const [isRhinoAutoMode, setIsRhinoAutoMode] = useState(false);
const [isLoadingRhinoNumber, setIsLoadingRhinoNumber] = useState(false);
const [rhinoNumberReserved, setRhinoNumberReserved] = useState(false);
```

#### 3.2 Watch Clasificacion Changes

Add useEffect to monitor clasificacion field:

```typescript
useEffect(() => {
  const handleClasificacionChange = async () => {
    if (clasificacion === 'r') {
      // Rhino Automotive selected
      setIsRhinoAutoMode(true);
      setIsLoadingRhinoNumber(true);

      try {
        const response = await fetch('/api/counters/rhino-next');
        const data = await response.json();

        if (response.ok) {
          setNumero(data.rawValue.toString()); // Store as raw number (1, 2, 3)
          setRhinoNumberReserved(true);
        } else {
          console.error('Failed to get Rhino number:', data.error);
          alert('Error al obtener el número Rhino automático');
        }
      } catch (error) {
        console.error('Error fetching Rhino number:', error);
        alert('Error de conexión al obtener número Rhino');
      } finally {
        setIsLoadingRhinoNumber(false);
      }
    } else {
      // Other clasificacion selected
      setIsRhinoAutoMode(false);
      setRhinoNumberReserved(false);
      // Don't clear numero - let user edit if they want
    }
  };

  handleClasificacionChange();
}, [clasificacion]);
```

#### 3.3 Update Numero Input Field

Modify the numero input to be disabled when in Rhino mode:

```typescript
<input
  type="text"
  value={numero}
  onChange={(e) => setNumero(e.target.value)}
  disabled={isRhinoAutoMode || isLoadingRhinoNumber}
  className={`input-base ${
    isRhinoAutoMode ? 'bg-slate-100 cursor-not-allowed' : ''
  }`}
  placeholder={isLoadingRhinoNumber ? 'Obteniendo número...' : ''}
/>

{isRhinoAutoMode && (
  <p className="text-xs text-slate-500 mt-1">
    Número automático Rhino (no editable)
  </p>
)}
```

#### 3.4 Update Global Clean

Reset Rhino states when cleaning:

```typescript
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

  // Reset Rhino states
  setIsRhinoAutoMode(false);
  setRhinoNumberReserved(false);
};
```

---

### 4. Edge Cases & Considerations

#### 4.1 User Switches Away from Rhino
**Scenario:** User selects R, gets number 00005, then changes to another clasificacion

**Solution:**
- Keep the number in the field (don't clear it)
- Re-enable the field for editing
- The reserved number is "lost" but that's acceptable
- Next user will get 00006

#### 4.2 User Gets Number but Doesn't Save
**Scenario:** User gets 00005 but clicks "Limpiar" or refreshes page

**Solution:**
- Number is reserved in counter but product not created
- This creates a gap (00005 is skipped)
- **Acceptable** - sequential numbers don't need to be gap-free
- Alternative: Implement a "release" mechanism (complex, not recommended)

#### 4.3 Concurrent Users
**Scenario:** Two users select R at the same time

**Solution:**
- Database function `get_next_rhino_number()` uses atomic UPDATE
- First request gets 00005, second gets 00006
- No collision possible due to database-level locking

#### 4.4 Manual Number Entry (Non-Rhino)
**Scenario:** User selects clasificacion = 'O' (Otro) and manually enters "00010"

**Solution:**
- Allowed - only R classification uses auto-increment
- Manual numbers can overlap with Rhino numbers
- Consider adding validation warning if number format matches Rhino pattern

#### 4.5 Editing Existing Products
**Scenario:** User edits a product that already has a Rhino number

**Solution:**
- In edit mode, keep the existing number
- Don't fetch a new number
- Disable field if clasificacion = R

---

### 5. Implementation Checklist

#### Phase 1: Database Setup
- [ ] Create `counters` table in Supabase
- [ ] Create `get_next_rhino_number()` function
- [ ] Initialize counter with value 0
- [ ] Test function directly in Supabase SQL editor

#### Phase 2: API Development
- [ ] Create `/api/counters/rhino-next/route.ts`
- [ ] Add GET endpoint to fetch next number
- [ ] Test endpoint with curl/Postman
- [ ] Add optional validation to POST `/api/products`

#### Phase 3: Frontend Integration
- [ ] Add Rhino state variables
- [ ] Add useEffect to watch clasificacion
- [ ] Update numero input to be conditional disabled
- [ ] Add loading state indicator
- [ ] Update handleGlobalClean
- [ ] Test user flow end-to-end

#### Phase 4: Testing
- [ ] Test sequential number generation (00001, 00002, 00003)
- [ ] Test switching between R and other clasificaciones
- [ ] Test concurrent users (if possible)
- [ ] Test number formatting (padding with zeros)
- [ ] Test error handling (API failures)

---

### 6. Future Enhancements

1. **Number Preview:** Show "Next number will be: 00005" before selecting R
2. **Reset Counter:** Admin interface to reset counter if needed
3. **Multiple Sequences:** Different counters for different clasificaciones
4. **Audit Trail:** Log which user reserved which number and when
5. **Number Recovery:** Mechanism to reclaim unused reserved numbers

---

### 7. Database Migration Script

For Supabase SQL Editor:

```sql
-- Step 1: Create counters table
CREATE TABLE IF NOT EXISTS counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Insert initial Rhino counter
INSERT INTO counters (name, current_value)
VALUES ('rhino_auto_number', 0)
ON CONFLICT (name) DO NOTHING;

-- Step 3: Create function to get next number atomically
CREATE OR REPLACE FUNCTION get_next_rhino_number()
RETURNS INTEGER AS $$
DECLARE
  next_val INTEGER;
BEGIN
  UPDATE counters
  SET current_value = current_value + 1,
      updated_at = NOW()
  WHERE name = 'rhino_auto_number'
  RETURNING current_value INTO next_val;

  RETURN next_val;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Grant permissions (adjust as needed)
GRANT SELECT ON counters TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_next_rhino_number() TO anon, authenticated;

-- Step 5: Test the function
SELECT get_next_rhino_number(); -- Should return 1
SELECT get_next_rhino_number(); -- Should return 2
SELECT get_next_rhino_number(); -- Should return 3

-- Step 6: Reset counter if needed (for testing)
-- UPDATE counters SET current_value = 0 WHERE name = 'rhino_auto_number';
```

---

## Summary

This architecture provides:
- ✅ **Atomic number generation** via database function
- ✅ **Thread-safe** concurrent access
- ✅ **Simple implementation** using existing Supabase infrastructure
- ✅ **Clear user experience** with auto-fill and disabled field
- ✅ **Minimal complexity** - straightforward to maintain
- ✅ **Scalable** - works with any number of users

The key insight is using a database-level counter with atomic updates, which handles all concurrency issues automatically.

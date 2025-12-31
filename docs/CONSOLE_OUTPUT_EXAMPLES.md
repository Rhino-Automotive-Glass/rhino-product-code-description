# Console Output Examples

## Example 1: Complete Product Entry

**User fills out:**
- Classification: R (Rhino Automotive)
- Parte: s (Side)
- Number: 123
- Color: GT (Green Tint)
- Accessory: Y
- Compatibility: TOYOTA CAMRY 2020, 2021, 2022
- Position: Front
- Side: Left

**Console output:**
```javascript
Product Data: {
  productCode: {
    clasificacion: 'R',
    parte: 's',
    numero: '123',
    color: 'GT',
    aditamento: 'Y',
    generated: 'RS00123GTY'
  },
  compatibility: {
    items: [
      { marca: 'TOYOTA', subModelo: 'CAMRY', modelo: '2020' },
      { marca: 'TOYOTA', subModelo: 'CAMRY', modelo: '2021' },
      { marca: 'TOYOTA', subModelo: 'CAMRY', modelo: '2022' }
    ],
    generated: 'TOYOTA CAMRY 2020, TOYOTA CAMRY 2021, TOYOTA CAMRY 2022'
  },
  description: {
    parte: 's',
    posicion: 'Front',
    lado: 'Left',
    generated: 'SIDE FRONT LEFT TOYOTA CAMRY 2020, 2021, 2022'
  }
}
```

---

## Example 2: Partial Entry (Only Product Code)

**User fills out:**
- Classification: D (Domestic)
- Parte: b (Back)
- Number: 5
- (Everything else empty)

**Console output:**
```javascript
Product Data: {
  productCode: {
    clasificacion: 'D',
    parte: 'b',
    numero: '5',
    color: '',
    aditamento: '',
    generated: 'DB00005--'
  },
  compatibility: {
    items: [],
    generated: '---'
  },
  description: {
    parte: 'b',
    posicion: '',
    lado: '',
    generated: 'BACK - -'
  }
}
```

---

## Example 3: Only Compatibility Data

**User fills out:**
- Compatibility: HONDA ACCORD 2023
- (Everything else empty)

**Console output:**
```javascript
Product Data: {
  productCode: {
    clasificacion: '',
    parte: '',
    numero: '',
    color: '',
    aditamento: '',
    generated: '------------'
  },
  compatibility: {
    items: [
      { marca: 'HONDA', subModelo: 'ACCORD', modelo: '2023' }
    ],
    generated: 'HONDA ACCORD 2023'
  },
  description: {
    parte: '',
    posicion: '',
    lado: '',
    generated: '- - - HONDA ACCORD 2023'
  }
}
```

---

## Example 4: Custom Compatibility ("Otro")

**User fills out:**
- Classification: R
- Parte: v (Vent)
- Number: 999
- Color: CL (Clear)
- Accessory: N
- Custom Compatibility: Tesla Model 3, 2024
- Position: Rear
- Side: Right

**Console output:**
```javascript
Product Data: {
  productCode: {
    clasificacion: 'R',
    parte: 'v',
    numero: '999',
    color: 'CL',
    aditamento: 'N',
    generated: 'RV00999CLN'
  },
  compatibility: {
    items: [
      { marca: 'Tesla Model 3', subModelo: '', modelo: '2024' }
    ],
    generated: 'TESLA MODEL 3 2024'
  },
  description: {
    parte: 'v',
    posicion: 'Rear',
    lado: 'Right',
    generated: 'VENT REAR RIGHT TESLA MODEL 3 2024'
  }
}
```

---

## Example 5: Multiple Brands and Models

**User fills out:**
- Classification: F (Foreign)
- Parte: d (Door)
- Number: 42
- Color: YP (Gray Tint Privacy)
- Accessory: Y
- Compatibility: 
  - TOYOTA CAMRY 2020, 2021
  - HONDA ACCORD 2022, 2023
  - NISSAN ALTIMA 2021
- Position: Front
- Side: Left

**Console output:**
```javascript
Product Data: {
  productCode: {
    clasificacion: 'F',
    parte: 'd',
    numero: '42',
    color: 'YP',
    aditamento: 'Y',
    generated: 'FD00042YPY'
  },
  compatibility: {
    items: [
      { marca: 'TOYOTA', subModelo: 'CAMRY', modelo: '2020' },
      { marca: 'TOYOTA', subModelo: 'CAMRY', modelo: '2021' },
      { marca: 'HONDA', subModelo: 'ACCORD', modelo: '2022' },
      { marca: 'HONDA', subModelo: 'ACCORD', modelo: '2023' },
      { marca: 'NISSAN', subModelo: 'ALTIMA', modelo: '2021' }
    ],
    generated: 'TOYOTA CAMRY 2020, TOYOTA CAMRY 2021, HONDA ACCORD 2022, HONDA ACCORD 2023, NISSAN ALTIMA 2021'
  },
  description: {
    parte: 'd',
    posicion: 'Front',
    lado: 'Left',
    generated: 'DOOR FRONT LEFT TOYOTA CAMRY 2020, 2021 HONDA ACCORD 2022, 2023 NISSAN ALTIMA 2021'
  }
}
```

---

## Example 6: Empty Save (Validation Warning)

**User clicks "Guardar" without filling anything**

**Console output:**
```
⚠️ No data to save - all fields are empty
```

---

## Understanding the Output Structure

### productCode Section
- **Raw values**: Individual form selections
- **generated**: Formatted code string (e.g., "RS00123GTY")
- Empty fields show as `''` (empty string)
- Generated code shows `-` for missing values

### compatibility Section
- **items**: Array of compatibility objects
  - Each has `marca`, `subModelo`, `modelo`
  - Custom entries have empty `subModelo: ''`
- **generated**: Formatted comma-separated string
- Empty state shows `items: []` and `generated: '---'`

### description Section
- **Raw values**: posicion, lado, parte
- **generated**: Intelligent grouped description
  - Groups by marca + subModelo
  - Shows years in ascending order
  - Handles multiple brands/models gracefully
- Empty fields show as `''`
- Generated description shows `-` for missing values

---

## Notes

1. **All generated strings are UPPERCASE**
2. **Parte is shared** between productCode and description
3. **Number auto-pads** to 5 digits (e.g., "5" becomes "00005")
4. **Compatibility grouping** happens in description generation
5. **Validation** only checks for ANY data, not completeness
6. **Custom compatibility** entries have empty subModelo field

---

## Next Steps

When integrating with Supabase:
1. You'll have both raw values AND generated strings
2. Can search/filter by raw values
3. Can display generated strings directly
4. Can regenerate strings from raw values if needed
5. Audit trail: See exactly what user selected

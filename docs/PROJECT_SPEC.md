Create a Next.js 16.1.0 application under the folder dev for Rhino Auto Glass, an Automotive Glass production company.

Consider that this is the first part of the scope of the application (Code Generation) This is a catalog reference code creation tool based on NAGS naming conventions. The second part of the scope will be called Product Description, which will be another form type section where the user selects another set of parameters resulting in another generated string very similar to this first part of the scope.

Encapsulate the first part of the scope under the concept Code Generation.
And reserve the second part of the scope under the concept Product Description.

REQUIREMENTS FOR FIRST PART OF THE SCOPE:

1. **UI Components:**
   - Heading: "Rhino Code Generator"
   - Subtitle: "Automotive Glass Production Catalog Reference"
   - Form with 5 fields (in order):
     a) Clasificación Comercial (dropdown): D - Doméstico, F - Foránea, R - Rhino Automotive
     b) Parte (radio buttons): s - Side, b - Back, d - Door, q - Quarter, v - Vent
     c) Número (text input): 5-digit number field, only accepts digits
     d) Color (dropdown): GT - Green Tint, YT - Gray Tint, YP - Gray Tint Privacy, CL - Clear
     e) Aditamento (radio buttons): Y, N
   - Single "Clean" button (centered)
   - Result display area showing "Generated Rhino Code"

2. **Functionality:**
   - Real-time code generation: Update the displayed code instantly whenever any field changes
   - No generate button needed - automatic updates on every selection/input
   - Number input validation: Only allow digits, max 5 characters, block additional input after 5 digits
   - Auto-pad numbers with leading zeros (e.g., "1" becomes "00001")
   - Final code format: [Clasificación][Parte][5-digit number][Color][Aditamento]
   - Example output: "RV00001GTY"
   - ALL generated codes must be UPPERCASE
   - Generated code display always shows dashes for missing values (e.g., "-----", "R----", "RV---", "RV00123--")
   - Clean button resets all fields and clears the result back to initial state with dashes

3. **Styling:**
   - Professional industrial aesthetic
   - Gradient purple background (similar to #667eea to #764ba2)
   - White card container with rounded corners and shadow
   - Clean, modern form design
   - Large, prominent code display (monospace font, 36px)
   - Result area with dashed border and light background
   - Smooth transitions and hover effects
   - Mobile responsive

4. **Layout:**
   - Desktop (≥768px): Two-column grid layout with Code Generator on left and Product Description on right
   - Mobile (<768px): Single column, stacked vertically with Code Generator on top, user scrolls down to Product Description
   - Product Description section should be an empty placeholder for now

5. **Technical Stack:**
   - Next.js 16.1.0 with App Router
   - TypeScript
   - Tailwind CSS for styling
   - React hooks (useState) for state management
   - Client-side component ('use client')

6. **User Experience:**
   - Dropdowns start with "Select..." option
   - Radio buttons are clearly labeled and can only be reset via Clean button
   - Number input has placeholder "00000"
   - Clean button with hover effect
   - Instant visual feedback on all interactions
   - Code display always visible showing current state with dashes for empty fields

Please create a single-page Next.js application with proper file structure (app/page.tsx, app/components/) that implements all these features.
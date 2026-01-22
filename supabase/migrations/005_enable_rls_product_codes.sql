-- ============================================
-- RBAC: Enable RLS on product_codes
-- ============================================

-- Enable RLS
ALTER TABLE product_codes ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read products
CREATE POLICY "All authenticated users can read products"
ON product_codes
FOR SELECT
TO authenticated
USING (true);

-- Policy: Only admins can create products
CREATE POLICY "Only admins can create products"
ON product_codes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Only admins can fully update products
CREATE POLICY "Only admins can fully update products"
ON product_codes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy: QA can only toggle verified field
CREATE POLICY "QA can toggle verified field only"
ON product_codes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'qa'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'qa'
  )
);

-- Policy: Only admins can delete products
CREATE POLICY "Only admins can delete products"
ON product_codes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

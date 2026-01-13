-- Add verified column to product_codes table
-- This migration adds a boolean column to track verification status

ALTER TABLE product_codes
ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;

-- Add comment to the column for documentation
COMMENT ON COLUMN product_codes.verified IS 'Indicates whether the product code has been verified by a user';

-- Create an index for better query performance when filtering by verified status
CREATE INDEX IF NOT EXISTS idx_product_codes_verified ON product_codes(verified);

-- Optionally, you can set existing products to verified if needed
-- UPDATE product_codes SET verified = false WHERE verified IS NULL;

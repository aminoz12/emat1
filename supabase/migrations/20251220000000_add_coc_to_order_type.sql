-- Migration: Add 'coc' to order_type enum if it doesn't exist
-- This fixes the error: invalid input value for enum order_type: "coc"

-- Check if 'coc' already exists in the enum, if not add it
DO $$ 
BEGIN
  -- Check if 'coc' value exists in order_type enum
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_enum 
    WHERE enumlabel = 'coc' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_type')
  ) THEN
    -- Add 'coc' to the order_type enum
    ALTER TYPE order_type ADD VALUE 'coc';
    RAISE NOTICE 'Added ''coc'' to order_type enum';
  ELSE
    RAISE NOTICE '''coc'' already exists in order_type enum';
  END IF;
END $$;


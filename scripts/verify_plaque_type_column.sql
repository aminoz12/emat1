-- Script to verify and add plaque_type column if it doesn't exist
-- Run this in Supabase SQL Editor if you're getting "Could not find the 'plaque_type' column" errors

-- Check if column exists
DO $$ 
BEGIN
  -- Check if plaque_type column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'plaque_type'
  ) THEN
    -- Add the column if it doesn't exist
    ALTER TABLE public.orders 
    ADD COLUMN plaque_type TEXT;
    
    RAISE NOTICE 'Added plaque_type column to orders table';
  ELSE
    RAISE NOTICE 'plaque_type column already exists in orders table';
  END IF;
  
  -- Add comment to explain the column
  COMMENT ON COLUMN public.orders.plaque_type IS 'Type of plaque for plaque orders: permanente or ww-provisoire';
  
  -- Create index if it doesn't exist
  CREATE INDEX IF NOT EXISTS idx_orders_plaque_type ON public.orders(plaque_type) 
  WHERE plaque_type IS NOT NULL;
  
  RAISE NOTICE 'Index created or already exists';
END $$;

-- Verify the column exists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders' 
AND column_name = 'plaque_type';


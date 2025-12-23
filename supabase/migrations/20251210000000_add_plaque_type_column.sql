-- Migration: Add plaque_type column to orders table
-- This column stores the type of plaque for plaque orders: 'permanente' or 'ww-provisoire'

-- Add plaque_type column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS plaque_type TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.orders.plaque_type IS 'Type of plaque for plaque orders: permanente or ww-provisoire';

-- Create index for better query performance when filtering by plaque type
CREATE INDEX IF NOT EXISTS idx_orders_plaque_type ON public.orders(plaque_type) 
WHERE plaque_type IS NOT NULL;

-- Update existing orders with plaque type from metadata if available
UPDATE public.orders 
SET plaque_type = (metadata->>'plaqueType')::TEXT
WHERE type = 'plaque' 
  AND metadata->>'plaqueType' IS NOT NULL
  AND plaque_type IS NULL;


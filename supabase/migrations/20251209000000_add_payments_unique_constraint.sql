-- Add unique constraint on order_id in payments table
-- This allows upsert operations to work properly

-- First, remove any duplicate payments (keep the most recent one)
DELETE FROM public.payments p1
WHERE EXISTS (
  SELECT 1 FROM public.payments p2
  WHERE p2.order_id = p1.order_id
  AND p2.created_at > p1.created_at
);

-- Add unique constraint
ALTER TABLE public.payments
ADD CONSTRAINT payments_order_id_unique UNIQUE (order_id);

-- Add index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_sumup_checkout_id ON public.payments(sumup_checkout_id);


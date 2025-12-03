-- Remove Stripe column from payments table
ALTER TABLE public.payments 
DROP COLUMN IF EXISTS stripe_payment_intent_id;
-- 🔧 FIX: Allow admins to view all orders
-- This script adds RLS policies so admins can see all orders in the admin panel

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- Create policy for admins to view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'ADMIN' OR profiles.role = 'SUPER_ADMIN')
    )
    OR auth.uid() = user_id  -- Users can still see their own orders
  );

-- Create policy for admins to update all orders
CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'ADMIN' OR profiles.role = 'SUPER_ADMIN')
    )
    OR auth.uid() = user_id  -- Users can still update their own orders
  );

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

SELECT '✅ RLS policies for admin orders access created successfully!' as message;



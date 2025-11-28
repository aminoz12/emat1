-- ✅ RÉACTIVER RLS APRÈS TEST

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Créer des policies simples
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users" ON public.profiles;

CREATE POLICY "Enable insert for authenticated users"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Enable update for users"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

SELECT '✅ RLS réactivé avec policies simples.' as message;



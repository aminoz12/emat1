-- ⚠️ DÉSACTIVER RLS TEMPORAIREMENT POUR TEST
-- Utilisez ce script UNIQUEMENT pour tester si RLS est le problème

-- Désactiver RLS sur profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Vérifier
SELECT 
  'RLS désactivé:' as status,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

SELECT '⚠️ RLS est maintenant DÉSACTIVÉ. Testez la création d''un compte.' as warning;
SELECT '⚠️ IMPORTANT: Réactivez RLS après le test avec: ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;' as reminder;



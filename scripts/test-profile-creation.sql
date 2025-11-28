-- 🧪 TEST - Vérifier que la création de profils fonctionne
-- Exécutez ce script après fix-profiles-only.sql pour tester

-- Test 1: Vérifier que le trigger existe et est actif
SELECT 
  'Test 1 - Trigger:' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN '✅ Trigger existe'
    ELSE '❌ Trigger manquant'
  END as result;

-- Test 2: Vérifier que la fonction existe
SELECT 
  'Test 2 - Fonction:' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'handle_new_user'
    ) THEN '✅ Fonction existe'
    ELSE '❌ Fonction manquante'
  END as result;

-- Test 3: Vérifier que la table profiles existe avec la bonne structure
SELECT 
  'Test 3 - Table profiles:' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN '✅ Table existe'
    ELSE '❌ Table manquante'
  END as result;

-- Test 4: Vérifier que la colonne role a le bon type
SELECT 
  'Test 4 - Type role:' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'role'
      AND udt_name = 'user_role'
    ) THEN '✅ Type role correct'
    ELSE '❌ Type role incorrect'
  END as result;

-- Test 5: Vérifier les RLS policies
SELECT 
  'Test 5 - RLS policies:' as test,
  COUNT(*)::text || ' policies actives' as result
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Instructions pour tester manuellement
SELECT 
  '📝 Instructions:' as info,
  '1. Allez sur http://localhost:3000/connexion' as step1,
  '2. Créez un nouveau compte' as step2,
  '3. Vérifiez que le profil est créé dans public.profiles' as step3;



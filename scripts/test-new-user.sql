-- 🧪 TEST - Simuler la création d'un utilisateur pour tester le trigger
-- ⚠️ Ce script teste le trigger sans créer de vrai utilisateur

-- Test 1: Vérifier que le trigger est actif
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
      AND event_object_table = 'users'
      AND event_manipulation = 'INSERT'
    ) THEN '✅ Trigger actif sur INSERT'
    ELSE '❌ Trigger manquant ou inactif'
  END as test_trigger;

-- Test 2: Vérifier que la fonction peut être exécutée
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'handle_new_user'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN '✅ Fonction existe dans le bon schéma'
    ELSE '❌ Fonction manquante ou dans le mauvais schéma'
  END as test_function;

-- Test 3: Vérifier les permissions de la fonction
SELECT 
  'Permissions de la fonction:' as info,
  proname as function_name,
  prosecdef as security_definer,
  proconfig as config
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Test 4: Vérifier que la table profiles est accessible
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles'
    ) THEN '✅ Table profiles existe'
    ELSE '❌ Table profiles manquante'
  END as test_table;

-- Test 5: Vérifier le type de la colonne role
SELECT 
  'Type de la colonne role:' as info,
  column_name,
  udt_name as enum_type,
  CASE 
    WHEN udt_name = 'user_role' THEN '✅ Type correct'
    ELSE '❌ Type incorrect: ' || udt_name
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name = 'role';

-- Instructions pour tester manuellement
SELECT 
  '📝 Pour tester:' as instruction,
  '1. Allez sur http://localhost:3000/connexion' as step1,
  '2. Créez un nouveau compte avec un email de test' as step2,
  '3. Vérifiez dans Supabase que le profil est créé automatiquement' as step3,
  '4. Si erreur, vérifiez les logs Supabase (Logs > Postgres Logs)' as step4;



-- 🧪 TEST - Insertion manuelle pour vérifier que la table fonctionne
-- Utilisez ce script pour tester si le problème vient de la table ou du trigger

-- Remplacer 'USER_ID_HERE' par un ID d'utilisateur réel de auth.users
-- Remplacer 'test@example.com' par un email de test

-- Test 1: Vérifier qu'on peut insérer manuellement
INSERT INTO public.profiles (id, email, role)
SELECT 
  id,
  email,
  'USER'::user_role
FROM auth.users
WHERE email = 'test@example.com'  -- Changez cet email
LIMIT 1
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Vérifier que l'insertion a fonctionné
SELECT 
  'Test insertion:' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE email = 'test@example.com'  -- Changez cet email
    ) THEN '✅ Insertion réussie'
    ELSE '❌ Insertion échouée'
  END as result;

-- Si l'insertion manuelle fonctionne, le problème vient du trigger
-- Si l'insertion manuelle échoue, le problème vient de la table/structure



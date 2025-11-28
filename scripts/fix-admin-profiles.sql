-- Script de diagnostic et correction des profils administrateurs
-- Ce script vérifie et corrige les profils manquants ou incomplets

-- ÉTAPE 1: DIAGNOSTIC - Voir tous les utilisateurs dans auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY email;

-- ÉTAPE 2: DIAGNOSTIC - Voir tous les profils existants
SELECT 
  id,
  email,
  role,
  created_at
FROM public.profiles
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY email;

-- ÉTAPE 3: DIAGNOSTIC - Voir les utilisateurs sans profils
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at,
  p.id as profile_id,
  p.email as profile_email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY u.email;

-- ÉTAPE 4: CORRECTION - Créer les profils manquants depuis auth.users
-- Cette commande crée les profils pour les utilisateurs qui n'en ont pas
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  CASE 
    WHEN u.email = 'mhammed@ematricule.fr' THEN 'SUPER_ADMIN'::user_role
    WHEN u.email IN ('admin2@ematricule.fr', 'admin3@ematricule.fr') THEN 'ADMIN'::user_role
    ELSE 'USER'::user_role
  END,
  COALESCE(u.created_at, NOW()),
  NOW()
FROM auth.users u
WHERE u.email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )
ON CONFLICT (id) DO NOTHING;

-- ÉTAPE 5: CORRECTION - Mettre à jour les emails manquants dans les profils existants
UPDATE public.profiles p
SET 
  email = u.email,
  role = CASE 
    WHEN u.email = 'mhammed@ematricule.fr' THEN 'SUPER_ADMIN'::user_role
    WHEN u.email IN ('admin2@ematricule.fr', 'admin3@ematricule.fr') THEN 'ADMIN'::user_role
    ELSE p.role
  END,
  updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
  AND u.email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
  AND (p.email IS NULL OR p.email != u.email);

-- ÉTAPE 6: CORRECTION - Mettre à jour les rôles pour les profils existants
UPDATE public.profiles
SET 
  role = CASE 
    WHEN email = 'mhammed@ematricule.fr' THEN 'SUPER_ADMIN'::user_role
    WHEN email IN ('admin2@ematricule.fr', 'admin3@ematricule.fr') THEN 'ADMIN'::user_role
    ELSE role
  END,
  updated_at = NOW()
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr');

-- ÉTAPE 7: VÉRIFICATION FINALE - Voir le résultat final
SELECT 
  p.id,
  p.email,
  p.role,
  u.email_confirmed_at,
  p.created_at,
  p.updated_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY p.email;



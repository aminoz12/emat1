-- Script pour insérer d'abord dans profiles, puis dans admins
-- ÉTAPE 1: Insérer dans public.profiles EN PREMIER

-- Vérifier que les utilisateurs existent dans auth.users
SELECT 
  'Vérification des utilisateurs dans auth.users:' as info,
  id,
  email,
  email_confirmed_at
FROM auth.users
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY email;

-- Insérer/Mettre à jour dans public.profiles
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
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Vérifier que les profils ont été créés/mis à jour
SELECT 
  'Profils créés dans public.profiles:' as info,
  id,
  email,
  role,
  created_at
FROM public.profiles
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY email;

-- ÉTAPE 2: Maintenant insérer dans public.admins (après que les profils existent)

INSERT INTO public.admins (id, email, role, is_main_admin, can_edit_admins, can_delete_admins, is_active)
SELECT 
  p.id,
  p.email,
  p.role,
  CASE WHEN p.email = 'mhammed@ematricule.fr' THEN true ELSE false END,
  CASE WHEN p.role = 'SUPER_ADMIN' THEN true ELSE false END,
  CASE WHEN p.role = 'SUPER_ADMIN' AND p.email != 'mhammed@ematricule.fr' THEN true ELSE false END,
  true
FROM public.profiles p
WHERE p.email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
  AND p.role IN ('ADMIN', 'SUPER_ADMIN')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_main_admin = CASE WHEN EXCLUDED.email = 'mhammed@ematricule.fr' THEN true ELSE admins.is_main_admin END,
  can_edit_admins = CASE WHEN EXCLUDED.role = 'SUPER_ADMIN' THEN true ELSE admins.can_edit_admins END,
  can_delete_admins = CASE WHEN EXCLUDED.role = 'SUPER_ADMIN' AND EXCLUDED.email != 'mhammed@ematricule.fr' THEN true ELSE admins.can_delete_admins END,
  updated_at = NOW();

-- Vérification finale: Afficher les admins créés
SELECT 
  'Admins créés dans public.admins:' as info,
  a.id,
  a.email,
  a.role,
  a.is_main_admin,
  a.can_edit_admins,
  a.can_delete_admins,
  a.is_active,
  a.created_at
FROM public.admins a
WHERE a.email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY a.is_main_admin DESC, a.email;


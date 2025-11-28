-- Script pour créer les 3 administrateurs dans la table admins
-- IMPORTANT: Exécutez d'abord create-admins-table.sql pour créer la table

-- Étape 1: Vérifier que les utilisateurs existent dans auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY email;

-- Étape 2: Créer/mettre à jour les profils avec les rôles
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

-- Étape 3: Les admins seront automatiquement créés dans la table admins via le trigger
-- Mais si le trigger n'existe pas encore, créons-les manuellement:
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

-- Étape 4: Vérification finale
SELECT 
  a.id,
  a.email,
  a.role,
  a.is_main_admin,
  a.can_edit_admins,
  a.can_delete_admins,
  a.is_active,
  p.email as profile_email,
  p.role as profile_role,
  u.email_confirmed_at
FROM public.admins a
LEFT JOIN public.profiles p ON a.id = p.id
LEFT JOIN auth.users u ON a.id = u.id
WHERE a.email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY a.is_main_admin DESC, a.email;


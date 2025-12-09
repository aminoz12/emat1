-- Script simplifié pour ajouter les 3 administrateurs
-- Exécutez ce script après avoir créé la table admins (create-admins-table.sql)

-- ÉTAPE 1: Vérifier que les utilisateurs existent dans auth.users
-- Si cette requête ne retourne pas 3 lignes, créez d'abord les utilisateurs dans Supabase Auth
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY email;

-- ÉTAPE 2: CRÉER/METTRE À JOUR LES PROFILS EN PREMIER
-- C'est important car la table admins référence profiles
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

-- Vérifier que les profils ont été créés
SELECT 
  id,
  email,
  role,
  created_at
FROM public.profiles
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY email;

-- ÉTAPE 3: CRÉER LES ADMINS DANS LA TABLE admins
-- Maintenant que les profils existent, on peut créer les entrées dans admins
-- (Le trigger devrait le faire automatiquement, mais on le fait manuellement pour être sûr)
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

-- ÉTAPE 4: VÉRIFICATION FINALE - Afficher tous les admins créés
SELECT 
  a.id,
  a.email,
  a.role,
  a.is_main_admin,
  a.can_edit_admins,
  a.can_delete_admins,
  a.is_active,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN 'Oui' 
    ELSE 'Non - Vérifiez dans Supabase Auth' 
  END as email_confirme,
  a.created_at
FROM public.admins a
LEFT JOIN auth.users u ON a.id = u.id
WHERE a.email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY a.is_main_admin DESC, a.email;


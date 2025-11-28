-- Script SQL pour créer les 3 administrateurs initiaux
-- IMPORTANT: Ce script crée uniquement les profils dans la table profiles
-- Les utilisateurs doivent être créés via l'interface Supabase Auth ou via l'API
-- 
-- Instructions:
-- 1. Créez d'abord les 3 utilisateurs dans Supabase Auth (Authentication > Users > Add User)
--    - mhammed@ematricule.fr (password: Mhammed92@++)
--    - admin2@ematricule.fr (password: Espace92@++)
--    - admin3@ematricule.fr (password: Espace92@++)
-- 2. Copiez les IDs des utilisateurs créés
-- 3. Exécutez ce script en remplaçant les IDs ci-dessous

-- Option 1: Si vous connaissez les IDs des utilisateurs
-- Remplacez 'user-id-1', 'user-id-2', 'user-id-3' par les vrais IDs
/*
INSERT INTO profiles (id, email, role, created_at, updated_at)
VALUES
  ('user-id-1', 'mhammed@ematricule.fr', 'SUPER_ADMIN'::user_role, NOW(), NOW()),
  ('user-id-2', 'admin2@ematricule.fr', 'ADMIN'::user_role, NOW(), NOW()),
  ('user-id-3', 'admin3@ematricule.fr', 'ADMIN'::user_role, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role,
  updated_at = NOW();
*/

-- Option 2: Mettre à jour par email (si les profils existent déjà)
UPDATE profiles
SET 
  role = CASE 
    WHEN email = 'mhammed@ematricule.fr' THEN 'SUPER_ADMIN'::user_role
    WHEN email IN ('admin2@ematricule.fr', 'admin3@ematricule.fr') THEN 'ADMIN'::user_role
    ELSE role
  END,
  updated_at = NOW()
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr');

-- Option 3: Créer les profils depuis auth.users (si les utilisateurs existent dans auth.users)
INSERT INTO profiles (id, email, role, created_at, updated_at)
SELECT 
  id,
  email,
  CASE 
    WHEN email = 'mhammed@ematricule.fr' THEN 'SUPER_ADMIN'::user_role
    WHEN email IN ('admin2@ematricule.fr', 'admin3@ematricule.fr') THEN 'ADMIN'::user_role
    ELSE 'USER'::user_role
  END,
  NOW(),
  NOW()
FROM auth.users
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role,
  updated_at = NOW();

-- Vérifier les admins créés
SELECT id, email, role, created_at
FROM profiles
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY email;


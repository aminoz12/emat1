-- Script SQL pour ajouter 3 administrateurs dans Supabase
-- Instructions:
-- 1. Ouvrez Supabase Dashboard
-- 2. Allez dans SQL Editor
-- 3. Collez ce script
-- 4. Remplacez les emails par les emails réels de vos utilisateurs
-- 5. Exécutez le script

-- Option 1: Mettre à jour des utilisateurs existants par leur email
UPDATE profiles
SET role = 'ADMIN'::user_role
WHERE email IN (
  'admin1@example.com',  -- Remplacez par le premier email
  'admin2@example.com',  -- Remplacez par le deuxième email
  'admin3@example.com'   -- Remplacez par le troisième email
);

-- Option 2: Mettre à jour par ID utilisateur (si vous connaissez les IDs)
-- UPDATE profiles
-- SET role = 'ADMIN'::user_role
-- WHERE id IN (
--   'user-id-1',
--   'user-id-2',
--   'user-id-3'
-- );

-- Option 3: Créer des profils ADMIN pour des utilisateurs qui n'ont pas encore de profil
-- (Assurez-vous que les utilisateurs existent dans auth.users d'abord)
-- INSERT INTO profiles (id, email, role, created_at, updated_at)
-- SELECT 
--   id,
--   email,
--   'ADMIN'::user_role,
--   NOW(),
--   NOW()
-- FROM auth.users
-- WHERE email IN (
--   'admin1@example.com',
--   'admin2@example.com',
--   'admin3@example.com'
-- )
-- ON CONFLICT (id) DO UPDATE SET role = 'ADMIN'::user_role;

-- Vérifier les admins créés
SELECT id, email, role, created_at
FROM profiles
WHERE role IN ('ADMIN', 'SUPER_ADMIN')
ORDER BY email;


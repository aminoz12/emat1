-- ⚠️ SCRIPT DE RÉINITIALISATION COMPLÈTE
-- Ce script supprime TOUT et recrée une configuration propre
-- ⚠️ ATTENTION: Ce script va supprimer toutes les données des tables concernées

-- ============================================
-- ÉTAPE 1: SUPPRIMER TOUT CE QUI A ÉTÉ CRÉÉ
-- ============================================

-- Supprimer les triggers sur admins
DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
DROP TRIGGER IF EXISTS sync_admin_on_profile_update ON public.profiles;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS public.handle_admins_updated_at();
DROP FUNCTION IF EXISTS public.sync_admin_from_profile();

-- Supprimer les policies de la table admins
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can update admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can insert admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can delete admins" ON public.admins;
  END IF;
END $$;

-- Supprimer la table admins
DROP TABLE IF EXISTS public.admins CASCADE;

-- ============================================
-- ÉTAPE 2: VÉRIFIER ET CORRIGER LE SCHÉMA DE BASE
-- ============================================

-- S'assurer que les types ENUM existent
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
  END IF;
END $$;

-- S'assurer que la table profiles existe et est correcte
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'FR',
  role user_role DEFAULT 'USER'::user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Créer les index pour profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- ÉTAPE 3: CORRIGER LE TRIGGER DE CRÉATION DE PROFIL
-- ============================================

-- Supprimer l'ancien trigger et fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recréer la fonction avec le cast correct
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'USER'::user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ÉTAPE 4: CRÉER LES PROFILS POUR LES 3 ADMINS
-- ============================================

-- Insérer/Mettre à jour les profils des admins
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

-- ============================================
-- ÉTAPE 5: VÉRIFICATION
-- ============================================

-- Vérifier les profils créés
SELECT 
  'Profils créés:' as info,
  id,
  email,
  role,
  created_at
FROM public.profiles
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY email;

-- Vérifier que le trigger fonctionne
SELECT 
  'Trigger vérifié:' as info,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';



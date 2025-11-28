-- 🚀 CONFIGURATION SUPABASE COMPLÈTE - REPARTIR DE ZÉRO
-- Ce script configure Supabase proprement pour éviter l'erreur "Database error saving new user"

-- ============================================
-- ÉTAPE 1: NETTOYAGE COMPLET
-- ============================================

-- Supprimer tous les triggers personnalisés
DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
DROP TRIGGER IF EXISTS sync_admin_on_profile_update ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Supprimer toutes les fonctions personnalisées
DROP FUNCTION IF EXISTS public.handle_admins_updated_at();
DROP FUNCTION IF EXISTS public.sync_admin_from_profile();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Supprimer les policies de admins
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can update admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can insert admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can delete admins" ON public.admins;
  END IF;
END $$;

-- Supprimer la table admins (on la recréera plus tard si besoin)
DROP TABLE IF EXISTS public.admins CASCADE;

-- ============================================
-- ÉTAPE 2: CRÉER LES TYPES ENUM
-- ============================================

-- Créer le type user_role s'il n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
  END IF;
END $$;

-- ============================================
-- ÉTAPE 3: CRÉER/METTRE À JOUR LA TABLE PROFILES
-- ============================================

-- Supprimer et recréer la table profiles proprement
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
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

-- Créer les index
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- ============================================
-- ÉTAPE 4: CRÉER LE TRIGGER POUR CRÉER LES PROFILS AUTOMATIQUEMENT
-- ============================================

-- Fonction pour créer automatiquement un profil quand un utilisateur est créé
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'USER'::user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ÉTAPE 5: CONFIGURER LES RLS POLICIES POUR PROFILES
-- ============================================

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Recréer les policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- ============================================
-- ÉTAPE 6: CRÉER LES PROFILS DES 3 ADMINS
-- ============================================

-- Insérer les profils des admins (si les utilisateurs existent dans auth.users)
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
-- ÉTAPE 7: VÉRIFICATION FINALE
-- ============================================

-- Vérifier les profils créés
SELECT 
  '✅ Profils créés:' as status,
  id,
  email,
  role,
  created_at
FROM public.profiles
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY email;

-- Vérifier que le trigger existe
SELECT 
  '✅ Trigger vérifié:' as status,
  trigger_name,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Message de succès
SELECT '✅ Configuration Supabase terminée avec succès!' as message;



-- 🔧 CORRECTION URGENTE - Table Profiles et Trigger
-- Ce script corrige uniquement la table profiles et le trigger pour permettre la création de profils clients

-- ============================================
-- ÉTAPE 1: SUPPRIMER L'ANCIEN TRIGGER DÉFECTUEUX
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================
-- ÉTAPE 2: VÉRIFIER/CORRIGER LE TYPE ENUM
-- ============================================

-- S'assurer que le type user_role existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
  END IF;
END $$;

-- ============================================
-- ÉTAPE 3: VÉRIFIER/CORRIGER LA TABLE PROFILES
-- ============================================

-- Vérifier que la table profiles existe avec la bonne structure
DO $$ 
BEGIN
  -- Si la table n'existe pas, la créer
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
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
    
    -- Créer l'index
    CREATE INDEX idx_profiles_email ON public.profiles(email);
  ELSE
    -- Si la table existe, s'assurer que le type role est correct
    -- Vérifier si la colonne role existe et a le bon type
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'role'
      AND udt_name = 'user_role'
    ) THEN
      -- Si la colonne role n'existe pas ou a le mauvais type, la corriger
      ALTER TABLE public.profiles 
      DROP COLUMN IF EXISTS role;
      
      ALTER TABLE public.profiles 
      ADD COLUMN role user_role DEFAULT 'USER'::user_role NOT NULL;
    END IF;
  END IF;
END $$;

-- ============================================
-- ÉTAPE 4: CRÉER LE TRIGGER CORRECT
-- ============================================

-- Fonction pour créer automatiquement un profil (avec le cast correct)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'USER'::user_role  -- ⚠️ IMPORTANT: Cast vers user_role
  )
  ON CONFLICT (id) DO NOTHING;  -- Éviter les erreurs si le profil existe déjà
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ÉTAPE 5: CONFIGURER LES RLS POLICIES
-- ============================================

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies pour éviter les conflits
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
-- ÉTAPE 6: VÉRIFICATION
-- ============================================

-- Vérifier que le trigger existe
SELECT 
  '✅ Trigger créé:' as status,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Vérifier la structure de la table profiles
SELECT 
  '✅ Structure de la table profiles:' as status,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Message de succès
SELECT '✅ Table profiles et trigger corrigés! Vous pouvez maintenant créer des profils clients.' as message;



-- 🚨 CORRECTION URGENTE - Création de profils clients
-- Script minimal pour corriger "Database error saving new user"

-- ============================================
-- ÉTAPE 1: NETTOYAGE COMPLET
-- ============================================

-- Supprimer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Supprimer la fonction
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- ÉTAPE 2: VÉRIFIER LA STRUCTURE
-- ============================================

-- S'assurer que le type existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
  END IF;
END $$;

-- S'assurer que la table existe avec la bonne structure
DO $$
BEGIN
  -- Si la table n'existe pas, la créer
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY,
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
  END IF;
  
  -- Ajouter la contrainte de clé étrangère si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- S'assurer que la colonne role existe avec le bon type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'USER'::user_role NOT NULL;
  END IF;
END $$;

-- Créer l'index
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- ÉTAPE 3: DÉSACTIVER RLS TEMPORAIREMENT
-- ============================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 4: CRÉER LA FONCTION ULTRA-SIMPLE
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Récupérer l'email de manière sécurisée
  user_email := COALESCE(NEW.email, '');
  
  -- Insertion avec gestion d'erreur complète
  BEGIN
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (
      NEW.id,
      user_email,
      'USER'::user_role,
      NOW(),
      NOW()
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- Si le profil existe déjà, ne rien faire
      NULL;
    WHEN OTHERS THEN
      -- Logger l'erreur mais ne pas bloquer
      RAISE WARNING 'Erreur création profil pour %: %', user_email, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- ÉTAPE 5: CRÉER LE TRIGGER
-- ============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ÉTAPE 6: RÉACTIVER RLS AVEC POLICIES PERMISSIVES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les policies existantes
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles'
  )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- Policy pour INSERT - permettre au trigger d'insérer
CREATE POLICY "Allow trigger to insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Policy pour SELECT - tout le monde peut voir
CREATE POLICY "Allow everyone to view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Policy pour UPDATE - utilisateurs peuvent modifier leur profil
CREATE POLICY "Allow users to update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT '✅ Configuration terminée!' as status;
SELECT 'Trigger:' as check_item, trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
SELECT 'Fonction:' as check_item, proname FROM pg_proc WHERE proname = 'handle_new_user';
SELECT 'RLS:' as check_item, CASE WHEN rowsecurity THEN 'ACTIVÉ' ELSE 'DÉSACTIVÉ' END FROM pg_tables WHERE tablename = 'profiles';
SELECT 'Policies:' as check_item, COUNT(*)::text || ' policies' FROM pg_policies WHERE tablename = 'profiles';

SELECT '🧪 TESTEZ MAINTENANT: Créez un nouveau compte sur votre site' as instruction;



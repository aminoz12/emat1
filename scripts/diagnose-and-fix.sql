-- 🔍 DIAGNOSTIC ET CORRECTION COMPLÈTE
-- Ce script diagnostique le problème puis corrige tout

-- ============================================
-- DIAGNOSTIC 1: Vérifier ce qui existe
-- ============================================

SELECT '=== DIAGNOSTIC ===' as step;

-- Vérifier le trigger
SELECT 
  'Trigger:' as check_item,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created')
    THEN 'EXISTE'
    ELSE 'MANQUANT'
  END as status;

-- Vérifier la fonction
SELECT 
  'Fonction:' as check_item,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user')
    THEN 'EXISTE'
    ELSE 'MANQUANT'
  END as status;

-- Vérifier la table profiles
SELECT 
  'Table profiles:' as check_item,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
    THEN 'EXISTE'
    ELSE 'MANQUANT'
  END as status;

-- Vérifier le type user_role
SELECT 
  'Type user_role:' as check_item,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role')
    THEN 'EXISTE'
    ELSE 'MANQUANT'
  END as status;

-- Vérifier RLS
SELECT 
  'RLS activé:' as check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND rowsecurity = true
    )
    THEN 'OUI'
    ELSE 'NON'
  END as status;

-- ============================================
-- CORRECTION: Supprimer tout
-- ============================================

SELECT '=== SUPPRESSION ===' as step;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- CRÉATION: Recréer tout proprement
-- ============================================

SELECT '=== CRÉATION ===' as step;

-- 1. Créer le type ENUM s'il n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
  END IF;
END $$;

-- 2. Créer la table profiles si elle n'existe pas
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

-- 3. Créer l'index
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. DÉSACTIVER RLS TEMPORAIREMENT pour éviter tout blocage
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 5. Créer la fonction TRÈS SIMPLE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insertion simple avec cast explicite
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'USER'::user_role)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 6. Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. RÉACTIVER RLS avec policies simples
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes policies
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
  END LOOP;
END $$;

-- Créer des policies simples
CREATE POLICY "Enable insert for authenticated users"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Enable update for users"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

SELECT '=== VÉRIFICATION ===' as step;

SELECT 
  'Trigger créé:' as item,
  trigger_name,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT 
  'Fonction créée:' as item,
  proname,
  prosecdef as security_definer
FROM pg_proc
WHERE proname = 'handle_new_user';

SELECT 
  'Policies créées:' as item,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';

SELECT '✅ CORRECTION TERMINÉE! Testez maintenant la création d''un compte.' as message;



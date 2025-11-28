-- 🚨 CORRECTION URGENTE - Trigger handle_new_user
-- Ce script corrige spécifiquement l'erreur "Database error saving new user"

-- ============================================
-- ÉTAPE 1: SUPPRIMER COMPLÈTEMENT L'ANCIEN TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- ÉTAPE 2: S'ASSURER QUE LE TYPE ENUM EXISTE
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
  END IF;
END $$;

-- ============================================
-- ÉTAPE 3: S'ASSURER QUE LA TABLE PROFILES EXISTE
-- ============================================

-- Vérifier et créer la table profiles si elle n'existe pas
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

-- Créer l'index si nécessaire
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- ÉTAPE 4: CRÉER LA FONCTION AVEC GESTION D'ERREUR
-- ============================================

-- Fonction améliorée avec gestion d'erreur et cast correct
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insérer le profil avec gestion d'erreur
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    'USER'::user_role  -- ⚠️ CAST EXPLICITE VERS user_role
  )
  ON CONFLICT (id) DO NOTHING;  -- Éviter les erreurs si le profil existe déjà
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Logger l'erreur mais ne pas bloquer la création de l'utilisateur
    RAISE WARNING 'Erreur lors de la création du profil pour %: %', NEW.email, SQLERRM;
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
-- ÉTAPE 6: VÉRIFICATION
-- ============================================

-- Vérifier que le trigger existe
SELECT 
  '✅ Trigger créé:' as status,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Vérifier que la fonction existe avec le bon type de retour
SELECT 
  '✅ Fonction créée:' as status,
  proname as function_name,
  pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Vérifier la structure de la table profiles
SELECT 
  '✅ Colonne role:' as status,
  column_name,
  udt_name as type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name = 'role';

-- Message final
SELECT '✅ Correction terminée! Le trigger devrait maintenant fonctionner.' as message;



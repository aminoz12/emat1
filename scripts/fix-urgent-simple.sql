-- 🚨 CORRECTION URGENTE ET SIMPLE
-- Script minimal pour corriger "Database error saving new user"

-- ============================================
-- ÉTAPE 1: SUPPRIMER TOUT
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- ÉTAPE 2: DÉSACTIVER RLS TEMPORAIREMENT
-- ============================================

ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 3: CRÉER LA FONCTION SIMPLE
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'USER'::user_role)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================
-- ÉTAPE 4: CRÉER LE TRIGGER
-- ============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ÉTAPE 5: RÉACTIVER RLS AVEC POLICIES SIMPLES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Policy pour permettre l'insertion par le trigger (SECURITY DEFINER)
-- Le trigger utilise SECURITY DEFINER donc il peut insérer même avec RLS activé

-- Policy pour que les utilisateurs voient leur propre profil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy pour que les utilisateurs modifient leur propre profil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy pour que tout le monde puisse voir les profils (pour les admins)
CREATE POLICY "Everyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT '✅ Correction appliquée! Testez maintenant la création d''un compte.' as message;



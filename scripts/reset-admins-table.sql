-- Script pour réinitialiser complètement la table admins
-- ⚠️ ATTENTION: Ce script supprime et recrée la table admins
-- Utilisez-le uniquement si vous voulez repartir de zéro

-- Étape 1: Supprimer tous les triggers
DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
DROP TRIGGER IF EXISTS sync_admin_on_profile_update ON public.profiles;

-- Étape 2: Supprimer toutes les policies
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can update admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can insert admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can delete admins" ON public.admins;
  END IF;
END $$;

-- Étape 3: Supprimer les fonctions
DROP FUNCTION IF EXISTS public.handle_admins_updated_at();
DROP FUNCTION IF EXISTS public.sync_admin_from_profile();

-- Étape 4: Supprimer la table (si elle existe)
DROP TABLE IF EXISTS public.admins CASCADE;

-- Étape 5: Recréer la table et tout le reste
-- Maintenant exécutez le script create-admins-table.sql



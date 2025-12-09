-- Table admins séparée pour une meilleure gestion des administrateurs
-- Cette table est synchronisée automatiquement avec la table profiles

-- Supprimer les triggers existants si la table existe déjà
DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
DROP TRIGGER IF EXISTS sync_admin_on_profile_update ON public.profiles;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS public.handle_admins_updated_at();
DROP FUNCTION IF EXISTS public.sync_admin_from_profile();

-- Supprimer les policies existantes (si la table existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can update admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can insert admins" ON public.admins;
    DROP POLICY IF EXISTS "Super admins can delete admins" ON public.admins;
  END IF;
END $$;

-- Créer la table admins
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'ADMIN'::user_role,
  is_main_admin BOOLEAN DEFAULT false NOT NULL,
  can_edit_admins BOOLEAN DEFAULT false NOT NULL,
  can_delete_admins BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT admins_role_check CHECK (role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Créer des index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON public.admins(is_active);
CREATE INDEX IF NOT EXISTS idx_admins_is_main_admin ON public.admins(is_main_admin);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.handle_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at (supprimer s'il existe déjà)
DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admins_updated_at();

-- Fonction pour synchroniser les admins depuis profiles
-- Quand un profil a le rôle ADMIN ou SUPER_ADMIN, il est automatiquement ajouté à la table admins
CREATE OR REPLACE FUNCTION public.sync_admin_from_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le rôle est ADMIN ou SUPER_ADMIN, ajouter/mettre à jour dans admins
  IF NEW.role IN ('ADMIN', 'SUPER_ADMIN') THEN
    INSERT INTO public.admins (id, email, role, is_main_admin, can_edit_admins, can_delete_admins)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.role,
      CASE WHEN NEW.email = 'mhammed@ematricule.fr' THEN true ELSE false END,
      CASE WHEN NEW.role = 'SUPER_ADMIN' THEN true ELSE false END,
      CASE WHEN NEW.role = 'SUPER_ADMIN' AND NEW.email != 'mhammed@ematricule.fr' THEN true ELSE false END
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      is_main_admin = CASE WHEN EXCLUDED.email = 'mhammed@ematricule.fr' THEN true ELSE admins.is_main_admin END,
      can_edit_admins = CASE WHEN EXCLUDED.role = 'SUPER_ADMIN' THEN true ELSE admins.can_edit_admins END,
      can_delete_admins = CASE WHEN EXCLUDED.role = 'SUPER_ADMIN' AND EXCLUDED.email != 'mhammed@ematricule.fr' THEN true ELSE admins.can_delete_admins END,
      updated_at = NOW();
  ELSE
    -- Si le rôle n'est plus ADMIN ou SUPER_ADMIN, supprimer de la table admins
    DELETE FROM public.admins WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour synchroniser automatiquement (supprimer s'il existe déjà)
DROP TRIGGER IF EXISTS sync_admin_on_profile_update ON public.profiles;
CREATE TRIGGER sync_admin_on_profile_update
  AFTER INSERT OR UPDATE OF role, email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_admin_from_profile();

-- RLS Policies pour la table admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Les admins peuvent voir tous les admins
CREATE POLICY "Admins can view all admins"
  ON public.admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Seuls les SUPER_ADMIN peuvent modifier les admins (sauf le main admin)
CREATE POLICY "Super admins can update admins"
  ON public.admins FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SUPER_ADMIN'
    )
    AND NOT is_main_admin  -- Le main admin ne peut pas être modifié
  );

-- Seuls les SUPER_ADMIN peuvent insérer des admins
CREATE POLICY "Super admins can insert admins"
  ON public.admins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SUPER_ADMIN'
    )
  );

-- Seuls les SUPER_ADMIN peuvent supprimer des admins (sauf le main admin)
CREATE POLICY "Super admins can delete admins"
  ON public.admins FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SUPER_ADMIN'
    )
    AND NOT is_main_admin  -- Le main admin ne peut pas être supprimé
  );


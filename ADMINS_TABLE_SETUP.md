# Configuration de la Table Admins Séparée

Cette documentation explique comment utiliser la table `admins` séparée pour une meilleure gestion des administrateurs.

## Architecture

La table `admins` est une table séparée qui :
- ✅ Référence la table `profiles` (relation 1:1)
- ✅ Se synchronise automatiquement avec `profiles` via un trigger
- ✅ Permet une meilleure gestion des permissions spécifiques aux admins
- ✅ Protège le main admin avec des flags dédiés

## Structure de la Table

```sql
CREATE TABLE public.admins (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,  -- 'ADMIN' ou 'SUPER_ADMIN'
  is_main_admin BOOLEAN DEFAULT false,  -- Protection du main admin
  can_edit_admins BOOLEAN DEFAULT false,  -- Peut modifier d'autres admins
  can_delete_admins BOOLEAN DEFAULT false,  -- Peut supprimer d'autres admins
  is_active BOOLEAN DEFAULT true,  -- Admin actif ou désactivé
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by UUID REFERENCES profiles(id)  -- Qui a créé cet admin
);
```

## Installation

### Étape 1: Créer la table admins

1. Ouvrez Supabase Dashboard → SQL Editor
2. Exécutez le script: `scripts/create-admins-table.sql`
   - Ou: `supabase/admins-table.sql`

Ce script va:
- ✅ Créer la table `admins`
- ✅ Créer les index pour les performances
- ✅ Créer les triggers de synchronisation
- ✅ Configurer les RLS policies
- ✅ Migrer les admins existants depuis `profiles`

### Étape 2: Créer les données des admins

1. Assurez-vous que les utilisateurs existent dans `auth.users`
2. Exécutez le script: `scripts/create-admins-data.sql`

Ce script va:
- ✅ Créer/mettre à jour les profils avec les rôles
- ✅ Créer automatiquement les entrées dans `admins` (via trigger)
- ✅ Configurer les permissions pour chaque admin

## Synchronisation Automatique

La table `admins` se synchronise automatiquement avec `profiles`:

- ✅ Quand un profil obtient le rôle `ADMIN` ou `SUPER_ADMIN` → Entrée créée dans `admins`
- ✅ Quand un profil perd le rôle admin → Entrée supprimée de `admins`
- ✅ Quand l'email d'un profil change → Email mis à jour dans `admins`
- ✅ Quand le rôle d'un profil change → Rôle mis à jour dans `admins`

## Protection du Main Admin

Le main admin (`mhammed@ematricule.fr`) est protégé par:
- ✅ `is_main_admin = true` (ne peut pas être modifié)
- ✅ Ne peut pas être supprimé (RLS policy)
- ✅ Ne peut pas être modifié par d'autres admins (RLS policy)

## Utilisation dans le Code

### Requête pour obtenir tous les admins

```typescript
const { data: admins } = await supabase
  .from('admins')
  .select('*, profiles(first_name, last_name, phone)')
  .eq('is_active', true)
  .order('is_main_admin', { ascending: false })
```

### Vérifier si un utilisateur est admin

```typescript
const { data: admin } = await supabase
  .from('admins')
  .select('*')
  .eq('id', userId)
  .eq('is_active', true)
  .single()
```

### Créer un nouvel admin

```typescript
// 1. Mettre à jour le profil avec le rôle ADMIN
await supabase
  .from('profiles')
  .update({ role: 'ADMIN' })
  .eq('id', userId)

// 2. L'entrée dans admins sera créée automatiquement via le trigger
```

## Avantages de cette Architecture

1. **Séparation des responsabilités**: Les admins sont gérés séparément des profils utilisateurs
2. **Permissions granulaires**: Flags spécifiques (`can_edit_admins`, `can_delete_admins`)
3. **Protection renforcée**: Le main admin est protégé au niveau de la base de données
4. **Historique**: Le champ `created_by` permet de savoir qui a créé chaque admin
5. **Désactivation facile**: Le flag `is_active` permet de désactiver un admin sans le supprimer

## Migration depuis l'Ancien Système

Si vous avez déjà des admins dans `profiles`, le script `create-admins-table.sql` les migre automatiquement:

```sql
-- Migration automatique
INSERT INTO public.admins (id, email, role, is_main_admin, ...)
SELECT id, email, role, ...
FROM public.profiles
WHERE role IN ('ADMIN', 'SUPER_ADMIN')
```

## Vérification

Après installation, vérifiez avec:

```sql
SELECT 
  a.id,
  a.email,
  a.role,
  a.is_main_admin,
  a.can_edit_admins,
  a.can_delete_admins,
  a.is_active,
  p.first_name,
  p.last_name
FROM public.admins a
LEFT JOIN public.profiles p ON a.id = p.id
ORDER BY a.is_main_admin DESC, a.email;
```

Vous devriez voir les 3 admins avec leurs permissions correctes.



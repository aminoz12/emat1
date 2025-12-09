# Installation Rapide - Table Admins

## Installation en 2 étapes

### Étape 1: Créer la table admins

1. Ouvrez **Supabase Dashboard → SQL Editor**
2. Exécutez le script: **`scripts/create-admins-table.sql`**

Ce script crée:
- ✅ La table `admins` séparée
- ✅ Les triggers de synchronisation automatique
- ✅ Les RLS policies de sécurité
- ✅ Migre les admins existants depuis `profiles`

### Étape 2: Créer les 3 administrateurs

1. Assurez-vous que les utilisateurs existent dans **Authentication → Users**:
   - `mhammed@ematricule.fr` (password: `Mhammed92@++`)
   - `admin2@ematricule.fr` (password: `Espace92@++`)
   - `admin3@ematricule.fr` (password: `Espace92@++`)

2. Exécutez le script: **`scripts/add-admins-now.sql`** (ou `scripts/create-admins-data.sql`)

Ce script:
- ✅ Crée/mettre à jour les profils avec les rôles
- ✅ Crée automatiquement les entrées dans `admins` (via trigger)
- ✅ Configure les permissions pour chaque admin

## Vérification

Exécutez cette requête pour vérifier:

```sql
SELECT 
  a.email,
  a.role,
  a.is_main_admin,
  a.is_active
FROM public.admins a
ORDER BY a.is_main_admin DESC, a.email;
```

Vous devriez voir:
- ✅ 3 admins
- ✅ `mhammed@ematricule.fr` avec `is_main_admin = true`
- ✅ Tous avec `is_active = true`

## Connexion

Connectez-vous sur: `http://localhost:3000/admin/login`

- Email: `mhammed@ematricule.fr`
- Password: `Mhammed92@++`

## Avantages de la Table Admins

✅ **Séparation claire**: Admins gérés séparément des profils utilisateurs  
✅ **Permissions granulaires**: Flags spécifiques (`can_edit_admins`, `can_delete_admins`)  
✅ **Protection renforcée**: Main admin protégé au niveau base de données  
✅ **Synchronisation automatique**: Se met à jour automatiquement avec `profiles`  
✅ **Désactivation facile**: Flag `is_active` pour désactiver sans supprimer

## Documentation Complète

Voir `ADMINS_TABLE_SETUP.md` pour plus de détails.


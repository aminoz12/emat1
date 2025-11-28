# 🚀 Configuration Supabase - Repartir de Zéro

Ce guide vous permet de réinitialiser complètement votre configuration Supabase pour corriger l'erreur "Database error saving new user".

## ⚠️ ATTENTION

Ce processus va **supprimer** :
- La table `admins` (si elle existe)
- Tous les triggers personnalisés
- Toutes les fonctions personnalisées
- Les policies RLS de la table admins

**Les données dans `auth.users` et les autres tables (orders, documents, etc.) ne seront PAS supprimées.**

## 📋 Étapes

### Étape 1: Sauvegarder vos données (optionnel)

Si vous avez des données importantes dans `profiles`, exportez-les d'abord :

```sql
-- Exporter les profils existants
SELECT * FROM public.profiles;
```

### Étape 2: Exécuter le script de réinitialisation

1. Ouvrez **Supabase Dashboard → SQL Editor**
2. Exécutez le script : **`scripts/fresh-start-complete.sql`**

Ce script va :
- ✅ Supprimer tous les objets personnalisés (triggers, fonctions, table admins)
- ✅ Recréer la table `profiles` proprement
- ✅ Recréer le trigger `on_auth_user_created` correctement
- ✅ Configurer les RLS policies pour `profiles`
- ✅ Créer les profils des 3 admins

### Étape 3: Vérifier que tout fonctionne

Après l'exécution, vous devriez voir :
- ✅ 3 profils créés (mhammed, admin2, admin3)
- ✅ Le trigger `on_auth_user_created` actif

### Étape 4: Tester la création d'un nouvel utilisateur

1. Allez sur votre site : `http://localhost:3000/connexion`
2. Créez un nouveau compte
3. Vérifiez que le profil est créé automatiquement dans `profiles`

Si ça fonctionne, l'erreur "Database error saving new user" est corrigée !

## 🔧 Si vous voulez garder la table admins

Si vous voulez recréer la table `admins` après la réinitialisation :

1. Exécutez d'abord : `scripts/fresh-start-complete.sql`
2. Ensuite exécutez : `scripts/create-admins-table.sql`
3. Puis exécutez : `scripts/insert-profiles-first.sql`

## 📝 Scripts disponibles

- **`scripts/fresh-start-complete.sql`** - Réinitialisation complète (recommandé)
- **`scripts/reset-everything.sql`** - Version alternative
- **`scripts/create-admins-table.sql`** - Pour recréer la table admins après

## ✅ Vérification

Après la réinitialisation, vérifiez avec :

```sql
-- Vérifier les profils
SELECT id, email, role FROM public.profiles 
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr');

-- Vérifier le trigger
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

## 🎯 Résultat attendu

- ✅ Plus d'erreur "Database error saving new user"
- ✅ Les nouveaux utilisateurs créent automatiquement un profil
- ✅ Les 3 admins ont leurs profils avec les bons rôles
- ✅ Configuration propre et fonctionnelle



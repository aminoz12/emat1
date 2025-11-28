# 🔧 Correction Urgente - Table Profiles

Si vous ne pouvez plus créer de profils clients, suivez ces étapes dans l'ordre.

## ⚠️ Problème

L'erreur "Database error saving new user" est causée par :
- Le trigger `handle_new_user()` qui utilise `'USER'` (texte) au lieu de `'USER'::user_role` (ENUM)
- La table `profiles` qui peut avoir des problèmes de structure

## ✅ Solution en 2 étapes

### Étape 1: Corriger la table profiles et le trigger

1. Ouvrez **Supabase Dashboard → SQL Editor**
2. Exécutez : **`scripts/fix-profiles-only.sql`**

Ce script va :
- ✅ Supprimer l'ancien trigger défectueux
- ✅ Vérifier/corriger le type ENUM `user_role`
- ✅ Vérifier/corriger la structure de la table `profiles`
- ✅ Recréer le trigger `handle_new_user()` avec le cast correct
- ✅ Configurer les RLS policies

### Étape 2: Tester que ça fonctionne

1. Exécutez : **`scripts/test-profile-creation.sql`** pour vérifier
2. Testez manuellement :
   - Allez sur `http://localhost:3000/connexion`
   - Créez un nouveau compte
   - Vérifiez que le profil est créé automatiquement

## 🔍 Vérification

Après l'exécution, vous devriez voir :
- ✅ Le trigger `on_auth_user_created` actif
- ✅ La fonction `handle_new_user()` avec le cast `'USER'::user_role`
- ✅ La table `profiles` avec la colonne `role` de type `user_role`

## 📝 Si ça ne fonctionne toujours pas

1. Vérifiez les logs Supabase pour voir l'erreur exacte
2. Exécutez `scripts/test-profile-creation.sql` pour diagnostiquer
3. Vérifiez que les utilisateurs existent dans `auth.users` avant de créer les profils

## 🎯 Après correction

Une fois que la création de profils clients fonctionne :
- Vous pourrez créer des comptes normalement
- Ensuite, on ajoutera les admins avec `scripts/insert-profiles-first.sql`

**Priorité : Corriger d'abord la création de profils clients, puis on s'occupera des admins.**



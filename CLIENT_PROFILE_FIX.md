# 🚨 Correction - Erreur "Database error saving new user"

## ⚡ Solution Immédiate

### Étape 1: Exécuter le script de correction

1. **Ouvrez Supabase Dashboard → SQL Editor**
2. **Exécutez : `scripts/fix-client-profile-creation.sql`**

Ce script :
- ✅ Supprime complètement l'ancien trigger
- ✅ Vérifie et corrige la structure de la table `profiles`
- ✅ Désactive RLS temporairement
- ✅ Crée une fonction avec gestion d'erreur complète
- ✅ Crée le trigger
- ✅ Réactive RLS avec des policies permissives

### Étape 2: Tester immédiatement

1. Allez sur `http://localhost:3000/connexion`
2. Créez un nouveau compte
3. Vérifiez dans Supabase → Table Editor → `profiles` que le profil est créé

## 🔍 Si ça ne fonctionne toujours pas

### Option 1: Tester l'insertion manuelle

1. Exécutez : `scripts/test-manual-insert.sql`
   - Modifiez l'email dans le script pour utiliser un email de test
2. Si l'insertion manuelle fonctionne → Le problème vient du trigger
3. Si l'insertion manuelle échoue → Le problème vient de la table

### Option 2: Vérifier les logs Supabase

1. Allez dans **Supabase Dashboard → Logs → Postgres Logs**
2. Créez un compte
3. Regardez l'erreur exacte dans les logs
4. Les erreurs courantes :
   - `violates foreign key constraint` → Problème de référence auth.users
   - `violates unique constraint` → Email déjà existant
   - `column "role" is of type user_role` → Problème de cast ENUM
   - `permission denied` → Problème RLS

### Option 3: Désactiver RLS complètement (temporaire)

Si RLS est le problème :

```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

⚠️ **Testez, puis réactivez RLS après !**

## 📋 Checklist de Vérification

Après avoir exécuté le script, vérifiez :

- [ ] Le trigger `on_auth_user_created` existe
- [ ] La fonction `handle_new_user()` existe avec `SECURITY DEFINER`
- [ ] La table `profiles` a la colonne `role` de type `user_role`
- [ ] RLS est activé avec des policies permissives
- [ ] La contrainte de clé étrangère vers `auth.users` existe

## 🎯 Points Clés du Script

Le script `fix-client-profile-creation.sql` :
- ✅ Utilise `SECURITY DEFINER` pour contourner RLS
- ✅ Gère les erreurs avec `EXCEPTION`
- ✅ Utilise `ON CONFLICT DO NOTHING` pour éviter les doublons
- ✅ Désactive RLS temporairement puis le réactive avec des policies permissives
- ✅ Policy INSERT avec `WITH CHECK (true)` pour permettre l'insertion par le trigger

## ⚠️ Si l'erreur persiste

Partagez :
1. L'erreur exacte des logs Supabase
2. Le résultat de `scripts/test-manual-insert.sql`
3. La structure actuelle de la table `profiles` (SELECT * FROM information_schema.columns WHERE table_name = 'profiles')



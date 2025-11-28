# 🚨 Correction Urgente - "Database error saving new user"

## ⚡ Solution Rapide

1. **Ouvrez Supabase Dashboard → SQL Editor**
2. **Exécutez : `scripts/fix-urgent-simple.sql`**
3. **Testez immédiatement** : Créez un nouveau compte sur votre site

## 🔍 Si ça ne fonctionne toujours pas

### Option 1: Script avec gestion d'erreur
Exécutez : `scripts/fix-trigger-urgent.sql`

### Option 2: Vérifier les logs
1. Allez dans Supabase Dashboard → Logs → Postgres Logs
2. Créez un compte et regardez l'erreur exacte
3. Partagez l'erreur pour diagnostic

### Option 3: Désactiver complètement RLS temporairement
```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```
⚠️ **Attention** : Réactivez RLS après avoir testé !

## 📋 Checklist

- [ ] Le trigger `on_auth_user_created` existe
- [ ] La fonction `handle_new_user()` utilise `'USER'::user_role`
- [ ] La table `profiles` existe avec la colonne `role` de type `user_role`
- [ ] RLS est configuré correctement
- [ ] Les policies permettent l'insertion par le trigger

## 🧪 Test

Après avoir exécuté le script :
1. Allez sur `http://localhost:3000/connexion`
2. Créez un compte avec un email de test
3. Vérifiez dans Supabase → Table Editor → profiles que le profil est créé

## ⚠️ Si l'erreur persiste

Vérifiez dans les logs Supabase l'erreur exacte. Les causes possibles :
- Contrainte de clé étrangère
- Contrainte UNIQUE sur email
- Problème de permissions
- Type ENUM incorrect


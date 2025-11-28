# Guide de Correction des Administrateurs

Si vous rencontrez des problèmes de connexion ou si les emails n'apparaissent pas dans les profils, suivez ce guide.

## Problèmes courants

1. **"Email ou mot de passe incorrect"** - L'utilisateur existe dans auth.users mais le profil n'est pas créé ou l'email est manquant
2. **Emails manquants dans profiles** - Les profils existent mais sans email

## Solution Rapide : Script SQL

### Étape 1: Exécuter le script de diagnostic et correction

1. Ouvrez Supabase Dashboard → SQL Editor
2. Exécutez le script: `scripts/fix-admin-profiles.sql`
3. Ce script va:
   - Afficher tous les utilisateurs dans auth.users
   - Afficher tous les profils dans profiles
   - Créer les profils manquants
   - Mettre à jour les emails manquants
   - Mettre à jour les rôles

### Étape 2: Vérifier les résultats

Le script affichera à la fin tous les profils avec leurs emails et rôles. Vérifiez que:
- ✅ Les 3 emails sont présents
- ✅ Les rôles sont corrects (SUPER_ADMIN pour mhammed, ADMIN pour les autres)

### Étape 3: Vérifier les mots de passe

Si vous ne pouvez toujours pas vous connecter:

1. Allez dans Supabase Dashboard → Authentication → Users
2. Trouvez chaque utilisateur
3. Cliquez sur "Reset Password" ou "Update User"
4. Vérifiez/redéfinissez les mots de passe:
   - `mhammed@ematricule.fr` → `Mhammed92@++`
   - `admin2@ematricule.fr` → `Espace92@++`
   - `admin3@ematricule.fr` → `Espace92@++`

## Solution Alternative : Page Web

1. Allez sur: `http://localhost:3000/admin/diagnostic`
2. Cliquez sur "Lancer le diagnostic"
3. Si des profils manquent, cliquez sur "Créer les profils manquants"

**Note**: Cette page nécessite que vous soyez connecté en tant qu'admin. Si vous ne pouvez pas vous connecter, utilisez le script SQL.

## Solution Complète : Recréer les Admins

Si rien ne fonctionne, recréez les admins depuis zéro:

### Option A: Via la page web (nécessite SUPABASE_SERVICE_ROLE_KEY)

1. Configurez `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`
2. Allez sur: `http://localhost:3000/admin/init-admins`
3. Cliquez sur "Créer les 3 administrateurs"

### Option B: Via Supabase Dashboard

1. **Supprimez les anciens utilisateurs** (si nécessaire):
   - Supabase Dashboard → Authentication → Users
   - Supprimez les utilisateurs avec les emails admin

2. **Créez les nouveaux utilisateurs**:
   - Cliquez sur "Add User"
   - Email: `mhammed@ematricule.fr`, Password: `Mhammed92@++`
   - ✅ Cochez "Auto Confirm User"
   - Répétez pour admin2 et admin3

3. **Créez les profils**:
   - Exécutez le script: `scripts/create-initial-admins.sql` (Option 3)

## Vérification Finale

Après correction, vérifiez avec cette requête SQL:

```sql
SELECT 
  p.id,
  p.email,
  p.role,
  u.email_confirmed_at,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY p.email;
```

Vous devriez voir:
- ✅ 3 lignes
- ✅ Tous les emails présents
- ✅ Rôles corrects
- ✅ email_confirmed_at non null

## Connexion

Une fois corrigé, connectez-vous sur:
- `http://localhost:3000/admin/login`
- Email: `mhammed@ematricule.fr`
- Password: `Mhammed92@++`

## Correction du Trigger

Si le trigger ne crée pas automatiquement les profils pour les nouveaux utilisateurs:

1. Exécutez: `scripts/fix-trigger-role.sql`
2. Ce script corrige le trigger pour utiliser le bon type ENUM



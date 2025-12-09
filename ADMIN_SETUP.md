# Configuration des Administrateurs

Ce guide explique comment créer les 3 administrateurs initiaux du système.

## Administrateurs à créer

1. **Main Admin (Super Admin - Protégé)**
   - Email: `mhammed@ematricule.fr`
   - Password: `Mhammed92@++`
   - Rôle: `SUPER_ADMIN`
   - ⚠️ **Protégé**: Ne peut pas être modifié ou supprimé

2. **Admin 2**
   - Email: `admin2@ematricule.fr`
   - Password: `Espace92@++`
   - Rôle: `ADMIN`

3. **Admin 3**
   - Email: `admin3@ematricule.fr`
   - Password: `Espace92@++`
   - Rôle: `ADMIN`

## Méthode 1: Page Web (Recommandée)

1. **Configurez la clé de service Supabase**:
   - Allez dans votre projet Supabase Dashboard
   - Settings → API
   - Copiez la **Service Role Key** (⚠️ Gardez-la secrète!)
   - Ajoutez-la dans votre fichier `.env.local`:
     ```
     SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key-ici
     ```

2. **Accédez à la page d'initialisation**:
   - Allez sur: `http://localhost:3000/admin/init-admins`
   - Cliquez sur "Créer les 3 administrateurs"
   - Les 3 comptes seront créés automatiquement avec leurs mots de passe

## Méthode 2: Supabase Dashboard (Manuelle)

1. **Créez les utilisateurs dans Supabase Auth**:
   - Allez dans Supabase Dashboard → Authentication → Users
   - Cliquez sur "Add User" pour chaque admin:
     - Email: `mhammed@ematricule.fr`, Password: `Mhammed92@++`
     - Email: `admin2@ematricule.fr`, Password: `Espace92@++`
     - Email: `admin3@ematricule.fr`, Password: `Espace92@++`
   - ✅ Cochez "Auto Confirm User" pour chaque utilisateur

2. **Créez les profils avec les rôles**:
   - Allez dans SQL Editor
   - Exécutez le script `scripts/create-initial-admins.sql`
   - Ou utilisez Option 3 du script qui crée automatiquement les profils depuis `auth.users`

## Méthode 3: Script SQL Direct

Si les utilisateurs existent déjà dans `auth.users`, exécutez simplement:

```sql
-- Créer/mettre à jour les profils avec les rôles
INSERT INTO profiles (id, email, role, created_at, updated_at)
SELECT 
  id,
  email,
  CASE 
    WHEN email = 'mhammed@ematricule.fr' THEN 'SUPER_ADMIN'::user_role
    WHEN email IN ('admin2@ematricule.fr', 'admin3@ematricule.fr') THEN 'ADMIN'::user_role
    ELSE 'USER'::user_role
  END,
  NOW(),
  NOW()
FROM auth.users
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role,
  updated_at = NOW();
```

## Vérification

Après création, vérifiez que les admins sont bien créés:

```sql
SELECT id, email, role, created_at
FROM profiles
WHERE email IN ('mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr')
ORDER BY email;
```

Ou utilisez la page: `http://localhost:3000/admin/setup-admins` pour voir la liste.

## Protection du Main Admin

Le main admin (`mhammed@ematricule.fr`) est protégé:
- ✅ Ne peut pas être modifié via l'interface admin
- ✅ Ne peut pas être supprimé
- ✅ Protection au niveau API et interface

## Connexion

Une fois créés, les admins peuvent se connecter sur:
- `http://localhost:3000/admin/login`

## Notes importantes

- ⚠️ La **Service Role Key** donne un accès complet à votre base de données. Ne la partagez jamais publiquement.
- ⚠️ Ne commitez jamais le fichier `.env.local` dans Git.
- Le main admin est le seul compte qui ne peut pas être modifié, même par un SUPER_ADMIN.


# Configuration Supabase - Guide de démarrage

Ce guide vous explique comment configurer Supabase pour le projet EMatricule.

## 📋 Prérequis

1. Un compte Supabase (gratuit) : [https://supabase.com](https://supabase.com)
2. Node.js et npm installés

## 🚀 Configuration

### 1. Créer un projet Supabase

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Cliquez sur "New Project"
3. Remplissez les informations :
   - **Name**: EMatricule (ou votre nom de projet)
   - **Database Password**: Choisissez un mot de passe fort
   - **Region**: Choisissez la région la plus proche
4. Cliquez sur "Create new project"

### 2. Récupérer les clés d'API

1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Copiez les informations suivantes :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon/public key** (clé publique)
   - **service_role key** (clé privée - à garder secrète)

### 3. Configurer les variables d'environnement

1. Créez un fichier `.env.local` à la racine du projet `ematriculle/`
2. Ajoutez les variables suivantes :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

# Autres variables (gardez celles existantes)
NEXT_PUBLIC_API_URL=http://localhost:3001
# ... autres variables
```

### 4. Créer les tables dans Supabase

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez et exécutez le contenu du fichier `supabase/schema.sql`
4. Vérifiez que toutes les tables ont été créées en allant dans **Table Editor**

### 5. Configurer l'authentification

1. Dans Supabase, allez dans **Authentication** > **Settings**
2. Configurez les **Site URL** :
   - `http://localhost:3000` pour le développement
   - Votre URL de production pour le déploiement
3. (Optionnel) Activez les providers OAuth (Google, etc.) si nécessaire

### 6. Vérifier les politiques RLS

Les politiques Row Level Security (RLS) sont déjà configurées dans le schéma SQL pour :
- Les utilisateurs peuvent voir/modifier uniquement leurs propres profils
- Les utilisateurs peuvent voir/créer uniquement leurs propres commandes
- Les utilisateurs peuvent voir les documents de leurs commandes

## 🧪 Tester l'installation

1. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```

2. Testez la connexion/inscription :
   - Allez sur `http://localhost:3000/connexion`
   - Créez un compte de test
   - Vérifiez que vous êtes redirigé vers `/dashboard`

3. Vérifiez dans Supabase :
   - **Authentication** > **Users** : votre nouvel utilisateur doit apparaître
   - **Table Editor** > **profiles** : un profil doit être créé automatiquement

## 📁 Structure des fichiers créés

```
ematriculle/
├── lib/
│   └── supabase/
│       ├── client.ts          # Client Supabase côté client
│       ├── server.ts          # Client Supabase côté serveur
│       └── middleware.ts      # Middleware pour les sessions
├── hooks/
│   └── useSupabaseSession.ts  # Hook React pour la session
├── supabase/
│   └── schema.sql             # Schéma de base de données
├── middleware.ts              # Middleware Next.js
└── .env.local                 # Variables d'environnement (à créer)
```

## 🔐 Sécurité

- ⚠️ **NE COMMITEZ JAMAIS** le fichier `.env.local` dans Git
- ⚠️ Gardez votre `SERVICE_ROLE_KEY` secrète (elle contourne RLS)
- ✅ Utilisez uniquement `NEXT_PUBLIC_SUPABASE_ANON_KEY` côté client
- ✅ Les politiques RLS protègent automatiquement les données

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🐛 Dépannage

### Erreur : "Invalid API key"
- Vérifiez que vous avez copié la bonne clé (anon key vs service role key)
- Vérifiez que les variables d'environnement sont bien chargées

### Erreur : "User not found" après inscription
- Vérifiez que le trigger `on_auth_user_created` a été créé
- Vérifiez dans les logs Supabase si le trigger s'exécute

### Les commandes ne s'affichent pas
- Vérifiez que l'utilisateur est bien connecté
- Vérifiez les politiques RLS dans Supabase
- Vérifiez que les données existent dans la table `orders`


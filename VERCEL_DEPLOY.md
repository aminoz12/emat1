# Guide de déploiement sur Vercel

Ce guide vous explique comment déployer EMatricule sur Vercel.

## 📋 Prérequis

1. Un compte Vercel (gratuit) : [https://vercel.com](https://vercel.com)
2. Un compte Supabase : [https://supabase.com](https://supabase.com)
3. Un compte GitHub/GitLab/Bitbucket (pour connecter le repository)

## 🚀 Déploiement

### Option 1 : Déploiement via l'interface Vercel (Recommandé)

1. **Connecter votre repository**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "Add New Project"
   - Connectez votre compte GitHub/GitLab/Bitbucket
   - Sélectionnez le repository `emattricule`

2. **Configurer le projet**
   - **Framework Preset**: Next.js (détecté automatiquement)
   - **Root Directory**: `ematriculle` (si votre projet est dans un sous-dossier)
   - **Build Command**: `npm run build` (par défaut)
   - **Output Directory**: `.next` (par défaut)
   - **Install Command**: `npm install` (par défaut)

3. **Configurer les variables d'environnement**
   
   Cliquez sur "Environment Variables" et ajoutez :

   ```env
   # Backend API (OBLIGATOIRE - après déploiement du backend sur Render)
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-service.onrender.com
   NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
   
   # Supabase (OBLIGATOIRE)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   
   # Stripe (si utilisé)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
   STRIPE_SECRET_KEY=sk_live_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   
   # NextAuth (si utilisé)
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-nextauth-secret-here
   
   # App
   NODE_ENV=production
   ```

   **Important**: 
   - Les variables `NEXT_PUBLIC_*` sont accessibles côté client
   - Les autres variables sont uniquement côté serveur
   - Utilisez les clés de **production** pour Supabase et Stripe

4. **Déployer**
   - Cliquez sur "Deploy"
   - Vercel va automatiquement :
     - Installer les dépendances
     - Builder le projet
     - Déployer sur leur infrastructure

### Option 2 : Déploiement via CLI

1. **Installer Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Se connecter**
   ```bash
   vercel login
   ```

3. **Déployer**
   ```bash
   cd ematriculle
   vercel
   ```

4. **Configurer les variables d'environnement**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   # ... ajoutez toutes les autres variables
   ```

5. **Déployer en production**
   ```bash
   vercel --prod
   ```

## 🔧 Configuration Supabase pour Production

1. **Mettre à jour les URLs autorisées**
   - Dans Supabase Dashboard > Authentication > URL Configuration
   - Ajoutez votre URL Vercel : `https://your-domain.vercel.app`
   - Ajoutez aussi : `https://your-domain.vercel.app/**`

2. **Configurer les RLS (Row Level Security)**
   - Assurez-vous que toutes les politiques RLS sont correctement configurées
   - Testez les permissions en production

3. **Vérifier les webhooks (si utilisés)**
   - Mettez à jour les URLs de webhooks avec votre URL Vercel

## 📝 Variables d'environnement requises

### Obligatoires
- `NEXT_PUBLIC_BACKEND_URL` - URL de votre backend Render (ex: `https://xxx.onrender.com`)
- `NEXT_PUBLIC_API_URL` - URL de votre backend Render (même valeur que ci-dessus, pour compatibilité)
- `NEXT_PUBLIC_SUPABASE_URL` - URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé publique Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clé service role Supabase (pour les opérations admin)

### Optionnelles (selon vos fonctionnalités)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Clé publique Stripe
- `STRIPE_SECRET_KEY` - Clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret webhook Stripe
- `NEXTAUTH_URL` - URL de votre application
- `NEXTAUTH_SECRET` - Secret pour NextAuth

## 🔍 Vérification post-déploiement

1. **Tester l'authentification**
   - Créez un compte
   - Connectez-vous
   - Vérifiez que les sessions fonctionnent

2. **Tester les commandes**
   - Créez une commande test
   - Vérifiez que les données sont bien sauvegardées dans Supabase

3. **Tester le panneau admin**
   - Connectez-vous en tant qu'admin
   - Vérifiez que vous pouvez voir les commandes

4. **Vérifier les logs**
   - Allez dans Vercel Dashboard > Deployments > [votre déploiement] > Logs
   - Vérifiez qu'il n'y a pas d'erreurs

## 🚨 Problèmes courants

### Erreur "Missing environment variables"
- Vérifiez que toutes les variables sont bien configurées dans Vercel
- Redéployez après avoir ajouté les variables

### Erreur "Supabase connection failed"
- Vérifiez que les URLs autorisées dans Supabase incluent votre domaine Vercel
- Vérifiez que les clés API sont correctes

### Erreur "Build failed"
- Vérifiez les logs de build dans Vercel
- Assurez-vous que toutes les dépendances sont dans `package.json`
- Vérifiez que `next.config.js` est correct

### Les images ne se chargent pas
- Vérifiez la configuration `images` dans `next.config.js`
- Assurez-vous que les domaines sont autorisés

### Erreur "routes-manifest.json couldn't be found" dans backend
Cette erreur se produit lorsque Vercel essaie de builder le backend (NestJS) comme un projet Next.js.

**Solutions :**

1. **Vérifier les paramètres du projet Vercel :**
   - Allez dans Vercel Dashboard > Votre Projet > Settings > General
   - Vérifiez que **Root Directory** est défini sur `.` (racine) et non sur `backend`
   - Si vous avez plusieurs projets configurés, supprimez celui qui pointe vers `backend`

2. **Vérifier la détection automatique :**
   - Allez dans Settings > Git
   - Assurez-vous que Vercel ne détecte pas automatiquement plusieurs projets
   - Le backend NestJS doit être déployé séparément (Railway, Render, AWS, etc.)

3. **Vérifier `.vercelignore` :**
   - Le fichier `.vercelignore` doit contenir `backend/` pour exclure le backend
   - Redéployez après avoir vérifié ce fichier

4. **Note importante :**
   - Le backend NestJS est un service séparé qui ne doit PAS être déployé sur Vercel
   - Il doit être déployé sur une plateforme qui supporte Node.js (Railway, Render, Heroku, AWS, etc.)
   - Le frontend Next.js communique avec le backend via `NEXT_PUBLIC_API_URL`

## 📊 Monitoring

Vercel fournit automatiquement :
- **Analytics** : Statistiques de performance
- **Logs** : Logs en temps réel
- **Deployments** : Historique des déploiements
- **Speed Insights** : Métriques de vitesse

## 🔄 Déploiements automatiques

Par défaut, Vercel déploie automatiquement :
- À chaque push sur `main`/`master` → Production
- À chaque push sur une autre branche → Preview

Pour désactiver :
- Allez dans Project Settings > Git
- Désactivez "Automatic deployments"

## 🌐 Domaines personnalisés

1. Allez dans Project Settings > Domains
2. Ajoutez votre domaine
3. Suivez les instructions DNS
4. Vercel configurera automatiquement le SSL

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Next.js sur Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variables d'environnement Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Note**: Assurez-vous de tester votre application en production avant de la mettre en ligne publiquement.


# Guide de déploiement Backend sur Render

Ce guide vous explique comment déployer le backend NestJS d'EMatricule sur Render.

## 📋 Prérequis

1. Un compte Render (gratuit) : [https://render.com](https://render.com)
2. Un compte Supabase : [https://supabase.com](https://supabase.com)
3. Un compte GitHub/GitLab/Bitbucket (pour connecter le repository)
4. Un service Redis (optionnel, pour les queues Bull)

## 🚀 Déploiement

### Option 1 : Déploiement via render.yaml (Recommandé)

1. **Connecter votre repository**
   - Allez sur [render.com](https://render.com)
   - Cliquez sur "New +" → "Blueprint"
   - Connectez votre compte GitHub/GitLab/Bitbucket
   - Sélectionnez le repository `emattricule`
   - Render détectera automatiquement le fichier `render.yaml`

2. **Configurer les variables d'environnement**
   
   Render vous permettra de configurer les variables d'environnement. Voici la liste complète :

   ```env
   # Obligatoires
   NODE_ENV=production
   PORT=10000
   CORS_ORIGIN=https://your-frontend.vercel.app,https://your-frontend.vercel.app
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   SUPABASE_ANON_KEY=your-anon-key-here
   FRONTEND_URL=https://your-frontend.vercel.app
   
   # SumUp (Paiements)
   SUMUP_API_KEY=your-sumup-api-key
   SUMUP_MERCHANT_CODE=your-merchant-code
   
   # Redis (Optionnel - pour les queues)
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password
   
   # Email (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_NAME=EMatricule
   FROM_EMAIL=noreply@emattricule.com
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRES_IN=7d
   
   # VIN Decoder (Optionnel)
   VIN_DECODER_API_KEY=your-vin-decoder-api-key
   VIN_DECODER_BASE_URL=https://vindecoder.eu/api/v2
   ```

3. **Déployer**
   - Cliquez sur "Apply"
   - Render va automatiquement :
     - Installer les dépendances
     - Builder le projet
     - Déployer sur leur infrastructure

### Option 2 : Déploiement manuel

1. **Créer un nouveau Web Service**
   - Allez sur [render.com](https://render.com)
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre repository

2. **Configurer le service**
   - **Name**: `emattricule-backend`
   - **Environment**: `Node`
   - **Region**: Choisissez la région la plus proche (ex: Frankfurt)
   - **Branch**: `main` ou `master`
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`

3. **Configurer les variables d'environnement**
   - Allez dans "Environment" dans les paramètres du service
   - Ajoutez toutes les variables listées ci-dessus

4. **Déployer**
   - Cliquez sur "Create Web Service"
   - Render va automatiquement déployer votre service

## 🔧 Configuration

### Port

Render assigne automatiquement un port via la variable d'environnement `PORT`. Le backend est configuré pour utiliser `PORT` ou `3001` par défaut.

**Important**: Dans `render.yaml`, le PORT est défini à `10000` car Render utilise ce port par défaut.

### CORS

Le backend est configuré pour accepter les requêtes depuis :
- Les origines spécifiées dans `CORS_ORIGIN` (peut être une liste séparée par des virgules)
- Tous les domaines `.onrender.com` (pour les previews Render)
- Tous les domaines `.vercel.app` (pour les previews Vercel)

Exemple de `CORS_ORIGIN` :
```
CORS_ORIGIN=https://your-app.vercel.app,https://www.yourdomain.com
```

### Redis (Optionnel)

Si vous utilisez Redis pour les queues Bull, vous pouvez :
1. Créer un service Redis sur Render
2. Utiliser un service Redis externe (Upstash, Redis Cloud, etc.)
3. Laisser Redis vide si vous n'utilisez pas les queues

### Base de données

Le backend utilise Supabase comme base de données. Assurez-vous que :
- `SUPABASE_URL` est correct
- `SUPABASE_SERVICE_ROLE_KEY` est la clé service role (pas l'anon key)
- Les tables nécessaires sont créées dans Supabase

## 📝 Variables d'environnement requises

### Obligatoires

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NODE_ENV` | Environnement | `production` |
| `PORT` | Port du serveur | `10000` |
| `CORS_ORIGIN` | Origines autorisées (CORS) | `https://your-app.vercel.app` |
| `SUPABASE_URL` | URL du projet Supabase | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role Supabase | `eyJhbGc...` |
| `FRONTEND_URL` | URL du frontend | `https://your-app.vercel.app` |
| `SUMUP_API_KEY` | Clé API SumUp | `sup_sk_...` |
| `SUMUP_MERCHANT_CODE` | Code marchand SumUp | `XXXX` |
| `SMTP_HOST` | Serveur SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_USER` | Utilisateur SMTP | `your-email@gmail.com` |
| `SMTP_PASS` | Mot de passe SMTP | `your-app-password` |
| `FROM_EMAIL` | Email expéditeur | `noreply@emattricule.com` |
| `JWT_SECRET` | Secret JWT (min 32 caractères) | `your-super-secret-key` |

### Optionnelles

| Variable | Description | Défaut |
|----------|-------------|--------|
| `SUPABASE_ANON_KEY` | Clé anonyme Supabase | - |
| `REDIS_HOST` | Hôte Redis | `localhost` |
| `REDIS_PORT` | Port Redis | `6379` |
| `REDIS_PASSWORD` | Mot de passe Redis | - |
| `FROM_NAME` | Nom expéditeur | `EMatricule` |
| `JWT_EXPIRES_IN` | Expiration JWT | `7d` |
| `VIN_DECODER_API_KEY` | Clé API VIN Decoder | - |
| `VIN_DECODER_BASE_URL` | URL VIN Decoder | `https://vindecoder.eu/api/v2` |

## 🔍 Vérification post-déploiement

1. **Vérifier les logs**
   - Allez dans votre service Render → "Logs"
   - Vérifiez que le serveur démarre correctement
   - Vous devriez voir : `🚀 Backend server running on port 10000`

2. **Tester l'API**
   - Accédez à `https://your-service.onrender.com/api/docs`
   - Vous devriez voir la documentation Swagger

3. **Tester un endpoint**
   ```bash
   curl https://your-service.onrender.com/api/health
   ```

4. **Vérifier CORS**
   - Testez depuis votre frontend
   - Vérifiez qu'il n'y a pas d'erreurs CORS dans la console

## 🚨 Problèmes courants

### Erreur "Port already in use"
- Vérifiez que `PORT` est défini à `10000` dans Render
- Render assigne automatiquement le port, mais il faut le définir dans les variables d'environnement

### Erreur "CORS blocked"
- Vérifiez que `CORS_ORIGIN` contient l'URL exacte de votre frontend
- Ajoutez `https://your-service.onrender.com` si nécessaire
- Vérifiez que les URLs n'ont pas de slash final

### Erreur "Supabase connection failed"
- Vérifiez que `SUPABASE_URL` est correct
- Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est la clé service role (pas l'anon key)
- Testez la connexion depuis Supabase Dashboard

### Erreur "Build failed"
- Vérifiez les logs de build dans Render
- Assurez-vous que toutes les dépendances sont dans `package.json`
- Vérifiez que `Root Directory` est défini à `backend` (si déploiement manuel)

### Le service redémarre en boucle
- Vérifiez les logs pour voir l'erreur
- Vérifiez que toutes les variables d'environnement obligatoires sont définies
- Vérifiez que le `Start Command` est correct : `npm run start:prod`

## 📊 Monitoring

Render fournit automatiquement :
- **Logs** : Logs en temps réel
- **Metrics** : CPU, mémoire, réseau
- **Events** : Historique des déploiements
- **Alerts** : Notifications en cas de problème

## 🔄 Déploiements automatiques

Par défaut, Render déploie automatiquement :
- À chaque push sur `main`/`master` → Production
- À chaque push sur une autre branche → Preview (si activé)

Pour désactiver :
- Allez dans Settings → "Auto-Deploy"
- Désactivez "Auto-Deploy"

## 🌐 Domaines personnalisés

1. Allez dans Settings → "Custom Domains"
2. Ajoutez votre domaine
3. Suivez les instructions DNS
4. Render configurera automatiquement le SSL

## 🔗 Intégration avec le Frontend

Une fois le backend déployé :

1. **Mettre à jour le frontend**
   - Ajoutez la variable d'environnement `NEXT_PUBLIC_API_URL` dans Vercel
   - Valeur : `https://your-service.onrender.com`

2. **Mettre à jour CORS**
   - Ajoutez l'URL du frontend dans `CORS_ORIGIN` du backend
   - Format : `https://your-frontend.vercel.app`

3. **Tester la connexion**
   - Testez une requête depuis le frontend
   - Vérifiez les logs du backend pour voir les requêtes

## 📚 Ressources

- [Documentation Render](https://render.com/docs)
- [Node.js sur Render](https://render.com/docs/node)
- [Variables d'environnement Render](https://render.com/docs/environment-variables)
- [NestJS Documentation](https://docs.nestjs.com)

---

**Note**: Assurez-vous de tester votre API en production avant de la mettre en ligne publiquement.


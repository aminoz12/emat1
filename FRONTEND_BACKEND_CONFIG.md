# Configuration Frontend pour communiquer avec le Backend

Ce guide explique comment configurer le frontend (Vercel) pour communiquer avec le backend déployé sur Render.

## 🔧 Variables d'environnement à configurer dans Vercel

### Variable principale : `NEXT_PUBLIC_BACKEND_URL`

**Valeur** : L'URL de votre backend Render (ex: `https://emattricule-backend.onrender.com`)

### Où configurer dans Vercel :

1. **Allez dans votre projet Vercel**
2. **Settings** → **Environment Variables**
3. **Ajoutez la variable** :
   - **Key** : `NEXT_PUBLIC_BACKEND_URL`
   - **Value** : `https://votre-backend-service.onrender.com`
   - **Environments** : Sélectionnez `Production`, `Preview`, et `Development`

4. **Redéployez** votre application après avoir ajouté la variable

## 📝 Variables utilisées dans le code

Le frontend utilise actuellement deux noms de variables (pour compatibilité) :

1. **`NEXT_PUBLIC_BACKEND_URL`** (Principal)
   - Utilisé dans : `app/api/payments/create-checkout/route.ts`
   - Utilisé dans : `app/payment/return/page.tsx`

2. **`NEXT_PUBLIC_API_URL`** (Alternatif - pour compatibilité)
   - Utilisé dans : `app/order-form/page.tsx`
   - Utilisé dans : `app/confirmation/page.tsx`
   - Utilisé dans : `app/auth/signup/page.tsx`
   - Utilisé dans : `app/api/auth/[...nextauth]/route.ts`

**Recommandation** : Configurez **les deux** avec la même valeur pour assurer la compatibilité complète.

## ✅ Configuration complète dans Vercel

Ajoutez ces variables dans Vercel (Settings → Environment Variables) :

```env
# Backend URL (obligatoire)
NEXT_PUBLIC_BACKEND_URL=https://votre-backend-service.onrender.com
NEXT_PUBLIC_API_URL=https://votre-backend-service.onrender.com

# Supabase (déjà configuré normalement)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key

# Autres variables existantes...
```

## 🔍 Comment trouver l'URL de votre backend Render

1. **Allez sur [render.com](https://render.com)**
2. **Ouvrez votre service backend**
3. **L'URL est affichée en haut** (ex: `https://emattricule-backend.onrender.com`)
4. **Copiez cette URL** et utilisez-la dans Vercel

## 🧪 Tester la connexion

Après avoir configuré les variables :

1. **Redéployez votre frontend sur Vercel**
2. **Testez une fonctionnalité** qui appelle le backend (ex: créer une commande)
3. **Vérifiez les logs Vercel** pour voir si les requêtes réussissent
4. **Vérifiez les logs Render** pour voir les requêtes entrantes

## 🚨 Problèmes courants

### Erreur "Failed to connect to backend"
- ✅ Vérifiez que `NEXT_PUBLIC_BACKEND_URL` est correctement configuré
- ✅ Vérifiez que l'URL ne contient pas de slash final (`/`)
- ✅ Vérifiez que le backend Render est en ligne (pas en "sleep")
- ✅ Vérifiez que CORS est configuré dans le backend avec l'URL Vercel

### Erreur CORS
- ✅ Dans Render, vérifiez que `CORS_ORIGIN` contient votre URL Vercel
- ✅ Format : `https://votre-app.vercel.app` (sans slash final)
- ✅ Vous pouvez ajouter plusieurs URLs séparées par des virgules

### Le backend ne répond pas
- ✅ Vérifiez que le service Render est actif (pas en "sleep")
- ✅ Les services Render gratuits se mettent en veille après 15 min d'inactivité
- ✅ La première requête peut prendre quelques secondes pour "réveiller" le service

## 📋 Checklist de configuration

- [ ] Backend déployé sur Render et accessible
- [ ] URL du backend copiée (ex: `https://xxx.onrender.com`)
- [ ] `NEXT_PUBLIC_BACKEND_URL` configuré dans Vercel
- [ ] `NEXT_PUBLIC_API_URL` configuré dans Vercel (même valeur)
- [ ] `CORS_ORIGIN` dans Render contient l'URL Vercel
- [ ] Frontend redéployé sur Vercel
- [ ] Test de connexion réussi

## 🔗 Exemple de configuration complète

### Dans Vercel (Environment Variables) :
```
NEXT_PUBLIC_BACKEND_URL=https://emattricule-backend.onrender.com
NEXT_PUBLIC_API_URL=https://emattricule-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Dans Render (Environment Variables) :
```
CORS_ORIGIN=https://votre-app.vercel.app
FRONTEND_URL=https://votre-app.vercel.app
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
# ... autres variables
```

---

**Note** : Après avoir configuré les variables, n'oubliez pas de redéployer votre frontend sur Vercel pour que les changements prennent effet !






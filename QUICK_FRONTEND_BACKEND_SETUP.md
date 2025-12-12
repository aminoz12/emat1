# 🚀 Configuration Rapide : Frontend → Backend

## Étape 1 : Obtenir l'URL de votre backend Render

1. Allez sur [render.com](https://render.com)
2. Ouvrez votre service backend
3. Copiez l'URL affichée (ex: `https://emattricule-backend.onrender.com`)

## Étape 2 : Configurer dans Vercel

1. Allez dans votre projet Vercel
2. **Settings** → **Environment Variables**
3. Ajoutez ces variables :

```
NEXT_PUBLIC_BACKEND_URL=https://votre-backend.onrender.com
NEXT_PUBLIC_API_URL=https://votre-backend.onrender.com
```

4. Sélectionnez **Production**, **Preview**, et **Development**
5. Cliquez sur **Save**

## Étape 3 : Configurer CORS dans Render

1. Allez dans votre service Render
2. **Environment** → Trouvez `CORS_ORIGIN`
3. Ajoutez votre URL Vercel (ex: `https://votre-app.vercel.app`)
4. Sauvegardez

## Étape 4 : Redéployer

1. **Vercel** : Redéployez votre frontend (automatique après sauvegarde des variables)
2. **Render** : Redéployez votre backend si vous avez modifié CORS_ORIGIN

## ✅ Test

Testez une fonctionnalité qui appelle le backend (ex: créer une commande).

---

**Guide complet** : Voir [FRONTEND_BACKEND_CONFIG.md](./FRONTEND_BACKEND_CONFIG.md)






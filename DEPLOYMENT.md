# Guide de déploiement complet - EMatricule

Ce document récapitule les guides de déploiement pour le frontend et le backend.

## 📦 Architecture

- **Frontend**: Next.js déployé sur Vercel
- **Backend**: NestJS déployé sur Render
- **Base de données**: Supabase
- **Paiements**: SumUp

## 🚀 Déploiement Frontend (Vercel)

Voir le guide complet : [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

### Étapes rapides :
1. Connecter le repository à Vercel
2. Configurer les variables d'environnement
3. Déployer

## 🔧 Déploiement Backend (Render)

Voir le guide complet : [backend/RENDER_DEPLOY.md](./backend/RENDER_DEPLOY.md)

### Étapes rapides :
1. Connecter le repository à Render (via `render.yaml` ou manuellement)
2. Configurer les variables d'environnement
3. Déployer

## 🔗 Configuration croisée

### Après le déploiement du backend :

1. **Mettre à jour le frontend (Vercel)**
   - Ajoutez la variable `NEXT_PUBLIC_API_URL` dans Vercel
   - Valeur : `https://your-backend-service.onrender.com`

2. **Mettre à jour le backend (Render)**
   - Ajoutez l'URL du frontend dans `CORS_ORIGIN`
   - Format : `https://your-frontend.vercel.app`
   - Vous pouvez ajouter plusieurs URLs séparées par des virgules

### Variables d'environnement partagées

Les deux services ont besoin de :
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (backend uniquement)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend uniquement)

## ✅ Checklist de déploiement

### Backend (Render)
- [ ] Service créé sur Render
- [ ] Variables d'environnement configurées
- [ ] Service déployé et accessible
- [ ] Documentation Swagger accessible (`/api/docs`)
- [ ] CORS configuré avec l'URL du frontend

### Frontend (Vercel)
- [ ] Projet créé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] `NEXT_PUBLIC_API_URL` pointant vers le backend Render
- [ ] Frontend déployé et accessible
- [ ] Test de connexion au backend réussi

### Tests finaux
- [ ] Authentification fonctionne
- [ ] Création de commande fonctionne
- [ ] Paiement fonctionne
- [ ] Pas d'erreurs CORS
- [ ] Les logs sont accessibles

## 🆘 Support

En cas de problème :
1. Vérifiez les logs dans Render (backend) et Vercel (frontend)
2. Vérifiez que toutes les variables d'environnement sont correctes
3. Vérifiez la configuration CORS
4. Consultez les guides détaillés pour chaque service


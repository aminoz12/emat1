# ✅ Checklist de déploiement Vercel

Utilisez cette checklist avant de déployer sur Vercel.

## 📋 Pré-déploiement

### Configuration
- [ ] Toutes les variables d'environnement sont documentées dans `ENV_VARIABLES.md`
- [ ] Le fichier `vercel.json` est configuré
- [ ] Le fichier `next.config.js` est optimisé pour la production
- [ ] Le fichier `.vercelignore` exclut les fichiers inutiles

### Code
- [ ] Tous les imports sont corrects
- [ ] Pas d'erreurs TypeScript (`npm run build` passe)
- [ ] Pas d'erreurs ESLint (`npm run lint` passe)
- [ ] Les dépendances sont à jour dans `package.json`

### Base de données
- [ ] Supabase est configuré et accessible
- [ ] Les tables sont créées dans Supabase
- [ ] Les politiques RLS sont configurées
- [ ] Les admins sont créés dans Supabase

### Sécurité
- [ ] Les clés API sont en variables d'environnement (pas en dur)
- [ ] Le fichier `.env` est dans `.gitignore`
- [ ] Les secrets ne sont pas commités

## 🚀 Déploiement

### Vercel
- [ ] Repository connecté à Vercel
- [ ] Toutes les variables d'environnement sont configurées dans Vercel
- [ ] Le build passe sans erreur
- [ ] L'application se déploie correctement

### Configuration Supabase
- [ ] URLs autorisées mises à jour avec l'URL Vercel
- [ ] Les webhooks (si utilisés) pointent vers Vercel
- [ ] Les clés API de production sont utilisées

## ✅ Post-déploiement

### Tests fonctionnels
- [ ] Page d'accueil se charge
- [ ] Authentification fonctionne (création de compte, connexion)
- [ ] Dashboard utilisateur fonctionne
- [ ] Création de commande fonctionne
- [ ] Upload de documents fonctionne
- [ ] Panneau admin accessible et fonctionnel

### Tests de performance
- [ ] Les pages se chargent rapidement
- [ ] Les images sont optimisées
- [ ] Pas d'erreurs dans la console navigateur
- [ ] Pas d'erreurs dans les logs Vercel

### Monitoring
- [ ] Les logs Vercel sont accessibles
- [ ] Les erreurs sont trackées (si configuré)
- [ ] Les métriques de performance sont visibles

## 🔧 Configuration finale

- [ ] Domaine personnalisé configuré (si nécessaire)
- [ ] SSL/HTTPS activé automatiquement
- [ ] Redirections configurées (si nécessaire)
- [ ] Analytics configurées (si nécessaire)

## 📝 Documentation

- [ ] README.md mis à jour
- [ ] Guide de déploiement Vercel créé
- [ ] Variables d'environnement documentées
- [ ] Instructions pour l'équipe disponibles

---

**Note** : Cochez chaque élément avant de déployer en production.


# EMatricule - Plateforme d'immatriculation en ligne

Une plateforme complète et moderne pour la gestion des cartes grises et plaques d'immatriculation, similaire à eplaque.fr.

## 🚀 Fonctionnalités

### 👤 Côté Utilisateur
- **Recherche VIN** : Décodage automatique des numéros VIN
- **Sélection de services** : Carte grise, plaques, duplicata, etc.
- **Formulaire intelligent** : Upload de documents avec validation
- **Paiement sécurisé** : Intégration Stripe complète
- **Suivi de commande** : Dashboard utilisateur avec historique
- **Notifications email** : Confirmations et mises à jour automatiques

### 🔧 Côté Administrateur
- **Dashboard complet** : Statistiques en temps réel
- **Gestion des commandes** : Approbation, rejet, suivi
- **Gestion des utilisateurs** : Liste, détails, historique
- **Configuration des prix** : Tarifs dynamiques par service
- **Logs système** : Suivi des emails et erreurs

## 🛠️ Stack Technique

### Frontend
- **Next.js 14** avec App Router
- **React 18** + TypeScript
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations
- **NextAuth.js** pour l'authentification
- **React Hook Form** + Zod pour les formulaires
- **Stripe** pour les paiements
- **UploadThing** pour les fichiers

### Backend
- **NestJS** avec TypeScript
- **PostgreSQL** avec Prisma ORM
- **Redis** pour le cache et les queues
- **BullMQ** pour les tâches en arrière-plan
- **Stripe** pour les paiements
- **Nodemailer** pour les emails
- **Swagger** pour la documentation API

### Infrastructure
- **Docker** pour la containerisation
- **GitHub Actions** pour CI/CD
- **Railway/Render** pour le déploiement
- **PostgreSQL** en base de données
- **Redis** pour le cache

## 📦 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optionnel)

### Installation locale

1. **Cloner le repository**
```bash
git clone https://github.com/your-username/emattricule.git
cd emattricule
```

2. **Installer les dépendances**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

3. **Configuration de la base de données**
```bash
# Créer la base de données
createdb emattricule

# Exécuter les migrations
cd backend
npx prisma migrate dev
npx prisma generate
```

4. **Configuration des variables d'environnement**
```bash
# Copier les fichiers d'exemple
cp .env.example .env
cp backend/env.example backend/.env

# Éditer les variables selon votre configuration
```

5. **Démarrer les services**
```bash
# Redis
redis-server

# Backend
cd backend
npm run start:dev

# Frontend (nouveau terminal)
npm run dev
```

### Installation avec Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

## 🔧 Configuration

### Variables d'environnement

#### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Backend (backend/.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/emattricule?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
VIN_DECODER_API_KEY="your-vin-decoder-api-key"
```

## 🚀 Déploiement

### Vercel (Recommandé pour Next.js)

Le projet est optimisé pour le déploiement sur Vercel. Voir le guide complet : [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

**Déploiement rapide** :
1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement (voir [ENV_VARIABLES.md](./ENV_VARIABLES.md))
3. Déployez automatiquement

**Variables d'environnement requises** :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Railway
1. Connecter le repository GitHub
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Render
1. Créer un nouveau service Web
2. Connecter le repository
3. Configurer les variables d'environnement
4. Déployer

### Docker
```bash
# Build des images
docker build -t emattricule-frontend .
docker build -t emattricule-backend ./backend

# Déploiement
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 API Documentation

L'API est documentée avec Swagger et accessible à :
- **Développement** : http://localhost:3001/api/docs
- **Production** : https://your-domain.com/api/docs

### Endpoints principaux

#### Authentification
- `POST /auth/login` - Connexion
- `POST /auth/register` - Inscription
- `GET /auth/profile` - Profil utilisateur

#### Véhicules
- `POST /vehicles/decode` - Décoder un VIN
- `GET /vehicles` - Liste des véhicules

#### Commandes
- `POST /orders` - Créer une commande
- `GET /orders` - Liste des commandes
- `GET /orders/:id` - Détails d'une commande
- `PATCH /orders/:id/status` - Mettre à jour le statut

#### Paiements
- `POST /payments/create-payment-intent` - Créer un paiement
- `POST /payments/confirm-payment` - Confirmer un paiement
- `POST /payments/webhook` - Webhook Stripe

#### Administration
- `GET /admin/dashboard` - Statistiques
- `GET /admin/orders` - Gestion des commandes
- `GET /admin/users` - Gestion des utilisateurs

## 🧪 Tests

```bash
# Tests frontend
npm run test

# Tests backend
cd backend
npm run test

# Tests e2e
npm run test:e2e
```

## 📊 Monitoring

### Logs
- **Application** : Logs structurés avec Winston
- **Base de données** : Logs de requêtes Prisma
- **Redis** : Logs de cache et queues

### Métriques
- **Performance** : Temps de réponse API
- **Business** : Commandes, revenus, utilisateurs
- **Système** : CPU, mémoire, disque

## 🔒 Sécurité

- **Authentification** : JWT avec refresh tokens
- **Autorisation** : Rôles et permissions
- **Validation** : Zod schemas pour tous les inputs
- **Rate limiting** : Protection contre les abus
- **HTTPS** : Chiffrement en transit
- **CORS** : Configuration stricte

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Email** : support@emattricule.com
- **Téléphone** : 01 84 80 28 27
- **Documentation** : [docs.emattricule.com](https://docs.emattricule.com)
- **Issues** : [GitHub Issues](https://github.com/your-username/emattricule/issues)

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [NestJS](https://nestjs.com/) - Framework Node.js
- [Prisma](https://prisma.io/) - ORM moderne
- [Stripe](https://stripe.com/) - Paiements
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://framer.com/motion/) - Animations

---

**EMatricule** - Simplifiez vos démarches d'immatriculation 🚗
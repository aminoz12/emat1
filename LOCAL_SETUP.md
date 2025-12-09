# Configuration locale - Frontend

## 🚀 Configuration rapide pour tester localement

### Étape 1 : Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet (à côté de `package.json`) avec ce contenu :

```env
# Backend API URL (Render)
NEXT_PUBLIC_BACKEND_URL=https://emat1.onrender.com
NEXT_PUBLIC_API_URL=https://emat1.onrender.com

# Supabase Configuration (ajoutez vos valeurs)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# NextAuth (si utilisé)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### Étape 2 : Redémarrer le serveur de développement

Après avoir créé/modifié `.env.local`, **redémarrez** le serveur Next.js :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

**Important** : Next.js charge les variables d'environnement au démarrage, donc un redémarrage est nécessaire après modification.

### Étape 3 : Vérifier la configuration

1. **Ouvrez** `http://localhost:3000`
2. **Testez** une fonctionnalité qui appelle le backend (ex: créer une commande)
3. **Vérifiez la console** du navigateur pour voir les appels API

## ✅ Variables configurées

- ✅ `NEXT_PUBLIC_BACKEND_URL=https://emat1.onrender.com`
- ✅ `NEXT_PUBLIC_API_URL=https://emat1.onrender.com`

## 🔍 Vérification

Pour vérifier que les variables sont bien chargées, vous pouvez temporairement ajouter dans un composant :

```typescript
console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
```

## 🚨 Problèmes courants

### Les variables ne sont pas chargées
- ✅ Vérifiez que le fichier s'appelle bien `.env.local` (avec le point au début)
- ✅ Redémarrez le serveur Next.js
- ✅ Vérifiez que les variables commencent par `NEXT_PUBLIC_` pour être accessibles côté client

### Erreur CORS
- ✅ Vérifiez que dans Render, `CORS_ORIGIN` contient `http://localhost:3000`
- ✅ Format dans Render : `http://localhost:3000,https://your-app.vercel.app`

### Le backend ne répond pas
- ✅ Vérifiez que le service Render est actif (pas en "sleep")
- ✅ La première requête peut prendre quelques secondes pour "réveiller" le service

## 📝 Note

Le fichier `.env.local` est dans `.gitignore` et ne sera **pas** commité dans Git. C'est normal et sécurisé pour vos variables locales.



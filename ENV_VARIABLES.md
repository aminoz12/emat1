# Variables d'environnement requises

Ce fichier liste toutes les variables d'environnement nécessaires pour le projet.

## 🔐 Variables obligatoires

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Où les trouver** :
- Allez dans votre projet Supabase > Settings > API
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key (⚠️ gardez-la secrète)

## 🔧 Variables optionnelles

### SumUp (paiements)
```env
SUMUP_API_KEY=sup_sk_xas2RLNos33K2gf6l2zoj4j5n8Wbk7vWw
SUMUP_MERCHANT_CODE=your_merchant_code_here
```

**Où les trouver** :
- Connectez-vous à votre compte SumUp
- Allez dans Settings > API
- ✅ **Clé secrète configurée** : `sup_sk_xas2RLNos33K2gf6l2zoj4j5n8Wbk7vWw` (⚠️ Pour les opérations backend, utilisez une clé secrète `sup_sk_...` plutôt qu'une clé publique `sup_pk_...`)
- `SUMUP_MERCHANT_CODE` : Votre code marchand SumUp (trouvable dans votre tableau de bord SumUp)

### Stripe (si vous utilisez les paiements - optionnel)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### NextAuth (si vous utilisez NextAuth)
```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### Configuration générale
```env
NODE_ENV=production
```

## 📝 Configuration pour Vercel

1. Allez dans votre projet Vercel > Settings > Environment Variables
2. Ajoutez toutes les variables ci-dessus
3. Sélectionnez les environnements (Production, Preview, Development)
4. Redéployez votre application

## ⚠️ Notes importantes

- Les variables commençant par `NEXT_PUBLIC_` sont accessibles côté client
- Les autres variables sont uniquement côté serveur
- Ne commitez JAMAIS vos variables d'environnement dans Git
- Utilisez les clés de **production** pour Supabase et Stripe en production


# Fix : Utilisation du Hosted Checkout avec API Key (pas OAuth)

## ✅ Corrections appliquées

### 1. Activation du Hosted Checkout
Le paramètre `hosted_checkout: { enabled: true }` est maintenant inclus lors de la création du checkout pour activer le paiement public/guest.

### 2. Utilisation prioritaire de `hosted_checkout_url`
Selon la documentation SumUp, quand `hosted_checkout: { enabled: true }` est activé, la réponse API inclut directement un champ `hosted_checkout_url` qui est l'URL publique pour le paiement.

**Le code utilise maintenant** :
1. **PRIORITÉ 1** : `checkout.hosted_checkout_url` (si disponible) - URL publique directe
2. **PRIORITÉ 2** : Extraction depuis `checkout.links` (fallback)

### 3. Utilisation d'API Key (pas OAuth)
Le code utilise déjà une API Key (`SUMUP_API_KEY`) et non OAuth, ce qui est correct pour les hosted checkouts.

## 📋 Vérification

### Variables d'environnement requises
- `SUMUP_API_KEY` : Clé API SumUp (format `sup_sk_...` pour secret key)
- `SUMUP_MERCHANT_CODE` : Code marchand SumUp

### Configuration SumUp Dashboard
1. Allez sur [https://me.sumup.com](https://me.sumup.com)
2. **Settings** → **For Developers** → **API Keys**
3. Vérifiez que vous avez une **API Key** (pas OAuth credentials)
4. Vérifiez que les **Hosted Checkouts** sont activés

## ✅ Résultat attendu

Après redéploiement :
- ✅ Le checkout est créé avec `hosted_checkout: { enabled: true }`
- ✅ SumUp retourne `hosted_checkout_url` dans la réponse
- ✅ Cette URL est utilisée pour rediriger le client
- ✅ Le client peut payer avec sa carte **sans compte SumUp**

## 🔍 Logs à vérifier

Dans les logs Render après création d'un checkout, vous devriez voir :
```
✅ Found hosted_checkout_url directly in response (PUBLIC CHECKOUT URL): https://...
✅ Using hosted_checkout_url (direct public checkout URL for guest payment): https://...
```

Si vous voyez :
```
⚠️ No hosted_checkout_url found, using URL from links: ...
```
Cela signifie que SumUp n'a pas retourné `hosted_checkout_url`. Vérifiez :
1. Que `hosted_checkout: { enabled: true }` est bien envoyé
2. Que votre compte SumUp permet les hosted checkouts
3. Que vous utilisez une API Key valide (pas OAuth)

---

**Action** : Redéployez le backend et testez. Le `hosted_checkout_url` devrait maintenant être utilisé en priorité.




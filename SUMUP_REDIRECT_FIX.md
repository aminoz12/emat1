# Fix: Redirection vers page de connexion SumUp

## 🚨 Problème

Après avoir cliqué sur "Payer", l'utilisateur est redirigé vers une page de connexion SumUp (en néerlandais) au lieu de la page de paiement.

## 🔍 Cause probable

L'URL utilisée pour rediriger vers SumUp n'est pas l'URL publique de paiement, mais une URL qui nécessite une authentification.

## ✅ Solutions

### Solution 1 : Vérifier les logs Render (PRIORITAIRE)

**Action immédiate** :
1. Allez dans les logs Render du backend
2. Créez un nouveau checkout
3. Cherchez dans les logs :
   ```
   Available links from SumUp:
   === SUMUP LINKS DETAILS ===
   Link 1: { href: "...", rel: "...", method: "..." }
   ```

4. **Identifiez le lien correct** :
   - Le lien doit avoir une URL publique (pas `/api/`, pas `/login`)
   - L'URL devrait ressembler à `https://me.sumup.com/...` ou `https://pay.sumup.com/...`
   - Le `rel` pourrait être `"checkout"`, `"payment"`, ou similaire

### Solution 2 : Vérifier le format d'URL SumUp

SumUp peut utiliser différents formats selon le type de checkout :

**Format 1** (Hosted Checkout) :
- URL : `https://me.sumup.com/checkout/{checkout_id}`
- Ou dans les `links` avec `rel: "checkout"`

**Format 2** (Card Widget) :
- Nécessite une intégration JavaScript
- Pas une simple redirection

### Solution 3 : Vérifier la configuration SumUp

1. **Dashboard SumUp** :
   - Vérifiez que votre compte est actif
   - Vérifiez que les checkouts sont activés
   - Vérifiez les paramètres de checkout

2. **Variables d'environnement** :
   - `SUMUP_API_KEY` : Doit être une clé secrète (`sup_sk_...`)
   - `SUMUP_MERCHANT_CODE` : Doit être valide
   - Clés de test vs production : Vérifiez que vous utilisez les bonnes

### Solution 4 : Utiliser tous les liens disponibles

Le code a été amélioré pour :
- Logger tous les liens retournés
- Essayer plusieurs stratégies pour trouver le bon lien
- Valider que l'URL semble publique

## 🔧 Actions à effectuer

1. **Redéployez le backend** avec le code amélioré
2. **Créez un nouveau checkout**
3. **Vérifiez les logs Render** pour voir tous les liens
4. **Testez chaque URL** retournée pour trouver celle qui fonctionne
5. **Si nécessaire**, modifiez le code pour utiliser le bon lien

## 📝 Code actuel

Le code essaie maintenant :
1. Lien avec `rel="checkout"`, `rel="payment"`, ou `rel="pay"`
2. Lien avec "checkout" ou "pay" dans l'URL
3. Lien GET qui n'est pas "self" ou "status"
4. N'importe quel lien disponible

## 🚨 Si aucun lien ne fonctionne

Il se peut que SumUp nécessite :
- Une intégration différente (Card Widget JavaScript)
- Une configuration supplémentaire dans le dashboard
- Un format d'URL spécifique selon votre compte

Dans ce cas, **contactez le support SumUp** avec :
- Votre checkout ID
- Les liens retournés par l'API
- La question : "Quelle URL dois-je utiliser pour rediriger l'utilisateur vers la page de paiement publique ?"


# Fix CRITIQUE : Activation du Hosted Checkout Public SumUp

## 🚨 Problème

Redirection vers une **page de connexion SumUp** au lieu d'une page de paiement publique.

## ✅ Solution appliquée

**Le problème** : Le checkout créé n'était pas un "Hosted Checkout" public, donc SumUp redirigeait vers une page nécessitant un compte.

**La solution** : Ajout du paramètre `hosted_checkout: { enabled: true }` lors de la création du checkout.

### Code modifié

```typescript
const checkoutData = {
  checkout_reference: orderId,
  amount: checkoutAmount,
  currency: currency.toUpperCase(),
  merchant_code: merchantCode,
  description: `Payment for order ${order.id}`,
  return_url: returnUrl,
  hosted_checkout: {
    enabled: true  // ✅ CRITICAL: Enables public/guest payment
  }
};

const checkout = await this.sumup.checkouts.create(checkoutData);
```

## 📋 Actions à effectuer

1. **Redéployez le backend** sur Render
2. **Testez** la création d'un nouveau checkout
3. **Vérifiez** que l'URL retournée mène à une page de paiement publique (pas de connexion)

## ✅ Résultat attendu

- ✅ URL de checkout publique accessible sans authentification
- ✅ Les clients peuvent payer directement avec leur carte de crédit
- ✅ Aucun compte SumUp requis pour le client
- ✅ Redirection vers la page de paiement publique SumUp

## 🔍 Vérification

Après le redéploiement, vérifiez dans les logs Render :
```
Creating SumUp hosted checkout with public payment enabled: {
  hosted_checkout: { enabled: true }
}
```

Si le problème persiste, vérifiez :
1. Les liens retournés par SumUp dans les logs
2. Que votre compte SumUp permet les hosted checkouts publics
3. La configuration dans le SumUp Dashboard





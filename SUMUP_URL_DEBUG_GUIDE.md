# Guide de débogage : URL SumUp Widget

## 🚨 Problème actuel

L'URL `https://checkout.sumup.com/b/{checkout_id}` retourne une **404 Not Found**.

## 🔍 Étapes de débogage

### 1. Vérifier les logs Render après création d'un checkout

Après avoir créé un checkout, cherchez dans les logs Render :

```
SumUp checkout created:
=== SUMUP LINKS DETAILS ===
Link 1: { href: "...", rel: "...", method: "..." }
Link 2: { href: "...", rel: "...", method: "..." }
===========================
```

### 2. Identifier le bon lien

Recherchez un lien qui :
- A `rel` contenant "checkout", "payment", ou "pay"
- A `href` contenant une URL valide vers SumUp
- N'est pas `rel: "self"` ou `rel: "status"`

### 3. Formats d'URL possibles

SumUp peut utiliser différents formats :
- `https://me.sumup.com/checkout/{id}`
- `https://pay.sumup.com/checkout/{id}`
- `https://checkout.sumup.com/checkout/{id}`
- URL complète dans `links`

### 4. Si aucun lien ne fonctionne

**Vérifiez** :
1. Le checkout est-il bien créé ? (status = "PENDING")
2. Le checkout ID est-il valide ?
3. Votre compte SumUp est-il actif ?
4. Utilisez-vous les bonnes clés API (test vs production) ?

### 5. Alternative : Utiliser le Card Widget

Si les checkouts ne fonctionnent pas, SumUp propose aussi un **Card Widget** qui s'intègre directement dans votre page via JavaScript. Cela nécessite une refactorisation mais peut être plus fiable.

## 📝 Actions immédiates

1. **Redéployez le backend** avec le code amélioré
2. **Créez un nouveau checkout**
3. **Vérifiez les logs Render** pour voir tous les liens
4. **Copiez le lien** qui semble être l'URL de paiement
5. **Testez ce lien** dans le navigateur

## 🔧 Si le problème persiste

1. **Contactez le support SumUp** :
   - Fournissez le checkout ID
   - Demandez l'URL correcte pour accéder au widget
   - Demandez la documentation complète sur les checkouts

2. **Vérifiez la documentation SumUp** :
   - [SumUp Developer Documentation](https://developer.sumup.com)
   - Section sur les checkouts et l'intégration

3. **Envisagez l'alternative Card Widget** :
   - Plus d'intégration mais plus fiable
   - Nécessite des changements dans le frontend



# Corriger l’erreur SumUp 403

Une **403** sur la création de checkout SumUp signifie en général que le **scope "payments"** n’est pas activé pour votre compte. SumUp doit l’activer manuellement.

## Étapes à suivre

### 1. Demander l’activation du scope "payments"

1. Allez sur **https://developer.sumup.com/contact**
2. Remplissez le formulaire en indiquant que vous avez besoin du **scope "payments"** pour votre intégration (création de checkouts / paiements en ligne).
3. Attendez la réponse de SumUp ; ils activeront le scope sur votre compte.

### 2. Vérifier vos variables d’environnement

Dans Vercel (ou votre hébergeur), vérifiez :

- **`SUMUP_API_KEY`** : clé **secrète** (commence par `sup_sk_...`), sans espaces avant/après.  
  Création / copie : https://me.sumup.com/settings/api-keys

- **`SUMUP_MERCHANT_CODE`** : code marchand (souvent du type `MCXXXXXX` ou similaire).  
  À retrouver dans SumUp : Paramètres / Compte marchand.

### 3. Après activation par SumUp

Une fois le scope "payments" activé, relancez un paiement. Si 403 persiste, revérifiez la clé et le merchant code ci‑dessus.

## Référence

- [SumUp – Authorization](https://developer.sumup.com/tools/authorization/authorization/)  
- [SumUp – Contact](https://developer.sumup.com/contact)

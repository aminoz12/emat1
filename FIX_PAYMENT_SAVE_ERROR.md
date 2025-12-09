# Fix: "Failed to save payment record" Error

## 🔍 Problème

L'erreur `Failed to save payment record` se produit lors de la création d'un checkout SumUp. Cela indique que l'insertion/mise à jour dans la table `payments` de Supabase échoue.

## ✅ Solutions

### Solution 1 : Exécuter la migration SQL (Recommandé)

1. **Allez dans Supabase Dashboard** → **SQL Editor**
2. **Exécutez cette migration** :

```sql
-- Add unique constraint on order_id in payments table
-- First, remove any duplicate payments (keep the most recent one)
DELETE FROM public.payments p1
WHERE EXISTS (
  SELECT 1 FROM public.payments p2
  WHERE p2.order_id = p1.order_id
  AND p2.created_at > p1.created_at
);

-- Add unique constraint
ALTER TABLE public.payments
ADD CONSTRAINT payments_order_id_unique UNIQUE (order_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_sumup_checkout_id ON public.payments(sumup_checkout_id);
```

3. **Redéployez le backend** sur Render

### Solution 2 : Vérifier les permissions RLS

1. **Allez dans Supabase Dashboard** → **Authentication** → **Policies**
2. **Vérifiez la table `payments`**
3. **Assurez-vous qu'il y a une politique** qui permet au service role d'insérer/mettre à jour :

```sql
-- Policy pour permettre au service role d'insérer/mettre à jour
CREATE POLICY "Service role can manage payments"
ON public.payments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

### Solution 3 : Vérifier que la table existe

1. **Allez dans Supabase Dashboard** → **Table Editor**
2. **Vérifiez que la table `payments` existe** avec ces colonnes :
   - `id` (UUID, Primary Key)
   - `order_id` (UUID, Foreign Key vers orders)
   - `amount` (DECIMAL)
   - `currency` (TEXT)
   - `sumup_checkout_id` (TEXT)
   - `status` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

Si la table n'existe pas, exécutez le schéma complet depuis `supabase/schema.sql`

## 🔧 Changements apportés au code

Le code a été amélioré pour :
1. **Meilleure gestion d'erreur** : Les erreurs Supabase sont maintenant loggées avec tous les détails
2. **Logique insert/update** : Au lieu d'utiliser `upsert` avec `onConflict`, le code vérifie d'abord si un paiement existe, puis fait un insert ou update
3. **Messages d'erreur détaillés** : Les erreurs incluent maintenant le message, code, détails et hints de Supabase

## 🧪 Test après correction

1. **Redéployez le backend** sur Render
2. **Testez la création d'un checkout** depuis le frontend
3. **Vérifiez les logs Render** pour voir les détails de l'erreur si elle persiste

## 📋 Checklist de vérification

- [ ] Migration SQL exécutée dans Supabase
- [ ] Contrainte unique sur `order_id` ajoutée
- [ ] Indexes créés
- [ ] Permissions RLS vérifiées/configurées
- [ ] Backend redéployé sur Render
- [ ] Test de création de checkout réussi

## 🚨 Si l'erreur persiste

1. **Vérifiez les logs Render** pour voir l'erreur exacte de Supabase
2. **Vérifiez les variables d'environnement** dans Render :
   - `SUPABASE_URL` est correct
   - `SUPABASE_SERVICE_ROLE_KEY` est correct (clé service role, pas anon key)
3. **Testez la connexion Supabase** depuis le backend en vérifiant les logs au démarrage
4. **Vérifiez que la table `payments` existe** et a la bonne structure

## 📝 Notes

- Le code utilise maintenant une logique insert/update au lieu d'upsert pour plus de contrôle
- Les erreurs sont maintenant plus détaillées pour faciliter le debugging
- La contrainte unique sur `order_id` garantit qu'il n'y a qu'un seul paiement par commande


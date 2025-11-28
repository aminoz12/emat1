# ⚠️ IMPORTANT : VIN doit être en 17 CASES SÉPARÉES

## Problème actuel

Votre PDF a actuellement **1 seul champ VIN** (`text_10se`) qui accepte 17 caractères, mais il devrait avoir **17 champs séparés** (un pour chaque caractère).

## Pourquoi 17 cases séparées ?

L'utilisateur a demandé spécifiquement que **chaque caractère du VIN aille dans sa propre case**. C'est souvent le format requis pour les formulaires officiels.

## Solution : Modifier le PDF

### Option 1 : Avec Adobe Acrobat Pro (Recommandé)

1. **Ouvrez** `public/mandat.pdf` dans Adobe Acrobat Pro
2. **Supprimez** le champ actuel `text_10se` (NUMERO DE VIN)
3. **Créez 17 nouveaux champs texte** à la place :
   - Cliquez sur l'outil "Champ texte"
   - Créez le premier champ (petit rectangle pour 1 caractère)
   - **Cliquez droit** sur le champ → **Propriétés**
   - Dans l'onglet **Général**, **Nom du champ** : `Case1`
   - Dans l'onglet **Options**, **Longueur maximale** : `1`
   - Répétez pour créer `Case2`, `Case3`, ..., `Case17`
   - Positionnez-les côte à côte (ou selon votre mise en page)
4. **Sauvegardez** le PDF

### Option 2 : Renommer les champs existants

Si vous avez déjà créé 17 champs mais qu'ils ne sont pas détectés :

1. Ouvrez le PDF dans Adobe Acrobat Pro
2. Cliquez sur chaque champ VIN
3. Renommez-les : `Case1`, `Case2`, `Case3`, ..., `Case17`
4. Vérifiez que chaque champ a `maxLength = 1`
5. Sauvegardez

### Option 3 : Utiliser l'outil actuel (temporaire)

Le système fonctionne actuellement avec **un seul champ VIN** comme solution de secours, mais ce n'est **pas idéal**. Le VIN sera inséré dans le champ `text_10se` en une seule fois.

Pour que cela fonctionne mieux plus tard, créez quand même les 17 cases séparées.

## Comment vérifier après modification

Après avoir créé les 17 cases, relancez :

```bash
npm run test-pdf
```

Vous devriez voir :
```
🔢 Champs VIN détectés: 17
   - Case1 → Case 1
   - Case2 → Case 2
   ...
   - Case17 → Case 17
   ✅ Parfait! Toutes les 17 cases VIN sont présentes!
```

## Noms recommandés pour les 17 champs VIN

Utilisez un de ces patterns (dans l'ordre de préférence) :

1. **`Case1`, `Case2`, ..., `Case17`** ✅ (Recommandé - simple et clair)
2. **`VIN_1`, `VIN_2`, ..., `VIN_17`** ✅
3. **`Numéro VIN case 1`, `Numéro VIN case 2`, ..., `Numéro VIN case 17`** ✅
4. **`vin1`, `vin2`, ..., `vin17`** ✅

Le système détectera automatiquement n'importe lequel de ces patterns.

## Workaround actuel

Si vous ne pouvez pas créer les 17 cases maintenant, le système utilisera le champ `text_10se` existant. Le VIN sera inséré en une seule fois (17 caractères dans un seul champ).

Cela fonctionne, mais ce n'est **pas l'idéal** pour une présentation professionnelle.


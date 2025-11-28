# Guide : Rendre le PDF Mandat Fillable (Remplissable)

## 📋 Pourquoi le PDF doit être fillable ?

Pour que le système puisse remplir automatiquement le mandat PDF avec les informations du client, le fichier `mandat.pdf` doit contenir des **champs de formulaire AcroForm**. 

Si le PDF est juste une image ou un document scanné sans champs, le système ne pourra pas y insérer les données automatiquement.

## 🔍 Comment vérifier si votre PDF est fillable ?

1. Ouvrez `mandat.pdf` avec Adobe Acrobat Reader (ou un autre lecteur PDF)
2. Allez dans l'outil **"Remplir et signer"** ou **"Formulaires"**
3. Si vous voyez des champs que vous pouvez cliquer et remplir → ✅ Le PDF est fillable
4. Si c'est juste du texte/image sans champs → ❌ Le PDF n'est pas fillable

## ✅ Solution 1 : Rendre le PDF Fillable avec Adobe Acrobat Pro

### Étapes :

1. **Ouvrir le PDF** dans Adobe Acrobat Pro (pas Reader, il faut la version Pro)

2. **Créer les champs de formulaire** :
   - Allez dans **Outils** → **Préparer un formulaire**
   - Ou utilisez l'outil **Formulaires** dans le panneau de droite

3. **Ajouter les champs pour chaque information** :
   - **Nom du demandeur** : Ajoutez un champ texte → Nommez-le `nom` ou `NomDemandeur`
   - **Prénom du demandeur** : Ajoutez un champ texte → Nommez-le `prenom` ou `PrenomDemandeur`
   - **Email** : Ajoutez un champ texte → Nommez-le `email` ou `EmailDemandeur`
   - **Téléphone** : Ajoutez un champ texte → Nommez-le `telephone` ou `TelephoneDemandeur`
   - **Adresse** : Ajoutez un champ texte → Nommez-le `adresse` ou `AdresseDemandeur`
   - **Code postal** : Ajoutez un champ texte → Nommez-le `code_postal` ou `CodePostal`
   - **Ville** : Ajoutez un champ texte → Nommez-le `ville` ou `VilleDemandeur`
   
   **IMPORTANT : VIN en 17 cases séparées** :
   - Créez **17 champs texte individuels** pour le VIN
   - Nommez-les : `Case1`, `Case2`, `Case3`, ..., `Case17`
   - OU : `VIN_1`, `VIN_2`, `VIN_3`, ..., `VIN_17`
   - OU : `Numéro VIN case 1`, `Numéro VIN case 2`, ..., `Numéro VIN case 17`
   - Chaque champ ne doit accepter qu'**1 caractère** (maxLength=1)
   
   - **Immatriculation** : Ajoutez un champ texte → Nommez-le `immatriculation` ou `ImmatriculationVehicule`
   - **Date** : Ajoutez un champ texte → Nommez-le `date` ou `DateDemande`
   - **Type de démarche** : Ajoutez un champ texte → Nommez-le `demarche` ou `TypeDemarche`

4. **Nommer correctement les champs** :
   - ⚠️ **C'EST TRÈS IMPORTANT** : Le nom que vous donnez au champ est ce que le système cherche
   - Cliquez sur chaque champ → Propriétés → Onglet "Général" → **Nom**
   - Utilisez des noms simples : `nom`, `prenom`, `email`, etc.
   - Pour le VIN, utilisez un pattern cohérent : `Case1`, `Case2`, ..., `Case17`

5. **Sauvegarder** :
   - Fichier → Enregistrer
   - Remplacez le fichier `mandat.pdf` dans le dossier `public/`

## ✅ Solution 2 : Utiliser un outil en ligne

Plusieurs outils en ligne permettent de rendre un PDF fillable :

1. **Adobe Acrobat Online** : https://www.adobe.com/acrobat/online/add-form-fields-to-pdf.html
2. **PDFEscape** : https://www.pdfescape.com/
3. **iLovePDF** : https://www.ilovepdf.com/fr

### Avec PDFEscape :

1. Allez sur https://www.pdfescape.com/
2. Téléchargez votre `mandat.pdf`
3. Ajoutez des champs de formulaire pour chaque information
4. Nommez-les correctement (comme dans Solution 1)
5. Téléchargez le PDF remplissable

## ✅ Solution 3 : Détecter automatiquement les champs existants

Si votre PDF a déjà des champs mais avec des noms différents :

1. Générez un mandat (même avec de fausses données)
2. Regardez la **console du serveur** (terminal où tourne `npm run dev`)
3. Vous verrez une liste comme :
   ```
   📋 Champs disponibles dans mandat.pdf:
   1. "NomDemandeur"
   2. "PrenomDemandeur"
   3. "EmailDemandeur"
   4. "Case1"
   5. "Case2"
   ...
   ```
4. Copiez les **vrais noms** de champs
5. Ouvrez `lib/pdf/fieldMapping.ts`
6. Mettez à jour `MANDAT_FIELD_MAPPING` avec les vrais noms

### Exemple de mise à jour :

Si dans la console vous voyez `"Case1"`, `"Case2"`, ..., `"Case17"` :

```typescript
vinFieldsPattern: [
  'Case',  // ← Sera utilisé pour générer Case1, Case2, ..., Case17
  'case',
  'VIN_',
  // ... autres patterns
]
```

## 📝 Exemple de champs à créer dans le PDF

### Champs obligatoires :

| Information | Nom du champ suggéré | Type | Notes |
|------------|---------------------|------|-------|
| Nom | `nom` ou `NomDemandeur` | Texte | Majuscules |
| Prénom | `prenom` ou `PrenomDemandeur` | Texte | Majuscules |
| Email | `email` ou `EmailDemandeur` | Texte | |
| Téléphone | `telephone` ou `TelephoneDemandeur` | Texte | |
| Adresse | `adresse` ou `AdresseDemandeur` | Texte | |
| Code postal | `code_postal` ou `CodePostal` | Texte | |
| Ville | `ville` ou `VilleDemandeur` | Texte | |
| **VIN Case 1** | `Case1` ou `VIN_1` | Texte | **1 caractère max** |
| **VIN Case 2** | `Case2` ou `VIN_2` | Texte | **1 caractère max** |
| ... | ... | ... | ... |
| **VIN Case 17** | `Case17` ou `VIN_17` | Texte | **1 caractère max** |
| Immatriculation | `immatriculation` | Texte | |
| Date | `date` ou `DateDemande` | Texte | Format JJ/MM/AAAA |
| Type démarche | `demarche` ou `TypeDemarche` | Texte | |

## ✅ Après avoir rendu le PDF fillable

1. Remplacez `public/mandat.pdf` par votre nouveau PDF fillable
2. Générez un mandat de test
3. Vérifiez la console du serveur pour voir les champs détectés
4. Si nécessaire, ajustez les noms dans `fieldMapping.ts`

## 🆘 Besoin d'aide ?

Si vous ne savez pas comment rendre le PDF fillable ou si les champs ne sont pas détectés :
1. Générez un mandat de test
2. Regardez la console du serveur pour voir la liste des champs
3. Envoyez-moi la liste et je pourrai ajuster le code pour vos champs spécifiques


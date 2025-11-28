# Guide de Mapping des Champs PDF

Ce guide explique comment mapper correctement les champs du formulaire aux champs réels dans `mandat.pdf`.

## 📋 Étape 1: Identifier les champs disponibles

1. Remplissez le formulaire sur la page carte-grise
2. Cliquez sur "Générer et télécharger le mandat"
3. Regardez la **console du serveur** (terminal où tourne `npm run dev`)
4. Vous verrez une liste complète de tous les champs disponibles dans `mandat.pdf`

Exemple de sortie:
```
📋 ANALYSE DU PDF MANDAT.PDF
📋 Nombre total de champs trouvés: 15
📋 Liste complète des champs disponibles:

1. "NomDemandeur"
   Type: PDFTextField
   Valeur actuelle: (vide)

2. "PrenomDemandeur"
   Type: PDFTextField
   Valeur actuelle: (vide)

3. "AdresseDemandeur"
   Type: PDFTextField
   Valeur actuelle: (vide)
...
```

## 📝 Étape 2: Mettre à jour le mapping

1. Ouvrez le fichier: `lib/pdf/fieldMapping.ts`
2. Trouvez la section `MANDAT_FIELD_MAPPING`
3. Pour chaque propriété, remplacez les noms de champs par les **vrais noms** trouvés dans la console

### Exemple de mise à jour:

**Avant** (noms de champs supposés):
```typescript
lastName: [
  'nom', 'Nom', 'NOM', 'nom_du_demandeur'
]
```

**Après** (vrais noms trouvés dans la console):
```typescript
lastName: [
  'NomDemandeur',  // ← Vrai nom trouvé dans la console
  'nom', 'Nom', 'NOM'  // ← Garder des alternatives au cas où
]
```

## 🎯 Champs à mapper

Assurez-vous de mapper correctement ces champs:

| Donnée du formulaire | Propriété dans fieldMapping.ts | Exemple de nom de champ |
|---------------------|-------------------------------|------------------------|
| Nom de famille | `lastName` | NomDemandeur, nom_famille |
| Prénom | `firstName` | PrenomDemandeur, prenom |
| Email | `email` | EmailDemandeur, email |
| Téléphone | `phone` | TelephoneDemandeur, tel |
| Adresse | `address` | AdresseDemandeur, adresse |
| Code postal | `postalCode` | CodePostal, cp |
| Ville | `city` | VilleDemandeur, ville |
| VIN (optionnel) | `vin` | VIN, numero_serie |
| Immatriculation (optionnel) | `registrationNumber` | Immatriculation, plaque |
| Date | `date` | DateDemande, date |
| Type de démarche | `demarcheType` | TypeDemarche, objet |

## ✅ Étape 3: Tester

1. Après avoir mis à jour le mapping, testez à nouveau
2. Générez un mandat
3. Vérifiez la console - vous devriez voir:
   ```
   ✅ Nom: "NomDemandeur" = "DUPONT"
   ✅ Prénom: "PrenomDemandeur" = "JEAN"
   ✅ Email: "EmailDemandeur" = "jean.dupont@email.com"
   ...
   ```
4. Téléchargez le PDF et vérifiez que les données sont aux bons endroits

## 🔧 Problèmes courants

### Les données sont dans les mauvais champs
- Vérifiez que les noms de champs dans `fieldMapping.ts` correspondent exactement à ceux dans la console
- Les noms sont sensibles à la casse

### Certains champs ne sont pas remplis
- Vérifiez dans la console quels champs ont échoué
- Ajoutez d'autres variantes de noms dans le mapping

### Le PDF est vide
- Vérifiez que `mandat.pdf` existe dans le dossier `public/`
- Vérifiez les logs d'erreur dans la console

## 📞 Besoin d'aide?

Si vous avez des problèmes, vérifiez:
1. La console du serveur pour voir tous les champs disponibles
2. Le fichier `lib/pdf/fieldMapping.ts` pour le mapping actuel
3. Les logs d'erreur dans la console du navigateur et du serveur


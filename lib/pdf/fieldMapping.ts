/**
 * Mapping des champs du formulaire vers les noms réels des champs dans mandat.pdf
 * 
 * Pour trouver les vrais noms des champs :
 * 1. Générer un mandat (même avec de mauvaises données)
 * 2. Vérifier la console du serveur - elle affichera tous les champs disponibles
 * 3. Mettre à jour ce mapping avec les vrais noms de champs
 */

export interface FieldMapping {
  // Informations client
  lastName?: string[]
  firstName?: string[]
  email?: string[]
  phone?: string[]
  address?: string[]
  streetNumber?: string[]
  streetType?: string[]
  streetName?: string[]
  postalCode?: string[]
  city?: string[]
  
  // Informations véhicule
  vin?: string[]
  registrationNumber?: string[]
  marque?: string[]
  
  // Informations société
  siret?: string[]
  
  // Autres
  date?: string[]
  demarcheType?: string[]
  // Patterns pour les champs VIN individuels
  vinFieldsPattern?: string[]
}

/**
 * Mapping des champs - À ADAPTER selon les vrais noms dans votre mandat.pdf
 * 
 * Pour chaque propriété, mettez un tableau de noms de champs possibles
 * Le premier nom qui correspond sera utilisé
 */
export const MANDAT_FIELD_MAPPING: FieldMapping = {
  // Nom de famille - Vrais noms détectés dans mandat.pdf
  lastName: [
    'Nom', // Champ réel dans le PDF
    'nom', 'NOM', 'nom_du_demandeur', 'Nom_du_demandeur',
    'nom_famille', 'nom_familial', 'lastName', 'lastname'
  ],
  
  // Prénom - Vrais noms détectés dans mandat.pdf
  firstName: [
    'Prenom', // Champ réel dans le PDF
    'prenom', 'Prénom', 'PRENOM', 'prenom_du_demandeur', 'Prénom_du_demandeur',
    'firstname', 'firstName'
  ],
  
  // Email
  email: [
    'email', 'Email', 'EMAIL', 'courriel', 'e-mail', 'E-MAIL',
    'mail', 'adresse_email'
  ],
  
  // Téléphone
  phone: [
    'telephone', 'Téléphone', 'TELEPHONE', 'tel', 'Tel', 'TEL',
    'phone', 'PHONE', 'portable', 'numero_telephone',
    // Champ détecté "Numer" (peut être téléphone)
    'text_2nham'
  ],
  
  // Adresse
  address: [
    'adresse', 'Adresse', 'ADRESSE', 'adresse_du_demandeur', 'Adresse_du_demandeur',
    'address', 'street', 'rue', 'voie',
    // Champs détectés dans le PDF actuel
    'text_3bkww', // "Rue"
    'text_5hgk'   // "Adress"
  ],
  
  // Code postal - Probablement text_24uujc à text_28jkez (5 chiffres)
  postalCode: [
    'text_24uujc', 'text_25txco', 'text_26qdcm', 'text_27wpne', 'text_28jkez', // Champs code postal (5 caractères)
    'code_postal', 'Code postal', 'CODE_POSTAL', 'codePostal',
    'postal_code', 'cp', 'CP', 'ZIP', 'code_postal_demandeur'
  ],
  
  // Ville - Vrais noms détectés dans mandat.pdf
  city: [
    'text_29pzdx', // Valeur "Ville" - champ réel dans le PDF
    'text_50kbae', // Autre champ "Ville"
    'ville', 'Ville', 'VILLE', 'city', 'CITY', 'ville_demandeur'
  ],
  
  // Numéro de rue - Vrais noms détectés dans mandat.pdf
  streetNumber: [
    'Numéro Rue', // Champ réel dans le PDF
    'numero_rue', 'Numero_rue', 'NUMERO_RUE', 'numero_de_rue', 'Numero_de_rue',
    'street_number', 'STREET_NUMBER', 'num_rue', 'num_de_rue'
  ],
  
  // Type de rue - Vrais noms détectés dans mandat.pdf
  // CORRECTION: text_22nyt ("Nom Rue") est en fait le TYPE de rue
  streetType: [
    'text_22nyt', // Valeur "Nom Rue" - mais c'est le TYPE de rue dans le PDF
    'type_rue', 'Type_rue', 'TYPE_RUE', 'type_de_rue', 'Type_de_rue',
    'street_type', 'STREET_TYPE', 'type_voie', 'Type_voie'
  ],
  
  // Nom de rue - Vrais noms détectés dans mandat.pdf
  // CORRECTION: text_23iund ("Addresse") est en fait le NOM de la rue
  streetName: [
    'text_23iund', // Valeur "Addresse" - c'est le NOM de la rue dans le PDF
    'nom_rue', 'Nom_rue', 'NOM_RUE', 'nom_de_rue', 'Nom_de_rue',
    'street_name', 'STREET_NAME', 'nom_voie', 'Nom_voie', 'nom_de_la_rue'
  ],
  
  // Marque du véhicule - Vrais noms détectés dans mandat.pdf
  marque: [
    'marque', // Champ réel dans le PDF
    'Marque', 'MARQUE', 'marque_vehicule', 'Marque_vehicule',
    'brand', 'BRAND', 'make', 'MAKE', 'marque_du_vehicule'
  ],
  
  // SIRET (uniquement pour les sociétés)
  siret: [
    'siret', 'SIRET', 'numero_siret', 'NUMERO_SIRET', 'Numero_SIRET',
    'siret_entreprise', 'SIRET_ENTREPRISE', 'siret_societe', 'SIRET_SOCIETE'
  ],
  
  // VIN (17 caractères) - Champs individuels pour chaque caractère
  // ⚠️ IMPORTANT: Il faut 17 CHAMPS SÉPARÉS (un par caractère), pas un seul champ de 17 caractères!
  // Le VIN sera divisé en 17 caractères, chacun dans sa propre case
  // Noms possibles: VIN_1, VIN_2, ..., VIN_17 ou vin1, vin2, ... vin17, etc.
  vin: [
    // Si c'est un seul champ (fallback - pas idéal mais fonctionne)
    'vin', 'VIN', 'numero_serie', 'numéro_série', 'NUMERO_SERIE',
    'chassis', 'CHASSIS', 'numero_chassis', 'NUMERO_CHASSIS',
    'vin_vehicule', 'VIN_VEHICULE', 'vin_du_vehicule', 'VIN_DU_VEHICULE',
    'numero_vin', 'NUMERO_VIN', 'num_vin', 'NUM_VIN',
    'identifiant_vehicule', 'identifiant_du_vehicule',
    // Champ détecté dans le PDF actuel (⚠️ C'est un SEUL champ, pas 17 séparés!)
    'text_10se' // "NUMERO DE VIN" - maxLength 17 (doit être divisé en 17 cases!)
  ],
  
  // Patterns pour les 17 cases individuelles du VIN
  // Chaque caractère du VIN doit aller dans sa propre case (1 à 17)
  vinFieldsPattern: [
    // Pattern 1: Numéro VIN case 1, Numéro VIN case 2, ... (avec espaces)
    'Numéro VIN case ',
    'Numero VIN case ',
    'Numéro VIN Case ',
    'Numero VIN Case ',
    'numero vin case ',
    'NUMERO VIN CASE ',
    // Pattern 2: Case 1, Case 2, ... (simple)
    'Case ',
    'case ',
    'CASE ',
    // Pattern 3: VIN_1, VIN_2, ..., VIN_17
    'VIN_',
    'vin_',
    // Pattern 4: VIN1, VIN2, ..., VIN17 (sans underscore)
    'VIN',
    // Pattern 5: vin1, vin2, ..., vin17
    'vin',
    // Pattern 6: Case_VIN_1, Case_VIN_2, ...
    'Case_VIN_',
    'case_VIN_',
    // Pattern 7: numero_serie_1, numero_serie_2, ...
    'numero_serie_',
    'NUMERO_SERIE_',
    'Numero_Serie_',
    // Pattern 8: Chassis_1, Chassis_2, ...
    'Chassis_',
    'CHASSIS_',
    'chassis_',
    // Pattern 9: NS_1, NS_2, ... (Numéro de série abrégé)
    'NS_',
    'ns_',
    // Pattern 10: Num_Serie_1, Num_Serie_2, ...
    'Num_Serie_',
    'num_serie_'
  ],
  
  // Immatriculation - Vrais noms détectés dans mandat.pdf
  registrationNumber: [
    'text_49nkit', // Valeur "NUMERO IMMATRICULATION" - champ réel dans le PDF
    'immatriculation', 'Immatriculation', 'IMMATRICULATION',
    'plaque', 'Plaque', 'PLAQUE',
    'num_immat', 'NUM_IMMAT', 'numero_immat', 'NUMERO_IMMAT',
    'registration', 'REGISTRATION',
    'numero_immatriculation', 'NUMERO_IMMATRICULATION',
    'immatriculation_vehicule', 'IMMATRICULATION_VEHICULE',
    'plaque_immatriculation', 'PLAQUE_IMMATRICULATION',
    'num_plaque', 'NUM_PLAQUE', 'numero_plaque',
    'immat_vehicule', 'IMMAT_VEHICULE'
  ],
  
  // Date - Probablement text_51juix à text_55dmco (format JJ/MM/AAAA = 10 caractères)
  date: [
    'text_51juix', 'text_52fzld', 'text_53eypx', 'text_54iyyb', 'text_55dmco', // Champs date (10 caractères)
    'text_56yhn', 'text_57tlqp', 'text_58tjdx', 'text_59uosx', 'text_60rgec', // Suite date
    'date', 'Date', 'DATE', 'date_demande', 'date_de_demande', 'DATE_DEMANDE',
    'date_aujourdhui', 'date_du_jour', 'date_fait_le', 'FAIT_LE',
    'date_signature'
  ],
  
  // Type de démarche - Vrais noms détectés dans mandat.pdf
  demarcheType: [
    'text_74kgvf', // Valeur "Type de démarche" - champ réel dans le PDF (CORRIGÉ)
    'text_30qxzu', // Ancien nom (gardé pour compatibilité)
    'demarche', 'Démarche', 'DEMARCHE', 'type_demarche', 'TYPE_DEMARCHE',
    'objet', 'Objet', 'OBJET', 'type_demande', 'TYPE_DEMANDE',
    'motif', 'Motif', 'MOTIF'
  ],
}

/**
 * Fonction pour mapper et remplir les champs du formulaire PDF
 */
export function mapAndFillFields(
  form: any,
  formData: any,
  fieldMapping: FieldMapping & { vinFieldsPattern?: string[] } = MANDAT_FIELD_MAPPING as any
): { success: number; failed: string[] } {
  const failed: string[] = []
  let success = 0
  
  // Préparer les données formatées
  const lastNameUpper = (formData.lastName || '').toUpperCase().trim()
  const firstNameUpper = (formData.firstName || '').toUpperCase().trim()
  const fullName = `${lastNameUpper} ${firstNameUpper}`.trim()
  
  // Date du jour - Toujours utiliser la date actuelle (date de génération du mandat)
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  
    if (process.env.NODE_ENV === 'development') {
      console.log(`📅 Date de génération du mandat: ${today}`)
    }
  
  // Type de démarche
  const demarcheLabels: Record<string, string> = {
    'changement-titulaire': 'Changement de titulaire',
    'changement-adresse': 'Changement d\'adresse',
    'duplicata': 'Demande de duplicata',
    'declaration-achat': 'Déclaration d\'achat',
    'immatriculation-provisoire-ww': 'Immatriculation provisoire WW',
    'carte-grise-vehicule-etranger-ue': 'Carte grise véhicule étranger (UE)',
    'fiche-identification': 'Fiche d\'identification d\'un véhicule',
    'enregistrement-cession': 'Enregistrement de cession',
    'w-garage': 'W Garage',
  }
  const demarcheLabel = demarcheLabels[formData.demarcheType] || formData.demarcheType
  
  // Fonction helper pour remplir un champ
  const tryFillField = (fieldNames: string[] | undefined, value: string, label: string) => {
    if (!fieldNames || !value || value.trim() === '') {
      if (fieldNames && value) {
        failed.push(`${label}: valeur vide`)
      }
      return false
    }
    
    for (const fieldName of fieldNames) {
      try {
        const field = form.getTextField(fieldName)
        if (field) {
          field.setText(value)
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ ${label}: "${fieldName}" = "${value}"`)
          }
          success++
          return true
        }
      } catch (e) {
        // Essayer comme dropdown
        try {
          const dropdown = form.getDropdown(fieldName)
          if (dropdown) {
            dropdown.select(value)
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ ${label}: "${fieldName}" (dropdown) = "${value}"`)
            }
            success++
            return true
          }
        } catch (e2) {
          // Ignorer
        }
      }
    }
    
    failed.push(`${label}: aucun champ trouvé parmi [${fieldNames.join(', ')}]`)
    return false
  }
  
  // Remplir les champs selon le mapping
  // Tous les champs texte sont convertis en MAJUSCULES avant insertion
  tryFillField(fieldMapping.lastName, lastNameUpper, 'Nom')
  tryFillField(fieldMapping.firstName, firstNameUpper, 'Prénom')
  tryFillField(fieldMapping.email, (formData.email || '').toUpperCase().trim(), 'Email')
  tryFillField(fieldMapping.phone, (formData.phone || '').toUpperCase().trim(), 'Téléphone')
  
  // Adresse - Essayer d'abord les 3 champs séparés, puis l'adresse complète
  // Tous convertis en MAJUSCULES
  if (formData.streetNumber && formData.streetType && formData.streetName) {
    tryFillField(fieldMapping.streetNumber, (formData.streetNumber || '').toUpperCase().trim(), 'Numéro de rue')
    tryFillField(fieldMapping.streetType, (formData.streetType || '').toUpperCase().trim(), 'Type de rue')
    tryFillField(fieldMapping.streetName, (formData.streetName || '').toUpperCase().trim(), 'Nom de rue')
  }
  // Fallback: adresse complète
  if (formData.address) {
    tryFillField(fieldMapping.address, (formData.address || '').toUpperCase().trim(), 'Adresse complète')
  }
  
  // Code postal - Format 5 chiffres - Probablement text_24uujc à text_28jkez
  const postalFields = ['text_24uujc', 'text_25txco', 'text_26qdcm', 'text_27wpne', 'text_28jkez']
  const postalStr = (formData.postalCode || '').trim()
  if (postalStr.length === 5) {
    for (let i = 0; i < 5; i++) {
      const char = postalStr[i]
      const fieldName = postalFields[i]
      if (fieldName) {
        try {
          const field = form.getTextField(fieldName)
          if (field) {
            field.setText(char)
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Code postal position ${i + 1}/5: "${fieldName}" = "${char}"`)
            }
            success++
          }
        } catch (e) {
          // Ignorer
        }
      }
    }
  } else {
    // Fallback: essayer un seul champ
    tryFillField(fieldMapping.postalCode, postalStr, 'Code postal')
  }
  
  // Ville - IMPORTANT: Toujours remplacer "Ville" (placeholder) par la vraie valeur du client
  // Convertie en MAJUSCULES
  const cityValue = (formData.city || '').toUpperCase().trim()
  if (cityValue) {
    // Essayer les deux champs ville détectés (text_29pzdx et text_50kbae)
    const cityFields = ['text_29pzdx', 'text_50kbae']
    let cityFilled = false
    for (const fieldName of cityFields) {
      try {
        const field = form.getTextField(fieldName)
        if (field) {
          // TOUJOURS remplacer, même si le champ contient "Ville" (placeholder)
          // Cela garantit que la vraie valeur du client remplace le placeholder
          field.setText(cityValue)
          const currentValue = field.getText() || ''
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Ville: "${fieldName}" = "${cityValue}" (remplacé le placeholder "${currentValue === cityValue ? 'Ville' : currentValue}")`)
          }
          success++
          cityFilled = true
          // Ne pas break, remplir les deux champs si nécessaire
        }
      } catch (e) {
        console.warn(`⚠️ Impossible de remplir le champ ville ${fieldName}`)
      }
    }
    if (!cityFilled) {
      // Fallback: utiliser le mapping
      tryFillField(fieldMapping.city, cityValue, 'Ville')
    }
  } else {
    console.warn('⚠️ Ville non fournie dans les données')
    failed.push('Ville: valeur manquante')
  }
  
  // Marque du véhicule - Convertie en MAJUSCULES
  if (formData.marque) {
    tryFillField(fieldMapping.marque, (formData.marque || '').toUpperCase().trim(), 'Marque')
  }
  
  // SIRET (uniquement si fourni - pour les sociétés)
  // IMPORTANT: Si le SIRET n'est pas fourni, VIDER le champ pour supprimer les "N" (placeholders)
  const siretFields = fieldMapping.siret || []
  
  if (formData.siret && formData.siret.trim() !== '') {
    const siretValue = (formData.siret || '').toUpperCase().trim()
    const siretFilled = tryFillField(fieldMapping.siret, siretValue, 'SIRET')
    if (siretFilled) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ SIRET inséré: "${siretValue}"`)
      }
    } else {
      console.warn('⚠️ SIRET fourni mais aucun champ trouvé pour l\'insérer')
    }
  } else {
    console.log('🗑️  SIRET non fourni - SUPPRESSION FORCÉE de tous les champs SIRET')
    let siretCleared = 0
    
    // D'abord, essayer avec le mapping
    for (const fieldName of siretFields) {
      try {
        const field = form.getTextField(fieldName)
        if (field) {
          const currentValue = field.getText() || ''
          // Toujours vider le champ SIRET s'il n'est pas fourni
          field.setText('')
          if (currentValue && currentValue.trim() !== '') {
            console.log(`✅ Champ SIRET "${fieldName}" vidé (supprimé "${currentValue}")`)
            siretCleared++
            success++
          }
        }
      } catch (e) {
        // Ignorer si le champ n'existe pas ou n'est pas un text field
      }
    }
    
    // Chercher dans TOUS les champs du PDF pour trouver et VIDER le SIRET
    console.log('🔍 Recherche AGGRESSIVE de champs SIRET dans TOUS les champs du PDF...')
    try {
      const allFields = form.getFields()
      console.log(`📋 Parcours de ${allFields.length} champs pour trouver le SIRET...`)
      
      for (const field of allFields) {
        const fieldName = field.getName()
        const lowerName = fieldName.toLowerCase()
        try {
          const textField = form.getTextField(fieldName)
          if (textField) {
            const currentValue = textField.getText() || ''
            const lowerValue = currentValue.toLowerCase()
            
            // CRITÈRES TRÈS ÉLARGIS pour détecter le champ SIRET
            const isSiretField = (
              // Par nom de champ
              lowerName.includes('siret') || 
              (lowerName.includes('numero') && (lowerName.includes('siret') || lowerName.includes('entreprise'))) ||
              // Par valeur du champ - TOUTES les variantes possibles
              lowerValue.includes('siret') ||
              lowerValue.includes('cas échéant') ||
              lowerValue.includes('cas echeant') ||
              lowerValue.includes('le cas échéant') ||
              lowerValue.includes('le cas echeant') ||
              lowerValue.includes('n° siret') ||
              lowerValue.includes('no siret') ||
              lowerValue.includes('numero siret') ||
              lowerValue.includes('n siret') ||
              lowerValue.includes('n° siret, le cas échéant') ||
              lowerValue.includes('n° siret, le cas echeant') ||
              lowerValue.includes('n siret, le cas échéant') ||
              // Détecter les champs avec beaucoup de "N" (placeholders SIRET) - CRITÈRES ASSOUPLIS
              (currentValue.match(/N{2,}/) && currentValue.length >= 5) || // Au moins 2 N consécutifs et longueur >= 5
              (currentValue.match(/N/g) && currentValue.match(/N/g)!.length >= 4) || // Au moins 4 N au total
              // Détecter les champs qui ne contiennent QUE des "N" (placeholders SIRET typiques)
              (currentValue.length >= 5 && /^N+$/.test(currentValue)) || // Au moins 5 caractères, tous des "N"
              // Détecter les patterns comme "NNNNNNNN" ou "NNNNNNNNNN"
              /^N{5,}$/.test(currentValue) || // 5+ N consécutifs uniquement
              // Détecter les champs qui contiennent "N°" suivi de plusieurs "N"
              /N°\s*N{3,}/.test(currentValue) || // "N°" suivi de 3+ N
              // Détecter les champs qui contiennent "N° SIRET" ou variantes
              /N°\s*SIRET/i.test(currentValue) ||
              /N\s*SIRET/i.test(currentValue)
            )
            
            if (isSiretField) {
              // VIDER COMPLÈTEMENT le champ SIRET
              textField.setText('')
              // Vérifier que le champ est bien vidé
              const afterValue = textField.getText() || ''
              if (afterValue === '') {
                console.log(`✅✅✅ Champ SIRET VIDÉ: "${fieldName}" (supprimé "${currentValue}")`)
                siretCleared++
                success++
              } else {
                // Si le champ ne peut pas être vidé, essayer de mettre des espaces
                console.warn(`⚠️ Impossible de vider complètement "${fieldName}", tentative avec espaces...`)
                try {
                  const spaceCount = Math.max(currentValue.length, 10)
                  textField.setText(' '.repeat(spaceCount))
                  const afterSpace = textField.getText() || ''
                  console.log(`✅ Champ SIRET "${fieldName}" rempli avec ${spaceCount} espaces (remplacé "${currentValue}")`)
                  siretCleared++
                  success++
                } catch (e2) {
                  console.warn(`❌ Impossible de modifier le champ "${fieldName}": ${e2}`)
                }
              }
            }
          }
        } catch (e) {
          // Ignorer si ce n'est pas un text field
        }
      }
    } catch (e) {
      console.error(`❌ ERREUR lors de la recherche du SIRET: ${e}`)
    }
    
    // DERNIÈRE TENTATIVE: Vider TOUS les champs qui contiennent "N°" ou beaucoup de "N"
    if (siretCleared === 0) {
      console.warn('⚠️ Aucun champ SIRET trouvé avec les critères standards')
      console.log('🔍 DERNIÈRE TENTATIVE: Recherche de TOUS les champs avec "N°" ou beaucoup de "N"...')
      try {
        const allFields2 = form.getFields()
        for (const field of allFields2) {
          const fieldName = field.getName()
          try {
            const textField = form.getTextField(fieldName)
            if (textField) {
              const currentValue = textField.getText() || ''
              // Si le champ contient "N°" ou beaucoup de "N", le vider
              if (currentValue.includes('N°') || (currentValue.match(/N/g) && currentValue.match(/N/g)!.length >= 4)) {
                textField.setText('')
                const afterValue = textField.getText() || ''
                if (afterValue === '') {
                  console.log(`✅✅✅ Champ suspect VIDÉ: "${fieldName}" (supprimé "${currentValue}")`)
                  siretCleared++
                  success++
                } else {
                  // Essayer avec des espaces
                  try {
                    textField.setText(' '.repeat(Math.max(currentValue.length, 10)))
                    console.log(`✅ Champ suspect "${fieldName}" rempli avec espaces`)
                    siretCleared++
                    success++
                  } catch (e) {}
                }
              }
            }
          } catch (e) {}
        }
      } catch (e) {
        console.error(`❌ ERREUR lors de la dernière tentative: ${e}`)
      }
    }
    
    if (siretCleared === 0) {
      console.error('❌❌❌ AUCUN champ SIRET trouvé pour être vidé!')
      console.error('💡 Le champ SIRET peut avoir un nom complètement différent dans le PDF')
      console.error('💡 Vérifiez manuellement le PDF pour trouver le nom exact du champ SIRET')
    } else {
      console.log(`✅✅✅ ${siretCleared} champ(s) SIRET VIDÉ(S) avec succès!`)
    }
  }
  
  // VIN - Champ obligatoire (doit être rempli)
  // Le VIN doit être divisé en 17 caractères individuels
  const vinValue = (formData.vin || '').toString().toUpperCase().trim()
  
  if (!vinValue) {
    console.warn('⚠️ VIN non fourni dans les données - champ obligatoire manquant')
    failed.push('VIN: valeur manquante (champ obligatoire)')
  } else if (vinValue.length !== 17) {
    console.warn(`⚠️ VIN invalide: doit contenir 17 caractères (actuellement ${vinValue.length})`)
    failed.push(`VIN: longueur invalide (${vinValue.length}/17)`)
  } else {
    // D'abord, essayer de remplir le VIN dans les 17 cases détectées (text_32qvsr à text_48txmg)
    const vinCases = [
      'text_32qvsr', 'text_33oypy', 'text_34vvdv', 'text_35jyhz', 'text_36xuwp',
      'text_37bcih', 'text_38rubz', 'text_39pvme', 'text_40ciuk', 'text_41sztp',
      'text_42ayxv', 'text_43dntp', 'text_44jfew', 'text_45jewt', 'text_46rzat',
      'text_47udxv', 'text_48txmg'
    ]
    
    let vinCasesFilled = 0
    const vinChars = vinValue.split('')
    
    console.log('🔍 Tentative de remplissage des 17 cases VIN détectées...')
    for (let i = 0; i < 17; i++) {
      const char = vinChars[i]
      const fieldName = vinCases[i]
      
      if (fieldName) {
        try {
          const field = form.getTextField(fieldName)
          if (field) {
            field.setText(char)
            console.log(`✅ VIN Case ${i + 1}/17: "${fieldName}" = "${char}"`)
            vinCasesFilled++
          }
        } catch (e) {
          console.warn(`⚠️ Impossible de remplir la case ${i + 1} (${fieldName})`)
        }
      }
    }
    
    if (vinCasesFilled === 17) {
      console.log('✅ VIN complet: Toutes les 17 cases ont été remplies avec succès!')
    } else if (vinCasesFilled > 0) {
      console.warn(`⚠️ VIN partiel: ${vinCasesFilled}/17 cases remplies`)
      // Essayer aussi avec les patterns
      const vinFilled = fillVINInIndividualFields(form, vinValue, fieldMapping.vinFieldsPattern || [])
      if (!vinFilled) {
        failed.push(`VIN: seulement ${vinCasesFilled}/17 cases remplies`)
      }
    } else {
      // Essayer avec les patterns
      const vinFilled = fillVINInIndividualFields(form, vinValue, fieldMapping.vinFieldsPattern || [])
      
      if (!vinFilled) {
        // Si les 17 cases individuelles n'existent pas, utiliser un seul champ (méthode de secours)
        console.log('⚠️ Impossible de trouver les 17 cases VIN individuelles')
        const singleFieldFilled = tryFillField(fieldMapping.vin, vinValue, 'VIN (17 caractères - champ unique)')
        
        if (!singleFieldFilled) {
          failed.push('VIN: aucun champ trouvé pour insérer le VIN')
        }
      }
    }
  }
  
  // Immatriculation - Champ obligatoire (doit être rempli) - Déjà en MAJUSCULES
  const immatValue = (formData.registrationNumber || '').toString().toUpperCase().trim()
  if (immatValue) {
    tryFillField(fieldMapping.registrationNumber, immatValue, 'Immatriculation')
  } else {
    console.warn('⚠️ Immatriculation non fournie dans les données - champ obligatoire manquant')
    failed.push('Immatriculation: valeur manquante (champ obligatoire)')
  }
  
  // Date - Format JJ/MM/AAAA (8 caractères sans slashes) - Probablement text_51juix à text_58tjdx (8 champs)
  // IMPORTANT: Utiliser la date du jour (today) qui est déjà calculée
  // IMPORTANT: Chaque caractère doit aller dans un champ séparé (2 1 1 1 2 0 2 5)
  // Exemple: 21/11/2025 devient "21112025" (8 caractères) → text_51juix='2', text_52fzld='1', etc.
  const dateFields = [
    'text_51juix', 'text_52fzld', 'text_53eypx', 'text_54iyyb', 
    'text_55dmco', 'text_56yhn', 'text_57tlqp', 'text_58tjdx'
  ]
  
  // Format: JJ/MM/AAAA = 8 caractères (sans slashes)
  // On enlève les slashes pour avoir les chiffres uniquement
  const dateStr = today.replace(/\//g, '') // Enlever les slashes pour avoir 8 caractères (JJMMAAAA)
  console.log(`📅 Date à insérer: ${today} (format sans slashes: ${dateStr}, longueur: ${dateStr.length})`)
  
  // Vérifier que nous avons 8 caractères (JJMMAAAA)
  if (dateStr.length === 8) {
    let dateFilled = 0
    console.log(`🔍 Remplissage de la date dans ${dateFields.length} champs individuels...`)
    console.log(`📋 Date divisée: ${dateStr.split('').join(' ')} (chaque chiffre dans un champ séparé)`)
    
    for (let i = 0; i < 8; i++) {
      const char = dateStr[i]
      const fieldName = dateFields[i]
      if (fieldName) {
        try {
          const field = form.getTextField(fieldName)
          if (field) {
            // IMPORTANT: Mettre UN SEUL caractère dans chaque champ
            // Vérifier d'abord la valeur actuelle
            const beforeValue = field.getText() || ''
            field.setText(char)
            // Vérifier que le champ a bien été rempli
            const afterValue = field.getText() || ''
            console.log(`✅ Date position ${i + 1}/8: "${fieldName}" = "${char}" (avant: "${beforeValue}", après: "${afterValue}")`)
            if (afterValue === char) {
              dateFilled++
              success++
            } else {
              console.warn(`⚠️ La date position ${i + 1} n'a pas été correctement remplie (attendu: "${char}", obtenu: "${afterValue}")`)
            }
          }
        } catch (e) {
          console.warn(`⚠️ Impossible de remplir la date position ${i + 1} (${fieldName}): ${e}`)
        }
      }
    }
    if (dateFilled === 8) {
      console.log(`✅ Date complète: Toutes les 8 positions ont été remplies avec succès!`)
      console.log(`📅 Date finale: ${dateStr.split('').join(' ')}`)
    } else if (dateFilled > 0) {
      console.warn(`⚠️ Date partielle: ${dateFilled}/8 positions remplies`)
    } else {
      console.warn('⚠️ Aucune position de date n\'a été remplie, tentative avec un seul champ...')
      // Fallback: essayer un seul champ
      tryFillField(fieldMapping.date, today, 'Date')
    }
  } else {
    console.warn(`⚠️ Format de date invalide: "${dateStr}" (longueur: ${dateStr.length}, attendu: 8)`)
    // Fallback: essayer un seul champ
    tryFillField(fieldMapping.date, today, 'Date')
  }
  
  // Type de démarche - Converti en MAJUSCULES
  console.log(`📋 Type de démarche à insérer: "${formData.demarcheType}" → "${demarcheLabel}" → "${demarcheLabel.toUpperCase()}"`)
  const demarcheFilled = tryFillField(fieldMapping.demarcheType, demarcheLabel.toUpperCase(), 'Type de démarche')
  if (!demarcheFilled) {
    console.warn(`⚠️ Type de démarche non rempli! Valeur: "${demarcheLabel.toUpperCase()}", Champs essayés: ${fieldMapping.demarcheType?.join(', ')}`)
    failed.push('Type de démarche: aucun champ trouvé')
  }
  
  return { success, failed }
}

/**
 * Remplit le VIN dans 17 cases individuelles
 * Chaque caractère du VIN va dans sa propre case (Case 1 à 17)
 */
function fillVINInIndividualFields(
  form: any,
  vinValue: string,
  patterns: string[]
): boolean {
  if (!vinValue || vinValue.length !== 17) {
    return false
  }
  
  // Obtenir tous les champs disponibles
  const allFields = form.getFields()
  const fieldNames = allFields.map((f: any) => f.getName())
  
  console.log('🔍 Recherche des 17 cases VIN individuelles...')
  console.log(`📋 ${fieldNames.length} champs totaux disponibles dans le PDF`)
  
  // D'abord, chercher tous les champs qui pourraient être des cases VIN
  const vinRelatedFields = fieldNames.filter((name: string) => {
    const lowerName = name.toLowerCase()
    const upperName = name.toUpperCase()
    
    // Chercher des champs qui contiennent VIN/chassis/case/numero serie suivi d'un numéro
    const isVinField = (
      // Contient "vin" et un numéro
      (lowerName.includes('vin') || upperName.includes('VIN')) && /\d/.test(name) ||
      // Contient "chassis" et un numéro
      (lowerName.includes('chassis') || upperName.includes('CHASSIS')) && /\d/.test(name) ||
      // Contient "numero serie" et un numéro
      (lowerName.includes('numero') && lowerName.includes('serie')) && /\d/.test(name) ||
      // Contient "case" et un numéro (et possiblement VIN)
      (lowerName.includes('case') || upperName.includes('CASE')) && /\d/.test(name) ||
      // Patterns spécifiques: VIN_1, Case1, NS_1, etc.
      /^(vin|chassis|case|ns|numero.?serie)[_\-]?\s*\d+/i.test(name) ||
      /vin.*[_\s]?(\d+)/i.test(name) ||
      // Numéro VIN case 1, Numero VIN case 2, etc.
      /numero.*vin.*case.*\d+/i.test(name) ||
      /case.*\d+/i.test(name)
    )
    
    return isVinField
  })
  
  if (vinRelatedFields.length > 0) {
    console.log(`📋 ${vinRelatedFields.length} champs VIN potentiels trouvés:`)
    vinRelatedFields.forEach((field: string) => console.log(`   - "${field}"`))
    console.log('')
  } else {
    console.warn('⚠️ Aucun champ VIN potentiel trouvé automatiquement')
    console.warn('💡 Vérifiez la liste complète des champs ci-dessus pour trouver les cases VIN')
  }
  
  // Créer un mapping des champs VIN par numéro de position
  const vinFieldMap: { [key: number]: string } = {}
  
  // Pour chaque champ VIN trouvé, essayer d'extraire le numéro
  for (const fieldName of vinRelatedFields) {
    // Extraire le numéro du nom du champ (ex: "VIN_1" -> 1, "Case5" -> 5, "Numéro VIN case 3" -> 3)
    // Chercher le dernier nombre dans le nom (pour gérer "Numéro VIN case 1")
    const numbers = fieldName.match(/\d+/g)
    if (numbers && numbers.length > 0) {
      // Prendre le dernier nombre trouvé (plus probable d'être le numéro de case)
      const numStr = numbers[numbers.length - 1]
      const num = parseInt(numStr, 10)
      if (num >= 1 && num <= 17) {
        // Si plusieurs champs pour la même case, garder le premier trouvé
        if (!vinFieldMap[num]) {
          vinFieldMap[num] = fieldName
        }
      }
    }
  }
  
  console.log(`📋 Cases VIN détectées: ${Object.keys(vinFieldMap).length}/17`)
  if (Object.keys(vinFieldMap).length > 0) {
    Object.entries(vinFieldMap).forEach(([pos, name]) => {
      console.log(`   Case ${pos}: "${name}"`)
    })
    console.log('')
  }
  
  // Essayer aussi avec les patterns connus (si pas tous les champs trouvés)
  if (Object.keys(vinFieldMap).length < 17) {
    console.log('🔍 Recherche des cases VIN manquantes avec les patterns connus...')
    
    for (const pattern of patterns) {
      const patternTrimmed = pattern.trim()
      
      for (let i = 1; i <= 17; i++) {
        if (vinFieldMap[i]) continue // Déjà trouvé
        
        // Essayer différentes variantes pour chaque pattern
        const variants = [
          // Pattern exact: Numéro VIN case 1, Numéro VIN case 2, etc.
          `${patternTrimmed}${i}`,
          // Avec underscore: VIN_1, VIN_2, etc.
          `${patternTrimmed.replace(/\s/g, '_')}${i}`,
          // Avec tiret: VIN-1, VIN-2, etc.
          `${patternTrimmed.replace(/\s/g, '-')}${i}`,
          // Avec numéro formaté: VIN_01, VIN_02, etc.
          `${patternTrimmed.replace(/\s/g, '_')}${String(i).padStart(2, '0')}`,
          // Variantes de casse
          patternTrimmed.charAt(0).toUpperCase() + patternTrimmed.slice(1).toLowerCase() + i,
          patternTrimmed.toUpperCase() + i,
          patternTrimmed.toLowerCase() + i,
          // Patterns spécifiques communs
          `Case_${i}`,
          `case_${i}`,
          `CASE_${i}`,
          `Case${i}`,
          `case${i}`,
          `CASE${i}`,
          `NumeroSerie${i}`,
          `numero_serie_${i}`,
          `Numero_Serie_${i}`,
          `NUMERO_SERIE_${i}`,
        ]
        
        for (const variant of variants) {
          // Chercher dans la liste des champs (insensible à la casse)
          const found = fieldNames.find((name: string) => name.toLowerCase() === variant.toLowerCase())
          if (found) {
            vinFieldMap[i] = found // Utiliser le nom exact du champ
            console.log(`   ✅ Case ${i} trouvée: "${found}" (via pattern "${pattern}")`)
            break
          }
        }
      }
    }
    
    console.log(`📋 Après recherche par patterns: ${Object.keys(vinFieldMap).length}/17 cases trouvées\n`)
  }
  
  // Maintenant remplir les cases trouvées
  let filledCount = 0
  const filledCases: number[] = []
  
  for (let i = 1; i <= 17; i++) {
    const char = vinValue[i - 1] // VIN est indexé 0-16
    const fieldName = vinFieldMap[i]
    
    if (fieldName) {
      try {
        const field = form.getTextField(fieldName)
        if (field) {
          field.setText(char)
          console.log(`✅ VIN Case ${i}/17: "${fieldName}" = "${char}"`)
          filledCount++
          filledCases.push(i)
        }
      } catch (e) {
        console.warn(`⚠️ Impossible de remplir la case ${i} (${fieldName})`)
      }
    }
  }
  
  if (filledCount === 17) {
    console.log(`✅ VIN complet: Toutes les 17 cases ont été remplies avec succès!`)
    return true
  } else if (filledCount > 0) {
    const missingCases = Array.from({ length: 17 }, (_, i) => i + 1).filter(i => !filledCases.includes(i))
    console.warn(`⚠️ VIN partiel: ${filledCount}/17 cases remplies`)
    console.warn(`⚠️ Cases manquantes: ${missingCases.join(', ')}`)
    console.warn(`💡 Recherchez les champs VIN dans la console pour trouver les noms exacts`)
  } else {
    console.warn(`❌ Aucune case VIN individuelle trouvée`)
    console.warn(`💡 Le PDF peut utiliser un format de nom différent. Vérifiez la liste des champs ci-dessus.`)
  }
  
  return filledCount === 17
}


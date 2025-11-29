import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, PDFForm, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import { mapAndFillFields, MANDAT_FIELD_MAPPING } from '@/lib/pdf/fieldMapping'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    
    // Validation des champs obligatoires
    if (!formData.vin || formData.vin.trim() === '') {
      return NextResponse.json(
        { error: 'Le numéro VIN est obligatoire' },
        { status: 400 }
      )
    }
    
    if (formData.vin.length !== 17) {
      return NextResponse.json(
        { error: `Le numéro VIN doit contenir exactement 17 caractères. Vous avez saisi ${formData.vin.length} caractère(s).` },
        { status: 400 }
      )
    }
    
    if (!formData.registrationNumber || formData.registrationNumber.trim() === '') {
      return NextResponse.json(
        { error: 'Le numéro d\'immatriculation est obligatoire' },
        { status: 400 }
      )
    }
    
    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Données reçues pour génération mandat:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        vin: formData.vin,
        registrationNumber: formData.registrationNumber,
        demarcheType: formData.demarcheType
      })
    }
    
    // Charger le PDF template (essayer les deux cas)
    const publicDir = path.join(process.cwd(), 'public')
    let templatePath = path.join(publicDir, 'Mandat.pdf')
    
    if (!fs.existsSync(templatePath)) {
      // Essayer avec minuscules
      templatePath = path.join(publicDir, 'mandat.pdf')
      if (!fs.existsSync(templatePath)) {
        return NextResponse.json(
          { error: 'Template PDF (Mandat.pdf ou mandat.pdf) non trouvé dans le dossier public' },
          { status: 404 }
        )
      }
    }
    
    const templateBytes = fs.readFileSync(templatePath)
    const pdfDoc = await PDFDocument.load(templateBytes)
    
    // Vérifier si le PDF a des formulaires
    let form: PDFForm | null = null
    let allFields: any[] = []
    let fieldNames: string[] = []
    
    try {
      form = pdfDoc.getForm()
      allFields = form.getFields()
      fieldNames = allFields.map(f => f.getName())
      
      // Log only in development to reduce production overhead
      if (process.env.NODE_ENV === 'development') {
        console.log('='.repeat(80))
        console.log('📋 ANALYSE DU PDF MANDAT.PDF')
        console.log('='.repeat(80))
        console.log(`📋 Nombre total de champs trouvés: ${allFields.length}`)
        console.log('📋 Liste complète des champs disponibles:')
        console.log('-'.repeat(80))
        
        // Afficher le type de chaque champ avec plus de détails
        allFields.forEach((field, index) => {
          const fieldName = field.getName()
          const fieldType = field.constructor.name
          
          // Essayer de lire la valeur actuelle du champ
          let currentValue = ''
          if (form) {
            try {
              const textField = form.getTextField(fieldName)
              currentValue = textField.getText() || '(vide)'
            } catch {
              try {
                const dropdown = form.getDropdown(fieldName)
                const selected = dropdown.getSelected()
                currentValue = Array.isArray(selected) ? (selected.length > 0 ? selected.join(', ') : '(vide)') : (selected || '(vide)')
              } catch {
                currentValue = '(non-text)'
              }
            }
          }
          
          console.log(`${index + 1}. "${fieldName}"`)
          console.log(`   Type: ${fieldType}`)
          console.log(`   Valeur actuelle: ${currentValue}`)
          console.log('')
        })
        
        console.log('='.repeat(80))
        console.log('💡 INSTRUCTIONS:')
        console.log('')
        if (allFields.length === 0) {
          console.log('⚠️  ATTENTION: Votre PDF ne contient PAS de champs de formulaire!')
          console.log('')
          console.log('Pour que le système puisse remplir le mandat automatiquement,')
          console.log('vous devez rendre le PDF "fillable" (remplissable).')
          console.log('')
          console.log('📖 Consultez le guide: GUIDE_PDF_FILLABLE.md')
          console.log('')
          console.log('Options:')
          console.log('1. Utilisez Adobe Acrobat Pro pour ajouter des champs de formulaire')
          console.log('2. Utilisez un outil en ligne (PDFEscape, iLovePDF, etc.)')
          console.log('3. Contactez-nous pour obtenir un template fillable')
          console.log('')
        } else {
          console.log('✅ Votre PDF contient des champs de formulaire!')
          console.log('')
          console.log('Pour mapper correctement les champs:')
          console.log('1. Copiez les noms EXACTS des champs ci-dessus')
          console.log('2. Ouvrez le fichier: lib/pdf/fieldMapping.ts')
          console.log('3. Mettez à jour MANDAT_FIELD_MAPPING avec les vrais noms de champs')
          console.log('')
          console.log('Pour les 17 cases VIN, assurez-vous que les champs s\'appellent:')
          console.log('  - Case1, Case2, ..., Case17')
          console.log('  - OU VIN_1, VIN_2, ..., VIN_17')
          console.log('  - OU un pattern similaire avec numéros 1 à 17')
        }
        console.log('='.repeat(80))
      }
      
    } catch (error) {
      console.warn('⚠️ Le PDF ne contient pas de formulaires AcroForm, utilisation de la méthode de texte direct')
      form = null
    }
    
    if (!form || allFields.length === 0) {
      // Si pas de formulaires, utiliser la méthode de placement de texte direct
      console.log('⚠️ Aucun champ de formulaire détecté, utilisation de la méthode alternative')
      return generatePDFWithTextPlacement(pdfDoc, formData)
    }
    
    // Vérifier que VIN et immatriculation sont présents (obligatoires)
    const vinValue = (formData.vin || '').toString().toUpperCase().trim()
    const immatValue = (formData.registrationNumber || '').toString().toUpperCase().trim()
    
    if (!vinValue) {
      return NextResponse.json(
        { error: 'Le numéro VIN est obligatoire pour générer le mandat' },
        { status: 400 }
      )
    }
    
    if (vinValue.length !== 17) {
      return NextResponse.json(
        { error: `Le numéro VIN doit contenir exactement 17 caractères. Vous avez saisi ${vinValue.length} caractère(s).` },
        { status: 400 }
      )
    }
    
    if (!immatValue) {
      return NextResponse.json(
        { error: 'Le numéro d\'immatriculation est obligatoire pour générer le mandat' },
        { status: 400 }
      )
    }
    
    // S'assurer que les valeurs sont formatées correctement
    formData.vin = vinValue
    formData.registrationNumber = immatValue
    
    // Utiliser le mapping pour remplir les champs
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔄 Début du remplissage des champs avec le mapping...\n')
      console.log('📋 Données à insérer:')
      console.log(`  - VIN: ${vinValue} (${vinValue.length} caractères)`)
      console.log(`  - Immatriculation: ${immatValue}`)
      console.log('')
    }
    
    const result = mapAndFillFields(form, formData, MANDAT_FIELD_MAPPING)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n' + '='.repeat(80))
      console.log('📊 RÉSULTAT DU REMPLISSAGE')
      console.log('='.repeat(80))
      console.log(`✅ Champs remplis avec succès: ${result.success}`)
      
      if (result.failed.length > 0) {
        console.log(`❌ Champs non remplis: ${result.failed.length}`)
        console.log('Liste des champs non remplis:')
        result.failed.forEach(f => console.log(`  - ${f}`))
      }
      console.log('='.repeat(80) + '\n')
    }
    
    // Ne pas verrouiller le formulaire - garder les champs éditables pour la signature
    // form.flatten() - commenté pour permettre l'édition
    
    // Générer le PDF
    const pdfBytes = await pdfDoc.save()
    
    // Retourner le PDF
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="mandat_${formData.demarcheType}_${Date.now()}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Erreur génération mandat:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération du mandat' },
      { status: 500 }
    )
  }
}

/**
 * Méthode alternative : Ajouter du texte directement sur le PDF
 * Utilisé si le PDF n'a pas de champs de formulaire
 */
async function generatePDFWithTextPlacement(
  pdfDoc: PDFDocument,
  formData: any
): Promise<NextResponse> {
  try {
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()
    
    // Charger une police
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    // Vérifier que VIN et immatriculation sont présents (obligatoires)
    const vinValue = (formData.vin || '').toString().toUpperCase().trim()
    const immatValue = (formData.registrationNumber || '').toString().toUpperCase().trim()
    
    if (!vinValue) {
      throw new Error('Le numéro VIN est obligatoire pour générer le mandat')
    }
    
    if (vinValue.length !== 17) {
      throw new Error(`Le numéro VIN doit contenir exactement 17 caractères. Vous avez saisi ${vinValue.length} caractère(s).`)
    }
    
    if (!immatValue) {
      throw new Error('Le numéro d\'immatriculation est obligatoire pour générer le mandat')
    }
    
    // Préparer les données
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
    
    const demarcheLabels: Record<string, string> = {
      'changement-titulaire': 'Changement de titulaire',
      'changement-adresse': 'Changement d\'adresse',
      'duplicata': 'Demande de duplicata',
      'declaration-achat': 'Déclaration d\'achat',
      'immatriculation-provisoire-ww': 'Immatriculation provisoire WW',
      'fiche-identification': 'Fiche d\'identification d\'un véhicule',
      'enregistrement-cession': 'Enregistrement de cession',
      'w-garage': 'W Garage',
    }
    const demarcheLabel = demarcheLabels[formData.demarcheType] || formData.demarcheType
    
    // Positions approximatives (à ajuster selon votre PDF)
    // Format: { x, y } où (0,0) est en bas à gauche
    // Ces valeurs sont des exemples et doivent être ajustées selon votre mandat.pdf
    
    // Construire l'adresse complète
    let fullAddress = formData.address || ''
    if (formData.streetNumber && formData.streetType && formData.streetName) {
      fullAddress = `${formData.streetNumber} ${formData.streetType} ${formData.streetName}`.trim()
    }
    
    // Tous les textes en MAJUSCULES pour la méthode alternative
    const textPositions = [
      { text: lastNameUpper, x: 100, y: height - 150, font: boldFont, size: 12 },
      { text: firstNameUpper, x: 100, y: height - 170, font: boldFont, size: 12 },
      { text: fullAddress.toUpperCase(), x: 100, y: height - 200, font: font, size: 10 },
      { text: `${(formData.postalCode || '').toUpperCase()} ${(formData.city || '').toUpperCase()}`.trim(), x: 100, y: height - 220, font: font, size: 10 },
      { text: (formData.email || '').toUpperCase(), x: 100, y: height - 240, font: font, size: 10 },
      { text: (formData.phone || '').toUpperCase(), x: 100, y: height - 260, font: font, size: 10 },
      { text: demarcheLabel.toUpperCase(), x: 100, y: height - 300, font: boldFont, size: 11 },
      { text: today, x: width - 150, y: height - 100, font: font, size: 10 },
      // VIN - obligatoire (17 caractères) - déjà en majuscules
      { 
        text: `VIN: ${vinValue}`, 
        x: 100, 
        y: height - 320, 
        font: boldFont, 
        size: 10 
      },
      // Immatriculation - obligatoire - déjà en majuscules
      { 
        text: `Immatriculation: ${immatValue}`, 
        x: 100, 
        y: height - 340, 
        font: boldFont, 
        size: 10 
      }
    ]
    
    // Ajouter la marque si fournie - en MAJUSCULES
    if (formData.marque) {
      textPositions.push({
        text: `Marque: ${(formData.marque || '').toUpperCase()}`,
        x: 100,
        y: height - 360,
        font: font,
        size: 10
      })
    }
    
    // Ajouter le SIRET si fourni (pour les sociétés) - en MAJUSCULES
    if (formData.siret && formData.siret.trim() !== '') {
      textPositions.push({
        text: `SIRET: ${(formData.siret || '').toUpperCase()}`,
        x: 100,
        y: height - 380,
        font: font,
        size: 10
      })
    }
    
    // Dessiner le texte sur la page
    textPositions.forEach(({ text, x, y, font, size }) => {
      if (text && text.trim()) {
        firstPage.drawText(text, {
          x,
          y,
          size,
          font,
          color: rgb(0, 0, 0),
        })
      }
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Texte ajouté directement sur le PDF (méthode alternative)')
    }
    
    const pdfBytes = await pdfDoc.save()
    
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="mandat_${formData.demarcheType}_${Date.now()}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Erreur méthode alternative:', error)
    throw error
  }
}


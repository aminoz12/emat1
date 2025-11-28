/**
 * Script de test pour analyser les champs du PDF mandat.pdf
 * 
 * Usage: npx tsx scripts/test-pdf-fields.ts
 */

import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

async function testPDFFields() {
  try {
    // Utiliser le fichier spécifié en argument, ou mandat.pdf par défaut
    const pdfFileName = process.argv[2] || 'mandat.pdf'
    const templatePath = path.join(process.cwd(), 'public', pdfFileName)
    
    if (!fs.existsSync(templatePath)) {
      console.error(`❌ Fichier ${pdfFileName} non trouvé dans public/`)
      console.error(`   Vérifiez que le fichier existe dans: ${templatePath}`)
      process.exit(1)
    }
    
    console.log(`📄 Analyse du fichier: ${pdfFileName}\n`)
    
    console.log(`📄 Lecture du fichier ${pdfFileName}...`)
    const templateBytes = fs.readFileSync(templatePath)
    const pdfDoc = await PDFDocument.load(templateBytes)
    
    console.log('✅ PDF chargé avec succès!\n')
    
    try {
      const form = pdfDoc.getForm()
      const allFields = form.getFields()
      const fieldNames = allFields.map(f => f.getName())
      
      console.log('='.repeat(80))
      console.log('✅ PDF FILLABLE DÉTECTÉ!')
      console.log('='.repeat(80))
      console.log(`📋 Nombre total de champs trouvés: ${allFields.length}\n`)
      
      if (allFields.length === 0) {
        console.warn('⚠️ ATTENTION: Le PDF est marqué comme fillable mais ne contient AUCUN champ!')
        console.warn('')
        console.warn('📋 CAUSES POSSIBLES:')
        console.warn('   1. Les champs de formulaire n\'ont pas été créés correctement')
        console.warn('   2. Les champs ont été créés mais pas sauvegardés')
        console.warn('   3. Le PDF a été créé avec un outil qui ne supporte pas AcroForm')
        console.warn('')
        console.warn('✅ SOLUTION:')
        console.warn('   1. Ouvrez mandat.pdf dans Adobe Acrobat Pro (pas Reader)')
        console.warn('   2. Allez dans: Outils → Préparer un formulaire')
        console.warn('   3. Ajoutez les champs de formulaire nécessaires')
        console.warn('   4. Nommez-les correctement (voir guide: GUIDE_PDF_FILLABLE.md)')
        console.warn('   5. IMPORTANT: Sauvegardez le PDF avec Fichier → Enregistrer')
        console.warn('   6. Testez à nouveau avec: npm run test-pdf')
        console.warn('')
        console.warn('📖 Pour plus d\'informations, consultez: GUIDE_PDF_FILLABLE.md')
        console.log('')
        return
      }
      
      console.log('📋 Liste complète des champs disponibles:\n')
      console.log('-'.repeat(80))
      
      // Catégoriser les champs
      const vinFields: string[] = []
      const clientFields: string[] = []
      const otherFields: string[] = []
      
      allFields.forEach((field, index) => {
        const fieldName = field.getName()
        const fieldType = field.constructor.name
        
        // Essayer de lire les propriétés du champ
        let currentValue = ''
        let maxLength = null
        
        try {
          const textField = form.getTextField(fieldName)
          currentValue = textField.getText() || '(vide)'
          // Certaines versions de pdf-lib supportent maxLength
          try {
            // @ts-ignore - peut ne pas exister
            maxLength = textField.getMaxLength()
          } catch {}
        } catch {
          try {
            const dropdown = form.getDropdown(fieldName)
            const selected = dropdown.getSelected()
            currentValue = Array.isArray(selected) ? (selected.length > 0 ? selected.join(', ') : '(vide)') : (selected || '(vide)')
          } catch {
            currentValue = '(non-text)'
          }
        }
        
        // Catégoriser
        const lowerName = fieldName.toLowerCase()
        if (lowerName.includes('vin') || lowerName.includes('case') || lowerName.includes('chassis') || lowerName.includes('numero') && lowerName.includes('serie')) {
          vinFields.push(fieldName)
        } else if (lowerName.includes('nom') || lowerName.includes('prenom') || lowerName.includes('email') || 
                   lowerName.includes('telephone') || lowerName.includes('adresse') || lowerName.includes('ville') ||
                   lowerName.includes('code') && lowerName.includes('postal')) {
          clientFields.push(fieldName)
        } else {
          otherFields.push(fieldName)
        }
        
        const display = `${index + 1}. "${fieldName}"`
        const typeInfo = `   Type: ${fieldType}`
        const valueInfo = `   Valeur: ${currentValue}`
        const maxInfo = maxLength ? `   MaxLength: ${maxLength}` : ''
        
        console.log(display)
        console.log(typeInfo)
        console.log(valueInfo)
        if (maxInfo) console.log(maxInfo)
        console.log('')
      })
      
      console.log('='.repeat(80))
      console.log('📊 ANALYSE PAR CATÉGORIE')
      console.log('='.repeat(80))
      
      // VIN Fields
      console.log(`\n🔢 Champs VIN détectés: ${vinFields.length}`)
      if (vinFields.length > 0) {
        vinFields.forEach(field => {
          // Extraire le numéro de la case
          const match = field.match(/(\d+)/)
          const num = match ? match[1] : '?'
          console.log(`   - ${field} ${match ? `→ Case ${num}` : ''}`)
        })
        
        if (vinFields.length === 17) {
          console.log('   ✅ Parfait! Toutes les 17 cases VIN sont présentes!')
        } else if (vinFields.length > 0) {
          console.log(`   ⚠️  ${vinFields.length} cases trouvées (attendu: 17)`)
        }
      } else {
        console.log('   ⚠️  Aucun champ VIN détecté - Vérifiez les noms des champs')
      }
      
      // Client Fields
      console.log(`\n👤 Champs informations client: ${clientFields.length}`)
      clientFields.forEach(field => console.log(`   - ${field}`))
      
      // Other Fields
      console.log(`\n📝 Autres champs: ${otherFields.length}`)
      otherFields.forEach(field => console.log(`   - ${field}`))
      
      console.log('\n' + '='.repeat(80))
      console.log('✅ ANALYSE TERMINÉE')
      console.log('='.repeat(80))
      
      // Suggestions
      if (vinFields.length !== 17 && vinFields.length > 0) {
        console.log('\n💡 SUGGESTIONS:')
        console.log(`   - ${17 - vinFields.length} case(s) VIN manquante(s)`)
        console.log('   - Assurez-vous que toutes les cases 1 à 17 existent')
      }
      
      if (vinFields.length === 0) {
        console.log('\n💡 SUGGESTIONS:')
        console.log('   - Aucun champ VIN trouvé')
        console.log('   - Vérifiez que les champs VIN sont nommés avec un pattern contenant VIN/case/chassis et un numéro')
        console.log('   - Exemples de noms valides: Case1, VIN_1, numero_serie_1, etc.')
      }
      
    } catch (error: any) {
      console.error('\n❌ ERREUR: Le PDF ne contient pas de champs de formulaire AcroForm')
      console.error('   Détails:', error.message)
      console.error('\n💡 SOLUTION:')
      console.error('   1. Ouvrez mandat.pdf dans Adobe Acrobat Pro')
      console.error('   2. Allez dans Outils → Préparer un formulaire')
      console.error('   3. Ajoutez les champs de formulaire nécessaires')
      console.error('   4. Sauvegardez et testez à nouveau')
    }
    
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'analyse du PDF:', error.message)
    process.exit(1)
  }
}

testPDFFields()


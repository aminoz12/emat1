import { PDFDocument, PDFTextField } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

export interface MandatData {
  // Informations client
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  postalCode: string
  city: string
  
  // Informations véhicule (optionnelles)
  vin?: string
  registrationNumber?: string
  brand?: string
  model?: string
  
  // Type de démarche
  demarcheType: string
  
  // Date
  date?: string
}

/**
 * Génère un mandat PDF rempli avec les informations du client
 */
export async function generateMandatPDF(formData: MandatData): Promise<Uint8Array> {
  try {
    // Charger le PDF template depuis le dossier public (essayer les deux cas)
    const publicDir = path.join(process.cwd(), 'public')
    let templatePath = path.join(publicDir, 'Mandat.pdf')
    
    if (!fs.existsSync(templatePath)) {
      // Essayer avec minuscules
      templatePath = path.join(publicDir, 'mandat.pdf')
      if (!fs.existsSync(templatePath)) {
        throw new Error('Template PDF (Mandat.pdf ou mandat.pdf) non trouvé dans le dossier public')
      }
    }
    
    const templateBytes = fs.readFileSync(templatePath)
    
    // Charger le PDF
    const pdfDoc = await PDFDocument.load(templateBytes)
    
    // Obtenir le premier formulaire (page)
    const form = pdfDoc.getForm()
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    
    // Remplir les champs du formulaire PDF
    // Note: Vous devrez adapter les noms de champs selon votre PDF CERFA 13757
    // Ces noms sont des exemples et doivent correspondre aux noms réels dans votre PDF
    
    try {
      // Informations du demandeur
      const nomField = form.getTextField('nom') || form.getTextField('Nom')
      if (nomField) nomField.setText(`${formData.lastName}`.toUpperCase())
      
      const prenomField = form.getTextField('prenom') || form.getTextField('Prénom')
      if (prenomField) prenomField.setText(`${formData.firstName}`.toUpperCase())
      
      const adresseField = form.getTextField('adresse') || form.getTextField('Adresse')
      if (adresseField) adresseField.setText(formData.address || '')
      
      const codePostalField = form.getTextField('codePostal') || form.getTextField('Code postal')
      if (codePostalField) codePostalField.setText(formData.postalCode || '')
      
      const villeField = form.getTextField('ville') || form.getTextField('Ville')
      if (villeField) villeField.setText(formData.city || '')
      
      const emailField = form.getTextField('email') || form.getTextField('Email')
      if (emailField) emailField.setText(formData.email || '')
      
      const telephoneField = form.getTextField('telephone') || form.getTextField('Téléphone')
      if (telephoneField) telephoneField.setText(formData.phone || '')
      
      // Informations véhicule
      if (formData.vin) {
        const vinField = form.getTextField('vin') || form.getTextField('VIN')
        if (vinField) vinField.setText(formData.vin)
      }
      
      if (formData.registrationNumber) {
        const immatField = form.getTextField('immatriculation') || form.getTextField('Immatriculation')
        if (immatField) immatField.setText(formData.registrationNumber)
      }
      
      // Date (aujourd'hui par défaut)
      const dateField = form.getTextField('date') || form.getTextField('Date')
      if (dateField) {
        const today = formData.date || new Date().toLocaleDateString('fr-FR')
        dateField.setText(today)
      }
      
      // Type de démarche (peut être dans un champ texte ou checkbox selon le PDF)
      const demarcheField = form.getTextField('demarche') || form.getTextField('Démarche')
      if (demarcheField) {
        const demarcheLabel = getDemarcheLabel(formData.demarcheType)
        demarcheField.setText(demarcheLabel)
      }
      
      // Marquer le formulaire comme rempli mais non verrouillé pour permettre la signature
      form.flatten()
    } catch (error) {
      console.warn('Certains champs PDF n\'ont pas pu être remplis:', error)
      // Continuer même si certains champs ne sont pas trouvés
    }
    
    // Générer le PDF rempli
    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  } catch (error) {
    console.error('Erreur lors de la génération du mandat PDF:', error)
    throw new Error('Impossible de générer le mandat PDF')
  }
}

/**
 * Convertit le type de démarche en libellé lisible
 */
function getDemarcheLabel(demarcheType: string): string {
  const labels: Record<string, string> = {
    'changement-titulaire': 'Changement de titulaire',
    'changement-adresse': 'Changement d\'adresse',
    'duplicata': 'Demande de duplicata',
    'declaration-achat': 'Déclaration d\'achat',
    'immatriculation-provisoire-ww': 'Immatriculation provisoire WW',
    'fiche-identification': 'Fiche d\'identification',
    'enregistrement-cession': 'Enregistrement de cession',
    'w-garage': 'W Garage',
  }
  
  return labels[demarcheType] || demarcheType
}

/**
 * Version côté client pour générer le mandat (nécessite une API route)
 */
export async function generateMandatPDFClient(formData: MandatData): Promise<Blob> {
  const response = await fetch('/api/generate-mandat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
  
  if (!response.ok) {
    throw new Error('Erreur lors de la génération du mandat')
  }
  
  return response.blob()
}


'use client'

import { useState, useEffect, startTransition } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { FileText, Info, Shield, Clock, CheckCircle, Star, CreditCard, Upload, Users, Copy, Car, FileCheck, Home, Search, Building2, ChevronRight, Download, Pen, RotateCcw } from 'lucide-react'
import { CAR_BRANDS } from '@/lib/data/carBrands'
import { useSupabaseSession } from '@/hooks/useSupabaseSession'
import { createOrder, uploadDocuments } from '@/lib/services/orderService'
// Charger PDFViewer uniquement côté client (pas de SSR)
// Utiliser useCanvas={false} pour désactiver le rendu canvas (plus rapide)
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">Chargement du viewer PDF...</p>
      </div>
    </div>
  )
})

// Charger SignaturePad uniquement côté client avec lazy loading
const SignaturePad = dynamic(() => import('@/components/SignaturePad'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-150 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
      <p className="text-sm text-gray-500">Chargement du pad de signature...</p>
    </div>
  )
})

// Types de rues
const STREET_TYPES = [
  'Rue',
  'Avenue',
  'Boulevard',
  'Place',
  'Chemin',
  'Allée',
  'Impasse',
  'Route',
  'Voie',
  'Square',
  'Passage',
  'Cours',
  'Promenade',
  'Autre'
] as const

export default function CarteGrisePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: sessionLoading } = useSupabaseSession()
  const [vin, setVin] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [registrationNumberError, setRegistrationNumberError] = useState('')
  
  // Format and validate French registration number (AA-123-AB format)
  const formatRegistrationNumber = (value: string): string => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7)
    
    // Format as AA-123-AB (2 letters, 3 digits, 2 letters)
    if (cleaned.length <= 2) {
      return cleaned
    } else if (cleaned.length <= 5) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`
    } else {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5, 7)}`
    }
  }
  
  // Validate registration number format
  const validateRegistrationNumber = (value: string): boolean => {
    // Remove dashes for validation
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '')
    
    // Must be exactly 7 characters: 2 letters, 3 digits, 2 letters
    if (cleaned.length !== 7) {
      return false
    }
    
    // Check format: AA-123-AB (2 letters, 3 digits, 2 letters)
    const pattern = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/
    return pattern.test(cleaned)
  }
  
  const handleRegistrationNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatRegistrationNumber(value)
    setRegistrationNumber(formatted)
    
    // Validate format
    if (formatted.replace(/[^a-zA-Z0-9]/g, '').length === 7) {
      if (validateRegistrationNumber(formatted)) {
        setRegistrationNumberError('')
      } else {
        setRegistrationNumberError('Format invalide. Utilisez le format AA-123-CD (2 lettres, 3 chiffres, 2 lettres)')
      }
    } else if (formatted.replace(/[^a-zA-Z0-9]/g, '').length > 0) {
      setRegistrationNumberError('Le numéro doit contenir 7 caractères (2 lettres, 3 chiffres, 2 lettres)')
    } else {
      setRegistrationNumberError('')
    }
  }
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  // Adresse en 3 parties : numéro, type de rue, nom de rue
  const [streetNumber, setStreetNumber] = useState('')
  const [streetType, setStreetType] = useState('')
  const [streetName, setStreetName] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  // Marque du véhicule
  const [marque, setMarque] = useState('')
  // SIRET (uniquement pour les sociétés)
  const [siret, setSiret] = useState('')
  
  // Get document type from URL parameter or default to 'changement-titulaire'
  const getInitialDocumentType = () => {
    const typeParam = searchParams.get('type')
    if (typeParam) {
      // Map URL paths to document type values
      const typeMap: Record<string, string> = {
        'changement-titulaire': 'changement-titulaire',
        'duplicata': 'duplicata',
        'immatriculation-provisoire-ww': 'immatriculation-provisoire-ww',
        'enregistrement-cession': 'enregistrement-cession',
        'changement-adresse': 'changement-adresse',
        'fiche-identification': 'fiche-identification',
        'declaration-achat': 'declaration-achat',
        'w-garage': 'w-garage'
      }
      return typeMap[typeParam] || 'changement-titulaire'
    }
    return 'changement-titulaire'
  }
  
  const [documentType, setDocumentType] = useState(getInitialDocumentType())
  const [clientType, setClientType] = useState<'normal' | 'hosted' | 'company'>('normal')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [proofAddressFile, setProofAddressFile] = useState<File | null>(null)
  const [currentCardFile, setCurrentCardFile] = useState<File | null>(null)
  const [certificatCessionFile, setCertificatCessionFile] = useState<File | null>(null)
  const [permisConduireFile, setPermisConduireFile] = useState<File | null>(null)
  const [controleTechniqueFile, setControleTechniqueFile] = useState<File | null>(null)
  const [assuranceFile, setAssuranceFile] = useState<File | null>(null)
  // Hosted persons documents
  const [hostIdFile, setHostIdFile] = useState<File | null>(null)
  const [hostProofAddressFile, setHostProofAddressFile] = useState<File | null>(null)
  const [attestationHebergementFile, setAttestationHebergementFile] = useState<File | null>(null)
  // Company documents
  const [kbisFile, setKbisFile] = useState<File | null>(null)
  const [gerantIdFile, setGerantIdFile] = useState<File | null>(null)
  const [cachetSocieteFile, setCachetSocieteFile] = useState<File | null>(null)
  const [companyAssuranceFile, setCompanyAssuranceFile] = useState<File | null>(null)
  // Duplicata documents
  const [mandatFile, setMandatFile] = useState<File | null>(null)
  const [cerfa13750File, setCerfa13750File] = useState<File | null>(null)
  const [cerfa13753File, setCerfa13753File] = useState<File | null>(null)
  const [duplicataReason, setDuplicataReason] = useState<'perte-vol' | 'autre' | null>(null)
  // Déclaration d'achat documents
  const [carteGriseVendeurFile, setCarteGriseVendeurFile] = useState<File | null>(null)
  const [demandeCertificatMandatFile, setDemandeCertificatMandatFile] = useState<File | null>(null)
  const [certificatCessionCerfa15776File, setCertificatCessionCerfa15776File] = useState<File | null>(null)
  const [recepisseDeclarationAchatFile, setRecepisseDeclarationAchatFile] = useState<File | null>(null)
  const [certificatDeclarationAchatCerfa13751File, setCertificatDeclarationAchatCerfa13751File] = useState<File | null>(null)
  const [justificatifIdentiteFile, setJustificatifIdentiteFile] = useState<File | null>(null)
  const [extraitKbisFile, setExtraitKbisFile] = useState<File | null>(null)
  const [achatGarage, setAchatGarage] = useState<boolean>(false)
  // Fiche d'identification documents
  const [ficheJustificatifIdentiteFile, setFicheJustificatifIdentiteFile] = useState<File | null>(null)
  const [fichePermisConduireFile, setFichePermisConduireFile] = useState<File | null>(null)
  const [ficheCopieCarteGriseFile, setFicheCopieCarteGriseFile] = useState<File | null>(null)
  const [ficheMandatCerfa13757File, setFicheMandatCerfa13757File] = useState<File | null>(null)
  // Immatriculation provisoire WW documents
  const [wwCarteGriseEtrangereFile, setWwCarteGriseEtrangereFile] = useState<File | null>(null)
  const [wwCertificatConformiteFile, setWwCertificatConformiteFile] = useState<File | null>(null)
  const [wwDemandeCertificatMandatFile, setWwDemandeCertificatMandatFile] = useState<File | null>(null)
  const [wwJustificatifProprieteFile, setWwJustificatifProprieteFile] = useState<File | null>(null)
  const [wwQuitusFiscalFile, setWwQuitusFiscalFile] = useState<File | null>(null)
  const [wwPermisConduireFile, setWwPermisConduireFile] = useState<File | null>(null)
  const [wwJustificatifDomicileFile, setWwJustificatifDomicileFile] = useState<File | null>(null)
  const [wwJustificatifIdentiteFile, setWwJustificatifIdentiteFile] = useState<File | null>(null)
  const [wwControleTechniqueFile, setWwControleTechniqueFile] = useState<File | null>(null)
  const [wwAccuseReceptionFile, setWwAccuseReceptionFile] = useState<File | null>(null)
  const [wwSeule, setWwSeule] = useState<boolean>(false)
  // W Garage documents
  const [wGarageKbisFile, setWGarageKbisFile] = useState<File | null>(null)
  const [wGarageSirenFile, setWGarageSirenFile] = useState<File | null>(null)
  const [wGarageJustificatifDomiciliationFile, setWGarageJustificatifDomiciliationFile] = useState<File | null>(null)
  const [wGarageCniGerantFile, setWGarageCniGerantFile] = useState<File | null>(null)
  const [wGarageAssuranceFile, setWGarageAssuranceFile] = useState<File | null>(null)
  const [wGaragePreuveActiviteFile, setWGaragePreuveActiviteFile] = useState<File | null>(null)
  const [wGarageAttestationFiscaleFile, setWGarageAttestationFiscaleFile] = useState<File | null>(null)
  const [wGarageAttestationUrssafFile, setWGarageAttestationUrssafFile] = useState<File | null>(null)
  const [wGarageMandatFile, setWGarageMandatFile] = useState<File | null>(null)
  // Enregistrement de cession documents
  const [cessionCarteGriseBarreeFile, setCessionCarteGriseBarreeFile] = useState<File | null>(null)
  const [cessionCarteIdentiteFile, setCessionCarteIdentiteFile] = useState<File | null>(null)
  const [cessionCertificatVenteFile, setCessionCertificatVenteFile] = useState<File | null>(null)
  const [cessionMandatFile, setCessionMandatFile] = useState<File | null>(null)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [mandatPreviewUrl, setMandatPreviewUrl] = useState<string | null>(null)
  const [isGeneratingMandat, setIsGeneratingMandat] = useState(false)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [isSignatureValidated, setIsSignatureValidated] = useState(false)
  const [mandatPreviewUrlWithSignature, setMandatPreviewUrlWithSignature] = useState<string | null>(null)
  // Prix calculé basé sur le code postal
  const [calculatedPrice, setCalculatedPrice] = useState<{
    totalPrice: number
    taxes: { y1: number; y2: number; total: number }
    serviceFee: number
    department: string
    departmentName: string
  } | null>(null)
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false)

  const handleFileChange = (setter: (file: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0])
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    // Validation des champs obligatoires
    if (!vin || vin.trim() === '') {
      alert('Le numéro VIN est obligatoire.')
      return
    }
    
    if (vin.length !== 17) {
      alert(`Le numéro VIN doit contenir exactement 17 caractères. Vous avez saisi ${vin.length} caractère(s).`)
      return
    }
    
    if (!registrationNumber || registrationNumber.trim() === '') {
      alert('Le numéro d\'immatriculation est obligatoire.')
      return
    }
    
    // Vérifier le format du numéro d'immatriculation
    if (!validateRegistrationNumber(registrationNumber)) {
      alert('Le numéro d\'immatriculation doit être au format AA-123-CD (2 lettres, 3 chiffres, 2 lettres).')
      return
    }

    if (!acceptTerms) {
      alert('Veuillez accepter les conditions générales.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Calculate price
      const finalPrice = calculatedPrice?.totalPrice || parseFloat(selectedDocument?.price?.replace('€', '').replace(',', '.') || '29.90')
      
      // Handle form submission
      const fullAddress = `${streetNumber} ${streetType} ${streetName}`.trim()
      
      // Create order data
      const orderData = {
        type: 'carte-grise' as const,
        vehicleData: {
          vin: vin.trim().toUpperCase(),
          registrationNumber: registrationNumber.trim().toUpperCase(),
          marque: marque || undefined,
        },
        serviceType: documentType,
        price: finalPrice,
        metadata: {
          firstName,
          lastName,
          email,
          phone,
          streetNumber,
          streetType,
          streetName,
          address: fullAddress,
          postalCode,
          city,
          clientType,
          siret: clientType === 'company' ? siret : '',
          documentType,
          mandatGenerated: !!mandatPreviewUrl,
          signatureValidated: isSignatureValidated,
        }
      }

      // Store all form data temporarily in localStorage for checkout-signup page
      // Convert files to base64 or store blob URLs for later upload
      const formDataToStore = {
        orderData,
        finalPrice,
        // Store file references (we'll convert them to files later)
        documents: {
          idFile: idFile ? { name: idFile.name, type: idFile.type, size: idFile.size } : null,
          proofAddressFile: proofAddressFile ? { name: proofAddressFile.name, type: proofAddressFile.type, size: proofAddressFile.size } : null,
          currentCardFile: currentCardFile ? { name: currentCardFile.name, type: currentCardFile.type, size: currentCardFile.size } : null,
          certificatCessionFile: certificatCessionFile ? { name: certificatCessionFile.name, type: certificatCessionFile.type, size: certificatCessionFile.size } : null,
          permisConduireFile: permisConduireFile ? { name: permisConduireFile.name, type: permisConduireFile.type, size: permisConduireFile.size } : null,
          controleTechniqueFile: controleTechniqueFile ? { name: controleTechniqueFile.name, type: controleTechniqueFile.type, size: controleTechniqueFile.size } : null,
          assuranceFile: assuranceFile ? { name: assuranceFile.name, type: assuranceFile.type, size: assuranceFile.size } : null,
        },
        mandatPreviewUrl,
        mandatPreviewUrlWithSignature,
        isSignatureValidated,
        // Store file objects in a separate key (we'll handle them in checkout-signup)
        files: {
          idFile,
          proofAddressFile,
          currentCardFile,
          certificatCessionFile,
          permisConduireFile,
          controleTechniqueFile,
          assuranceFile,
        }
      }
      
      // Store in localStorage (files will be stored separately)
      localStorage.setItem('pendingOrderData', JSON.stringify({
        ...formDataToStore,
        files: null // Don't store files in JSON
      }))
      
      // Convert files to base64 and store in sessionStorage
      const filesToStore: { [key: string]: { name: string; type: string; base64: string } } = {}
      
      const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1] // Remove data:type;base64, prefix
            resolve(base64)
          }
          reader.onerror = reject
        })
      }
      
      // Convert all files to base64
      const filePromises: Promise<void>[] = []
      
      if (idFile) {
        filePromises.push(
          convertFileToBase64(idFile).then(base64 => {
            filesToStore.idFile = { name: idFile.name, type: idFile.type, base64 }
          })
        )
      }
      if (proofAddressFile) {
        filePromises.push(
          convertFileToBase64(proofAddressFile).then(base64 => {
            filesToStore.proofAddressFile = { name: proofAddressFile.name, type: proofAddressFile.type, base64 }
          })
        )
      }
      if (currentCardFile) {
        filePromises.push(
          convertFileToBase64(currentCardFile).then(base64 => {
            filesToStore.currentCardFile = { name: currentCardFile.name, type: currentCardFile.type, base64 }
          })
        )
      }
      if (certificatCessionFile) {
        filePromises.push(
          convertFileToBase64(certificatCessionFile).then(base64 => {
            filesToStore.certificatCessionFile = { name: certificatCessionFile.name, type: certificatCessionFile.type, base64 }
          })
        )
      }
      if (permisConduireFile) {
        filePromises.push(
          convertFileToBase64(permisConduireFile).then(base64 => {
            filesToStore.permisConduireFile = { name: permisConduireFile.name, type: permisConduireFile.type, base64 }
          })
        )
      }
      if (controleTechniqueFile) {
        filePromises.push(
          convertFileToBase64(controleTechniqueFile).then(base64 => {
            filesToStore.controleTechniqueFile = { name: controleTechniqueFile.name, type: controleTechniqueFile.type, base64 }
          })
        )
      }
      if (assuranceFile) {
        filePromises.push(
          convertFileToBase64(assuranceFile).then(base64 => {
            filesToStore.assuranceFile = { name: assuranceFile.name, type: assuranceFile.type, base64 }
          })
        )
      }
      
      // Handle mandat files
      if (mandatPreviewUrlWithSignature && isSignatureValidated) {
        try {
          const response = await fetch(mandatPreviewUrlWithSignature)
          const blob = await response.blob()
          const mandatFile = new File([blob], `mandat_${documentType}_${Date.now()}.pdf`, { type: 'application/pdf' })
          filePromises.push(
            convertFileToBase64(mandatFile).then(base64 => {
              filesToStore.mandatFile = { name: mandatFile.name, type: mandatFile.type, base64 }
            })
          )
        } catch (error) {
          console.error('Erreur conversion mandat:', error)
        }
      } else if (mandatPreviewUrl) {
        try {
          const response = await fetch(mandatPreviewUrl)
          const blob = await response.blob()
          const mandatFile = new File([blob], `mandat_${documentType}_${Date.now()}.pdf`, { type: 'application/pdf' })
          filePromises.push(
            convertFileToBase64(mandatFile).then(base64 => {
              filesToStore.mandatFile = { name: mandatFile.name, type: mandatFile.type, base64 }
            })
          )
        } catch (error) {
          console.error('Erreur conversion mandat:', error)
        }
      }

      // Wait for all files to be converted
      await Promise.all(filePromises)
      
      console.log('Fichiers stockés dans sessionStorage:', Object.keys(filesToStore))
      console.log('Nombre de fichiers:', Object.keys(filesToStore).length)
      
      // Check if user is already logged in
      if (user && !sessionLoading) {
        // User is logged in - create order directly and redirect to payment
        try {
          // Convert base64 files back to File objects for upload
          const filesToUpload: Array<{ file: File; documentType: string }> = []
          
          const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
            const byteCharacters = atob(base64)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            return new File([byteArray], filename, { type: mimeType })
          }
          
          if (filesToStore.idFile) {
            filesToUpload.push({ 
              file: base64ToFile(filesToStore.idFile.base64, filesToStore.idFile.name, filesToStore.idFile.type), 
              documentType: 'carte_identite' 
            })
          }
          if (filesToStore.proofAddressFile) {
            filesToUpload.push({ 
              file: base64ToFile(filesToStore.proofAddressFile.base64, filesToStore.proofAddressFile.name, filesToStore.proofAddressFile.type), 
              documentType: 'justificatif_domicile' 
            })
          }
          if (filesToStore.currentCardFile) {
            filesToUpload.push({ 
              file: base64ToFile(filesToStore.currentCardFile.base64, filesToStore.currentCardFile.name, filesToStore.currentCardFile.type), 
              documentType: 'carte_grise_actuelle' 
            })
          }
          if (filesToStore.certificatCessionFile) {
            filesToUpload.push({ 
              file: base64ToFile(filesToStore.certificatCessionFile.base64, filesToStore.certificatCessionFile.name, filesToStore.certificatCessionFile.type), 
              documentType: 'certificat_cession' 
            })
          }
          if (filesToStore.permisConduireFile) {
            filesToUpload.push({ 
              file: base64ToFile(filesToStore.permisConduireFile.base64, filesToStore.permisConduireFile.name, filesToStore.permisConduireFile.type), 
              documentType: 'permis_conduire' 
            })
          }
          if (filesToStore.controleTechniqueFile) {
            filesToUpload.push({ 
              file: base64ToFile(filesToStore.controleTechniqueFile.base64, filesToStore.controleTechniqueFile.name, filesToStore.controleTechniqueFile.type), 
              documentType: 'controle_technique' 
            })
          }
          if (filesToStore.assuranceFile) {
            filesToUpload.push({ 
              file: base64ToFile(filesToStore.assuranceFile.base64, filesToStore.assuranceFile.name, filesToStore.assuranceFile.type), 
              documentType: 'assurance' 
            })
          }
          if (filesToStore.mandatFile) {
            filesToUpload.push({ 
              file: base64ToFile(filesToStore.mandatFile.base64, filesToStore.mandatFile.name, filesToStore.mandatFile.type), 
              documentType: isSignatureValidated ? 'mandat_signe' : 'mandat' 
            })
          }
          
          // Create order
          const result = await createOrder(orderData)
          
          if (!result.success || !result.order) {
            throw new Error(result.error || 'Erreur lors de la création de la commande')
          }
          
          // Upload documents
          if (filesToUpload.length > 0) {
            await uploadDocuments(filesToUpload, result.order.id)
          }
          
          // Store order references
      localStorage.setItem('currentOrderId', result.order.id)
      localStorage.setItem('currentOrderRef', result.order.reference)
          localStorage.setItem('currentOrderPrice', String(orderData.price))
          
          // Clean up temporary data
          localStorage.removeItem('pendingOrderData')
          sessionStorage.removeItem('pendingOrderFiles')
          
          // Redirect to payment
          router.push('/payment')
          return
        } catch (error: any) {
          console.error('Erreur création commande:', error)
          alert('Erreur lors de la création de la commande: ' + (error.message || 'Une erreur est survenue'))
          setIsSubmitting(false)
          return
        }
      }
      
      // User is not logged in - store data and redirect to checkout-signup
      sessionStorage.setItem('pendingOrderFiles', JSON.stringify(filesToStore))
      window.location.href = '/checkout-signup'

    } catch (error: any) {
      console.error('Erreur soumission:', error)
      setSubmitError(error.message || 'Une erreur est survenue lors de la soumission.')
      alert(error.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateMandat = async () => {
    try {
      setIsGeneratingMandat(true)
      
      // Vérifier que les informations minimales sont remplies
      if (!firstName || !lastName || !email || !streetNumber || !streetType || !streetName || !postalCode || !city) {
        alert('Veuillez remplir tous les champs obligatoires avant de générer le mandat.')
        setIsGeneratingMandat(false)
        return
      }
      
      // Vérifier SIRET si c'est une société
      if (clientType === 'company' && (!siret || siret.trim() === '')) {
        alert('Le numéro SIRET est obligatoire pour les sociétés.')
        setIsGeneratingMandat(false)
        return
      }

      // Vérifier VIN (obligatoire et 17 caractères)
      if (!vin || vin.trim() === '') {
        alert('Le numéro VIN est obligatoire. Veuillez le renseigner.')
        setIsGeneratingMandat(false)
        return
      }
      
      if (vin.length !== 17) {
        alert(`Le numéro VIN doit contenir exactement 17 caractères. Vous avez saisi ${vin.length} caractère(s).`)
        setIsGeneratingMandat(false)
        return
      }

      // Vérifier numéro d'immatriculation (obligatoire et format valide)
      if (!registrationNumber || registrationNumber.trim() === '') {
        alert('Le numéro d\'immatriculation est obligatoire. Veuillez le renseigner.')
        setIsGeneratingMandat(false)
        return
      }
      
      // Vérifier le format du numéro d'immatriculation
      if (!validateRegistrationNumber(registrationNumber)) {
        alert('Le numéro d\'immatriculation doit être au format AA-123-CD (2 lettres, 3 chiffres, 2 lettres).')
        setIsGeneratingMandat(false)
        return
      }

      // Construire l'adresse complète à partir des 3 champs
      const fullAddress = `${streetNumber} ${streetType} ${streetName}`.trim()
      
      // Préparer les données pour le mandat
      const mandatData = {
        firstName,
        lastName,
        email,
        phone: phone || '',
        // Adresse en 3 parties
        streetNumber: streetNumber.trim(),
        streetType: streetType.trim(),
        streetName: streetName.trim(),
        address: fullAddress, // Adresse complète pour compatibilité
        postalCode,
        city,
        vin: vin.trim().toUpperCase(),
        registrationNumber: registrationNumber.trim().toUpperCase(),
        marque: marque || '',
        siret: clientType === 'company' ? (siret || '').trim() : '',
        demarcheType: documentType,
      }

      // Appeler l'API pour générer le PDF
      const response = await fetch('/api/generate-mandat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mandatData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la génération du mandat')
      }

      // Vérifier que la réponse est bien un PDF
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/pdf')) {
        const errorText = await response.text()
        console.error('Réponse non-PDF reçue:', errorText)
        throw new Error('Le serveur n\'a pas retourné un PDF valide. Vérifiez les logs du serveur.')
      }

      // Récupérer le blob PDF
      const blob = await response.blob()
      
      // Vérifier que le blob n'est pas vide
      if (blob.size === 0) {
        throw new Error('Le PDF généré est vide. Vérifiez que mandat.pdf existe dans le dossier public.')
      }
      
      console.log('PDF généré avec succès, taille:', blob.size, 'bytes')
      
      // Libérer l'ancienne URL si elle existe
      if (mandatPreviewUrl) {
        window.URL.revokeObjectURL(mandatPreviewUrl)
      }
      
      // Créer une URL blob pour l'aperçu
      const url = window.URL.createObjectURL(blob)
      setMandatPreviewUrl(url)
      
      // Message de confirmation
      // alert('Mandat généré avec succès ! Vous pouvez maintenant le visualiser et le télécharger.')
    } catch (error: any) {
      console.error('Erreur génération mandat:', error)
      const fullAddress = `${streetNumber} ${streetType} ${streetName}`.trim()
      console.error('Détails:', {
        firstName,
        lastName,
        email,
        streetNumber,
        streetType,
        streetName,
        address: fullAddress,
        postalCode,
        city,
        marque,
        siret: clientType === 'company' ? siret : '',
        documentType
      })
      alert(error.message || 'Une erreur est survenue lors de la génération du mandat. Vérifiez la console pour plus de détails.')
    } finally {
      setIsGeneratingMandat(false)
    }
  }

  const handleValidateSignature = async () => {
    if (!signatureDataUrl || !mandatPreviewUrl) {
      alert('Veuillez d\'abord générer le mandat et signer.')
      return
    }

    try {
      // Intégrer la signature dans le PDF pour l'aperçu
      const { PDFDocument } = await import('pdf-lib')
      
      const response = await fetch(mandatPreviewUrl)
      const pdfBytes = await response.arrayBuffer()
      const pdfDoc = await PDFDocument.load(pdfBytes)
      const pages = pdfDoc.getPages()
      const lastPage = pages[pages.length - 1]
      
      // Convertir l'image de signature
      let signatureImage
      try {
        signatureImage = await pdfDoc.embedPng(signatureDataUrl)
      } catch (pngError) {
        const jpgDataUrl = signatureDataUrl.replace('image/png', 'image/jpeg')
        signatureImage = await pdfDoc.embedJpg(jpgDataUrl)
      }
      
      const signatureWidth = 150
      const signatureHeight = (signatureImage.height / signatureImage.width) * signatureWidth
      const signatureX = 350
      const signatureY = 120
      
      // Ajouter la signature au PDF
      lastPage.drawImage(signatureImage, {
        x: signatureX,
        y: signatureY,
        width: signatureWidth,
        height: signatureHeight,
      })
      
      // Sauvegarder le PDF avec la signature
      const pdfBytesWithSignature = await pdfDoc.save()
      // Convertir Uint8Array en ArrayBuffer pour compatibilité Blob
      const arrayBuffer = pdfBytesWithSignature.buffer.slice(
        pdfBytesWithSignature.byteOffset,
        pdfBytesWithSignature.byteOffset + pdfBytesWithSignature.byteLength
      ) as ArrayBuffer
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      
      // Libérer l'ancienne URL si elle existe
      if (mandatPreviewUrlWithSignature) {
        window.URL.revokeObjectURL(mandatPreviewUrlWithSignature)
      }
      
      setMandatPreviewUrlWithSignature(url)
      setIsSignatureValidated(true)
      
      console.log('✅ Signature validée et intégrée dans l\'aperçu')
    } catch (error: any) {
      console.error('Erreur lors de la validation de la signature:', error)
      alert('Erreur lors de la validation de la signature. Veuillez réessayer.')
    }
  }

  const handleResign = () => {
    setIsSignatureValidated(false)
    setSignatureDataUrl(null)
    if (mandatPreviewUrlWithSignature) {
      window.URL.revokeObjectURL(mandatPreviewUrlWithSignature)
      setMandatPreviewUrlWithSignature(null)
    }
  }

  const handleDownloadMandat = async () => {
    // Utiliser le PDF avec signature si validée, sinon le PDF original
    if (mandatPreviewUrlWithSignature) {
      // Télécharger directement le PDF avec signature validée
      const a = document.createElement('a')
      a.href = mandatPreviewUrlWithSignature
      a.download = `mandat_${documentType}_${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      console.log('✅ PDF téléchargé avec signature validée')
      return
    }
    
    if (!mandatPreviewUrl) return
    
    try {
      // Si une signature existe mais n'est pas validée, l'intégrer au PDF
      if (signatureDataUrl) {
        // Charger pdf-lib dynamiquement
        const { PDFDocument, rgb } = await import('pdf-lib')
        
        // Récupérer le PDF depuis l'URL blob
        const response = await fetch(mandatPreviewUrl)
        const pdfBytes = await response.arrayBuffer()
        
        // Charger le PDF
        const pdfDoc = await PDFDocument.load(pdfBytes)
        const pages = pdfDoc.getPages()
        const lastPage = pages[pages.length - 1]
        
        // Convertir l'image de signature en image PDF
        // Essayer PNG d'abord, puis JPG si nécessaire
        let signatureImage
        try {
          signatureImage = await pdfDoc.embedPng(signatureDataUrl)
        } catch (pngError) {
          console.warn('Impossible d\'embarquer en PNG, tentative en JPG:', pngError)
          // Si PNG échoue, convertir en JPG
          const jpgDataUrl = signatureDataUrl.replace('image/png', 'image/jpeg')
          signatureImage = await pdfDoc.embedJpg(jpgDataUrl)
        }
        
        // Obtenir le formulaire pour trouver le champ de signature
        const form = pdfDoc.getForm()
        let signatureField
        try {
          signatureField = form.getSignature('signature_14pvos')
          console.log('✅ Champ de signature trouvé: signature_14pvos')
        } catch (e) {
          console.warn('⚠️ Champ de signature signature_14pvos non trouvé:', e)
        }
        
        // Dimensions de la signature pour correspondre au champ de signature du PDF
        const signatureWidth = 150
        const signatureHeight = (signatureImage.height / signatureImage.width) * signatureWidth
        
        const pageWidth = lastPage.getSize().width
        const pageHeight = lastPage.getSize().height
        
        // Position du champ de signature dans le PDF mandat.pdf
        // IMPORTANT: Le champ "Nom" est en haut à gauche, le champ "Signature" est plus bas
        // Format PDF: (0,0) en bas à gauche, y augmente vers le haut
        // Le champ de signature est généralement en bas de page, au centre ou à droite
        // Ajustez ces coordonnées selon votre PDF
        const signatureX = 350 // Position X pour le champ de signature (ajusté plus à droite)
        const signatureY = 120 // Position Y en bas de page (ajustez selon votre PDF - augmentez pour descendre)
        
        console.log('📝 Ajout de la signature au PDF:', {
          signatureWidth,
          signatureHeight,
          signatureX,
          signatureY,
          pageWidth,
          pageHeight,
          imageWidth: signatureImage.width,
          imageHeight: signatureImage.height,
          signatureFieldExists: !!signatureField
        })
        
        // Ajouter la signature au PDF à la position du champ de signature
        // IMPORTANT: Utiliser les coordonnées correctes pour placer la signature sous le champ "Signature"
        lastPage.drawImage(signatureImage, {
          x: signatureX,
          y: signatureY,
          width: signatureWidth,
          height: signatureHeight,
        })
        
        console.log('✅ Signature ajoutée au PDF avec succès')
        
      // Sauvegarder le PDF avec la signature
      const pdfBytesWithSignature = await pdfDoc.save()

      // Créer un blob et télécharger
      const blob = new Blob([new Uint8Array(pdfBytesWithSignature)], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mandat_${documentType}_${Date.now()}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        console.log('✅ PDF téléchargé avec signature intégrée')
      } else {
        // Télécharger le PDF sans signature
        const a = document.createElement('a')
        a.href = mandatPreviewUrl
        a.download = `mandat_${documentType}_${Date.now()}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } catch (error: any) {
      console.error('Erreur lors du téléchargement du mandat avec signature:', error)
      alert('Erreur lors de l\'intégration de la signature. Le PDF sera téléchargé sans signature.')
      // Fallback: télécharger sans signature
      const a = document.createElement('a')
      a.href = mandatPreviewUrl
      a.download = `mandat_${documentType}_${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  // Nettoyer l'URL blob quand le composant est démonté ou quand l'URL change
  useEffect(() => {
    return () => {
      if (mandatPreviewUrl) {
        window.URL.revokeObjectURL(mandatPreviewUrl)
      }
    }
  }, [mandatPreviewUrl])

  // Calculer le prix de la carte grise basé sur le code postal
  useEffect(() => {
    const calculatePrice = async () => {
      // Ne calculer que si le code postal est valide (5 chiffres pour métropole, 3 pour DOM)
      if (!postalCode || (!/^\d{5}$/.test(postalCode) && !/^97\d{3}$/.test(postalCode))) {
        setCalculatedPrice(null)
        return
      }

      // Ne calculer que pour certaines démarches (pas pour "Sur devis")
      if (documentType === 'declaration-achat' || documentType === 'w-garage') {
        setCalculatedPrice(null)
        return
      }

      setIsCalculatingPrice(true)
      try {
        const response = await fetch(`/api/calculate-carte-grise-price?postalCode=${postalCode}`)
        if (response.ok) {
          const data = await response.json()
          // Vérifier que le prix calculé est valide
          if (data.totalPrice !== undefined && data.totalPrice > 0) {
            setCalculatedPrice(data)
          } else {
            setCalculatedPrice(null)
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('Erreur lors du calcul du prix:', await response.text())
          }
          setCalculatedPrice(null)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors du calcul du prix:', error)
        }
        setCalculatedPrice(null)
      } finally {
        setIsCalculatingPrice(false)
      }
    }

    // Délai pour éviter trop d'appels API (debounce)
    const timeoutId = setTimeout(() => {
      calculatePrice()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [postalCode, documentType])

  // Track if user has manually changed the document type
  const [userChangedType, setUserChangedType] = useState(false)

  // Update documentType when URL parameter changes (only on initial load, not if user changed it)
  useEffect(() => {
    // Only update from URL if user hasn't manually changed the type
    if (userChangedType) return
    
    const typeParam = searchParams.get('type')
    if (typeParam) {
      const typeMap: Record<string, string> = {
        'changement-titulaire': 'changement-titulaire',
        'duplicata': 'duplicata',
        'immatriculation-provisoire-ww': 'immatriculation-provisoire-ww',
        'enregistrement-cession': 'enregistrement-cession',
        'changement-adresse': 'changement-adresse',
        'fiche-identification': 'fiche-identification',
        'declaration-achat': 'declaration-achat',
        'w-garage': 'w-garage'
      }
      const mappedType = typeMap[typeParam]
      if (mappedType && mappedType !== documentType) {
        startTransition(() => {
          setDocumentType(mappedType)
          // Reset client type if not changement-titulaire
          if (mappedType !== 'changement-titulaire') {
            setClientType('normal')
          }
        })
      }
    }
  }, [searchParams, documentType, userChangedType])

  const documentTypes = [
    { 
      value: 'changement-titulaire', 
      label: 'Changement de titulaire', 
      description: 'Vous avez acheté un véhicule neuf ou d\'occasion en France ou à l\'étranger.',
      price: '29,90€',
      icon: Users,
      iconImage: '/g1.png'
    },
    {
      value: 'duplicata', 
      label: 'Demande de duplicata', 
      description: 'Votre carte grise a été perdue, volée ou abîmée.',
      price: '29,90€',
      icon: Copy,
      iconImage: '/g2.png'
    },
    {
      value: 'immatriculation-provisoire-ww', 
      label: 'Demande d\'immatriculation provisoire WW', 
      description: 'Vous avez acheté un véhicule à l\'étranger et souhaitez obtenir une immatriculation provisoire WW valable 4 mois.',
      price: '39,90€',
      icon: Car,
      iconImage: '/g3.png'
    },
    {
      value: 'enregistrement-cession', 
      label: 'Enregistrement de cession', 
      description: 'Vous avez vendu un véhicule et souhaitez ne plus être responsable en cas d\'amende ou d\'accident.',
      price: '29,90€',
      icon: FileCheck,
      iconImage: '/g4.png'
    },
    { 
      value: 'changement-adresse', 
      label: 'Changement d\'adresse', 
      description: 'Vous avez changé d\'adresse ou de nom de rue.',
      price: '29,90€',
      icon: Home,
      iconImage: '/g5.png'
    },
    {
      value: 'fiche-identification', 
      label: 'Fiche d\'identification d\'un véhicule', 
      description: 'Vous avez perdu la carte grise et souhaitez un document pour passer un contrôle technique.',
      price: '19,90€',
      icon: Search,
      iconImage: '/g6.png'
    },
    {
      value: 'declaration-achat', 
      label: 'Déclaration d\'achat', 
      description: 'Vous êtes un professionnel de l\'automobile et souhaitez déclarer l\'achat d\'un véhicule.',
      price: 'Sur devis',
      icon: Building2,
      iconImage: '/g7.png'
    },
    {
      value: 'w-garage', 
      label: 'W garage', 
      description: 'Vous êtes un professionnel de l\'automobile et souhaitez obtenir ou renouveler un W garage.',
      price: 'Sur devis',
      icon: Building2,
      iconImage: '/g8.png'
    },
  ]

  const selectedDocument = documentTypes.find(doc => doc.value === documentType)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Carte Grise en ligne
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Faites votre carte grise en 2 minutes. Service d'immatriculation simplifié en ligne avec habilitation du Ministère de l'Intérieur.
            </p>
            
            {/* Features */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 px-4">
              <div className="flex items-center space-x-2 text-gray-600 text-sm sm:text-base">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
                <span className="font-medium">Habilitation Ministère de l'Intérieur</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 text-sm sm:text-base">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
                <span className="font-medium">Traitement express en 24h</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 text-sm sm:text-base">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
                <span className="font-medium">Livraison par l'Imprimerie Nationale</span>
              </div>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12">
            {/* Left Column: Document Preview / Information */}
            <div>
              {/* Document Type Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Type de démarche
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  {documentTypes.map((doc) => {
                    const IconComponent = doc.icon
                    const hasIconImage = 'iconImage' in doc && doc.iconImage
                    return (
                      <button
                        key={doc.value}
                        type="button"
                        onClick={() => {
                        startTransition(() => {
                          setDocumentType(doc.value)
                          setUserChangedType(true) // Mark that user manually changed the type
                          
                          // Update URL to reflect the selected type
                          const params = new URLSearchParams(searchParams.toString())
                          params.set('type', doc.value)
                          router.push(`${pathname}?${params.toString()}`, { scroll: false })
                          
                          if (doc.value !== 'changement-titulaire') {
                            setClientType('normal')
                          }
                          if (doc.value !== 'duplicata') {
                            setDuplicataReason(null)
                          }
                          if (doc.value !== 'declaration-achat') {
                            setAchatGarage(false)
                          }
                          if (doc.value !== 'immatriculation-provisoire-ww') {
                            setWwSeule(false)
                          }
                        })
                      }}
                        className={`w-full p-3 sm:p-4 rounded-lg border transition-all text-left flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-md relative ${
                          documentType === doc.value
                            ? 'border-primary-600 bg-white shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {/* Icon - Isolated container with fixed size */}
                        <div 
                          className="flex-shrink-0 flex items-center justify-center w-full sm:w-auto" 
                          style={{ 
                            width: '100%',
                            maxWidth: '120px',
                            minWidth: '80px',
                            height: '60px',
                            minHeight: '60px',
                            overflow: 'visible',
                            isolation: 'isolate'
                          }}
                        >
                          {hasIconImage ? (
                            <Image
                              src={doc.iconImage as string}
                              alt={doc.label}
                              width={
                                doc.value === 'declaration-achat' || doc.value === 'w-garage' ? 171 :
                                doc.value === 'changement-adresse' ? 640 : 240
                              }
                              height={
                                doc.value === 'declaration-achat' || doc.value === 'w-garage' ? 171 :
                                doc.value === 'changement-adresse' ? 640 : 240
                              }
                              className="w-auto h-auto"
                              loading="lazy"
                              style={{
                                maxWidth: 
                                  (doc.value === 'declaration-achat' || doc.value === 'w-garage') ? '171px' :
                                  doc.value === 'changement-adresse' ? '640px' : '240px',
                                maxHeight: 
                                  (doc.value === 'declaration-achat' || doc.value === 'w-garage') ? '171px' :
                                  doc.value === 'changement-adresse' ? '640px' : '240px',
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain',
                                objectPosition: 'center',
                                display: 'block',
                                marginTop: (doc.value === 'changement-titulaire' || doc.value === 'duplicata' || doc.value === 'declaration-achat') ? '32px' : '0px'
                              }}
                            />
                          ) : (
                            <IconComponent className={`w-6 h-6 ${
                              documentType === doc.value
                                ? 'text-primary-600'
                                : 'text-gray-600'
                            }`} />
                          )}
                        </div>

                        {/* Vertical Divider Line - Hidden on mobile */}
                        <div className="hidden sm:block h-12 w-px bg-gray-300 mx-2"></div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                          <h3 className={`font-bold text-sm sm:text-base mb-1 ${
                            documentType === doc.value ? 'text-gray-900' : 'text-gray-900'
                          }`}>
                            {doc.label}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {doc.description}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0 absolute top-4 right-4 sm:relative sm:top-0 sm:right-0">
                          <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            documentType === doc.value
                              ? 'text-primary-600'
                              : 'text-gray-400'
                          }`} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Document Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aperçu du Mandat
                </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Le mandat sera prérempli avec vos informations. Prière de le télécharger, le signer, et l'insérer avec les documents nécessaires.
                  </p>
                  
                  {/* Button to generate mandat */}
                  <button
                    type="button"
                    onClick={handleGenerateMandat}
                    disabled={isGeneratingMandat || !firstName || !lastName || !email || !streetNumber || !streetType || !streetName || !postalCode || !city || !vin || vin.length !== 17 || !registrationNumber || !validateRegistrationNumber(registrationNumber) || !marque || (clientType === 'company' && !siret)}
                    className={`w-full mb-4 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                      !isGeneratingMandat && firstName && lastName && email && streetNumber && streetType && streetName && postalCode && city && vin && vin.length === 17 && registrationNumber && validateRegistrationNumber(registrationNumber) && marque && (clientType !== 'company' || siret)
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isGeneratingMandat ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Génération en cours...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        <span>Générer le mandat</span>
                      </>
                    )}
                  </button>

                  {/* Download button (shown only when PDF is generated) */}
                  {mandatPreviewUrl && (
                    <button
                      type="button"
                      onClick={handleDownloadMandat}
                      className="w-full mb-4 py-3 px-4 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Télécharger le mandat</span>
                    </button>
                  )}
                </div>
                
                {/* PDF Preview - Full space without controls - Responsive height */}
                <div className="relative w-full bg-white border border-gray-300 rounded overflow-hidden h-[400px] sm:h-[500px] md:h-[calc(100vh-350px)] lg:h-[calc(100vh-300px)] min-h-[350px] sm:min-h-[450px] md:min-h-[500px] max-h-[600px] md:max-h-[800px]">
                  {mandatPreviewUrl ? (
                    <PDFViewer url={mandatPreviewUrlWithSignature || mandatPreviewUrl} useCanvas={false} />
                  ) : (
                    <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">Aperçu du Mandat</p>
                          <p className="text-xs mt-2">Le mandat sera généré avec vos informations</p>
              </div>
              </div>
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-gray-200 text-xs opacity-20 transform -rotate-45">
                      EMATRICULE.FR
              </div>
            </div>
                    </>
                  )}
          </div>

                {/* Signature électronique */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Pen className="w-4 h-4 text-primary-600" />
                    <h4 className="text-base font-semibold text-gray-900">
                      Signature électronique
                    </h4>
        </div>
                  <p className="text-xs text-gray-600 mb-4">
                    {isSignatureValidated 
                      ? 'Signature validée et intégrée dans le mandat.' 
                      : 'Signez ci-dessous avec votre souris ou votre doigt. La signature sera placée dans le champ prévu du mandat.'}
                  </p>
                  
                  {!isSignatureValidated ? (
                    <>
                      <div className="flex justify-center mb-4">
                        <SignaturePad
                          onSignatureChange={(dataUrl) => {
                            setSignatureDataUrl(dataUrl)
                            console.log('Signature mise à jour:', dataUrl ? 'Signature présente' : 'Signature effacée')
                          }}
                          width={500}
                          height={150}
                        />
              </div>
                      
                      {signatureDataUrl && mandatPreviewUrl && (
                        <div className="flex justify-center space-x-3 mb-3">
                          <button
                            type="button"
                            onClick={handleValidateSignature}
                            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2 shadow-md"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Valider la signature</span>
                          </button>
                        </div>
                      )}
                      
                      {signatureDataUrl && !mandatPreviewUrl && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800 flex items-center space-x-2">
                            <Info className="w-3 h-3" />
                            <span>Générez d'abord le mandat pour valider la signature.</span>
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <div className="relative border-2 border-green-500 rounded-lg bg-white p-4" style={{ maxWidth: '500px' }}>
                          <img 
                            src={signatureDataUrl || ''} 
                            alt="Signature validée" 
                            className="w-full h-auto"
                            style={{ maxHeight: '150px', objectFit: 'contain' }}
                          />
                          <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={handleResign}
                          className="px-6 py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center space-x-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Resigner</span>
                        </button>
                      </div>
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-800 flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3" />
                          <span>Signature validée et visible dans l'aperçu. Vous pouvez maintenant télécharger le mandat.</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
          </div>

            {/* Right Column: Order Form */}
            <div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations de commande
              </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Document Type Display */}
                  {selectedDocument && (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-primary-700 font-medium">Démarche sélectionnée</p>
                          <p className="text-lg font-bold text-primary-900">{selectedDocument.label}</p>
                          {calculatedPrice && (
                            <p className="text-xs text-primary-600 mt-1">
                              Département {calculatedPrice.department} {calculatedPrice.departmentName && `(${calculatedPrice.departmentName})`}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {isCalculatingPrice ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                              <span className="text-sm text-primary-600">Calcul...</span>
                            </div>
                          ) : calculatedPrice ? (
                            <div>
                              <div className="text-2xl font-bold text-primary-600">
                                {calculatedPrice.totalPrice.toFixed(2)} €
                              </div>
                              <div className="text-xs text-primary-500 mt-1">
                                Taxes: {calculatedPrice.taxes.total.toFixed(2)} € + Service: {calculatedPrice.serviceFee.toFixed(2)} €
                              </div>
                            </div>
                          ) : (
                        <div className="text-2xl font-bold text-primary-600">
                          {selectedDocument.price}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vehicle Information - Two Rows */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du véhicule</h3>
                    
                    {/* Row 1: VIN and Registration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                          Numéro VIN (17 caractères) *
                          <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help" title="Le numéro VIN doit contenir exactement 17 caractères alphanumériques">
                            <Info className="w-3 h-3 text-gray-600" />
                          </div>
                        </label>
                        <input
                          type="text"
                          value={vin}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                            if (value.length <= 17) {
                              setVin(value)
                            }
                          }}
                          maxLength={17}
                          minLength={17}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
                          placeholder="Ex: 1HGBH41JXMN109186"
                          pattern="[A-Z0-9]{17}"
                          title="Le VIN doit contenir exactement 17 caractères alphanumériques"
                        />
                        {vin && vin.length !== 17 && (
                          <p className="text-sm text-red-600 mt-1">
                            Le VIN doit contenir exactement 17 caractères ({vin.length}/17)
                          </p>
                        )}
                      </div>
              <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Numéro d'immatriculation *
                        </label>
                        <input
                          type="text"
                          value={registrationNumber}
                          onChange={handleRegistrationNumberChange}
                          required
                          maxLength={9} // AA-123-CD = 9 characters with dashes
                          className={`w-full px-4 py-2.5 border rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none ${
                            registrationNumberError 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                          placeholder="Ex: AB-123-CD"
                        />
                        {registrationNumberError && (
                          <p className="text-xs text-red-600 mt-1">
                            {registrationNumberError}
                          </p>
                        )}
                        {registrationNumber && !registrationNumberError && validateRegistrationNumber(registrationNumber) && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Format valide
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Row 2: Marque */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Marque *
                      </label>
                      <select
                        value={marque}
                        onChange={(e) => setMarque(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
                        required
                      >
                        <option value="">Sélectionner une marque...</option>
                        {CAR_BRANDS.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>
                    </div>

                  {/* Personal Information - Two Rows */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                    
                    {/* Row 1: First Name and Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Nom *
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
                          required
                        />
                    </div>
              </div>

                    {/* Row 2: Email and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information - Domicilié(e) à */}
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Domicilié(e) à</h3>
                    
                    {/* Row 1: Street Number, Street Type, Street Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                          Numéro de rue *
                      </label>
                      <input
                        type="text"
                          value={streetNumber}
                          onChange={(e) => setStreetNumber(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
                        required
                          placeholder="Ex: 123"
                      />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Type de rue *
                        </label>
                        <select
                          value={streetType}
                          onChange={(e) => setStreetType(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
                          required
                        >
                          <option value="">Sélectionner...</option>
                          {STREET_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Nom de la rue *
                        </label>
                        <input
                          type="text"
                          value={streetName}
                          onChange={(e) => setStreetName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
                          required
                          placeholder="Ex: de la République"
                        />
                      </div>
                      </div>

                    {/* Row 2: Postal Code and City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Code postal *
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Ville *
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
                          required
                        />
                </div>
              </div>
            </div>

                  {/* SIRET (uniquement pour les sociétés) */}
                  {clientType === 'company' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Numéro SIRET *
                      </label>
                      <input
                        type="text"
                        value={siret}
                        onChange={(e) => setSiret(e.target.value.replace(/\D/g, ''))}
                        maxLength={14}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
                        required={clientType === 'company'}
                        placeholder="Ex: 12345678901234"
                      />
                      <p className="text-xs text-gray-500 mt-1">14 chiffres</p>
                    </div>
                  )}

                  {/* Documents Upload */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Documents à joindre</h3>
                    
                    {/* Client Type Selection for Changement de Titulaire */}
                    {documentType === 'changement-titulaire' && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                          Type de client
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setClientType('normal')}
                            className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                              clientType === 'normal'
                                ? 'border-primary-600 bg-primary-50 text-primary-900'
                                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="font-semibold">Personne normale</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setClientType('hosted')}
                            className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                              clientType === 'hosted'
                                ? 'border-primary-600 bg-primary-50 text-primary-900'
                                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="font-semibold">Personnes hébergées</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setClientType('company')}
                            className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                              clientType === 'company'
                                ? 'border-primary-600 bg-primary-50 text-primary-900'
                                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="font-semibold">Sociétés</div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Documents for Normal Client or Hosted/Company */}
                    {documentType === 'changement-titulaire' && (clientType === 'normal' || clientType === 'hosted' || clientType === 'company') && (
                      <>
                        {/* Carte Grise */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Carte Grise *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setCurrentCardFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {currentCardFile ? currentCardFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Certificat de cession */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Certificat de cession *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setCertificatCessionFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {certificatCessionFile ? certificatCessionFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Pièce d'identité */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Pièce d'identité *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setIdFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {idFile ? idFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Justificatif de domicile - only for normal and hosted */}
                        {(clientType === 'normal' || clientType === 'hosted') && (
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Justificatif de domicile (moins de 3 mois) *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setProofAddressFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {proofAddressFile ? proofAddressFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Permis de conduire */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Permis de conduire *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setPermisConduireFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {permisConduireFile ? permisConduireFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Contrôle technique */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Contrôle technique (moins de 6 mois) *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setControleTechniqueFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {controleTechniqueFile ? controleTechniqueFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Assurance - Normal and Company */}
                        {(clientType === 'normal' || clientType === 'company') && (
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Assurance *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(clientType === 'normal' ? setAssuranceFile : setCompanyAssuranceFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {(clientType === 'normal' ? assuranceFile : companyAssuranceFile) ? (clientType === 'normal' ? assuranceFile!.name : companyAssuranceFile!.name) : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Documents for Hosted Persons */}
                    {documentType === 'changement-titulaire' && clientType === 'hosted' && (
                      <>
                        <div className="border-t border-gray-200 pt-6 mt-6">
                          <h4 className="text-base font-semibold text-gray-900 mb-4">POUR LES PERSONNES HEBERGEES</h4>
                          
                          {/* Pièce d'identité de l'hébergeant */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Pièce d'identité de l'hébergeant *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setHostIdFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {hostIdFile ? hostIdFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>

                          {/* Justificatif de domicile de l'hébergeant */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Justificatif de domicile de l'hébergeant à son nom *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setHostProofAddressFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {hostProofAddressFile ? hostProofAddressFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>

                          {/* Attestation d'hébergement */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Attestation d'hébergement *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setAttestationHebergementFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {attestationHebergementFile ? attestationHebergementFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>

                          {/* Assurance for hosted */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Assurance *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setAssuranceFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {assuranceFile ? assuranceFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Documents for Companies */}
                    {documentType === 'changement-titulaire' && clientType === 'company' && (
                      <>
                        <div className="border-t border-gray-200 pt-6 mt-6">
                          <h4 className="text-base font-semibold text-gray-900 mb-4">POUR LES SOCIETES</h4>
                          
                          {/* KBIS */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              KBIS (moins de 3 mois) *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setKbisFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {kbisFile ? kbisFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>

                          {/* Pièce d'identité du gérant */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Pièce d'identité du gérant *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setGerantIdFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {gerantIdFile ? gerantIdFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>

                          {/* Cachet de la société */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Cachet de la société *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setCachetSocieteFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {cachetSocieteFile ? cachetSocieteFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Documents for Changement d'Adresse */}
                    {documentType === 'changement-adresse' && (
                      <>
                        {/* Photocopie carte grise */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Photocopie carte grise *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setCurrentCardFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {currentCardFile ? currentCardFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Photocopie Pièce d'identité */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Photocopie Pièce d'identité *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setIdFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {idFile ? idFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Photocopie justificatif de domicile (nouvelle adresse) */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Photocopie justificatif de domicile (nouvelle adresse) *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setProofAddressFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {proofAddressFile ? proofAddressFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Documents for Demande de DUPLICATA */}
                    {documentType === 'duplicata' && (
                      <>
                        {/* Justificatif d'identité */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Justificatif d'identité *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setIdFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {idFile ? idFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Justificatif de domicile */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Justificatif de domicile *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setProofAddressFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {proofAddressFile ? proofAddressFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* MANDAT */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            † MANDAT *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setMandatFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {mandatFile ? mandatFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* CERFA N°13750*05 */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            ‡ CERFA N°13750*05 (case duplicata cochée) *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setCerfa13750File)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {cerfa13750File ? cerfa13750File.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Reason for duplicata */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-900 mb-3">
                            Raison de la demande de duplicata *
                          </label>
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setDuplicataReason('perte-vol')}
                              className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                                duplicataReason === 'perte-vol'
                                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              <div className="font-semibold">Perte ou vol</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDuplicataReason('autre')}
                              className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                                duplicataReason === 'autre'
                                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              <div className="font-semibold">Autre (usure, détérioration, etc.)</div>
                            </button>
                          </div>
                        </div>

                        {/* CERFA N° 13753*02 - Only for loss or theft */}
                        {duplicataReason === 'perte-vol' && (
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              CERFA N° 13753*02 (uniquement pour perte ou vol) *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setCerfa13753File)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {cerfa13753File ? cerfa13753File.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Contrôle technique si applicable */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Contrôle technique si applicable
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <p className="text-xs text-gray-600 mb-2">
                            S'il a expiré, vous devrez demander la fiche d'identification de votre voiture pour pouvoir la passer en carte grise.
                          </p>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setControleTechniqueFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {controleTechniqueFile ? controleTechniqueFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Documents for Déclaration d'achat */}
                    {documentType === 'declaration-achat' && (
                      <>
                        {/* Copie de la carte grise datée, barrée et signée par le vendeur */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            1. Copie de la carte grise datée, barrée et signée par le vendeur *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setCarteGriseVendeurFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {carteGriseVendeurFile ? carteGriseVendeurFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Demande de certificat d'immatriculation et mandat d'immatriculation */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            2. Demande de certificat d'immatriculation et mandat d'immatriculation (préremplis et signés automatiquement sur Eplaque) *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setDemandeCertificatMandatFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {demandeCertificatMandatFile ? demandeCertificatMandatFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Achat depuis un garage */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-900 mb-3">
                            Le véhicule a-t-il été acheté à un garage ?
                          </label>
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setAchatGarage(true)}
                              className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                                achatGarage === true
                                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              <div className="font-semibold">Oui</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAchatGarage(false)}
                              className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                                achatGarage === false
                                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              <div className="font-semibold">Non</div>
                            </button>
                          </div>
                        </div>

                        {/* Certificat de cession (Cerfa 15776) */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            3. Certificat de cession (Cerfa 15776) *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          {achatGarage && (
                            <p className="text-xs text-gray-600 mb-2">
                              Si le véhicule a été acheté à un garage, fournir le récépissé de déclaration d'achat également
                            </p>
                          )}
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setCertificatCessionCerfa15776File)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {certificatCessionCerfa15776File ? certificatCessionCerfa15776File.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Récépissé de déclaration d'achat (si achat garage) */}
                        {achatGarage && (
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Récépissé de déclaration d'achat *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setRecepisseDeclarationAchatFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {recepisseDeclarationAchatFile ? recepisseDeclarationAchatFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Certificat de déclaration d'achat (Cerfa 13751) */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            4. Certificat de déclaration d'achat (Cerfa 13751) *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setCertificatDeclarationAchatCerfa13751File)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {certificatDeclarationAchatCerfa13751File ? certificatDeclarationAchatCerfa13751File.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Justificatif d'identité en cours de validité */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            5. Justificatif d'identité en cours de validité *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setJustificatifIdentiteFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {justificatifIdentiteFile ? justificatifIdentiteFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Extrait Kbis du professionnel acquéreur */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            6. Extrait Kbis du professionnel acquéreur *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setExtraitKbisFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {extraitKbisFile ? extraitKbisFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Documents for Fiche d'identification d'un véhicule */}
                    {documentType === 'fiche-identification' && (
                      <>
                        {/* Justificatif d'identité en cours de validité */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Justificatif d'identité en cours de validité *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setFicheJustificatifIdentiteFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {ficheJustificatifIdentiteFile ? ficheJustificatifIdentiteFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Permis de conduire */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Permis de conduire *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setFichePermisConduireFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {fichePermisConduireFile ? fichePermisConduireFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Copie de la carte grise perdue (facultative) */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Copie de la carte grise perdue (facultative)
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setFicheCopieCarteGriseFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {ficheCopieCarteGriseFile ? ficheCopieCarteGriseFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Mandat d'immatriculation Cerfa 13757 */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Mandat d'immatriculation Cerfa 13757 (prérempli et signé automatiquement sur Ematricule.fr) *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setFicheMandatCerfa13757File)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {ficheMandatCerfa13757File ? ficheMandatCerfa13757File.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Documents for Demande d'immatriculation provisoire WW */}
                    {documentType === 'immatriculation-provisoire-ww' && (
                      <>
                        {/* Copie de la carte grise étrangère */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Copie de la carte grise étrangère *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setWwCarteGriseEtrangereFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {wwCarteGriseEtrangereFile ? wwCarteGriseEtrangereFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Certificat de conformité ou document de la DRIRE ou de non-conformité */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Certificat de conformité ou document de la DRIRE ou de non-conformité *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setWwCertificatConformiteFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {wwCertificatConformiteFile ? wwCertificatConformiteFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Demande de certificat d'immatriculation et mandat d'immatriculation */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Demande de certificat d'immatriculation et mandat d'immatriculation (les cerfas sont préremplis et signés automatiquement dès validation de votre commande sur notre site) *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setWwDemandeCertificatMandatFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {wwDemandeCertificatMandatFile ? wwDemandeCertificatMandatFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Justificatif de propriété du véhicule */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Justificatif de propriété du véhicule (facture d'achat ou certificat de cession) *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setWwJustificatifProprieteFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {wwJustificatifProprieteFile ? wwJustificatifProprieteFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Quitus fiscal des impôts */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Quitus fiscal des impôts (UE, ou preuve ANTS de demande de quitus) ou certificat 846A des douanes (hors UE) pour les véhicules importés *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setWwQuitusFiscalFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {wwQuitusFiscalFile ? wwQuitusFiscalFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Permis de conduire */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Permis de conduire
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setWwPermisConduireFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {wwPermisConduireFile ? wwPermisConduireFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Justificatif de domicile de moins de 6 mois */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Justificatif de domicile de moins de 6 mois *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setWwJustificatifDomicileFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {wwJustificatifDomicileFile ? wwJustificatifDomicileFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Justificatif d'identité en cours de validité */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Justificatif d'identité en cours de validité *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setWwJustificatifIdentiteFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {wwJustificatifIdentiteFile ? wwJustificatifIdentiteFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Contrôle technique de moins de 6 mois */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Contrôle technique de moins de 6 mois (français ou d'un pays membre de l'UE) *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setWwControleTechniqueFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {wwControleTechniqueFile ? wwControleTechniqueFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Type de demande WW */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-900 mb-3">
                            Type de demande
                          </label>
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setWwSeule(true)}
                              className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                                wwSeule === true
                                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              <div className="font-semibold">Demande de WW seule</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setWwSeule(false)}
                              className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                                wwSeule === false
                                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              <div className="font-semibold">Autre</div>
                            </button>
                          </div>
                        </div>

                        {/* Accusé de réception (si demande de WW seule) */}
                        {wwSeule && (
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Si demande de WW seule : accusé de réception d'une demande d'immatriculation définitive de l'ANTS *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setWwAccuseReceptionFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {wwAccuseReceptionFile ? wwAccuseReceptionFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Documents for W GARAGE */}
                    {documentType === 'w-garage' && (
                      <>
                        {/* Obligatoires Section */}
                        <div className="mb-6">
                          <h4 className="text-base font-semibold text-gray-900 mb-4">Obligatoires</h4>
                          
                          {/* Kbis */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Kbis *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setWGarageKbisFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {wGarageKbisFile ? wGarageKbisFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>

                          {/* SIREN */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              SIREN *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setWGarageSirenFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {wGarageSirenFile ? wGarageSirenFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>

                          {/* Justificatif domiciliation entreprise */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Justificatif domiciliation entreprise *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setWGarageJustificatifDomiciliationFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {wGarageJustificatifDomiciliationFile ? wGarageJustificatifDomiciliationFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>

                          {/* CNI du gérant */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              CNI du gérant *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setWGarageCniGerantFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {wGarageCniGerantFile ? wGarageCniGerantFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>

                          {/* Assurance W garage */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Assurance W garage *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setWGarageAssuranceFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {wGarageAssuranceFile ? wGarageAssuranceFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>

                          {/* Preuve activité automobile */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Preuve activité automobile *
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setWGaragePreuveActiviteFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  required
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {wGaragePreuveActiviteFile ? wGaragePreuveActiviteFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Parfois demandés Section */}
                        <div className="border-t border-gray-200 pt-6 mt-6">
                          <h4 className="text-base font-semibold text-gray-900 mb-4">Parfois demandés</h4>
                          
                          {/* Attestation de régularité fiscale */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Attestation de régularité fiscale
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setWGarageAttestationFiscaleFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {wGarageAttestationFiscaleFile ? wGarageAttestationFiscaleFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>

                          {/* Attestation URSSAF */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Attestation URSSAF
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setWGarageAttestationUrssafFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {wGarageAttestationUrssafFile ? wGarageAttestationUrssafFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>

                          {/* Mandat */}
                          <div className="mb-4">
                            <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                              Mandat
                              <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                                <Info className="w-3 h-3 text-gray-600" />
                              </div>
                            </label>
                            <div className="flex items-center space-x-3">
                              <label className="cursor-pointer">
                                <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Choisir un fichier</span>
                                </span>
                                <input
                                  type="file"
                                  onChange={handleFileChange(setWGarageMandatFile)}
                                  className="hidden"
                                  accept="image/*,.pdf"
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {wGarageMandatFile ? wGarageMandatFile.name : 'Aucun fichier choisi'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Documents for Enregistrement de cession */}
                    {documentType === 'enregistrement-cession' && (
                      <>
                        {/* Carte grise barrée */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Carte grise barrée *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setCessionCarteGriseBarreeFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {cessionCarteGriseBarreeFile ? cessionCarteGriseBarreeFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Carte d'identité */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Carte d'identité *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setCessionCarteIdentiteFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {cessionCarteIdentiteFile ? cessionCarteIdentiteFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Certificat de vente */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Certificat de vente *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setCessionCertificatVenteFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {cessionCertificatVenteFile ? cessionCertificatVenteFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>

                        {/* Mandat */}
                        <div className="mb-4">
                          <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                            Mandat *
                            <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                              <Info className="w-3 h-3 text-gray-600" />
                            </div>
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="cursor-pointer">
                              <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Choisir un fichier</span>
                              </span>
                              <input
                                type="file"
                                onChange={handleFileChange(setCessionMandatFile)}
                                className="hidden"
                                accept="image/*,.pdf"
                                required
                              />
                            </label>
                            <span className="text-sm text-gray-500">
                              {cessionMandatFile ? cessionMandatFile.name : 'Aucun fichier choisi'}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Documents for other document types */}
                    {documentType !== 'changement-titulaire' && documentType !== 'changement-adresse' && documentType !== 'duplicata' && documentType !== 'declaration-achat' && documentType !== 'fiche-identification' && documentType !== 'immatriculation-provisoire-ww' && documentType !== 'w-garage' && documentType !== 'enregistrement-cession' && (
                      <>
                    {/* ID Document */}
                    <div className="mb-4">
                      <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                        Pièce d'identité *
                        <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                          <Info className="w-3 h-3 text-gray-600" />
                        </div>
                      </label>
                      <div className="flex items-center space-x-3">
                        <label className="cursor-pointer">
                          <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                            <Upload className="w-4 h-4" />
                            <span>Choisir un fichier</span>
                          </span>
                          <input
                            type="file"
                            onChange={handleFileChange(setIdFile)}
                            className="hidden"
                            accept="image/*,.pdf"
                            required
                          />
                        </label>
                        <span className="text-sm text-gray-500">
                          {idFile ? idFile.name : 'Aucun fichier choisi'}
                        </span>
                      </div>
                    </div>

                    {/* Proof of Address */}
                    <div className="mb-4">
                      <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                        Justificatif de domicile *
                        <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                          <Info className="w-3 h-3 text-gray-600" />
                        </div>
                      </label>
                      <div className="flex items-center space-x-3">
                        <label className="cursor-pointer">
                          <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                            <Upload className="w-4 h-4" />
                            <span>Choisir un fichier</span>
                          </span>
                          <input
                            type="file"
                            onChange={handleFileChange(setProofAddressFile)}
                            className="hidden"
                            accept="image/*,.pdf"
                            required
                          />
                        </label>
                        <span className="text-sm text-gray-500">
                          {proofAddressFile ? proofAddressFile.name : 'Aucun fichier choisi'}
                        </span>
                      </div>
                    </div>

                    {/* Current Registration Card */}
              <div>
                      <label className="flex items-center text-sm font-medium text-gray-900 mb-2">
                        Carte grise actuelle (si applicable)
                        <div className="w-4 h-4 ml-2 rounded-full bg-gray-300 flex items-center justify-center cursor-help">
                          <Info className="w-3 h-3 text-gray-600" />
                        </div>
                      </label>
                      <div className="flex items-center space-x-3">
                        <label className="cursor-pointer">
                          <span className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center space-x-2">
                            <Upload className="w-4 h-4" />
                            <span>Choisir un fichier</span>
                          </span>
                          <input
                            type="file"
                            onChange={handleFileChange(setCurrentCardFile)}
                            className="hidden"
                            accept="image/*,.pdf"
                          />
                        </label>
                        <span className="text-sm text-gray-500">
                          {currentCardFile ? currentCardFile.name : 'Aucun fichier choisi'}
                        </span>
                      </div>
                    </div>
                      </>
                    )}
                  </div>

                  {/* Acceptance Checkbox */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-600 focus:ring-2"
                        required
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        J'atteste que toutes les informations fournies sont exactes et complètes. Je comprends que les frais de traitement couvrent la vérification, la constitution et la transmission de mon dossier, et qu'ils restent engagés dès la validation de ma demande. J'accepte que le site agisse comme intermédiaire administratif. *
                      </span>
                    </label>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-gray-700 mb-2">
                      <CreditCard className="w-5 h-5 text-primary-600" />
                      <span className="font-semibold">Paiement sécurisé</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Paiement sécuriser avec PayPal, Carte Bancaire, Apple Pay, Google Pay
                      </p>
                    </div>

                  {/* Error Message */}
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                      <p className="text-sm">{submitError}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!acceptTerms || isSubmitting}
                    className={`w-full py-3.5 px-6 rounded font-semibold text-base transition-colors flex items-center justify-center space-x-2 ${
                      acceptTerms && !isSubmitting
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Traitement en cours...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>
                          Procéder au paiement - {
                            isCalculatingPrice 
                              ? 'Calcul...' 
                              : calculatedPrice 
                                ? `${calculatedPrice.totalPrice.toFixed(2)} €`
                                : selectedDocument?.price
                          }
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Pourquoi choisir EMatricule ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="text-center flex flex-col items-center">
                <div className="flex items-center justify-center mx-auto mb-4 h-40">
                  <Image
                    src="/rapid.png"
                    alt="Rapide"
                    width={160}
                    height={160}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rapide</h3>
                <p className="text-gray-600 text-sm">
                  Traitement de votre dossier en 24 heures maximum
                </p>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="flex items-center justify-center mx-auto mb-4 h-40">
                  <Image
                    src="/securise.png"
                    alt="Sécurisé"
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sécurisé</h3>
                <p className="text-gray-600 text-sm">
                  Service habilité par le Ministère de l'Intérieur
                </p>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="flex items-center justify-center mx-auto mb-4 h-40">
                  <Image
                    src="/ministre.png"
                    alt="Fiable"
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fiable</h3>
                <p className="text-gray-600 text-sm">
                  Plus de 10 000 cartes grises délivrées chaque mois
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

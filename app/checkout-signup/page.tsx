'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createOrder, uploadDocuments, createCheckoutAndRedirect } from '@/lib/services/orderService'
import { getFilesFromIndexedDB, clearIndexedDB } from '@/lib/utils/storage'
import { CheckCircle, Lock, User, Mail, Phone, MapPin, CreditCard, AlertTriangle, Loader2 } from 'lucide-react'

// Helper: wraps a promise with a timeout
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Délai dépassé (${label}). Veuillez réessayer.`)), ms)
    ),
  ])
}

const STEPS = [
  { id: 'account', label: 'Création du compte...' },
  { id: 'signin', label: 'Connexion en cours...' },
  { id: 'order', label: 'Enregistrement de la commande...' },
  { id: 'documents', label: 'Envoi des documents...' },
  { id: 'payment', label: 'Ouverture du paiement...' },
]

export default function CheckoutSignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [redirectingToPayment, setRedirectingToPayment] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState<string>('')
  const [userData, setUserData] = useState<any>(null)
  const [orderData, setOrderData] = useState<any>(null)
  const [files, setFiles] = useState<{ [key: string]: File }>({})
  const abortRef = useRef(false)

  useEffect(() => {
    const storedData = localStorage.getItem('pendingOrderData')
    if (!storedData) {
      router.push('/')
      return
    }

    const data = JSON.parse(storedData)
    setUserData({
      firstName: data.orderData.metadata.firstName,
      lastName: data.orderData.metadata.lastName,
      email: data.orderData.metadata.email,
      phone: data.orderData.metadata.phone,
      address: data.orderData.metadata.address,
      postalCode: data.orderData.metadata.postalCode,
      city: data.orderData.metadata.city,
    })
    setOrderData(data.orderData)

    const loadFiles = async () => {
      try {
        const idbFiles = await getFilesFromIndexedDB()
        if (Object.keys(idbFiles).length > 0) {
          console.log('Fichiers récupérés depuis IndexedDB:', Object.keys(idbFiles))
          setFiles(idbFiles)
          return
        }
      } catch (err) {
        console.error('Erreur lecture IndexedDB:', err)
      }

      const storedFiles = sessionStorage.getItem('pendingOrderFiles')
      if (storedFiles) {
        try {
          const filesData = JSON.parse(storedFiles)
          const fileObjects: { [key: string]: File } = {}
          for (const [key, fileData] of Object.entries(filesData)) {
            if (fileData && typeof fileData === 'object' && 'base64' in fileData) {
              try {
                const fileInfo = fileData as any
                const byteCharacters = atob(fileInfo.base64)
                const byteNumbers = new Array(byteCharacters.length)
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i)
                }
                const byteArray = new Uint8Array(byteNumbers)
                const blob = new Blob([byteArray], { type: fileInfo.type || 'application/octet-stream' })
                fileObjects[key] = new File([blob], fileInfo.name || key, { type: fileInfo.type || 'application/octet-stream' })
              } catch (convertError) {
                console.error(`Erreur conversion fichier ${key}:`, convertError)
              }
            }
          }
          setFiles(fileObjects)
        } catch (error) {
          console.error('Erreur récupération fichiers sessionStorage:', error)
        }
      }
    }

    loadFiles()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleCancel = () => {
    abortRef.current = true
    setIsLoading(false)
    setRedirectingToPayment(false)
    setCurrentStep('')
    setError('Opération annulée. Vous pouvez réessayer.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    abortRef.current = false
    setIsLoading(true)
    setError('')
    setCurrentStep('account')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setIsLoading(false)
      return
    }

    if (!userData || !orderData) {
      setError('Données manquantes. Veuillez recommencer.')
      setIsLoading(false)
      return
    }

    try {
      // ─── STEP 1: Create account ───────────────────────────────────────
      setCurrentStep('account')
      const createUserResponse = await withTimeout(
        fetch('/api/auth/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            password: formData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            address: userData.address,
            postalCode: userData.postalCode,
            city: userData.city,
          }),
        }),
        20000,
        'création du compte'
      )

      if (abortRef.current) return

      const createUserResult = await createUserResponse.json()
      if (!createUserResponse.ok) {
        throw new Error(createUserResult.error || 'Erreur lors de la création du compte')
      }

      // ─── STEP 2: Sign in ──────────────────────────────────────────────
      setCurrentStep('signin')
      const supabase = createClient()

      const { error: signInError } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: userData.email,
          password: formData.password,
        }),
        15000,
        'connexion'
      )

      if (abortRef.current) return
      if (signInError) {
        throw new Error('Compte créé mais impossible de se connecter. Veuillez réessayer dans quelques instants.')
      }

      // Verify session
      const { data: sessionData, error: sessionError } = await withTimeout(
        supabase.auth.getSession(),
        10000,
        'vérification session'
      )
      if (sessionError || !sessionData.session) {
        throw new Error('Session non établie. Veuillez réessayer.')
      }

      // Wait for profile to be created by DB trigger
      await new Promise(resolve => setTimeout(resolve, 600))

      if (abortRef.current) return

      // ─── STEP 3: Create order ─────────────────────────────────────────
      setCurrentStep('order')
      const result = await withTimeout(
        createOrder(orderData),
        20000,
        'création de la commande'
      )

      if (abortRef.current) return

      if (!result.success || !result.order) {
        let errorMessage = result.error || 'Erreur lors de la création de la commande'
        if (result.error?.includes('foreign key') || result.error?.includes('user_id')) {
          errorMessage = 'Erreur de profil utilisateur. Veuillez rafraîchir la page et réessayer.'
        }
        throw new Error(errorMessage)
      }

      console.log('Commande créée:', result.order.id)

      // ─── STEP 4: Upload documents ─────────────────────────────────────
      setCurrentStep('documents')

      // Always re-read from IndexedDB at submit time to avoid stale state
      let freshFiles: Record<string, File> = {}
      try {
        freshFiles = await getFilesFromIndexedDB()
      } catch (err) {
        console.error('Erreur IndexedDB:', err)
      }
      if (Object.keys(freshFiles).length === 0 && Object.keys(files).length > 0) {
        freshFiles = files
      }

      const docTypeMap: Record<string, string> = {
        idFile: 'carte_identite',
        proofAddressFile: 'justificatif_domicile',
        currentCardFile: 'carte_grise_actuelle',
        certificatCessionFile: 'certificat_cession',
        certificatCessionCerfa15776File: 'certificat_cession_15776',
        permisConduireFile: 'permis_conduire',
        controleTechniqueFile: 'controle_technique',
        assuranceFile: 'assurance',
        carteGriseFile: 'carte_grise',
        rectoFile: 'carte_grise_recto',
        versoFile: 'carte_grise_verso',
        mandatFile: 'mandat',
        hostIdFile: 'host_id',
        hostProofAddressFile: 'host_justificatif_domicile',
        attestationHebergementFile: 'attestation_hebergement',
        kbisFile: 'kbis',
        gerantIdFile: 'gerant_id',
        companyAssuranceFile: 'company_assurance',
        cerfa13750File: 'cerfa_13750',
        cerfa13753File: 'cerfa_13753',
        carteGriseVendeurFile: 'carte_grise_vendeur',
        demandeCertificatMandatFile: 'demande_certificat_mandat',
        recepisseDeclarationAchatFile: 'recepisse_declaration_achat',
        certificatDeclarationAchatCerfa13751File: 'certificat_declaration_achat_13751',
        justificatifIdentiteFile: 'justificatif_identite',
        extraitKbisFile: 'extrait_kbis',
        ficheJustificatifIdentiteFile: 'fiche_justificatif_identite',
        fichePermisConduireFile: 'fiche_permis_conduire',
        ficheCopieCarteGriseFile: 'fiche_copie_carte_grise',
        ficheMandatCerfa13757File: 'fiche_mandat_13757',
        wwCarteGriseEtrangereFile: 'ww_carte_grise_etrangere',
        wwCertificatConformiteFile: 'ww_certificat_conformite',
        wwDemandeCertificatMandatFile: 'ww_demande_certificat_mandat',
        wwJustificatifProprieteFile: 'ww_justificatif_propriete',
        wwQuitusFiscalFile: 'ww_quitus_fiscal',
        wwPermisConduireFile: 'ww_permis_conduire',
        wwJustificatifDomicileFile: 'ww_justificatif_domicile',
        wwJustificatifIdentiteFile: 'ww_justificatif_identite',
        wwControleTechniqueFile: 'ww_controle_technique',
        ueCarteGriseEtrangereFile: 'ue_carte_grise_etrangere',
        ueCertificatConformiteFile: 'ue_certificat_conformite',
        ueDemandeCertificatMandatFile: 'ue_demande_certificat_mandat',
        ueJustificatifProprieteFile: 'ue_justificatif_propriete',
        ueQuitusFiscalFile: 'ue_quitus_fiscal',
        uePermisConduireFile: 'ue_permis_conduire',
        ueJustificatifDomicileFile: 'ue_justificatif_domicile',
        ueJustificatifIdentiteFile: 'ue_justificatif_identite',
        ueControleTechniqueFile: 'ue_controle_technique',
        wGarageKbisFile: 'w_garage_kbis',
        wGarageSirenFile: 'w_garage_siren',
        wGarageJustificatifDomiciliationFile: 'w_garage_justificatif_domiciliation',
        wGarageCniGerantFile: 'w_garage_cni_gerant',
        wGarageAssuranceFile: 'w_garage_assurance',
        wGaragePreuveActiviteFile: 'w_garage_preuve_activite',
        wGarageAttestationFiscaleFile: 'w_garage_attestation_fiscale',
        wGarageAttestationUrssafFile: 'w_garage_attestation_urssaf',
        wGarageMandatFile: 'w_garage_mandat',
        cessionCarteGriseBarreeFile: 'cession_carte_grise_barree',
        cessionCarteIdentiteFile: 'cession_carte_identite',
        cessionCertificatVenteFile: 'cession_certificat_vente',
        cessionMandatFile: 'cession_mandat',
        quitusJustificatifIdentiteFile: 'quitus_justificatif_identite',
        quitusJustificatifDomicileFile: 'quitus_justificatif_domicile',
        quitusCertificatImmatriculationEtrangerFile: 'quitus_certificat_immatriculation_etranger',
        quitusJustificatifVenteFile: 'quitus_justificatif_vente',
        quitusCertificatConformiteFile: 'quitus_certificat_conformite',
        quitusControleTechniqueFile: 'quitus_controle_technique',
        quitusUsageVehiculeFile: 'quitus_usage_vehicule',
        quitusMandatRepresentationFile: 'quitus_mandat_representation',
        quitusCopieIdentiteMandataireFile: 'quitus_copie_identite_mandataire',
        quitusDemandeCertificatCerfa13750File: 'quitus_demande_cerfa_13750',
      }

      // Override mandat type based on signature
      if (freshFiles.mandatFile) {
        docTypeMap.mandatFile = orderData.metadata?.isSignatureValidated ? 'mandat_signe' : 'mandat'
      }

      const documentsToUpload: Array<{ file: File; documentType: string }> = []
      for (const [key, docType] of Object.entries(docTypeMap)) {
        const file = (freshFiles as Record<string, File | undefined>)[key]
        if (file) {
          documentsToUpload.push({ file, documentType: docType })
        }
      }

      console.log(`Upload de ${documentsToUpload.length} documents...`)
      if (documentsToUpload.length > 0) {
        // Don't await document upload with timeout - just run in background if needed
        // but wait for it so admin gets the files
        try {
          const uploadResult = await withTimeout(
            uploadDocuments(documentsToUpload, result.order.id),
            60000,
            'upload documents'
          )
          console.log(`Upload terminé: ${uploadResult.uploaded}/${documentsToUpload.length}`)
        } catch (uploadErr) {
          // Don't block payment on upload failure
          console.error('Erreur upload documents (non bloquant):', uploadErr)
        }
      } else {
        console.warn('Aucun document à uploader.')
      }

      if (abortRef.current) return

      // ─── Cleanup ──────────────────────────────────────────────────────
      localStorage.removeItem('pendingOrderData')
      sessionStorage.removeItem('pendingOrderFiles')
      try { await clearIndexedDB() } catch (_) {}

      localStorage.setItem('currentOrderId', result.order.id)
      localStorage.setItem('currentOrderRef', result.order.reference)
      localStorage.setItem('currentOrderPrice', String(orderData.price))

      // ─── STEP 5: Payment ──────────────────────────────────────────────
      setCurrentStep('payment')
      setIsLoading(false)
      setRedirectingToPayment(true)

      try {
        await createCheckoutAndRedirect(result.order.id, orderData.price)
        // After popup is opened, navigate to dashboard (popup handles payment)
        router.push('/dashboard')
      } catch (checkoutErr: any) {
        console.error('Erreur checkout:', checkoutErr)
        // Even if checkout fails, redirect to dashboard with order created
        setError('Commande créée avec succès. Si le paiement ne s\'est pas ouvert, allez dans votre espace client.')
        setTimeout(() => router.push('/dashboard'), 3000)
      }

    } catch (error: any) {
      console.error('Erreur checkout-signup:', error)
      setError(error.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  const currentStepLabel = STEPS.find(s => s.id === currentStep)?.label || 'Traitement en cours...'
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)

  if (!userData || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer votre compte</h1>
            <p className="text-gray-600">Complétez votre inscription pour finaliser votre commande</p>
          </div>

          {/* User info summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-600" />
              Vos informations
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-700">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">Email:</span>
                <span className="ml-2">{userData.email}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">Nom:</span>
                <span className="ml-2">{userData.firstName} {userData.lastName}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">Téléphone:</span>
                <span className="ml-2">{userData.phone}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">Adresse:</span>
                <span className="ml-2">{userData.address}, {userData.postalCode} {userData.city}</span>
              </div>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading progress display */}
          {(isLoading || redirectingToPayment) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-blue-700 font-medium">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{redirectingToPayment ? 'Ouverture du paiement...' : currentStepLabel}</span>
                </div>
                {isLoading && !redirectingToPayment && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Annuler
                  </button>
                )}
              </div>
              {/* Step progress bar */}
              <div className="flex gap-1">
                {STEPS.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      idx < currentStepIndex
                        ? 'bg-blue-600'
                        : idx === currentStepIndex
                          ? 'bg-blue-400 animate-pulse'
                          : 'bg-blue-100'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {STEPS.map((step, idx) => (
                  <span key={step.id} className={`text-xs ${idx <= currentStepIndex ? 'text-blue-600' : 'text-blue-200'}`}>
                    {idx + 1}
                  </span>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isLoading || redirectingToPayment}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none disabled:bg-gray-100"
                placeholder="Choisissez un mot de passe sécurisé"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isLoading || redirectingToPayment}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none disabled:bg-gray-100"
                placeholder="Confirmez votre mot de passe"
              />
            </div>

            <div className="flex items-center">
              <Lock className="w-5 h-5 text-gray-400 mr-2" />
              <p className="text-xs text-gray-600">
                Vos données sont sécurisées et ne seront utilisées que pour traiter votre commande.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || redirectingToPayment}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {redirectingToPayment ? (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Redirection vers le paiement sécurisé...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {currentStepLabel}
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Créer mon compte et continuer vers le paiement
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Car, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Download,
  Calendar,
  Package,
  User as UserIcon,
  LogOut,
  FileCheck,
  X,
  MapPin,
  Phone,
  Mail,
  File,
  Image as ImageIcon,
  ExternalLink,
  CreditCard,
  Info
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSupabaseSession } from '@/hooks/useSupabaseSession'

interface Order {
  id: string
  type: 'carte-grise' | 'plaque' | 'coc'
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  price: number
  reference?: string
  vehicleInfo?: {
    brand?: string
    model?: string
    registrationNumber?: string
  }
}

interface OrderDetails {
  id: string
  type: string
  status: string
  price: number
  reference?: string
  metadata?: any
  created_at: string
  updated_at: string
  vehicles?: {
    vin?: string
    make?: string
    model?: string
    year?: number
    engine?: string
    fuel_type?: string
    color?: string
    body_type?: string
    weight?: number
    power?: number
    displacement?: string
    registration_number?: string
  }
  profiles?: {
    email?: string
    first_name?: string
    last_name?: string
    phone?: string
    address?: string
    city?: string
    zip_code?: string
    country?: string
  }
  documents?: Array<{
    id: string
    name: string
    file_url: string
    file_type: string
    file_size: number
    created_at: string
  }>
  payment?: {
    amount: number
    status: string
    stripe_payment_intent_id?: string
  }
}

export default function DashboardPage() {
  const { user, loading: sessionLoading } = useSupabaseSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'carte-grise' | 'plaque' | 'coc'>('all')
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (sessionLoading) return
      
      if (!user) {
        router.push('/connexion')
        return
      }

      // IMPORTANT: If user is admin, redirect to admin panel
      // Admins should NEVER access client dashboard
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
        router.push('/admin')
        return
      }

      // Regular users can access dashboard
      if (user) {
        fetchOrders()
      }
    }

    checkUserAndRedirect()
  }, [user, sessionLoading, router])

  const fetchOrders = async () => {
    if (!user) return
    
    try {
      const supabase = createClient()
      
      // Fetch orders with vehicle info
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          vehicles (
            make,
            model,
            registration_number
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        // Fallback to empty array if error
        setOrders([])
        return
      }

      // Transform Supabase data to Order format
      const transformedOrders: Order[] = (ordersData || []).map((order: any) => ({
        id: order.id,
        type: order.type as 'carte-grise' | 'plaque' | 'coc',
        status: order.status as Order['status'],
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        price: parseFloat(order.price),
        reference: order.reference || undefined,
        vehicleInfo: order.vehicles ? {
          brand: order.vehicles.make,
          model: order.vehicles.model,
          registrationNumber: order.vehicles.registration_number
        } : undefined
      }))

      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { 
        label: 'En attente', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock 
      },
      processing: { 
        label: 'En traitement', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock 
      },
      completed: { 
        label: 'Terminé', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle 
      },
      cancelled: { 
        label: 'Annulé', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle 
      },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    )
  }

  const getTypeLabel = (type: Order['type']) => {
    if (type === 'carte-grise') return 'Carte Grise'
    if (type === 'plaque') return 'Plaque Immatriculation'
    return 'COC'
  }

  const getTypeIcon = (type: Order['type']) => {
    if (type === 'carte-grise') return FileText
    if (type === 'plaque') return Car
    return FileCheck // COC icon
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewOrder = async (orderId: string) => {
    setIsLoadingDetails(true)
    setIsModalOpen(true)
    
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement')
      }
      
      setSelectedOrder(data.order)
    } catch (error: any) {
      console.error('Error fetching order details:', error)
      alert('Erreur lors du chargement des détails de la commande')
      setIsModalOpen(false)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDocumentTypeLabel = (name: string) => {
    const types: Record<string, string> = {
      'carte_identite': 'Carte d\'identité',
      'justificatif_domicile': 'Justificatif de domicile',
      'carte_grise_actuelle': 'Carte grise actuelle',
      'certificat_cession': 'Certificat de cession',
      'permis_conduire': 'Permis de conduire',
      'controle_technique': 'Contrôle technique',
      'assurance': 'Attestation d\'assurance',
      'mandat': 'Mandat',
    }
    return types[name] || name
  }

  const isImage = (fileType: string) => fileType?.startsWith('image/')
  const isPdf = (fileType: string) => fileType?.includes('pdf')

  const formatMetadata = (metadata: any) => {
    if (!metadata || typeof metadata !== 'object') return null

    const documentTypeLabels: Record<string, string> = {
      'changement-titulaire': 'Changement de titulaire',
      'duplicata': 'Demande de duplicata',
      'immatriculation-provisoire-ww': 'Immatriculation provisoire WW',
      'enregistrement-cession': 'Enregistrement de cession',
      'changement-adresse': 'Changement d\'adresse',
      'fiche-identification': 'Fiche d\'identification',
      'declaration-achat': 'Déclaration d\'achat',
      'w-garage': 'W garage',
    }

    const clientTypeLabels: Record<string, string> = {
      'individual': 'Particulier',
      'company': 'Entreprise',
    }

    const importantFields: Record<string, string> = {
      // Service/Document info
      documentType: 'Type de démarche',
      serviceType: 'Type de service',
      
      // Address info (if not already shown in profile)
      streetNumber: 'Numéro de rue',
      streetType: 'Type de voie',
      streetName: 'Nom de la rue',
      address: 'Adresse complète',
      postalCode: 'Code postal',
      city: 'Ville',
      
      // Client type
      clientType: 'Type de client',
      siret: 'SIRET',
      
      // Status flags
      mandatGenerated: 'Mandat généré',
      signatureValidated: 'Signature validée',
      
      // Plaque specific
      plaqueType: 'Type de plaque',
      plaqueFormat: 'Format de plaque',
      quantity: 'Quantité',
      department: 'Département',
      customText: 'Texte personnalisé',
      fixingMode: 'Mode de fixation',
      material: 'Matériau',
    }

    const excludeFields = [
      'firstName', 'lastName', 'email', 'phone', // Already shown in profile section
      'vin', 'registrationNumber', 'marque', 'make', 'model', 'year' // Already shown in vehicle section
    ]

    const formattedData: Array<{ label: string; value: any }> = []

    Object.entries(metadata).forEach(([key, value]) => {
      // Skip excluded fields
      if (excludeFields.includes(key)) return
      
      // Skip empty values
      if (value === null || value === undefined || value === '') return
      
      // Skip boolean false values (unless they're important)
      if (value === false && !['mandatGenerated', 'signatureValidated'].includes(key)) return

      const label = importantFields[key] || key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim()

      let displayValue: string
      
      if (typeof value === 'boolean') {
        displayValue = value ? 'Oui' : 'Non'
      } else if (key === 'documentType' && documentTypeLabels[String(value)]) {
        displayValue = documentTypeLabels[String(value)]
      } else if (key === 'clientType' && clientTypeLabels[String(value)]) {
        displayValue = clientTypeLabels[String(value)]
      } else if (typeof value === 'object') {
        // Skip nested objects for now
        return
      } else {
        displayValue = String(value)
      }

      formattedData.push({ label, value: displayValue })
    })

    return formattedData.length > 0 ? formattedData : null
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.type === filter)

  if (sessionLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="EMatricule"
                  width={150}
                  height={48}
                  className="h-12 w-auto"
                />
              </Link>
              <div className="hidden md:block h-8 w-px bg-gray-300"></div>
              <div className="hidden md:flex items-center gap-2 text-gray-600">
                <UserIcon className="w-5 h-5" />
                <span className="font-medium">{user?.email || 'Utilisateur'}</span>
              </div>
            </div>
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/')
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Bienvenue dans votre espace client
          </h1>
          <p className="text-gray-600 text-lg">
            Gérez vos démarches et suivez vos commandes
          </p>
        </motion.div>

        {/* New Procedure Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Link
            href="/nouvelle-demarche"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg">Nouvelle démarche</span>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total commandes</span>
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">En traitement</span>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {orders.filter(o => o.status === 'processing' || o.status === 'pending').length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Terminées</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {orders.filter(o => o.status === 'completed').length}
            </p>
          </motion.div>
        </div>

        {/* Orders Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Mes commandes</h2>
              
              {/* Filters */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setFilter('carte-grise')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'carte-grise'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Carte Grise
                </button>
                <button
                  onClick={() => setFilter('plaque')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'plaque'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Plaques
                </button>
                <button
                  onClick={() => setFilter('coc')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'coc'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  COC
                </button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">Aucune commande trouvée</p>
                <p className="text-gray-500 mb-6">Commencez une nouvelle démarche pour voir vos commandes ici</p>
                <Link
                  href="/nouvelle-demarche"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Nouvelle démarche
                </Link>
              </div>
            ) : (
              filteredOrders.map((order, index) => {
                const TypeIcon = getTypeIcon(order.type)
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <TypeIcon className="w-6 h-6 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {getTypeLabel(order.type)}
                              </h3>
                              {getStatusBadge(order.status)}
                            </div>
                            {order.reference && (
                              <p className="text-sm text-gray-600 mb-1">
                                Référence: <span className="font-medium">{order.reference}</span>
                              </p>
                            )}
                            {order.vehicleInfo?.brand && (
                              <p className="text-sm text-gray-600">
                                {order.vehicleInfo.brand} {order.vehicleInfo.model}
                                {order.vehicleInfo.registrationNumber && ` • ${order.vehicleInfo.registrationNumber}`}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>Créé le {formatDate(order.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-900">{order.price.toFixed(2)} €</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewOrder(order.id)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Voir</span>
                        </button>
                        {order.status === 'completed' && (
                          <button className="flex items-center gap-2 px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors font-medium">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Télécharger</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  {selectedOrder && (() => {
                    const Icon = getTypeIcon(selectedOrder.type as Order['type'])
                    return <Icon className="w-6 h-6 text-white" />
                  })()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedOrder ? getTypeLabel(selectedOrder.type as Order['type']) : 'Détails de la commande'}
                  </h2>
                  {selectedOrder?.reference && (
                    <p className="text-primary-100 text-sm mt-1">
                      Référence: {selectedOrder.reference}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedOrder(null)
                }}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : selectedOrder ? (
                <div className="space-y-6">
                  {/* Status and Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Statut</p>
                      {getStatusBadge(selectedOrder.status as Order['status'])}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Prix</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedOrder.price.toFixed(2)} €</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Calendar className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">Date de création</p>
                        <p>{formatDateTime(selectedOrder.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">Dernière mise à jour</p>
                        <p>{formatDateTime(selectedOrder.updated_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* User Information */}
                  {selectedOrder.profiles && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-primary-600" />
                        Informations personnelles
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedOrder.profiles.first_name && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Prénom</p>
                            <p className="font-medium text-gray-900">{selectedOrder.profiles.first_name}</p>
                          </div>
                        )}
                        {selectedOrder.profiles.last_name && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Nom</p>
                            <p className="font-medium text-gray-900">{selectedOrder.profiles.last_name}</p>
                          </div>
                        )}
                        {selectedOrder.profiles.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Email</p>
                              <p className="font-medium text-gray-900">{selectedOrder.profiles.email}</p>
                            </div>
                          </div>
                        )}
                        {selectedOrder.profiles.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                              <p className="font-medium text-gray-900">{selectedOrder.profiles.phone}</p>
                            </div>
                          </div>
                        )}
                        {(selectedOrder.profiles.address || selectedOrder.profiles.city || selectedOrder.profiles.zip_code) && (
                          <div className="md:col-span-2 flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Adresse</p>
                              <p className="font-medium text-gray-900">
                                {selectedOrder.profiles.address && `${selectedOrder.profiles.address}, `}
                                {selectedOrder.profiles.zip_code && `${selectedOrder.profiles.zip_code} `}
                                {selectedOrder.profiles.city}
                                {selectedOrder.profiles.country && `, ${selectedOrder.profiles.country}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vehicle Information */}
                  {selectedOrder.vehicles && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Car className="w-5 h-5 text-primary-600" />
                        Informations du véhicule
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedOrder.vehicles.make && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Marque</p>
                            <p className="font-medium text-gray-900">{selectedOrder.vehicles.make}</p>
                          </div>
                        )}
                        {selectedOrder.vehicles.model && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Modèle</p>
                            <p className="font-medium text-gray-900">{selectedOrder.vehicles.model}</p>
                          </div>
                        )}
                        {selectedOrder.vehicles.registration_number && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Numéro d'immatriculation</p>
                            <p className="font-medium text-gray-900">{selectedOrder.vehicles.registration_number}</p>
                          </div>
                        )}
                        {selectedOrder.vehicles.vin && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">VIN</p>
                            <p className="font-medium text-gray-900 font-mono text-sm">{selectedOrder.vehicles.vin}</p>
                          </div>
                        )}
                        {selectedOrder.vehicles.year && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Année</p>
                            <p className="font-medium text-gray-900">{selectedOrder.vehicles.year}</p>
                          </div>
                        )}
                        {selectedOrder.vehicles.color && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Couleur</p>
                            <p className="font-medium text-gray-900">{selectedOrder.vehicles.color}</p>
                          </div>
                        )}
                        {selectedOrder.vehicles.fuel_type && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Carburant</p>
                            <p className="font-medium text-gray-900">{selectedOrder.vehicles.fuel_type}</p>
                          </div>
                        )}
                        {selectedOrder.vehicles.power && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Puissance (CV)</p>
                            <p className="font-medium text-gray-900">{selectedOrder.vehicles.power}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {selectedOrder.documents && selectedOrder.documents.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-600" />
                        Documents ({selectedOrder.documents.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedOrder.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {isImage(doc.file_type) ? (
                                <ImageIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                              ) : isPdf(doc.file_type) ? (
                                <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                              ) : (
                                <File className="w-5 h-5 text-gray-600 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {getDocumentTypeLabel(doc.name)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(doc.file_size)} • {formatDateTime(doc.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ouvrir"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <a
                                href={doc.file_url}
                                download
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Télécharger"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  {selectedOrder.payment && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary-600" />
                        Paiement
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Montant payé</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.payment.amount.toFixed(2)} €</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">Statut</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedOrder.payment.status === 'succeeded' 
                              ? 'bg-green-100 text-green-800' 
                              : selectedOrder.payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedOrder.payment.status === 'succeeded' ? 'Payé' : 
                             selectedOrder.payment.status === 'pending' ? 'En attente' : 'Échoué'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata (Additional Info) */}
                  {(() => {
                    const formattedMetadata = formatMetadata(selectedOrder.metadata)
                    return formattedMetadata && formattedMetadata.length > 0 ? (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Info className="w-5 h-5 text-primary-600" />
                          Informations supplémentaires
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formattedMetadata.map((item, index) => (
                              <div key={index}>
                                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                                <p className="font-medium text-gray-900">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null
                  })()}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucune information disponible</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedOrder(null)
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}


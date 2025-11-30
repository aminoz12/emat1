'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Car,
  RefreshCw,
  ShoppingCart,
  MoreVertical,
  Download,
  Edit,
  MapPin,
  Phone,
  FileDown,
  X,
  ChevronRight as ChevronRightIcon
} from 'lucide-react'

interface Order {
  id: string
  reference: string
  type: string
  status: string
  price: number
  created_at: string
  updated_at: string
  metadata: any
  profiles: {
    id: string
    email: string
    first_name: string
    last_name: string
    phone: string
  } | null
  vehicles: {
    id: string
    make: string
    model: string
    registration_number: string
    vin: string
  } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'
  
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [downloadingOrders, setDownloadingOrders] = useState<Set<string>>(new Set())
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, statusFilter, typeFilter])

  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        status: statusFilter,
        type: typeFilter
      })

      console.log('🔍 Fetching orders with params:', params.toString())
      const response = await fetch(`/api/admin/orders?${params}`)
      const data = await response.json()

      console.log('📦 Response status:', response.status)
      console.log('📦 Response data:', data)

      if (!response.ok) {
        console.error('❌ API Error:', data.error)
        throw new Error(data.error || 'Erreur lors du chargement')
      }

      console.log('✅ Orders received:', data.orders?.length || 0)
      console.log('✅ Orders data:', data.orders)

      setOrders(data.orders || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }))
    } catch (err: any) {
      console.error('❌ Fetch error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrderDetails = async (orderId: string) => {
    setIsDetailsLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement')
      }

      setOrderDetails(data.order)
      setIsDetailsOpen(true)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsDetailsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      // Refresh orders
      fetchOrders()
      if (orderDetails?.id === orderId) {
        setOrderDetails({ ...orderDetails, status: newStatus })
      }
      setOpenActionMenu(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const downloadAllDocuments = async (orderId: string) => {
    // Add orderId to downloading set
    setDownloadingOrders(prev => new Set(prev).add(orderId))
    
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/download-documents`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors du téléchargement')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `commande-${orderId}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setOpenActionMenu(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      // Remove orderId from downloading set
      setDownloadingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      processing: { label: 'En cours', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Loader2 },
      completed: { label: 'Terminée', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    }
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock }
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    )
  }

  const getTypeIcon = (type: string) => {
    if (type === 'carte-grise') return <FileText className="w-4 h-4 text-primary-600" />
    if (type === 'plaque') return <Car className="w-4 h-4 text-blue-600" />
    return <FileText className="w-4 h-4 text-purple-600" />
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'carte-grise': 'Carte Grise',
      'changement-titulaire': 'Carte Grise',
      'plaque': 'Plaque',
      'coc': 'COC'
    }
    return types[type] || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatMetadata = (metadata: any) => {
    if (!metadata || typeof metadata !== 'object') return null
    
    const formatted: any = {}
    
    // Fields to exclude
    const excludedFields = [
      'ClientType',
      'clientType',
      'MandatGenerated',
      'mandatGenerated',
      'mandat_genere',
      'SignatureValidated',
      'signatureValidated',
      'signature_validee',
      'DocumentType',
      'documentType',
      'StreetName',
      'streetName',
      'PostalCode',
      'postalCode',
      'StreetType',
      'streetType',
      'StreetNumber',
      'streetNumber'
    ]
    
    // Common fields mapping
    const fieldLabels: Record<string, string> = {
      'type_demarche': 'Type de démarche',
      'demarche_type': 'Type de démarche',
      'mandat_signed': 'Mandat signé',
      'mandat_url': 'Mandat PDF',
      'mandatUrl': 'Mandat PDF',
      'mandatUploaded': 'Mandat uploadé',
      'code_postal': 'Code postal',
      'departement': 'Département',
      'department': 'Département',
      'date_achat': 'Date d\'achat',
      'date_vente': 'Date de vente',
      'prix_achat': 'Prix d\'achat',
      'kilometrage': 'Kilométrage',
      'puissance_fiscale': 'Puissance fiscale',
      'energie': 'Énergie',
      'date_premiere_immatriculation': 'Date première immatriculation',
      'numero_formulaire': 'Numéro de formulaire',
      'signature': 'Signature',
      'signature_date': 'Date de signature',
      // Plaque fields
      'vehicleType': 'Type de véhicule',
      'material': 'Matériau',
      'fixingMode': 'Mode de fixation',
      'textOption': 'Option de texte',
      'customText': 'Texte personnalisé',
      'quantity': 'Quantité',
      'basePrice': 'Prix de base',
      'calculatedPrice': 'Prix calculé',
      'registrationNumber': 'Numéro d\'immatriculation'
    }

    for (const [key, value] of Object.entries(metadata)) {
      // Skip excluded fields
      if (excludedFields.includes(key)) continue
      
      if (value !== null && value !== undefined && value !== '' && value !== true && value !== false) {
        const label = fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        formatted[label] = value
      }
    }

    return formatted
  }

  // Helper function to build full address
  const buildFullAddress = (metadata: any, profile: any) => {
    const addressParts: string[] = []
    
    // From metadata
    if (metadata?.StreetNumber) addressParts.push(metadata.StreetNumber)
    if (metadata?.streetNumber) addressParts.push(metadata.streetNumber)
    if (metadata?.StreetType) addressParts.push(metadata.StreetType)
    if (metadata?.streetType) addressParts.push(metadata.streetType)
    if (metadata?.StreetName) addressParts.push(metadata.StreetName)
    if (metadata?.streetName) addressParts.push(metadata.streetName)
    
    // From profile
    if (profile?.address) addressParts.push(profile.address)
    if (profile?.city) addressParts.push(profile.city)
    if (profile?.zip_code) addressParts.push(profile.zip_code)
    if (metadata?.PostalCode && !profile?.zip_code) addressParts.push(metadata.PostalCode)
    if (metadata?.postalCode && !profile?.zip_code) addressParts.push(metadata.postalCode)
    
    return addressParts.filter(Boolean).join(', ') || 'Non renseignée'
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des commandes</h1>
          <p className="text-gray-600">Gérez et suivez toutes les commandes de votre plateforme</p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-blue-900">{pagination.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 mb-1">En attente</p>
              <p className="text-2xl font-bold text-yellow-900">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-1">En cours</p>
              <p className="text-2xl font-bold text-indigo-900">
                {orders.filter(o => o.status === 'processing').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Terminées</p>
              <p className="text-2xl font-bold text-green-900">
                {orders.filter(o => o.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par référence, email, nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white appearance-none cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En cours</option>
              <option value="completed">Terminées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white cursor-pointer"
          >
            <option value="all">Tous les types</option>
            <option value="carte-grise">Carte Grise</option>
            <option value="plaque">Plaque</option>
            <option value="coc">COC</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Chargement des commandes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-800 mb-1">Erreur</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Référence</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Montant</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-gray-500 text-lg font-medium mb-2">Aucune commande trouvée</p>
                          <p className="text-gray-400 text-sm mb-4">
                            {statusFilter !== 'all' || typeFilter !== 'all' 
                              ? 'Essayez de modifier les filtres' 
                              : 'Aucune commande n\'a été créée pour le moment'}
                          </p>
                          <button
                            onClick={fetchOrders}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                          >
                            Actualiser
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent transition-all border-b border-gray-100">
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                            <span className="font-semibold text-gray-900">
                              {order.reference || order.id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">
                              {order.profiles?.first_name} {order.profiles?.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{order.profiles?.email}</p>
                            {order.profiles?.phone && (
                              <p className="text-xs text-gray-500 mt-1">{order.profiles.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                            {getTypeIcon(order.type)}
                            <span className="text-sm font-medium text-gray-700">{getTypeLabel(order.type)}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className="font-bold text-lg text-gray-900">
                            {parseFloat(String(order.price)).toFixed(2)}€
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">{formatDate(order.created_at).split(' ')[0]}</span>
                            <span className="text-xs text-gray-500">{formatDate(order.created_at).split(' ')[1]}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2">
                          <button
                            onClick={() => fetchOrderDetails(order.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                            <button
                              onClick={() => downloadAllDocuments(order.id)}
                              disabled={downloadingOrders.has(order.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Télécharger tous les documents"
                            >
                              {downloadingOrders.has(order.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-5 border-t border-gray-200 bg-gray-50">
                <p className="text-sm font-medium text-gray-700">
                  Page <span className="font-bold text-primary-600">{pagination.page}</span> sur <span className="font-bold">{pagination.totalPages}</span> 
                  <span className="text-gray-500 ml-2">({pagination.total} commandes)</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white hover:border-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:hover:bg-gray-50 disabled:hover:border-gray-300 disabled:hover:text-gray-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Précédent</span>
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white hover:border-primary-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:hover:bg-gray-50 disabled:hover:border-gray-300 disabled:hover:text-gray-600"
                  >
                    <span className="text-sm font-medium">Suivant</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Actions Modal Card */}
      {openActionMenu && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setOpenActionMenu(null)
            setSelectedOrder(null)
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Actions - Commande {selectedOrder.reference || selectedOrder.id.slice(-8).toUpperCase()}
                </h3>
                <button
                  onClick={() => {
                    setOpenActionMenu(null)
                    setSelectedOrder(null)
                  }}
                  className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Actions List */}
            <div className="p-4 space-y-2">
              {/* View Details */}
              <button
                onClick={() => {
                  fetchOrderDetails(selectedOrder.id)
                  setOpenActionMenu(null)
                  setSelectedOrder(null)
                }}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-primary-50 hover:text-primary-700 rounded-lg flex items-center gap-3 transition-all group"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Eye className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-primary-700">Voir tous les détails</p>
                  <p className="text-xs text-gray-500">Informations complètes de la commande</p>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
              </button>

              {/* Download Documents */}
              <button
                onClick={() => {
                  downloadAllDocuments(selectedOrder.id)
                }}
                disabled={downloadingOrders.has(selectedOrder.id)}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-3 transition-all group disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  {downloadingOrders.has(selectedOrder.id) ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-700">Télécharger tous les documents</p>
                  <p className="text-xs text-gray-500">Fichier ZIP avec tous les documents</p>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              </button>

              {/* Divider */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Change Status Section */}
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Changer le statut</p>
                <div className="space-y-2">
                  {['pending', 'processing', 'completed', 'cancelled'].map((status) => {
                    const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
                      pending: { label: 'En attente', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
                      processing: { label: 'En cours', icon: Loader2, color: 'text-blue-600', bgColor: 'bg-blue-100' },
                      completed: { label: 'Terminée', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
                      cancelled: { label: 'Annulée', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' }
                    }
                    const config = statusConfig[status]
                    const Icon = config.icon
                    const isActive = selectedOrder.status === status
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, status)
                        }}
                        disabled={isUpdating || isActive}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                          isActive
                            ? 'bg-primary-50 border-2 border-primary-500'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary-100' : config.bgColor}`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : config.color} ${status === 'processing' && !isActive ? 'animate-spin' : ''}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${isActive ? 'text-primary-700' : 'text-gray-900'}`}>
                            {config.label}
                          </p>
                          {isActive && (
                            <p className="text-xs text-primary-600">Statut actuel</p>
                          )}
                        </div>
                        {isActive && (
                          <CheckCircle className="w-5 h-5 text-primary-600" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Order Details Sidebar */}
      {isDetailsOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {
              setIsDetailsOpen(false)
              setOrderDetails(null)
            }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {isDetailsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600">Chargement des détails...</p>
                </div>
              </div>
            ) : orderDetails ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white border-b border-primary-800 px-6 py-5 z-10 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Commande {orderDetails.reference || orderDetails.id.slice(-8).toUpperCase()}
                      </h2>
                      <p className="text-sm text-primary-100 mt-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Créée le {formatDate(orderDetails.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsDetailsOpen(false)
                        setOrderDetails(null)
                      }}
                      className="p-2 text-white hover:text-gray-100 hover:bg-primary-800 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                  {/* Status Card */}
                  <div className="bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 rounded-xl p-6 border-2 border-primary-200 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-primary-700 mb-2">Statut actuel</p>
                        {getStatusBadge(orderDetails.status)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['pending', 'processing', 'completed', 'cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(orderDetails.id, status)}
                            disabled={isUpdating || orderDetails.status === status}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                              orderDetails.status === status
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-primary-50 hover:shadow-md'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {status === 'pending' ? 'En attente' :
                             status === 'processing' ? 'En cours' :
                             status === 'completed' ? 'Terminée' : 'Annulée'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      Informations client
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1.5">Nom complet</p>
                        <p className="text-gray-900 font-semibold text-base">
                          {orderDetails.profiles?.first_name && orderDetails.profiles?.last_name
                            ? `${orderDetails.profiles.first_name} ${orderDetails.profiles.last_name}`
                            : orderDetails.profiles?.first_name || orderDetails.profiles?.last_name || 'Non renseigné'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1.5">Email</p>
                        <p className="text-gray-900">{orderDetails.profiles?.email || 'Non renseigné'}</p>
                      </div>
                      {orderDetails.profiles?.phone && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            Téléphone
                          </p>
                          <p className="text-gray-900">{orderDetails.profiles.phone}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Adresse
                        </p>
                        <p className="text-gray-900 leading-relaxed">
                          {buildFullAddress(orderDetails.metadata, orderDetails.profiles)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  {orderDetails.vehicles && (
                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-200 shadow-sm p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-blue-600" />
                        </div>
                        Informations véhicule
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {orderDetails.vehicles.registration_number && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm font-medium text-gray-500 mb-2">Matricule</p>
                            <p className="text-gray-900 font-semibold text-lg">
                              {orderDetails.vehicles.registration_number}
                            </p>
                          </div>
                        )}
                        {orderDetails.vehicles.vin && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm font-medium text-gray-500 mb-2">VIN</p>
                            <p className="text-gray-900 font-mono text-sm break-all">
                              {orderDetails.vehicles.vin}
                            </p>
                          </div>
                        )}
                        {orderDetails.vehicles.make && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm font-medium text-gray-500 mb-2">Marque</p>
                            <p className="text-gray-900 font-medium">{orderDetails.vehicles.make}</p>
                          </div>
                        )}
                        {orderDetails.vehicles.model && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm font-medium text-gray-500 mb-2">Modèle</p>
                            <p className="text-gray-900 font-medium">{orderDetails.vehicles.model}</p>
                          </div>
                        )}
                        {orderDetails.vehicles.year && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm font-medium text-gray-500 mb-2">Année</p>
                            <p className="text-gray-900 font-medium">{orderDetails.vehicles.year}</p>
                          </div>
                        )}
                        {orderDetails.vehicles.color && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm font-medium text-gray-500 mb-2">Couleur</p>
                            <p className="text-gray-900 font-medium">{orderDetails.vehicles.color}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Details */}
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                      </div>
                      Détails de la commande
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm font-medium text-gray-500 mb-2">Type de démarche</p>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(orderDetails.type === 'changement-titulaire' ? 'carte-grise' : orderDetails.type)}
                          <p className="text-gray-900 font-semibold text-base">
                            {orderDetails.type === 'changement-titulaire' ? 'Carte Grise' : getTypeLabel(orderDetails.type)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm font-medium text-gray-500 mb-2">Montant</p>
                        <p className="text-gray-900 font-bold text-2xl text-primary-600">
                          {parseFloat(String(orderDetails.price)).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metadata - Formatted */}
                  {orderDetails.metadata && Object.keys(formatMetadata(orderDetails.metadata) || {}).length > 0 && (
                    <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-200 shadow-sm p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        Informations de la démarche
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(formatMetadata(orderDetails.metadata) || {}).map(([key, value]) => {
                          // Special handling for URLs (like mandat PDF)
                          if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/'))) {
                            return (
                              <div key={key} className="md:col-span-2 bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-sm font-medium text-gray-500 mb-2">{key}</p>
                                <a
                                  href={value as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                                >
                                  <FileText className="w-4 h-4" />
                                  Voir le document
                                  <ChevronRightIcon className="w-4 h-4" />
                                </a>
                              </div>
                            )
                          }
                          
                          // Regular fields
                          return (
                            <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-sm font-medium text-gray-500 mb-1">{key}</p>
                              <p className="text-gray-900 font-medium text-sm">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Documents - Moved to bottom */}
                  {orderDetails.documents && orderDetails.documents.length > 0 && (
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200 shadow-lg p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
                            <FileDown className="w-5 h-5 text-primary-700" />
                          </div>
                          Documents ({orderDetails.documents.length})
                        </h3>
                      </div>
                      
                      {/* Download All Button - Prominent */}
                      <div className="mb-5">
                        <button
                          onClick={() => downloadAllDocuments(orderDetails.id)}
                          disabled={downloadingOrders.has(orderDetails.id)}
                          className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg font-semibold"
                        >
                          {downloadingOrders.has(orderDetails.id) ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Téléchargement en cours...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-5 h-5" />
                              <span>Télécharger tous les documents (.zip)</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Documents List */}
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {orderDetails.documents.map((doc: any) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-primary-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                                <p className="text-xs text-gray-500">
                                  {doc.file_type} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Taille inconnue'}
                                </p>
                              </div>
                            </div>
                            {doc.file_url && (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                                title="Voir le document"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        </>
      )}

      {/* Order Detail Modal - Old (keeping for backward compatibility) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Commande {selectedOrder.reference || selectedOrder.id.slice(-8).toUpperCase()}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Statut actuel</h3>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Client info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Client</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium">{selectedOrder.profiles?.first_name} {selectedOrder.profiles?.last_name}</p>
                  <p className="text-gray-600">{selectedOrder.profiles?.email}</p>
                  {selectedOrder.profiles?.phone && (
                    <p className="text-gray-600">{selectedOrder.profiles.phone}</p>
                  )}
                </div>
              </div>

              {/* Vehicle info */}
              {selectedOrder.vehicles && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Véhicule</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{selectedOrder.vehicles.registration_number}</p>
                    <p className="text-gray-600">{selectedOrder.vehicles.make} {selectedOrder.vehicles.model}</p>
                    {selectedOrder.vehicles.vin && (
                      <p className="text-gray-600 text-sm">VIN: {selectedOrder.vehicles.vin}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Order details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Type</h3>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedOrder.type)}
                    <span>{getTypeLabel(selectedOrder.type)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Montant</h3>
                  <p className="font-semibold text-lg">{parseFloat(String(selectedOrder.price)).toFixed(2)}€</p>
                </div>
              </div>

              {/* Metadata */}
              {selectedOrder.metadata && Object.keys(selectedOrder.metadata).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Informations supplémentaires</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <pre className="whitespace-pre-wrap text-gray-600">
                      {JSON.stringify(selectedOrder.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Changer le statut</h3>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'processing', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      disabled={isUpdating || selectedOrder.status === status}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedOrder.status === status
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        status === 'pending' ? 'En attente' :
                        status === 'processing' ? 'En cours' :
                        status === 'completed' ? 'Terminée' : 'Annulée'
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}


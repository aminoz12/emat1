'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  File,
  RefreshCw,
  ExternalLink,
  Calendar,
  User,
  ShoppingCart,
  Filter,
  X
} from 'lucide-react'

interface Document {
  id: string
  order_id: string
  name: string
  file_url: string
  file_type: string
  file_size: number
  created_at: string
  orders: {
    id: string
    reference: string
    type: string
    status: string
    profiles: {
      email: string
      first_name: string
      last_name: string
    } | null
  } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [pagination.page])

  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit)
      })

      const response = await fetch(`/api/admin/documents?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement')
      }

      setDocuments(data.documents || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDocument = async (docId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      fetchDocuments()
      setSelectedDoc(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-green-600" />
    if (fileType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />
    return <File className="w-5 h-5 text-gray-600" />
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Tous les documents uploadés par les clients</p>
        </div>
        <button
          onClick={fetchDocuments}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              <p className="text-sm text-gray-500">Total documents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => isImage(d.file_type)).length}
              </p>
              <p className="text-sm text-gray-500">Images</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => isPdf(d.file_type)).length}
              </p>
              <p className="text-sm text-gray-500">PDFs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun document trouvé</p>
            <p className="text-gray-400 text-sm mt-1">Les documents uploadés par les clients apparaîtront ici</p>
          </div>
        ) : (
          <>
            {/* Table view */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Document</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Commande</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Taille</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.file_type)}
                          <div>
                            <p className="font-medium text-gray-900">{getDocumentTypeLabel(doc.name)}</p>
                            <p className="text-xs text-gray-500">{doc.file_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {doc.orders ? (
                          <Link
                            href={`/admin/orders?search=${doc.orders.reference || doc.orders.id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {doc.orders.reference || doc.orders.id.slice(-8).toUpperCase()}
                          </Link>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {doc.orders?.profiles ? (
                          <div>
                            <p className="text-gray-900">
                              {doc.orders.profiles.first_name} {doc.orders.profiles.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{doc.orders.profiles.email}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">{formatFileSize(doc.file_size)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-500">{formatDate(doc.created_at)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} sur {pagination.totalPages} ({pagination.total} documents)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedDoc.file_type)}
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {getDocumentTypeLabel(selectedDoc.name)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedDoc.file_size)} • {formatDate(selectedDoc.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedDoc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <a
                  href={selectedDoc.file_url}
                  download
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={() => deleteDocument(selectedDoc.id)}
                  disabled={isDeleting}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              {isImage(selectedDoc.file_type) ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <img
                    src={selectedDoc.file_url}
                    alt={selectedDoc.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : isPdf(selectedDoc.file_type) ? (
                <iframe
                  src={selectedDoc.file_url}
                  className="w-full h-[70vh] rounded-lg shadow-lg"
                  title={selectedDoc.name}
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                  <File className="w-16 h-16 mb-4" />
                  <p>Aperçu non disponible pour ce type de fichier</p>
                  <a
                    href={selectedDoc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Télécharger le fichier
                  </a>
                </div>
              )}
            </div>

            {/* Order info */}
            {selectedDoc.orders && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <ShoppingCart className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Commande:</span>
                      <Link
                        href={`/admin/orders?search=${selectedDoc.orders.reference}`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {selectedDoc.orders.reference || selectedDoc.orders.id.slice(-8).toUpperCase()}
                      </Link>
                    </div>
                    {selectedDoc.orders.profiles && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Client:</span>
                        <span className="font-medium">
                          {selectedDoc.orders.profiles.first_name} {selectedDoc.orders.profiles.last_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}


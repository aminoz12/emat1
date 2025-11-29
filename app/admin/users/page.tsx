'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Shield,
  User,
  Crown,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  RefreshCw,
  XCircle
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  zip_code: string | null
  role: string
  created_at: string
  updated_at: string
  orderCount: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, roleFilter])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        role: roleFilter,
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement')
      }

      setUsers(data.users || [])
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

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    // Protect main admin
    const user = users.find(u => u.id === userId)
    if (user?.email === 'mhammed@ematricule.fr') {
      alert('Le main admin ne peut pas être modifié ou supprimé')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      // Refresh users
      fetchUsers()
      setSelectedUser(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; color: string; icon: any }> = {
      USER: { label: 'Utilisateur', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: User },
      ADMIN: { label: 'Admin', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Shield },
      SUPER_ADMIN: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Crown },
    }
    const config = roleConfig[role] || { label: role, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: User }
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600">Gérez les comptes utilisateurs et leurs droits</p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par email, nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tous les rôles</option>
            <option value="USER">Utilisateurs</option>
            <option value="ADMIN">Administrateurs</option>
            <option value="SUPER_ADMIN">Super Admins</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Utilisateur</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Commandes</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Inscription</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                              {getInitials(user.first_name, user.last_name, user.email)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Non renseigné'}
                              </p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{user.orderCount}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {formatDate(user.created_at)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} sur {pagination.totalPages} ({pagination.total} utilisateurs)
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

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Détails utilisateur</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User avatar and name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                  {getInitials(selectedUser.first_name, selectedUser.last_name, selectedUser.email)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {`${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || 'Non renseigné'}
                  </h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>

              {/* Contact info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Informations de contact</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedUser.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              {(selectedUser.address || selectedUser.city || selectedUser.zip_code) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">Adresse</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedUser.address && <p>{selectedUser.address}</p>}
                    <p>{selectedUser.zip_code} {selectedUser.city}</p>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedUser.orderCount}</p>
                  <p className="text-sm text-gray-600">Commandes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedUser.created_at)}</p>
                  <p className="text-sm text-gray-600">Inscription</p>
                </div>
              </div>

              {/* Role management */}
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Changer le rôle</h4>
                {selectedUser.email === 'mhammed@ematricule.fr' ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ Le main admin est protégé et ne peut pas être modifié ou supprimé.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {['USER', 'ADMIN', 'SUPER_ADMIN'].map((role) => (
                        <button
                          key={role}
                          onClick={() => updateUserRole(selectedUser.id, role)}
                          disabled={isUpdating || selectedUser.role === role}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedUser.role === role
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } disabled:opacity-50`}
                        >
                          {role === 'USER' ? 'Utilisateur' :
                           role === 'ADMIN' ? 'Admin' : 'Super Admin'}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Note: Seul un Super Admin peut modifier les rôles.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Users, 
  ShoppingCart, 
  Euro, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  FileText,
  Car,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface Stats {
  totalUsers: number
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  completedOrders: number
  totalRevenue: number
  recentOrders: number
  newUsersThisMonth: number
  ordersByType: {
    carteGrise: number
    plaque: number
    coc: number
  }
}

interface RecentOrder {
  id: string
  reference: string
  type: string
  status: string
  price: number
  created_at: string
  profiles: {
    email: string
    first_name: string
    last_name: string
  } | null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats')
      const statsData = await statsRes.json()
      
      if (!statsRes.ok) {
        throw new Error(statsData.error || 'Erreur lors du chargement des statistiques')
      }
      
      setStats(statsData.stats)

      // Fetch recent orders
      const ordersRes = await fetch('/api/admin/orders?limit=5')
      const ordersData = await ordersRes.json()
      
      if (ordersRes.ok) {
        setRecentOrders(ordersData.orders || [])
      }

    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Terminée', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
      unpaid: { label: 'Non payé', color: 'bg-orange-100 text-orange-800' },
    }
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'carte-grise': 'Carte Grise',
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Erreur</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre plateforme EMatricule</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalUsers || 0}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                +{stats?.newUsersThisMonth || 0} ce mois
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Commandes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalOrders || 0}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                +{stats?.recentOrders || 0} cette semaine
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {(stats?.totalRevenue || 0).toFixed(2)}€
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Commandes terminées
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Euro className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.pendingOrders || 0}</p>
              <p className="text-sm text-orange-600 mt-1">
                À traiter rapidement
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Orders by status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut des commandes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                <span className="text-gray-700">En attente</span>
              </div>
              <span className="font-semibold">{stats?.pendingOrders || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                <span className="text-gray-700">En cours</span>
              </div>
              <span className="font-semibold">{stats?.processingOrders || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <span className="text-gray-700">Terminées</span>
              </div>
              <span className="font-semibold">{stats?.completedOrders || 0}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commandes par type</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-primary-600 mr-3" />
                <span className="text-gray-700">Carte Grise</span>
              </div>
              <span className="font-semibold">{stats?.ordersByType?.carteGrise || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Car className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-gray-700">Plaques</span>
              </div>
              <span className="font-semibold">{stats?.ordersByType?.plaque || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-gray-700">COC</span>
              </div>
              <span className="font-semibold">{stats?.ordersByType?.coc || 0}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <Link
              href="/admin/orders?status=pending"
              className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <span className="text-yellow-800 font-medium">Traiter les commandes en attente</span>
              <Clock className="w-5 h-5 text-yellow-600" />
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-blue-800 font-medium">Voir les utilisateurs</span>
              <Users className="w-5 h-5 text-blue-600" />
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-green-800 font-medium">Toutes les commandes</span>
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Dernières commandes</h3>
            <Link
              href="/admin/orders"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Voir toutes →
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Référence</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Aucune commande pour le moment
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{order.reference || order.id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.profiles?.first_name} {order.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{order.profiles?.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{getTypeLabel(order.type)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{parseFloat(String(order.price)).toFixed(2)}€</span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-500 text-sm">{formatDate(order.created_at)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

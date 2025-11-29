'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, FileText, Clock, ArrowRight, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface OrderData {
  id: string
  quantity: number
  totalPrice: number
  [key: string]: any
}

const ConfirmationPage = () => {
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const orderId = localStorage.getItem('currentOrder')
    if (!orderId) {
      router.push('/')
      return
    }

    // Fetch order data
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
    .then(res => res.json())
    .then(data => {
      setOrderData(data)
      setIsLoading(false)
    })
    .catch(() => {
      setIsLoading(false)
      router.push('/')
    })
  }, [router])

  const handleNewOrder = async () => {
    localStorage.removeItem('currentOrder')
    localStorage.removeItem('vehicleData')
    localStorage.removeItem('selectedService')
    
    // Check user role and redirect accordingly
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      router.push('/dashboard')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Commande non trouvée</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 text-white px-6 py-3 rounded-2xl hover:bg-primary-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-16">
      <div className="container max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Commande confirmée !
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Votre commande a été traitée avec succès. Vous recevrez un email de confirmation sous peu.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Détails de la commande</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Numéro de commande</span>
                  <span className="font-semibold text-gray-900">#{orderData?.id?.slice(-8).toUpperCase() || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold text-gray-900">Carte grise standard</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Quantité</span>
                  <span className="font-semibold text-gray-900">{orderData?.quantity || 0}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Statut</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    En traitement
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {orderData?.totalPrice?.toFixed(2) || '0.00'}€
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Prochaines étapes</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email de confirmation</h4>
                    <p className="text-gray-600 text-sm">
                      Vous recevrez un email de confirmation avec tous les détails de votre commande.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Traitement des documents</h4>
                    <p className="text-gray-600 text-sm">
                      Nos équipes traitent vos documents et vérifient toutes les informations.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Livraison</h4>
                    <p className="text-gray-600 text-sm">
                      Votre carte grise vous sera livrée sous 24-48h par l'Imprimerie Nationale.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 px-4 rounded-2xl hover:bg-primary-700 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Télécharger la facture</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-2xl hover:bg-gray-200 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Suivre ma commande</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Besoin d'aide ?</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>support@emattricule.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="w-4 h-4">📞</span>
                  <span>01 84 80 28 27</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <button
            onClick={handleNewOrder}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300"
          >
            <span>Nouvelle commande</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default ConfirmationPage

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CreditCard, Shield, CheckCircle, AlertCircle, ArrowLeft, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSupabaseSession } from '@/hooks/useSupabaseSession'

const PaymentForm = () => {
  const router = useRouter()
  const { user } = useSupabaseSession()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    setIsProcessing(true)
    setError('')

    try {
      const orderId = localStorage.getItem('currentOrderId')
      const orderPrice = localStorage.getItem('currentOrderPrice')
      
      if (!orderId) {
        throw new Error('Aucune commande trouvée')
      }

      const amount = parseFloat(orderPrice || '29.90')

      // Create checkout via our API
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          amount: amount,
          currency: 'eur'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création du paiement')
      }

      const { checkoutUrl } = await response.json()
      
      // Redirect to secure checkout page
      window.location.href = checkoutUrl
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Lock className="w-6 h-6 mr-2 text-primary-600" />
          Méthodes de paiement
        </h3>
        
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 rounded-xl p-5">
            <p className="text-primary-800 font-medium">
              Vous serez redirigé vers notre page de paiement sécurisée pour finaliser votre commande.
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="bg-white w-12 h-8 rounded flex items-center justify-center mb-2">
                <div className="bg-blue-700 w-8 h-5 rounded-sm"></div>
              </div>
              <span className="text-xs font-medium text-gray-700">Visa</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="bg-white w-12 h-8 rounded flex items-center justify-center mb-2">
                <div className="bg-red-600 w-8 h-5 rounded-sm"></div>
              </div>
              <span className="text-xs font-medium text-gray-700">Mastercard</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="bg-white w-12 h-8 rounded flex items-center justify-center mb-2">
                <div className="bg-yellow-500 w-8 h-5 rounded-sm"></div>
              </div>
              <span className="text-xs font-medium text-gray-700">CMI</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>Paiement 100% sécurisé et crypté</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-white text-gray-700 py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2 border border-gray-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
        
        <button
          type="submit"
          disabled={isProcessing}
          className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Redirection sécurisée...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Payer {localStorage.getItem('currentOrderPrice') || '29,90'}€</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

interface OrderData {
  id: string
  quantity: number
  totalPrice: number
  [key: string]: any
}

const PaymentPage = () => {
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const orderId = localStorage.getItem('currentOrderId')
    if (!orderId) {
      router.push('/')
      return
    }

    // Fetch order data from our API
    fetch(`/api/orders/${orderId}`, {
      credentials: 'include',
    })
    .then(res => res.json())
    .then(data => {
      if (data.order) {
        setOrderData(data.order)
      } else {
        router.push('/')
      }
    })
    .catch(() => router.push('/'))
  }, [router])

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8 sm:py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Paiement sécurisé
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Finalisez votre commande avec un paiement 100% sécurisé
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Résumé de la commande</h3>
              
              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-gray-600">Service</span>
                    <p className="font-semibold text-gray-900 mt-1">Carte grise standard</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Quantité</span>
                    <p className="font-semibold text-gray-900 mt-1">{orderData?.quantity || 0}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-5">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {orderData?.totalPrice?.toFixed(2) || '0.00'}€
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Confirmation immédiate par email</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Traitement sous 24 heures</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Support client disponible</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <PaymentForm />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 sm:mt-16 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-gray-600 bg-white rounded-2xl py-4 px-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>SSL Sécurisé</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>CB Visa Mastercard</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-yellow-500" />
              <span>CMI</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentPage
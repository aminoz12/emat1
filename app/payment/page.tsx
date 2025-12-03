'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CreditCard, Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
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

      // Create SumUp checkout via our API
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId,
          amount: amount, // SumUp expects amount in euros, not cents
          currency: 'eur',
          provider: 'sumup'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création du paiement')
      }

      const { checkoutUrl } = await response.json()
      
      // Redirect to SumUp checkout page
      window.location.href = checkoutUrl
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Paiement avec SumUp</h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              Vous serez redirigé vers la page de paiement sécurisée de SumUp pour finaliser votre commande.
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Shield className="w-5 h-5 text-green-600" />
            <span>Paiement 100% sécurisé par SumUp</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
        
        <button
          type="submit"
          disabled={isProcessing}
          className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Redirection vers SumUp...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Payer {localStorage.getItem('currentOrderPrice') || '29,90'}€ avec SumUp</span>
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-16">
      <div className="container max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Paiement sécurisé
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Finalisez votre commande avec un paiement 100% sécurisé via SumUp
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Résumé de la commande</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">Service</span>
                  <p className="font-semibold text-gray-900">Carte grise standard</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Quantité</span>
                  <p className="font-semibold text-gray-900">{orderData?.quantity || 0}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {orderData?.totalPrice?.toFixed(2) || '0.00'}€
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Confirmation par email</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Traitement en 24h</span>
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
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>SSL Sécurisé</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <span>SumUp</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-primary-600" />
              <span>Sécurisé</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentPage
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PaymentReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const handlePaymentReturn = async () => {
      // SumUp widget returns these parameters after payment
      const orderId = searchParams.get('orderId') || searchParams.get('checkout_reference')
      const checkoutId = searchParams.get('checkout_id') || searchParams.get('id')
      const status = searchParams.get('status')

      if (!orderId && !checkoutId) {
        setStatus('failed')
        setError('Aucun identifiant de commande ou de paiement trouvé')
        return
      }

      try {
        // Verify payment status with backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          throw new Error('Non autorisé')
        }

        // First, check status from URL parameter (quick check)
        if (status === 'SUCCESS' || status === 'PAID') {
          // Verify with backend to ensure accuracy
          if (checkoutId) {
            const verifyResponse = await fetch(`${backendUrl}/payments/verify-payment/${checkoutId}`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
            })

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json()
              if (verifyData.status === 'PAID') {
                setStatus('success')
                setTimeout(() => {
                  router.push(`/payment-success?orderId=${orderId}`)
                }, 2000)
                return
              }
            }
          } else {
            // No checkoutId but status says success - trust it but log warning
            console.warn('Payment status is SUCCESS but no checkoutId available for verification')
            setStatus('success')
            setTimeout(() => {
              router.push(`/payment-success?orderId=${orderId}`)
            }, 2000)
            return
          }
        } else if (status === 'FAILED' || status === 'CANCELLED' || status === 'EXPIRED') {
          setStatus('failed')
          setTimeout(() => {
            router.push(`/payment-cancelled?orderId=${orderId}`)
          }, 2000)
          return
        }

        // If no status in URL or unclear, verify payment with backend
        if (checkoutId) {
          const verifyResponse = await fetch(`${backendUrl}/payments/verify-payment/${checkoutId}`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          })

          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json()
            if (verifyData.status === 'PAID') {
              setStatus('success')
              setTimeout(() => {
                router.push(`/payment-success?orderId=${orderId}`)
              }, 2000)
            } else {
              setStatus('failed')
              setTimeout(() => {
                router.push(`/payment-cancelled?orderId=${orderId}`)
              }, 2000)
            }
          } else {
            const errorData = await verifyResponse.json().catch(() => ({}))
            setStatus('failed')
            setError(errorData.error || errorData.message || 'Impossible de vérifier le statut du paiement')
            setTimeout(() => {
              router.push(`/payment-cancelled?orderId=${orderId || ''}`)
            }, 3000)
          }
        } else {
          setStatus('failed')
          setError('Informations de paiement incomplètes. Aucun identifiant de checkout trouvé.')
          setTimeout(() => {
            router.push(`/payment-cancelled?orderId=${orderId || ''}`)
          }, 3000)
        }
      } catch (err: any) {
        console.error('Payment return error:', err)
        setStatus('failed')
        setError(err.message || 'Une erreur est survenue')
        setTimeout(() => {
          router.push(`/payment-cancelled?orderId=${orderId || ''}`)
        }, 3000)
      }
    }

    handlePaymentReturn()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérification du paiement...</h2>
            <p className="text-gray-600">Veuillez patienter pendant que nous vérifions votre paiement.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h2>
            <p className="text-gray-600">Redirection en cours...</p>
          </>
        )}
        
        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement échoué</h2>
            <p className="text-gray-600 mb-4">{error || 'Le paiement n\'a pas pu être traité.'}</p>
            <p className="text-sm text-gray-500">Redirection en cours...</p>
          </>
        )}
      </div>
    </div>
  )
}


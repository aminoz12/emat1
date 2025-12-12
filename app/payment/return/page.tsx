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
  const [countdown, setCountdown] = useState(10)

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

        let paymentSuccess = false

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
                paymentSuccess = true
              }
            }
          } else {
            // No checkoutId but status says success - trust it but log warning
            console.warn('Payment status is SUCCESS but no checkoutId available for verification')
            paymentSuccess = true
          }
        } else if (status === 'FAILED' || status === 'CANCELLED' || status === 'EXPIRED') {
          paymentSuccess = false
        } else if (checkoutId) {
          // If no status in URL or unclear, verify payment with backend
          const verifyResponse = await fetch(`${backendUrl}/payments/verify-payment/${checkoutId}`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          })

          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json()
            paymentSuccess = verifyData.status === 'PAID'
          } else {
            const errorData = await verifyResponse.json().catch(() => ({}))
            setError(errorData.error || errorData.message || 'Impossible de vérifier le statut du paiement')
            paymentSuccess = false
          }
        } else {
          setError('Informations de paiement incomplètes. Aucun identifiant de checkout trouvé.')
          paymentSuccess = false
        }

        // Set status
        setStatus(paymentSuccess ? 'success' : 'failed')

        // Send message to parent window if in popup
        if (window.opener) {
          if (paymentSuccess) {
            window.opener.postMessage({
              type: 'SUMPUP_PAYMENT_SUCCESS',
              orderId: orderId
            }, window.location.origin)
          } else {
            window.opener.postMessage({
              type: 'SUMPUP_PAYMENT_FAILED',
              orderId: orderId,
              error: error || 'Le paiement a échoué'
            }, window.location.origin)
          }
        }

        // Start countdown and redirect after 10 seconds
        let seconds = 10
        const countdownInterval = setInterval(() => {
          seconds--
          setCountdown(seconds)
          if (seconds <= 0) {
            clearInterval(countdownInterval)
            if (window.opener) {
              // Close popup if opened from popup
              window.close()
            } else {
              // Redirect to dashboard if not in popup
              router.push('/dashboard')
            }
          }
        }, 1000)

      } catch (err: any) {
        console.error('Payment return error:', err)
        setStatus('failed')
        setError(err.message || 'Une erreur est survenue')
        
        // Send error message to parent if in popup
        if (window.opener) {
          window.opener.postMessage({
            type: 'SUMPUP_PAYMENT_FAILED',
            error: err.message || 'Une erreur est survenue'
          }, window.location.origin)
        }

        // Redirect after 10 seconds
        setTimeout(() => {
          if (window.opener) {
            window.close()
          } else {
            router.push('/dashboard')
          }
        }, 10000)
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
            <p className="text-gray-600 mb-2">Votre paiement a été traité avec succès.</p>
            <p className="text-sm text-gray-500">
              Retour à votre espace dans {countdown} seconde{countdown > 1 ? 's' : ''}...
            </p>
            <button
              onClick={() => {
                if (window.opener) {
                  window.close()
                } else {
                  router.push('/dashboard')
                }
              }}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Retourner maintenant
            </button>
          </>
        )}
        
        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement échoué</h2>
            <p className="text-gray-600 mb-4">{error || 'Le paiement n\'a pas pu être traité.'}</p>
            <p className="text-sm text-gray-500 mb-4">
              Retour à votre espace dans {countdown} seconde{countdown > 1 ? 's' : ''}...
            </p>
            <button
              onClick={() => {
                if (window.opener) {
                  window.close()
                } else {
                  router.push('/dashboard')
                }
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </>
        )}
      </div>
    </div>
  )
}


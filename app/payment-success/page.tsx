'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Mail, Phone, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const CONTACT_EMAIL = 'ematricule.info@gmail.com'
const CONTACT_PHONE = '01 47 85 10 00'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(15)
  const isPopup = typeof window !== 'undefined' && !!window.opener

  const goToDashboard = useCallback(() => {
    if (typeof window === 'undefined') return
    if (window.opener) {
      window.opener.postMessage({ type: 'REDIRECT_TO_DASHBOARD' }, window.location.origin)
      window.close()
    } else {
      router.push('/dashboard')
    }
  }, [router])

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    if (!orderId) {
      if (!isPopup) router.push('/dashboard')
      return
    }

    const fetchOrderData = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (!error) setOrderData(data)
      } catch (err) {
        console.error('Error fetching order:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderData()
  }, [searchParams, isPopup, router])

  // 15 second countdown then redirect to dashboard / close popup
  useEffect(() => {
    if (loading) return
    let mounted = true
    const t = setInterval(() => {
      if (!mounted) return
      setCountdown((prev) => {
        if (prev <= 1) return 0
        return prev - 1
      })
    }, 1000)
    return () => {
      mounted = false
      clearInterval(t)
    }
  }, [loading])

  useEffect(() => {
    if (!loading && countdown === 0 && !redirectedRef.current) {
      redirectedRef.current = true
      goToDashboard()
    }
  }, [loading, countdown, goToDashboard])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8 px-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 max-w-lg w-full relative">
        {/* Close button (popup) */}
        {isPopup && (
          <button
            type="button"
            onClick={goToDashboard}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fermer et accéder à mon espace"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Paiement réussi
          </h1>
          <p className="text-gray-600 mb-1">
            Votre commande a bien été reçue.
          </p>
          <p className="text-gray-600 mb-6">
            Vous serez notifié sous peu par email. Notre équipe traite votre dossier dans les plus brefs délais.
          </p>

          {orderData?.reference && (
            <p className="text-sm text-gray-500 mb-6">
              Référence commande : <span className="font-semibold text-gray-700">{orderData.reference}</span>
            </p>
          )}

          {/* Contact */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Nous contacter</h2>
            <div className="space-y-2 text-sm">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                {CONTACT_EMAIL}
              </a>
              <a
                href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                {CONTACT_PHONE}
              </a>
            </div>
          </div>

          {/* Countdown */}
          <p className="text-sm text-gray-500 mb-4">
            Redirection vers votre espace client dans <span className="font-semibold text-primary-600">{countdown}</span> seconde{countdown !== 1 ? 's' : ''}...
          </p>

          <button
            type="button"
            onClick={goToDashboard}
            className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Fermer et accéder à mon espace
          </button>
        </div>
      </div>
    </div>
  )
}

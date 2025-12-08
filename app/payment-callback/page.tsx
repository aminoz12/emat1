'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Extract parameters from Sumup callback
    const checkoutId = searchParams.get('checkout_id')
    const orderId = searchParams.get('checkout_reference') || searchParams.get('orderId')
    const status = searchParams.get('status')

    // Redirect to payment return page with all parameters
    const params = new URLSearchParams()
    if (orderId) params.set('orderId', orderId)
    if (checkoutId) params.set('checkout_id', checkoutId)
    if (status) params.set('status', status)

    router.push(`/payment/return?${params.toString()}`)
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  )
}


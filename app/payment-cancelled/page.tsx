'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCancelledPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Paiement annulé
            </h1>
            <p className="text-gray-600">
              Votre paiement n'a pas été finalisé.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Aucun montant n'a été débité de votre compte. 
              Vous pouvez réessayer le paiement à tout moment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {orderId && (
              <Link
                href={`/payment?orderId=${orderId}`}
                className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Réessayer le paiement
              </Link>
            )}
            <button
              onClick={() => router.back()}
              className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors border border-gray-300 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Besoin d'aide ? Contactez notre support client.
            </p>
            <Link
              href="/contact"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Contacter le support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


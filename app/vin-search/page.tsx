'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Car, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const VinSearchPage = () => {
  const [vin, setVin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  interface VehicleData {
    make?: string
    model?: string
    [key: string]: any
  }

  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vin.trim()) return

    setIsLoading(true)
    setError('')
    setVehicleData(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/decode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ vin }),
      })

      if (!response.ok) {
        throw new Error('Unable to decode VIN')
      }

      const data = await response.json()
      setVehicleData(data)
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    if (vehicleData) {
      // Store vehicle data in localStorage or context
      localStorage.setItem('vehicleData', JSON.stringify(vehicleData))
      router.push('/service-selection')
    }
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
            Recherche de véhicule
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Entrez votre numéro VIN ou votre numéro d'immatriculation pour commencer votre demande
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="vin" className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro VIN ou Immatriculation
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="vin"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="Ex: 1HGBH41JXMN109186 ou AB-123-CD"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  maxLength={17}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={!vin.trim() || isLoading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-2xl font-semibold text-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Recherche en cours...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Rechercher le véhicule</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          {vehicleData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center space-x-2 text-green-700 mb-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Véhicule trouvé !</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-600">Marque</span>
                  <p className="font-semibold text-gray-900">{vehicleData?.make || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Modèle</span>
                  <p className="font-semibold text-gray-900">{vehicleData?.model || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Année</span>
                  <p className="font-semibold text-gray-900">{vehicleData?.year || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Moteur</span>
                  <p className="font-semibold text-gray-900">{vehicleData?.engine || 'Non spécifié'}</p>
                </div>
                {vehicleData?.fuelType && (
                  <div>
                    <span className="text-sm text-gray-600">Carburant</span>
                    <p className="font-semibold text-gray-900">{vehicleData.fuelType}</p>
                  </div>
                )}
                {vehicleData?.color && (
                  <div>
                    <span className="text-sm text-gray-600">Couleur</span>
                    <p className="font-semibold text-gray-900">{vehicleData.color}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-2xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Car className="w-5 h-5" />
                <span>Continuer avec ce véhicule</span>
              </button>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-gray-600 mb-4">
            Vous ne trouvez pas votre véhicule ?
          </p>
          <button
            onClick={() => router.push('/contact')}
            className="text-primary-600 hover:text-primary-700 font-semibold underline"
          >
            Contactez notre support
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default VinSearchPage

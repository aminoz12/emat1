'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FileText, Car, ArrowLeft, CheckCircle, Shield, Clock, Zap, FileCheck } from 'lucide-react'
import { useSupabaseSession } from '@/hooks/useSupabaseSession'

export default function NouvelleDemarchePage() {
  const { user, loading } = useSupabaseSession()
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<'carte-grise' | 'plaque' | 'coc' | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/connexion')
      return
    }
  }, [user, loading, router])

  const handleSelect = (type: 'carte-grise' | 'plaque' | 'coc') => {
    setSelectedType(type)
    // Small delay for visual feedback before navigation
    setTimeout(() => {
      if (type === 'carte-grise') {
        router.push('/carte-grise')
      } else if (type === 'plaque') {
        router.push('/plaque-immatriculation')
      } else if (type === 'coc') {
        router.push('/notre-mission')
      }
    }, 300)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour au tableau de bord</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Choisissez votre démarche
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sélectionnez le type de service dont vous avez besoin pour continuer
          </p>
        </motion.div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Carte Grise Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden group ${
              selectedType === 'carte-grise'
                ? 'border-primary-600 shadow-xl scale-105'
                : 'border-gray-200 hover:border-primary-400 hover:shadow-xl'
            }`}
            onClick={() => handleSelect('carte-grise')}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-50"></div>
            
            <div className="relative p-8">
              {/* Icon */}
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${
                selectedType === 'carte-grise'
                  ? 'bg-primary-600 text-white scale-110'
                  : 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'
              }`}>
                <FileText className="w-10 h-10" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Carte Grise
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Effectuez toutes vos démarches de carte grise en ligne rapidement et en toute sécurité.
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    selectedType === 'carte-grise' ? 'text-primary-600' : 'text-green-600'
                  }`} />
                  <span className="text-gray-700 text-sm">Changement de titulaire</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    selectedType === 'carte-grise' ? 'text-primary-600' : 'text-green-600'
                  }`} />
                  <span className="text-gray-700 text-sm">Changement d'adresse</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    selectedType === 'carte-grise' ? 'text-primary-600' : 'text-green-600'
                  }`} />
                  <span className="text-gray-700 text-sm">Demande de duplicata</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    selectedType === 'carte-grise' ? 'text-primary-600' : 'text-green-600'
                  }`} />
                  <span className="text-gray-700 text-sm">Et bien plus encore...</span>
                </li>
              </ul>

              {/* Benefits */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-primary-600" />
                  <span>24h max</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-primary-600" />
                  <span>Sécurisé</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="w-4 h-4 text-primary-600" />
                  <span>Rapide</span>
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedType === 'carte-grise' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </div>

            {/* Hover Effect */}
            <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none transition-all duration-300 ${
              selectedType === 'carte-grise'
                ? 'border-primary-600'
                : 'border-transparent group-hover:border-primary-300'
            }`}></div>
          </motion.div>

          {/* Plaque Immatriculation Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden group ${
              selectedType === 'plaque'
                ? 'border-primary-600 shadow-xl scale-105'
                : 'border-gray-200 hover:border-primary-400 hover:shadow-xl'
            }`}
            onClick={() => handleSelect('plaque')}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50"></div>
            
            <div className="relative p-8">
              {/* Icon */}
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${
                selectedType === 'plaque'
                  ? 'bg-primary-600 text-white scale-110'
                  : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
              }`}>
                <Car className="w-10 h-10" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Plaque Immatriculation
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Personnalisez votre plaque d'immatriculation avec votre numéro de département préféré.
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    selectedType === 'plaque' ? 'text-primary-600' : 'text-green-600'
                  }`} />
                  <span className="text-gray-700 text-sm">Choix du département</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    selectedType === 'plaque' ? 'text-primary-600' : 'text-green-600'
                  }`} />
                  <span className="text-gray-700 text-sm">Prévisualisation en temps réel</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    selectedType === 'plaque' ? 'text-primary-600' : 'text-green-600'
                  }`} />
                  <span className="text-gray-700 text-sm">Livraison rapide</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    selectedType === 'plaque' ? 'text-primary-600' : 'text-green-600'
                  }`} />
                  <span className="text-gray-700 text-sm">Qualité garantie</span>
                </li>
              </ul>

              {/* Benefits */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Livraison rapide</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Conforme</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Personnalisable</span>
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedType === 'plaque' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </div>

            {/* Hover Effect */}
            <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none transition-all duration-300 ${
              selectedType === 'plaque'
                ? 'border-primary-600'
                : 'border-transparent group-hover:border-primary-300'
            }`}></div>
          </motion.div>

          {/* COC Card */}
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden group ${
              selectedType === 'coc'
                ? 'border-primary-600 shadow-xl scale-105'
                : 'border-gray-200 hover:border-primary-400 hover:shadow-xl'
            }`}
            onClick={() => handleSelect('coc')}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-50"></div>
            
            <div className="relative p-8">
              {/* Icon */}
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${
                selectedType === 'coc'
                  ? 'bg-primary-600 text-white scale-110'
                  : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
              }`}>
                <FileCheck className="w-10 h-10" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                COC
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                Obtenez votre Certificat de Conformité pour votre véhicule rapidement et en toute simplicité.
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    selectedType === 'coc' ? 'text-primary-600' : 'text-green-600'
                  }`} />
                  <span className="text-gray-700 text-sm">Toutes marques disponibles</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    selectedType === 'coc' ? 'text-primary-600' : 'text-green-600'
                  }`} />
                  <span className="text-gray-700 text-sm">Livraison digitale rapide</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    selectedType === 'coc' ? 'text-primary-600' : 'text-green-600'
                  }`} />
                  <span className="text-gray-700 text-sm">Document officiel</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    selectedType === 'coc' ? 'text-primary-600' : 'text-green-600'
                  }`} />
                  <span className="text-gray-700 text-sm">Support multilingue</span>
                </li>
              </ul>

              {/* Benefits */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Rapide</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Officiel</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>Numérique</span>
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedType === 'coc' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </div>

            {/* Hover Effect */}
            <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none transition-all duration-300 ${
              selectedType === 'coc'
                ? 'border-primary-600'
                : 'border-transparent group-hover:border-primary-300'
            }`}></div>
          </motion.div>
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600">
            Besoin d'aide ?{' '}
            <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-semibold">
              Contactez notre support
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}


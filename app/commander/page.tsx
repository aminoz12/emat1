'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Car, 
  FileCheck, 
  CheckCircle, 
  Clock, 
  Shield, 
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function CommanderPage() {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const products = [
    {
      id: 'carte-grise',
      title: 'Carte grise',
      description: 'Réalisez toutes vos démarches de carte grise en ligne, rapidement et en toute sécurité.',
      icon: FileText,
      href: '/carte-grise',
      gradient: 'from-primary-50 to-primary-100',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      features: [
        'Changement de titulaire',
        'Changement d\'adresse',
        'Demande de duplicata',
        'Enregistrement de cession'
      ],
      benefits: [
        { icon: Clock, text: '24h max', color: 'text-primary-600' },
        { icon: Shield, text: 'Sécurisé', color: 'text-primary-600' },
        { icon: Zap, text: 'Rapide', color: 'text-primary-600' }
      ]
    },
    {
      id: 'plaque',
      title: 'Plaques d\'immatriculation',
      description: 'Personnalisez votre plaque avec le département de votre choix.',
      icon: Car,
      href: '/plaque-immatriculation',
      gradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      features: [
        'Choix du département',
        'Prévisualisation en temps réel',
        'Livraison rapide',
        'Qualité garantie'
      ],
      benefits: [
        { icon: Clock, text: 'Livraison rapide', color: 'text-blue-600' },
        { icon: Shield, text: 'Conforme', color: 'text-blue-600' },
        { icon: Zap, text: 'Personnalisable', color: 'text-blue-600' }
      ]
    },
    {
      id: 'coc',
      title: 'COC (Certificat de Conformité)',
      description: 'Obtenez votre Certificat de Conformité officiel simplement et rapidement.',
      icon: FileCheck,
      href: '/notre-mission',
      gradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      features: [
        'Toutes marques disponibles',
        'Livraison digitale rapide',
        'Document officiel',
        'Support multilingue'
      ],
      benefits: [
        { icon: Clock, text: 'Rapide', color: 'text-purple-600' },
        { icon: Shield, text: 'Officiel', color: 'text-purple-600' },
        { icon: Zap, text: 'Numérique', color: 'text-purple-600' }
      ]
    }
  ]

  const handleCardClick = (href: string) => {
    router.push(href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 py-3 text-sm font-medium">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Service sécurisé</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Traitement rapide</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Commande en 2 minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-100 border border-primary-200 rounded-full mb-6 shadow-sm">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-bold text-primary-700">Commandez en ligne</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Choisissez votre service
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Sélectionnez le service souhaité et passez votre commande en quelques clics.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {products.map((product, index) => {
            const Icon = product.icon
            const isHovered = hoveredCard === product.id

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredCard(product.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-primary-400 hover:-translate-y-2"
                onClick={() => handleCardClick(product.href)}
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${product.gradient}`}></div>

                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                {/* Content */}
                <div className="relative p-8 md:p-10">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`relative w-20 h-20 md:w-24 md:h-24 ${product.iconBg} rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shadow-lg`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                    <Icon className={`w-10 h-10 md:w-12 md:h-12 ${product.iconColor} relative z-10`} />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                    {product.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-8 leading-relaxed text-base">
                    {product.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {product.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + idx * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${product.iconColor}`} />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Benefits */}
                  <div className="flex items-center gap-3 pt-6 border-t-2 border-gray-100 mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                      {product.benefits.map((benefit, idx) => {
                        const BenefitIcon = benefit.icon
                        return (
                          <div key={idx} className="flex items-center gap-1.5">
                            <BenefitIcon className={`w-4 h-4 ${benefit.color}`} />
                            <span className="text-sm font-medium text-gray-700">{benefit.text}</span>
                            {idx < product.benefits.length - 1 && <span className="text-gray-300 mx-1">•</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-primary-600 font-bold text-base group-hover:text-primary-700 transition-colors"
                  >
                    <span>Commander maintenant</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </motion.div>
                </div>

                {/* Hover Border Effect */}
                <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none transition-all duration-300 ${
                  isHovered ? 'border-primary-400' : 'border-transparent'
                }`}></div>

                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 md:p-10 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-primary-400"></div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Besoin d'aide pour choisir ?
            </h3>
            <p className="text-gray-600 mb-8 text-base">
              Notre équipe vous accompagne dans toutes vos démarches.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
              >
                <span>Nous contacter</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/aide"
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:border-primary-300 hover:bg-primary-50 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Centre d'aide
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


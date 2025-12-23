import type { Metadata } from 'next'
import { CheckCircle, Shield, Zap, FileCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Qui sommes-nous ? - E-matricule',
  description: 'e-matricule est une plateforme spécialisée dans les démarches d\'immatriculation en ligne, opérée par Espace Auto 92.',
}

export default function AboutPage() {
  const services = [
    {
      icon: Zap,
      title: 'Service rapide',
      description: 'Traitement accéléré de vos démarches administratives',
    },
    {
      icon: FileCheck,
      title: 'Vérification complète',
      description: 'Contrôle exhaustif de tous vos documents avant transmission',
    },
    {
      icon: Shield,
      title: 'Transmission sécurisée',
      description: 'Envoi sécurisé et conforme aux services SIV / ANTS',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Qui sommes-nous ?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Votre partenaire de confiance pour toutes vos démarches d'immatriculation
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                <strong>e-matricule</strong> est une plateforme spécialisée dans les démarches d'immatriculation en ligne, opérée par <strong>Espace Auto 92</strong>.
              </p>
            </div>

            {/* Services Section */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Nous accompagnons chaque client
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Nous accompagnons chaque client dans ses démarches administratives liées à la carte grise, en offrant :
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {services.map((service, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                      <service.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600">
                      {service.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-200">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <p className="text-lg text-gray-700">
                    <strong>Une assistance personnalisée</strong> pour répondre à toutes vos questions et vous guider dans vos démarches.
                  </p>
                </div>
              </div>
            </div>

            {/* Plaques Section */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Fabrication de plaques d'immatriculation
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Nous proposons également la <strong>fabrication de plaques d'immatriculation homologuées</strong>, auto et moto, conformes aux normes en vigueur.
              </p>
            </div>

            {/* Mission Section */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 border border-primary-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Notre mission
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <p className="text-lg text-gray-700">
                    <strong>Simplifier vos démarches</strong> administratives liées à l'immatriculation
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <p className="text-lg text-gray-700">
                    <strong>Vous éviter les erreurs</strong> administratives grâce à notre expertise
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <p className="text-lg text-gray-700">
                    <strong>Garantir un traitement sécurisé et conforme</strong> à la réglementation en vigueur
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


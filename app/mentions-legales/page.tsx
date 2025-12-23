import type { Metadata } from 'next'
import { Mail, MapPin, Building2, User, Server } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mentions légales - E-matricule',
  description: 'Mentions légales du site e-matricule, opéré par Espace Auto 92.',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Mentions légales
            </h1>
            <p className="text-xl text-gray-600">
              Informations légales concernant e-matricule
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            
            {/* Informations générales */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informations générales
              </h2>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
                <div className="flex items-start space-x-4">
                  <Building2 className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Nom commercial :</p>
                    <p className="text-gray-700">e-matricule</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Building2 className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Exploitant :</p>
                    <p className="text-gray-700">Espace Auto 92</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Adresse :</p>
                    <p className="text-gray-700">
                      123 Avenue des Champs-Élysées<br />
                      75008 Paris, France
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Mail className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Email :</p>
                    <a href="mailto:contact@ematricule.fr" className="text-primary-600 hover:text-primary-700">
                      contact@ematricule.fr
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <User className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Responsable de publication :</p>
                    <p className="text-gray-700">Espace Auto 92</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Server className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Hébergeur du site :</p>
                    <p className="text-gray-700">[À compléter : OVH, Hostinger, etc.]</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activité */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Activité
              </h2>
              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-200">
                <ul className="list-disc list-inside text-gray-700 space-y-3 ml-2">
                  <li>Prestataire administratif pour démarches carte grise</li>
                  <li>Vente de plaques d'immatriculation homologuées</li>
                </ul>
              </div>
            </div>

            {/* Avertissement */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Information importante
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                <p className="text-gray-700 leading-relaxed">
                  Le site e-matricule est un service indépendant, non affilié à l'ANTS ou à un organisme public.
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Dernière mise à jour : {new Date().getFullYear()}
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}


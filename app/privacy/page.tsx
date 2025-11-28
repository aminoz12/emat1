import type { Metadata } from 'next'
import { Shield, Database, Target, Scale, Clock, Share2, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Politique de confidentialité (RGPD) - EMatricule',
  description: 'Politique de confidentialité et protection des données personnelles de e-matricule.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Politique de confidentialité (RGPD)
            </h1>
            <p className="text-xl text-gray-600">
              Protection de vos données personnelles
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-lg text-gray-700 leading-relaxed">
                Cette Politique décrit la manière dont e-matricule collecte, traite et protège les données personnelles.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <Database className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  1. Données collectées
                </h2>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Nom, prénom</li>
                  <li>Adresse</li>
                  <li>Coordonnées</li>
                  <li>Documents d'immatriculation</li>
                  <li>Informations liées au véhicule</li>
                  <li>Historique de commande</li>
                  <li>Cookies (voir <a href="/cookies" className="text-primary-600 hover:text-primary-700 underline">Politique Cookies</a>)</li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  2. Finalités
                </h2>
              </div>
              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-200">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Traitement administratif des démarches carte grise</li>
                  <li>Création des dossiers ANTS/SIV</li>
                  <li>Communication avec le Client</li>
                  <li>Sécurisation du site</li>
                  <li>Facturation</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <Scale className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  3. Base légale
                </h2>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Exécution contractuelle</li>
                  <li>Obligation légale (SIV/ANTS)</li>
                  <li>Consentement (cookies, email)</li>
                  <li>Intérêt légitime (sécurité)</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  4. Durée de conservation
                </h2>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Documents carte grise : <strong>5 ans</strong></li>
                  <li>Données compte client : <strong>durée de l'utilisation</strong></li>
                  <li>Cookies : voir <a href="/cookies" className="text-primary-600 hover:text-primary-700 underline">Politique Cookies</a></li>
                </ul>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <Share2 className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  5. Partage des données
                </h2>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                <p className="text-gray-700 font-semibold mb-3">
                  Uniquement avec :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>ANTS / Ministère de l'Intérieur</li>
                  <li>Professionnels habilités SIV</li>
                  <li>Prestataires techniques sécurisés (hébergement)</li>
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <UserCheck className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  6. Vos droits
                </h2>
              </div>
              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-200">
                <p className="text-gray-700 mb-4">
                  Droit d'accès, rectification, suppression, opposition, portabilité.
                </p>
                <p className="text-gray-700">
                  <strong>Email de contact :</strong>{' '}
                  <a href="mailto:contact@ematricule.fr" className="text-primary-600 hover:text-primary-700 underline">
                    contact@ematricule.fr
                  </a>
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


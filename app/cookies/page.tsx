import type { Metadata } from 'next'
import { Cookie, Shield, BarChart3, Settings, Target, AlertCircle, Clock, Trash2, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Politique cookies - E-matricule',
  description: 'Politique d\'utilisation des cookies sur le site e-matricule.',
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Cookie className="w-12 h-12 text-primary-600" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Politique Cookies
            </h1>
            <p className="text-xl text-gray-600">
              e-matricule – Opéré par Espace Auto 92
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            
            {/* Section 1 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <Cookie className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  1. Qu'est-ce qu'un cookie ?
                </h2>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  Petit fichier enregistré sur votre appareil permettant d'améliorer la navigation, mémoriser vos préférences et produire des statistiques.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  2. Types de cookies utilisés
                </h2>
              </div>
              
              <div className="space-y-6">
                {/* Cookies nécessaires */}
                <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Cookies nécessaires
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-2">
                    Fonctionnement du site, sécurité, sessions.
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">
                    Consentement non requis.
                  </p>
                </div>

                {/* Cookies statistiques */}
                <div className="bg-orange-50 rounded-2xl p-6 border-l-4 border-orange-500">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Cookies statistiques
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-2">
                    Mesure d'audience (Google Analytics, Matomo).
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">
                    Consentement requis.
                  </p>
                </div>

                {/* Cookies de personnalisation */}
                <div className="bg-purple-50 rounded-2xl p-6 border-l-4 border-purple-500">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Cookies de personnalisation
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-2">
                    Affichage, préférences utilisateur.
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">
                    Consentement requis.
                  </p>
                </div>

                {/* Cookies marketing */}
                <div className="bg-red-50 rounded-2xl p-6 border-l-4 border-red-500">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Cookies marketing
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-2">
                    Facebook Pixel, Google Ads.
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">
                    Consentement explicite requis.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  3. Consentement
                </h2>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Bandeau cookies lors de la première visite</li>
                  <li>Refus aussi simple que l'acceptation</li>
                  <li>Consentement conservé 6 mois</li>
                  <li>Pas de dépôt de cookies non essentiels sans accord</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  4. Durée
                </h2>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                  <li>Cookies : <strong>max 13 mois</strong></li>
                  <li>Données associées : <strong>25 mois</strong></li>
                </ul>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  5. Gestion des cookies
                </h2>
              </div>
              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-200">
                <p className="text-gray-700 leading-relaxed">
                  Depuis le bandeau ou depuis le navigateur (Chrome, Safari, Firefox…).
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  6. Cookies utilisés (exemples)
                </h2>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Cookies nécessaires :</p>
                    <p className="text-gray-700">PHPSESSID, cookie_consent</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Cookies statistiques :</p>
                    <p className="text-gray-700">_ga, _gid, _pk_id.*</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Cookies marketing :</p>
                    <p className="text-gray-700">_fbp, _gcl_au</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  7. Responsable du traitement
                </h2>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <p className="text-gray-700 mb-2">
                  <strong>Espace Auto 92</strong>
                </p>
                <p className="text-gray-700">
                  123 Avenue des Champs-Élysées<br />
                  75008 Paris, France
                </p>
                <p className="text-gray-700 mt-2">
                  <a href="mailto:contact@ematricule.fr" className="text-primary-600 hover:text-primary-700 underline">
                    contact@ematricule.fr
                  </a>
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <UserCheck className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  8. Vos droits
                </h2>
              </div>
              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-200">
                <p className="text-gray-700">
                  Accès, effacement, opposition, retrait du consentement, portabilité.
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


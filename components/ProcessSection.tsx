'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Globe, TrendingUp, Shield, Clock, Star, FileText, CreditCard, Truck, CheckCircle, FileCheck, Search, Plus, X, MessageCircle, HelpCircle } from 'lucide-react'

const ProcessSection = () => {
  const steps = [
    {
      number: 1,
      title: 'Commandez en 2 minutes',
      description: 'Complétez votre demande en ligne rapidement grâce à un formulaire simple et intuitif.',
      icon: '/time.png',
      color: 'bg-blue-500',
    },
    {
      number: 2,
      title: 'Paiement en 3X CB',
      description: 'Réglez votre commande en toute sécurité, avec la possibilité de payer en 3 fois sans frais par Carte bancaire.',
      icon: '/payment.png',
      color: 'bg-purple-500',
    },
    {
      number: 3,
      title: 'Livraison en 24/48h',
      description: 'Votre carte grise est produite puis envoyée en recommandé par l\'Imprimerie Nationale dans des délais très courts.',
      icon: '/truck.png',
      color: 'bg-green-500',
    },
    {
      number: 4,
      title: 'Service habilité par l\'État',
      description: 'Nous disposons de l\'habilitation officielle du Ministère de l\'Intérieur pour traiter vos démarches en toute conformité.',
      icon: '/ministre.png',
      color: 'bg-red-500',
    },
  ]

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 w-full max-w-full overflow-x-hidden">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
            On s'occupe de vos démarches
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Pionniers de l'immatriculation en ligne, nous avons conçu un service pensé pour vous : rapide, simple et parfaitement guidé à chaque étape. Notre objectif : rendre vos démarches d'immatriculation plus faciles que jamais.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mx-auto mb-3">
                <Image 
                  src={step.icon} 
                  alt={step.title}
                  width={160}
                  height={160}
                  className="w-36 h-36 md:w-40 md:h-40"
                />
              </div>
              <div className="relative inline-block mb-3">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl blur-sm opacity-30"></div>
                <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white px-4 py-1.5 rounded-2xl flex items-center justify-center font-bold text-base shadow-lg border-2 border-white/20">
                  <span className="relative z-10">{step.number}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="mt-8">
          <div className="relative">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-100/30 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary-50/40 to-transparent rounded-full blur-3xl"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start relative z-10">
              {/* Left Section - Text Content */}
              <div className="space-y-5">
                {/* Badge */}
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-700 uppercase tracking-wider px-5 py-2.5 bg-gradient-to-r from-primary-100 to-primary-50 border border-primary-200/50 rounded-full shadow-sm">
                    <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
                    Plateforme d'Immatriculation
                  </span>
                </div>
                
                {/* Main Heading */}
                <h3 className="text-3xl lg:text-4xl font-bold leading-tight">
                  <span className="text-gray-900">Pourquoi choisir </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  notre service ?
                  </span>
            </h3>
                
                {/* Description */}
                <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg">
                Nous simplifions totalement vos démarches d’immatriculation. Gagnez du temps, faites des
économies et bénéficiez de l’expertise d’une plateforme officielle habilitée.
            </p>
          </div>

              {/* Right Section - Feature Cards Grid */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {/* Card 1 - Rapide */}
                <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 shadow-lg hover:shadow-xl border border-blue-200/50 hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/20 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="mb-4 text-center">
                      <div className="mb-3 flex flex-col items-center">
                        <div className="flex-shrink-0 mb-3">
                          <Image
                            src="/rapid.png"
                            alt="Rapide"
                            width={112}
                            height={112}
                            className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                          />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">Rapide</h4>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                      Traitement express de votre dossier sous 24h, avec une livraison accélérée de votre carte
                      grise.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Économique */}
                <div className="group relative bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 shadow-lg hover:shadow-xl border border-green-200/50 hover:border-green-300 transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/20 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="mb-4 text-center">
                      <div className="mb-3 flex flex-col items-center">
                        <div className="flex-shrink-0 mb-3">
                          <Image
                            src="/eco.png"
                            alt="Économique"
                            width={112}
                            height={112}
                            className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                          />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">Économique</h4>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                      Profitez de tarifs clairs et accessibles, dès 15€ sans frais cachés.

                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Sécurisé */}
                <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 shadow-lg hover:shadow-xl border border-purple-200/50 hover:border-purple-300 transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/20 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="mb-4 text-center">
                      <div className="mb-3 flex flex-col items-center">
                        <div className="flex-shrink-0 mb-3">
                          <Image
                            src="/securise.png"
                            alt="Sécurisé"
                            width={112}
                            height={112}
                            className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                          />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">Sécurisé</h4>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                      Plateforme habilitée par le Ministère de l'Intérieur, avec un paiement en ligne 100 %
sécurisé.

                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 4 - Expert */}
                <div className="group relative bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-6 shadow-lg hover:shadow-xl border border-orange-200/50 hover:border-orange-300 transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/20 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="mb-4 text-center">
                      <div className="mb-3 flex flex-col items-center">
                        <div className="flex-shrink-0 mb-3">
                          <Image
                            src="/expert.png"
                            alt="Expert"
                            width={112}
                            height={112}
                            className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                          />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors">Expert</h4>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                      Des spécialistes de l'immatriculation à votre service depuis 2009, pour tous types de
véhicules.

                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 lg:mt-20">
          {/* Header */}
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Plus de 3 000 clients nous ont fait confiance
            </h3>
          </div>

          {/* Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Review Card 1 */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed text-base">
                "Grâce à EMatricule, je me sens plus informé et confiant dans mes démarches d'immatriculation que jamais auparavant."
              </p>
              <div className="flex justify-center pt-2">
                <Image
                  src="/trustpilot.png"
                  alt="Trustpilot"
                  width={100}
                  height={40}
                  className="w-24 h-auto object-contain"
                />
              </div>
            </div>

            {/* Review Card 2 */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed text-base">
                "EMatricule m'a permis de rester au top de mes démarches et de prendre des décisions rapidement et facilement."
              </p>
              <div className="flex justify-center pt-2">
                <Image
                  src="/google.png"
                  alt="Google"
                  width={100}
                  height={40}
                  className="w-24 h-auto object-contain"
                />
              </div>
            </div>

            {/* Review Card 3 */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed text-base">
                "L'équipe client d'EMatricule a fait preuve d'un dévouement exceptionnel pour m'aider à résoudre un problème de facturation."
              </p>
              <div className="flex justify-center pt-2">
                <Image
                  src="/reviews.png"
                  alt="Reviews"
                  width={160}
                  height={64}
                  className="w-40 h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-20 lg:mt-24 py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-4">
            {/* Title */}
            <div className="text-center mb-16 lg:mb-20">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Comment Ça Marche ?
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-700 mx-auto rounded-full"></div>
            </div>

            {/* Mobile: Sequential order 1-5, Desktop: Two columns with alternated layout */}
            <div className="space-y-12 lg:space-y-0">
              {/* Mobile View - Sequential order */}
              <div className="lg:hidden space-y-12">
                {/* Step 1 */}
                <div className="group relative">
                  <div className="flex items-start gap-6 w-full transition-all duration-300 hover:translate-x-2">
                    <div className="flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                        1
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="mb-4 flex items-center gap-2 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                        <FileText className="w-9 h-9 text-primary-600 group-hover:text-primary-700 transition-colors duration-300" strokeWidth={1.5} />
                        <CheckCircle className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                        <CheckCircle className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                        Commande en ligne
                      </h4>
                      <p className="text-gray-600 leading-relaxed text-base">
                      Complétez le formulaire en quelques instants : saisissez les informations de votre
véhicule et recevez votre devis immédiatement.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="group relative">
                  <div className="flex items-start gap-6 w-full transition-all duration-300 hover:translate-x-2">
                    <div className="flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                        2
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="mb-4 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                        <Shield className="w-9 h-9 text-primary-300 group-hover:text-primary-400 transition-colors duration-300" strokeWidth={1.5} />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                        Paiement sécurisé
                      </h4>
                      <p className="text-gray-600 leading-relaxed text-base">
                      Procédez au paiement en ligne en toute sérénité, avec la possibilité de régler en 3 fois
sans frais. Toutes les transactions sont entièrement sécurisées.  </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="group relative">
                  <div className="flex items-start gap-6 w-full transition-all duration-300 hover:translate-x-2">
                    <div className="flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                        3
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="mb-4 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                        <Truck className="w-9 h-9 text-primary-300 group-hover:text-primary-400 transition-colors duration-300" strokeWidth={1.5} />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                      Traitement de votre dossier
                      </h4>
                      <p className="text-gray-600 leading-relaxed text-base">
                      Nos experts prennent en charge votre demande sous 24h. Nous contrôlons vos
documents, finalisons les démarches administratives et validons votre
immatriculation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="group relative">
                  <div className="flex items-start gap-6 w-full transition-all duration-300 hover:translate-x-2">
                    <div className="flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                        4
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="mb-4 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                        <FileCheck className="w-9 h-9 text-primary-300 group-hover:text-primary-400 transition-colors duration-300" strokeWidth={1.5} />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                        Réception de votre carte grise
                      </h4>
                      <p className="text-gray-600 leading-relaxed text-base">
                      Votre carte grise officielle est éditée puis envoyée en recommandé par l'Imprimerie
                      Nationale, directement à votre adresse.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="group relative">
                  <div className="flex items-start gap-6 w-full transition-all duration-300 hover:translate-x-2">
                    <div className="flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                        5
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="mb-4 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                        <CheckCircle className="w-9 h-9 text-primary-300 group-hover:text-primary-400 transition-colors duration-300" strokeWidth={1.5} />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                        C'est terminé !
                      </h4>
                      <p className="text-gray-600 leading-relaxed text-base">
                      Votre véhicule est immatriculé. Il ne vous reste plus qu'à profiter de votre nouvelle
                      carte grise en toute tranquillité.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop View - Two columns with alternated layout */}
              <div className="hidden lg:grid lg:grid-cols-2 gap-8 lg:gap-20 relative">
                {/* Vertical Divider with gradient */}
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-200 to-transparent transform -translate-x-1/2"></div>

                {/* Left Column - Steps 2 and 4 */}
                <div className="space-y-20 lg:pt-24">
                  {/* Step 2 */}
                  <div className="group relative">
                    <div className="flex items-start gap-6 w-full transition-all duration-300 hover:translate-x-2">
                      <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                          2
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="mb-4 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                          <Shield className="w-9 h-9 text-primary-300 group-hover:text-primary-400 transition-colors duration-300" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                          Paiement sécurisé
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-base">
                        Procédez au paiement en ligne en toute sérénité, avec la possibilité de régler en 3 fois
sans frais. Toutes les transactions sont entièrement sécurisées.  </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="group relative">
                    <div className="flex items-start gap-6 w-full transition-all duration-300 hover:translate-x-2">
                      <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                          4
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="mb-4 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                          <FileCheck className="w-9 h-9 text-primary-300 group-hover:text-primary-400 transition-colors duration-300" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                          Réception de votre carte grise
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-base">
                        Votre carte grise officielle est éditée puis envoyée en recommandé par l'Imprimerie
                        Nationale, directement à votre adresse.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Steps 1, 3, and 5 */}
                <div className="space-y-20">
                  {/* Step 1 */}
                  <div className="group relative">
                    <div className="flex items-start gap-6 w-full transition-all duration-300 hover:translate-x-[-8px]">
                      <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                          1
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="mb-4 flex items-center gap-2 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                          <FileText className="w-9 h-9 text-primary-600 group-hover:text-primary-700 transition-colors duration-300" strokeWidth={1.5} />
                          <CheckCircle className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                          <CheckCircle className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                          Commande en ligne
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-base">
                        Complétez le formulaire en quelques instants : saisissez les informations de votre
véhicule et recevez votre devis immédiatement.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="group relative">
                    <div className="flex items-start gap-6 w-full transition-all duration-300 hover:translate-x-[-8px]">
                      <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                          3
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="mb-4 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                          <Truck className="w-9 h-9 text-primary-300 group-hover:text-primary-400 transition-colors duration-300" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                        Traitement de votre dossier
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-base">
                        Nos experts prennent en charge votre demande sous 24h. Nous contrôlons vos
documents, finalisons les démarches administratives et validons votre
immatriculation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="group relative">
                    <div className="flex items-start gap-6 w-full transition-all duration-300 hover:translate-x-[-8px]">
                      <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                          5
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="mb-4 transform transition-transform duration-300 group-hover:translate-y-[-2px]">
                          <CheckCircle className="w-9 h-9 text-primary-300 group-hover:text-primary-400 transition-colors duration-300" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                          C'est terminé !
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-base">
                        Votre véhicule est immatriculé. Il ne vous reste plus qu'à profiter de votre nouvelle
                        carte grise en toute tranquillité.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <PartnersCarousel />

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </section>
  )
}

const PartnersCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const partners = [
    { src: '/fed.png', alt: 'Federation Professionnelle Carte Grise En Ligne' },
    { src: '/macif.png', alt: 'MACIF' },
    { src: '/50partners.png', alt: '50 Partners' },
    { src: '/maif.png', alt: 'MAIF' },
    { src: '/tech.png', alt: 'La French Tech' },
  ]

  // Calculate how many pairs we can show (2 partners per slide on mobile)
  const totalPairs = Math.ceil(partners.length / 2)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPairs)
    }, 2000) // Change every 2 seconds

    return () => clearInterval(interval)
  }, [totalPairs])

  // Get the two partners to display for current index
  const getVisiblePartners = () => {
    const startIndex = currentIndex * 2
    return partners.slice(startIndex, startIndex + 2)
  }

  return (
    <div className="mt-20 lg:mt-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-12 lg:mb-16">
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Nos partenaires
          </h3>
        </div>

        {/* Partners Logos - Mobile: 2 at a time with carousel, Desktop: all visible */}
        <div className="relative">
          {/* Mobile View - Carousel showing 2 partners */}
          <div className="lg:hidden">
            <div className="flex items-center justify-center gap-6 overflow-hidden">
              {getVisiblePartners().map((partner, index) => (
                <div
                  key={`${currentIndex}-${index}`}
                  className="flex items-center justify-center p-4 hover:opacity-80 transition-opacity duration-300 flex-shrink-0"
                  style={{
                    width: 'calc(50% - 0.75rem)',
                    animation: 'fadeIn 0.5s ease-in-out'
                  }}
                >
                  <Image
                    src={partner.src}
                    alt={partner.alt}
                    width={200}
                    height={120}
                    className="h-16 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPairs }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-primary-600 w-6' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop View - All partners visible */}
          <div className="hidden lg:flex flex-nowrap items-center justify-center gap-8 lg:gap-12 pb-4">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 hover:opacity-80 transition-opacity duration-300"
              >
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={200}
                  height={120}
                  className="h-20 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const FAQSection = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('Commandes')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const faqCategories = {
    Commandes: [
      {
        question: 'Quel est le délai de livraison standard ?',
        answer: 'Le délai de livraison standard pour une carte grise est de 24 à 48 heures après validation de votre dossier. La carte grise est envoyée par l\'Imprimerie Nationale en recommandé avec accusé de réception.',
      },
      {
        question: 'Comment puis-je suivre mon paiement ?',
        answer: 'Une fois votre paiement effectué, vous recevez un email de confirmation avec votre numéro de suivi. Vous pouvez également suivre l\'avancement de votre dossier dans votre espace client sur notre site.',
      },
      {
        question: 'Quels documents sont nécessaires pour commander ?',
        answer: 'Pour commander votre carte grise, vous aurez besoin de votre permis de conduire, de la carte grise actuelle (si changement de propriétaire), et d\'un justificatif de domicile de moins de 3 mois.',
      },
      {
        question: 'Puis-je payer en plusieurs fois ?',
        answer: 'Oui, nous proposons le paiement en 3 fois sans frais pour tous nos clients. Cette option est disponible lors du processus de paiement.',
      },
    ],
    Livraison: [
      {
        question: 'Quel est le délai de livraison standard ?',
        answer: 'Le délai de livraison standard est de 24 à 48 heures après validation de votre dossier. La carte grise est envoyée par l\'Imprimerie Nationale en recommandé.',
      },
      {
        question: 'Comment est livrée ma carte grise ?',
        answer: 'Votre carte grise est livrée par l\'Imprimerie Nationale en recommandé avec accusé de réception directement à l\'adresse que vous avez indiquée lors de la commande.',
      },
      {
        question: 'Puis-je suivre ma livraison ?',
        answer: 'Oui, vous recevez un numéro de suivi par email une fois votre carte grise expédiée. Vous pouvez suivre l\'acheminement sur le site de La Poste.',
      },
      {
        question: 'Que faire si je ne reçois pas ma carte grise ?',
        answer: 'Si vous ne recevez pas votre carte grise dans les délais, contactez notre service client au 01 47 85 10 00. Nous pourrons vérifier le statut de votre envoi et procéder à un nouvel envoi si nécessaire.',
      },
    ],
    Retours: [
      {
        question: 'Comment effectuer un retour ?',
        answer: 'Pour effectuer un retour, contactez notre service client au 01 47 85 10 00 ou par email à contact@ematricule.fr. Notre équipe vous guidera dans la procédure de retour.',
      },
      {
        question: 'Quand serai-je remboursé après un retour ?',
        answer: 'Le remboursement est effectué dans un délai de 5 à 10 jours ouvrables après réception et validation de votre retour par notre équipe. Le remboursement se fait sur le même moyen de paiement utilisé lors de la commande.',
      },
      {
        question: 'Puis-je annuler ma commande ?',
        answer: 'Oui, vous pouvez annuler votre commande tant que le dossier n\'a pas été traité. Contactez-nous rapidement au 01 47 85 10 00 pour annuler votre commande.',
      },
      {
        question: 'Quelle est votre politique de remboursement ?',
        answer: 'Nous remboursons intégralement les commandes annulées avant traitement. Une fois le dossier traité, les frais administratifs peuvent être retenus. Contactez-nous pour plus de détails.',
      },
    ],
    'Carte grise': [
      {
        question: 'Qu\'est-ce qu\'une carte grise ?',
        answer: 'La carte grise, officiellement appelée "certificat d\'immatriculation", est le document officiel qui prouve l\'identité de votre véhicule. Elle contient toutes les informations techniques et administratives de votre véhicule.',
      },
      {
        question: 'Comment obtenir ma carte grise ?',
        answer: 'Vous pouvez obtenir votre carte grise en ligne sur notre plateforme EMatricule. Il suffit de remplir notre formulaire en quelques clics, de fournir les documents nécessaires et de procéder au paiement. Nous nous occupons de toutes les démarches administratives.',
      },
      {
        question: 'Combien coûte une carte grise ?',
        answer: 'Le prix d\'une carte grise varie selon plusieurs facteurs : le type de véhicule, la puissance fiscale, la région d\'immatriculation, et le type de démarche. Nos tarifs commencent à partir de 29,90€. Vous obtiendrez un devis précis après avoir rempli notre formulaire.',
      },
      {
        question: 'Quels sont les délais pour obtenir ma carte grise ?',
        answer: 'Une fois votre dossier validé et votre paiement effectué, nous traitons votre demande en 24 heures maximum. La carte grise est ensuite envoyée par l\'Imprimerie Nationale en recommandé, avec un délai de livraison de 24 à 48 heures supplémentaires.',
      },
      {
        question: 'Quels documents sont nécessaires pour une carte grise ?',
        answer: 'Les documents nécessaires varient selon le type de démarche. Généralement, vous aurez besoin de votre permis de conduire, de la carte grise actuelle (si changement de propriétaire), d\'un justificatif de domicile de moins de 3 mois, et parfois d\'un certificat de non-gage ou d\'un contrôle technique selon le cas.',
      },
      {
        question: 'Puis-je faire ma carte grise en ligne ?',
        answer: 'Oui, absolument ! EMatricule est une plateforme officielle habilitée par le Ministère de l\'Intérieur depuis 2009. Vous pouvez effectuer toutes vos démarches de carte grise en ligne, de manière sécurisée et rapide.',
      },
    ],
    'Matricule': [
      {
        question: 'Qu\'est-ce qu\'un numéro de matricule ?',
        answer: 'Le numéro de matricule, également appelé numéro d\'immatriculation ou plaque d\'immatriculation, est le code unique qui identifie votre véhicule. Il est composé de lettres et de chiffres (format AA-123-AA) et doit être affiché sur les plaques d\'immatriculation de votre véhicule.',
      },
      {
        question: 'Comment obtenir un nouveau numéro de matricule ?',
        answer: 'Lors de l\'immatriculation d\'un nouveau véhicule ou lors d\'un changement d\'immatriculation, vous recevez automatiquement un nouveau numéro de matricule. Ce numéro est attribué par le système d\'immatriculation des véhicules (SIV) et vous est communiqué lors de la délivrance de votre carte grise.',
      },
      {
        question: 'Puis-je choisir mon numéro de matricule ?',
        answer: 'Oui, vous pouvez demander un numéro de matricule personnalisé (plaque personnalisée) moyennant des frais supplémentaires. Cette option vous permet de choisir une combinaison de lettres et de chiffres selon certaines règles. Contactez-nous pour plus d\'informations.',
      },
      {
        question: 'Que faire en cas de perte ou vol de ma carte grise ?',
        answer: 'En cas de perte ou de vol de votre carte grise, vous devez demander un duplicata. Vous pouvez le faire en ligne sur notre plateforme. Il vous faudra fournir une déclaration de perte ou de vol et payer les frais de duplicata.',
      },
      {
        question: 'Comment changer mon adresse sur ma carte grise ?',
        answer: 'Pour changer votre adresse sur votre carte grise, vous devez effectuer une démarche de changement d\'adresse. Cette procédure est simple et peut être faite en ligne sur notre site. Vous devrez fournir un justificatif de domicile récent (moins de 3 mois) à votre nouvelle adresse.',
      },
      {
        question: 'Qu\'est-ce que le code de cession ?',
        answer: 'Le code de cession est un code unique à 4 caractères qui est fourni lors de la vente d\'un véhicule. Il permet à l\'acheteur de procéder à l\'enregistrement de la cession et à l\'immatriculation du véhicule à son nom. Ce code est valable 30 jours.',
      },
    ],
  }

  const currentFAQs = faqCategories[activeTab as keyof typeof faqCategories] || []
  
  const filteredFAQs = searchQuery
    ? currentFAQs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentFAQs

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="mt-20 lg:mt-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Section - Help Center */}
          <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 rounded-3xl p-8 lg:p-12 overflow-hidden transform-gpu group" style={{ perspective: '1200px' }}>
            {/* Advanced 3D Background with Parallax Layers */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Dynamic animated orbs with depth */}
              <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-br from-primary-400/30 to-primary-500/20 rounded-full blur-3xl animate-orb-float" style={{ 
                animation: 'orbFloat3d 10s ease-in-out infinite',
                transformStyle: 'preserve-3d'
              }}></div>
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-primary-500/25 to-primary-600/15 rounded-full blur-3xl animate-orb-float" style={{ 
                animation: 'orbFloat3d 12s ease-in-out infinite reverse',
                transformStyle: 'preserve-3d'
              }}></div>
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-primary-300/20 to-primary-400/10 rounded-full blur-2xl animate-orb-float" style={{ 
                animation: 'orbFloat3d 14s ease-in-out infinite',
                transformStyle: 'preserve-3d',
                transform: 'translate(-50%, -50%)'
              }}></div>
              
              {/* Enhanced 3D Network lines with depth */}
              <svg className="absolute inset-0 w-full h-full opacity-25 animate-network-pulse" viewBox="0 0 400 400" style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(0)'
              }}>
                <defs>
                  <linearGradient id="lineGradient3d" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <line x1="50" y1="100" x2="150" y2="200" stroke="url(#lineGradient3d)" strokeWidth="2" filter="url(#glow)" />
                <line x1="150" y1="200" x2="250" y2="150" stroke="url(#lineGradient3d)" strokeWidth="2" filter="url(#glow)" />
                <line x1="250" y1="150" x2="350" y2="250" stroke="url(#lineGradient3d)" strokeWidth="2" filter="url(#glow)" />
                <circle cx="150" cy="200" r="5" fill="#60a5fa" opacity="0.8" filter="url(#glow)" className="animate-pulse-glow" />
                <circle cx="250" cy="150" r="5" fill="#a78bfa" opacity="0.8" filter="url(#glow)" className="animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
              </svg>
              
              {/* Advanced 3D Grid with perspective */}
              <div className="absolute inset-0 opacity-15" style={{
                backgroundImage: 'linear-gradient(rgba(96, 165, 250, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(96, 165, 250, 0.4) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: 'perspective(1200px) rotateX(65deg) translateY(60px) translateZ(-50px)',
                transformStyle: 'preserve-3d',
                animation: 'gridMove 20s linear infinite'
              }}></div>
              
              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary-300/40 rounded-full blur-sm"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${15 + (i % 3) * 30}%`,
                    animation: `particleFloat ${8 + i * 2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                    transformStyle: 'preserve-3d'
                  }}
                />
              ))}
            </div>

            {/* Enhanced Main Icon with 3D effects */}
            <div className="relative z-10 flex items-center justify-center mb-8">
              <div className="relative w-52 h-52 lg:w-72 lg:h-72 transform-gpu" style={{ 
                transformStyle: 'preserve-3d',
                animation: 'iconFloat3d 8s ease-in-out infinite'
              }}>
                {/* Multiple glow layers for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/30 via-primary-300/20 to-primary-500/25 rounded-full blur-3xl -z-20 animate-glow-pulse" style={{
                  animation: 'glowPulse 4s ease-in-out infinite',
                  transform: 'scale(1.2) translateZ(-30px)'
                }}></div>
                <div className="absolute inset-0 bg-primary-400/15 rounded-full blur-2xl -z-10 animate-glow-pulse" style={{
                  animation: 'glowPulse 3s ease-in-out infinite reverse',
                  transform: 'scale(1.1) translateZ(-15px)'
                }}></div>
                
                <div className="relative w-full h-full" style={{ transform: 'translateZ(40px) rotateY(0deg)' }}>
                  <Image
                    src="/faq.png"
                    alt="FAQ"
                    width={288}
                    height={288}
                    className="w-full h-full object-contain opacity-95"
                    style={{ 
                      filter: 'drop-shadow(0 25px 50px rgba(96, 165, 250, 0.4)) drop-shadow(0 0 30px rgba(167, 139, 250, 0.3))',
                      transform: 'translateZ(20px)',
                      animation: 'iconRotate3d 15s ease-in-out infinite'
                    }}
                    priority
                  />
                  </div>
                
                {/* Rotating ring around icon */}
                <div className="absolute inset-0 border-2 border-primary-300/20 rounded-full animate-rotate-ring" style={{
                  animation: 'rotateRing 20s linear infinite',
                  transform: 'translateZ(10px)',
                  transformStyle: 'preserve-3d'
                }}></div>
              </div>
            </div>

            {/* Title */}
            <div className="relative z-10 mb-4">
              <h3 className="text-[28px] lg:text-[34px] font-bold text-white mb-2 uppercase tracking-tight">
                CENTRE D'AIDE & SUPPORT
              </h3>
              <p className="text-primary-200 text-sm lg:text-base">
                Trouvez des réponses rapides à vos questions
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative z-10 mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un sujet ou question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-gray-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-300 text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - FAQ */}
          <div className="bg-gray-50 rounded-3xl p-8 lg:p-12">
            {/* Title */}
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Questions Fréquentes
            </h3>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap sm:grid sm:grid-cols-5 gap-2 mb-6 border-b border-gray-200 pb-4 overflow-x-auto">
              {['Commandes', 'Livraison', 'Retours', 'Carte grise', 'Matricule'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setSearchQuery('')
                    setExpandedItems(new Set())
                  }}
                  className={`flex-shrink-0 px-3 py-2 text-xs sm:text-sm font-semibold transition-colors text-center whitespace-nowrap min-w-fit ${
                    activeTab === tab
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {searchQuery && filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun résultat trouvé pour "{searchQuery}"</p>
                </div>
              ) : filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq, index) => {
                  // Find the original index in the current category for proper expansion tracking
                  const originalIndex = currentFAQs.findIndex(f => f.question === faq.question)
                  return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => toggleExpanded(originalIndex >= 0 ? originalIndex : index)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 mb-2">
                          {faq.question}
                        </h4>
                        {expandedItems.has(originalIndex >= 0 ? originalIndex : index) && (
                          <p className="text-sm text-gray-600 leading-relaxed mt-2">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                      <button
                        className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpanded(originalIndex >= 0 ? originalIndex : index)
                        }}
                      >
                        {expandedItems.has(originalIndex >= 0 ? originalIndex : index) ? (
                          <X className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Plus className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  )
                })
              ) : null}
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-colors">
                Voir toutes les FAQs
              </button>
              <button className="flex items-center justify-center gap-2 text-gray-700 hover:text-primary-600 transition-colors font-semibold text-sm">
                <MessageCircle className="w-4 h-4" />
                Ou Parler à un agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcessSection







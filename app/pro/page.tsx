'use client'

import { CheckCircle, Users, Clock, Shield, Star, Award, Heart, Lightbulb, Target, Zap, Globe, Phone, Mail, MessageCircle, Eye, Car, FileText, Building, Wrench, ArrowRight, TrendingUp, DollarSign, UserCheck, Settings, BarChart3, Smartphone, Laptop, Database } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const ProPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const carouselImages = [
    {
      id: 1,
      title: 'Plateforme intuitive',
      description: 'Interface simple et moderne pour gérer vos démarches',
      icon: Laptop,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      title: 'Traitement rapide',
      description: 'Délais garantis sous 24h pour tous vos dossiers',
      icon: Clock,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      title: 'Support expert',
      description: 'Équipe dédiée disponible du lundi au samedi',
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 3000) // Change image every 3 seconds

    return () => clearInterval(interval)
  }, [carouselImages.length])

  const features = [
    {
      icon: Shield,
      title: 'Accès SIV et ANTS',
      description: 'Nous vous accompagnons sur toutes les démarches possibles, des plus simples aux plus complexes, et pour tous les véhicules.',
      color: 'text-blue-500'
    },
    {
      icon: FileText,
      title: '100% en ligne',
      description: 'Aucun document papier à envoyer. Vos documents cerfa sont automatiquement préremplis, vous n\'avez plus qu\'à les signer en quelques clics.',
      color: 'text-green-500'
    },
    {
      icon: Clock,
      title: 'Délais garantis',
      description: 'Vous recevez un certificat provisoire par email sous 24h à réception de votre dossier complet.',
      color: 'text-purple-500'
    }
  ]

  const benefits = [
    {
      icon: DollarSign,
      title: 'Des tarifs avantageux',
      description: 'Nous vous proposons les meilleurs tarifs adaptés à vos besoins. Bénéficiez de remises immédiates et touchez des commissions sur l\'ensemble de vos commandes pour vous et vos clients.',
      color: 'text-green-500'
    },
    {
      icon: UserCheck,
      title: 'Un compte personnalisé',
      description: 'Notre plateforme vous permet de créer et piloter au quotidien toutes vos démarches d\'immatriculation pour vous et vos clients de façon dématérialisée : plateforme SaaS, signature électronique, coffre fort numérique, etc.',
      color: 'text-blue-500'
    },
    {
      icon: Heart,
      title: 'Sans engagement',
      description: 'Nous souhaitons vous apporter la solution la plus efficace et rapide possible peu importe la nature de vos besoins. Pour cela, accédez gratuitement et sans engagement à notre plateforme pro en ouvrant votre compte.',
      color: 'text-red-500'
    },
    {
      icon: Users,
      title: 'Une équipe à votre écoute',
      description: 'Notre équipe d\'experts de l\'immatriculation est à votre écoute du lundi au samedi par téléphone, email, whatsApp, chat... Votre satisfaction est notre priorité.',
      color: 'text-purple-500'
    }
  ]

  const solutions = [
    {
      icon: Car,
      title: 'Gestionnaires de flottes',
      description: 'Gérez efficacement les immatriculations de votre parc automobile sur une seule interface.',
      color: 'text-blue-500'
    },
    {
      icon: Laptop,
      title: 'Plateformes et startups',
      description: 'Faites vivre la meilleure expérience à vos clients grâce à notre plateforme SaaS ou notre API.',
      color: 'text-green-500'
    },
    {
      icon: TrendingUp,
      title: 'Achat - Vente',
      description: 'La plateforme pour simplifier vos démarches et celles de vos clients sans habilitation.',
      color: 'text-purple-500'
    },
    {
      icon: Building,
      title: 'Loueurs',
      description: 'Proposez une solution à vos clients pour gérer leurs démarches (changement de titulaire après une LOA, duplicata…).',
      color: 'text-orange-500'
    }
  ]

  const stats = [
    {
      number: '2009',
      label: '1ère plateforme d\'immatriculation depuis 2009',
      description: 'Notre mission est de faire de l\'immatriculation d\'un véhicule une démarche simple et rapide grâce à la plateforme la plus innovante du marché.'
    },
    {
      number: '4000+',
      label: 'Plus de 4000 professionnels nous font déjà confiance',
      description: 'Que vous proposiez déjà un service de carte grise à vos clients ou que vous réfléchissiez à optimiser la gestion de vos immatriculations, notre plateforme pour les professionnels pourra répondre à vos besoins.'
    }
  ]

  const testimonials = [
    {
      rating: '4.5',
      platform: 'Ekomi',
      reviews: '30 000+ avis'
    },
    {
      rating: '4.5',
      platform: 'Google',
      reviews: '25 000+ avis'
    },
    {
      rating: '4.3',
      platform: 'Trustpilot',
      reviews: '15 000+ avis'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Optimisez la gestion de vos<br />
              <span className="text-[#0d6962]">immatriculations</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Découvrez la solution la plus simple pour gérer efficacement toutes vos démarches d'immatriculation
            </p>

            {/* Animated Carousel */}
            <div className="mb-12">
              <div className="relative w-full h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
                {/* Carousel Images */}
                <div className="relative w-full h-full">
                  {carouselImages.map((image, index) => (
                    <div
                      key={image.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className={`w-full h-full bg-gradient-to-br ${image.color} flex items-center justify-center`}>
                        <div className="text-center text-white">
                          <image.icon className="w-20 h-20 mx-auto mb-6" />
                          <h3 className="text-2xl font-bold mb-3">{image.title}</h3>
                          <p className="text-lg opacity-90 max-w-md mx-auto">{image.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup"
                className="bg-[#0d6962] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#0a5550] transition-colors flex items-center justify-center space-x-2"
              >
                <span>Ouvrir mon compte pro</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              gratuit et sans engagement
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Nous nous occupons de tout.
              </h2>
              <p className="text-lg text-gray-600">
                La plateforme d'immatriculation la plus simple depuis 2009
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Gagnez du temps et de l'argent
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-12 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Central Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                <span className="text-[#0d6962]">SOLUTION</span>
                <br />
                <span className="text-2xl md:text-3xl font-medium text-gray-700">pour les professionnels</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez comment EMatricule s'adapte à votre secteur d'activité
              </p>
            </motion.div>

            {/* Diamond Layout with Solutions */}
            <div className="relative max-w-4xl mx-auto">
              {/* Central Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-32 h-32 bg-gradient-to-br from-[#0d6962] to-[#0a5550] rounded-full flex items-center justify-center shadow-2xl">
                  <div className="text-center text-white">
                    <div className="text-2xl font-bold">EM</div>
                    <div className="text-xs opacity-90">Matricule</div>
                  </div>
                </div>
              </div>

              {/* Solutions positioned around the center */}
              <div className="grid grid-cols-2 gap-8 md:gap-12">
                {/* Top Left - Fleet Managers */}
                <motion.div
                  initial={{ opacity: 0, x: -50, y: -50 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="group"
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-[#0d6962]/30 h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Car className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#0d6962] transition-colors">
                        Gestionnaires de flottes
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        Gérez efficacement les immatriculations de votre parc automobile sur une seule interface.
                      </p>
                      <div className="flex items-center justify-center text-[#0d6962] font-semibold text-sm group-hover:translate-x-1 transition-transform duration-300">
                        <span>En savoir plus</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Top Right - Startups & Platforms */}
                <motion.div
                  initial={{ opacity: 0, x: 50, y: -50 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="group"
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-[#0d6962]/30 h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Laptop className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#0d6962] transition-colors">
                        Plateformes et startups
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        Faites vivre la meilleure expérience à vos clients grâce à notre plateforme SaaS ou notre API.
                      </p>
                      <div className="flex items-center justify-center text-[#0d6962] font-semibold text-sm group-hover:translate-x-1 transition-transform duration-300">
                        <span>Intégrer l'API</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Bottom Left - Buy-Sell */}
                <motion.div
                  initial={{ opacity: 0, x: -50, y: 50 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="group"
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-[#0d6962]/30 h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#0d6962] transition-colors">
                        Achat - Vente
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        La plateforme pour simplifier vos démarches et celles de vos clients sans habilitation.
                      </p>
                      <div className="flex items-center justify-center text-[#0d6962] font-semibold text-sm group-hover:translate-x-1 transition-transform duration-300">
                        <span>Commencer</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Bottom Right - Lessors */}
                <motion.div
                  initial={{ opacity: 0, x: 50, y: 50 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="group"
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-[#0d6962]/30 h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Building className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#0d6962] transition-colors">
                        Loueurs
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        Proposez une solution à vos clients pour gérer leurs démarches (changement de titulaire après une LOA, duplicata…).
                      </p>
                      <div className="flex items-center justify-center text-[#0d6962] font-semibold text-sm group-hover:translate-x-1 transition-transform duration-300">
                        <span>Optimiser</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Connecting Lines */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
                <motion.path
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 1 }}
                  d="M100,100 Q200,200 300,100"
                  stroke="#0d6962"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  fill="none"
                  opacity="0.3"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 1.2 }}
                  d="M300,100 Q200,200 300,300"
                  stroke="#0d6962"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  fill="none"
                  opacity="0.3"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 1.4 }}
                  d="M300,300 Q200,200 100,300"
                  stroke="#0d6962"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  fill="none"
                  opacity="0.3"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 1.6 }}
                  d="M100,300 Q200,200 100,100"
                  stroke="#0d6962"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  fill="none"
                  opacity="0.3"
                />
              </svg>
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-16"
            >
              <div className="bg-gradient-to-r from-[#0d6962] to-[#0a5550] rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-3">Prêt à optimiser vos démarches ?</h3>
                <p className="text-sm opacity-90 mb-4 max-w-xl mx-auto">
                  Rejoignez plus de 4000 professionnels qui nous font confiance
                </p>
                <Link 
                  href="/auth/signup"
                  className="inline-flex items-center space-x-2 bg-white text-[#0d6962] px-6 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  <span>Démarrer maintenant</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Qui sommes-nous ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* First Stat */}
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#0d6962] mb-4">
                  {stats[0].number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{stats[0].label}</h3>
                <p className="text-gray-600 leading-relaxed">{stats[0].description}</p>
              </div>

              {/* Logo Space */}
              <div className="flex justify-center items-center">
                <div className="w-32 h-32 bg-gradient-to-br from-[#0d6962] to-[#0a5550] rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-center text-white">
                    <Car className="w-12 h-12 mx-auto mb-2" />
                    <span className="text-xs font-bold">EMatricule</span>
                  </div>
                </div>
              </div>

              {/* Second Stat */}
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#0d6962] mb-4">
                  {stats[1].number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{stats[1].label}</h3>
                <p className="text-gray-600 leading-relaxed">{stats[1].description}</p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link 
                href="/auth/signup"
                className="bg-[#0d6962] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#0a5550] transition-colors inline-flex items-center space-x-2"
              >
                <span>Ouvrir mon compte pro</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                gratuit et sans engagement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Un service recommandé par nos clients
              </h2>
              <div className="text-2xl font-bold text-[#0d6962] mb-2">
                + 1 million d'utilisateurs
              </div>
              <p className="text-lg text-gray-600">
                + 30 000 avis clients sur plusieurs plateformes indépendantes d'avis certifiés
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-[#0d6962] mb-2">
                    {testimonial.rating} / 5
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    sur {testimonial.platform}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.reviews}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nos partenaires Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Nos partenaires
              </h2>
              <p className="text-lg text-gray-600">
                Nous travaillons avec des partenaires de confiance pour vous offrir le meilleur service
              </p>
            </div>

            {/* Partners Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
              {/* Partner 1 - Ministère de l'Intérieur */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Shield className="w-8 h-8 text-[#0d6962]" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">Ministère de l'Intérieur</span>
              </div>

              {/* Partner 2 - Imprimerie Nationale */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">Imprimerie Nationale</span>
              </div>

              {/* Partner 3 - Fédération Nationale */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Building className="w-8 h-8 text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">Fédération Nationale des Professionnels</span>
              </div>

              {/* Partner 4 - France Autotech */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Car className="w-8 h-8 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">France Autotech</span>
              </div>

              {/* Partner 5 - Banque de France */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">Banque de France</span>
              </div>

              {/* Partner 6 - ANTS */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                  <Globe className="w-8 h-8 text-indigo-600" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">ANTS</span>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 text-center">
              <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Certifié ISO 27001</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>RGPD Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Données protégées</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-[#0d6962]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Faire ma carte grise ou mes plaques en 2min
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/carte-grise"
                className="bg-white text-[#0d6962] px-8 py-4 rounded-3xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Commander carte grise
              </Link>
              <Link 
                href="/plaque-immatriculation"
                className="border-2 border-white text-white px-8 py-4 rounded-3xl font-semibold hover:bg-white hover:text-[#0d6962] transition-colors"
              >
                Commander plaques
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Besoin d'aide ?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:0147851000" className="flex items-center space-x-2 text-gray-700 hover:text-[#0d6962] transition-colors">
                <Phone className="w-4 h-4" />
                <span className="font-semibold text-sm">01 47 85 10 00</span>
              </a>
              <a href="mailto:contact@ematricule.fr" className="flex items-center space-x-2 text-gray-700 hover:text-[#0d6962] transition-colors">
                <Mail className="w-4 h-4" />
                <span className="font-semibold text-sm">contact@ematricule.fr</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-700 hover:text-[#0d6962] transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="font-semibold text-sm">Chat en direct</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProPage

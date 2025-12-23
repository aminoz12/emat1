import Link from 'next/link'
import { FileText, Car, Users, Building, Wrench, Shield, Clock, CheckCircle } from 'lucide-react'

const ServiceCards = () => {
  const popularServices = [
    {
      title: 'Changement de titulaire',
      description: 'Transférez la propriété de votre véhicule rapidement et en toute sécurité.',
      icon: Users,
      href: '/services/changement-titulaire',
      price: '35€',
      time: '24h',
      popular: true,
    },
    {
      title: 'Duplicata carte grise',
      description: 'Obtenez un duplicata de votre carte grise en cas de perte ou de vol.',
      icon: FileText,
      href: '/services/duplicata',
      price: '60€',
      time: '24h',
    },
    {
      title: 'Immatriculation provisoire WW',
      description: 'Plaques temporaires pour vos déplacements avant immatriculation définitive.',
      icon: Car,
      href: '/services/immatriculation-provisoire',
      price: '49€',
      time: '48h',
    },
    {
      title: 'Enregistrement de cession',
      description: 'Enregistrez la vente de votre véhicule dans les délais légaux.',
      icon: FileText,
      href: '/services/cession',
      price: '20€',
      time: '24h',
    },
    {
      title: 'Changement d\'adresse carte grise',
      description: 'Mettez à jour votre adresse sur votre carte grise.',
      icon: FileText,
      href: '/services/changement-adresse',
      price: '15€',
      time: '24h',
    },
    {
      title: 'Fiche d\'identification d\'un véhicule',
      description: 'Obtenez les informations complètes de votre véhicule.',
      icon: FileText,
      href: '/services/fiche-identification',
      price: '50€',
      time: '24h',
    },
  ]

  const professionalServices = [
    {
      title: 'Déclaration d\'achat',
      description: 'Service dédié aux professionnels de l\'automobile.',
      icon: Building,
      href: '/professionnels/declaration-achat',
      price: '25€',
      time: '24h',
    },
    {
      title: 'W garage',
      description: 'Solution complète pour les garages et concessionnaires.',
      icon: Wrench,
      href: '/professionnels/w-garage',
      price: '60€',
      time: '24h',
    },
  ]

  const features = [
    { icon: Shield, text: 'Habilitation Ministère de l\'Intérieur' },
    { icon: Clock, text: 'Traitement express en 24h' },
    { icon: CheckCircle, text: 'Livraison par l\'Imprimerie Nationale' },
    { icon: Car, text: 'Tous types de véhicules' },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Nos services d'immatriculation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nous nous occupons de tout pour simplifier vos démarches d'immatriculation. 
            Choisissez le service dont vous avez besoin.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-primary-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">{feature.text}</p>
            </div>
          ))}
        </div>

        {/* Popular Services */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              6
            </span>
            Les plus populaires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((service, index) => (
              <div
                key={index}
                className="card p-6 hover:shadow-lg transition-shadow group relative"
              >
                {service.popular && (
                  <div className="absolute -top-3 -right-3 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Populaire
                  </div>
                )}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <service.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {service.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-primary-600">
                    {service.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    Délai: {service.time}
                  </div>
                </div>
                <Link
                  href={service.href}
                  className="btn btn-primary w-full text-center"
                >
                  Commander
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Services */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Building className="w-8 h-8 text-primary-600 mr-3" />
            Pour les professionnels de l'auto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {professionalServices.map((service, index) => (
              <div
                key={index}
                className="card p-6 hover:shadow-lg transition-shadow group border-2 border-primary-100"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <service.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {service.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-primary-600">
                    {service.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    Délai: {service.time}
                  </div>
                </div>
                <Link
                  href={service.href}
                  className="btn btn-primary w-full text-center"
                >
                  En savoir plus
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="btn btn-secondary px-8 py-3 text-lg font-semibold rounded-lg"
          >
            Voir tous les services
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ServiceCards






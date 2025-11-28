import { Car, Award, Shield, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CommanderPlaques() {
  const plateCategories = [
    {
      title: 'Plaques auto',
      icon: Car,
      count: 5,
      plates: [
        { name: 'Plaque plexiglass', price: '29,90€', description: 'Plaque standard en plexiglass' },
        { name: 'Plaque luxe', price: '39,90€', description: 'Plaque haut de gamme' },
        { name: 'Plaque aluminium', price: '34,90€', description: 'Plaque en aluminium' },
        { name: 'Plaque collection', price: '49,90€', description: 'Plaque pour véhicule de collection' },
        { name: 'Plaque noire', price: '24,90€', description: 'Plaque noire non homologuée' },
      ]
    },
    {
      title: 'Plaques moto',
      icon: Car,
      count: 3,
      plates: [
        { name: 'Plaque moto standard', price: '24,90€', description: 'Plaque moto homologuée' },
        { name: 'Plaque moto collection', price: '39,90€', description: 'Plaque moto de collection' },
        { name: 'Plaque moto noire', price: '19,90€', description: 'Plaque moto noire' },
      ]
    },
    {
      title: 'Plaques camion',
      icon: Car,
      count: 3,
      plates: [
        { name: 'Plaque camion', price: '34,90€', description: 'Plaque camion standard' },
        { name: 'Plaque camion USA', price: '44,90€', description: 'Plaque camion style USA' },
        { name: 'Plaque camion noire', price: '29,90€', description: 'Plaque camion noire' },
      ]
    },
  ]

  const features = [
    { icon: Award, text: 'Made in France' },
    { icon: Shield, text: 'Matériaux haut de gamme' },
    { icon: CheckCircle, text: 'Tous véhicules' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Commander vos plaques d'immatriculation
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Leader de la plaque d'immatriculation sur Internet. Toutes nos plaques sont fabriquées en France avec les dernières technologies.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-gray-600">
                  <feature.icon className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plate Categories */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choisissez vos plaques
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nous vous proposons un très large choix de plaques d'immatriculation pour tous vos véhicules
            </p>
          </div>

          <div className="space-y-12">
            {plateCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mr-4">
                    <category.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                    <p className="text-gray-600">{category.count} modèles disponibles</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.plates.map((plate, plateIndex) => (
                    <div
                      key={plateIndex}
                      className="card p-6 hover:shadow-lg transition-shadow group"
                    >
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {plate.name}
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        {plate.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-primary-600">
                          {plate.price}
                        </div>
                        <div className="text-sm text-gray-500">
                          Livraison 24/48h
                        </div>
                      </div>
                      <button className="btn btn-primary w-full">
                        Commander
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Pourquoi faire ses plaques avec EMatricule ?
              </h2>
              <p className="text-xl text-gray-600">
                Leader de la plaque d'immatriculation sur Internet, nous vous proposons toutes les plaques d'immatriculation homologuées pour tous les véhicules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Made in France</h3>
                <p className="text-gray-600 text-sm">
                  Toutes nos plaques d'immatriculation sont fabriquées en France. Nos plaques sont fabriquées grâce aux dernières technologies dans des matériaux haut de gamme.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tous véhicules</h3>
                <p className="text-gray-600 text-sm">
                  Nous vous proposons un très large choix de plaques d'immatriculation pour tous vos véhicules : plaques auto, moto, scooter, collection, 4x4 etc.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Qualité garantie</h3>
                <p className="text-gray-600 text-sm">
                  Toutes nos plaques respectent les normes en vigueur et sont fabriquées avec des matériaux de qualité supérieure pour une durabilité optimale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Prêt à commander vos plaques ?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Choisissez parmi notre large gamme de plaques d'immatriculation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn bg-white text-primary-600 px-8 py-3 text-lg font-semibold rounded-2xl hover:bg-primary-50 transition-colors flex items-center justify-center space-x-2">
                <span>Voir tous les modèles</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link
                href="/contact"
                className="btn border-2 border-white text-white px-8 py-3 text-lg font-semibold rounded-2xl hover:bg-white hover:text-primary-600 transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


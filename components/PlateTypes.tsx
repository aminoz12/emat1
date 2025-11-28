import Link from 'next/link'
import { Car, Bike, Truck, Shield, Star, Award } from 'lucide-react'

const PlateTypes = () => {
  const plateCategories = [
    {
      title: 'Plaques auto',
      icon: Car,
      count: 5,
      plates: [
        { name: 'Plaque immatriculation plexiglass', price: '29,90€', href: '/plaques/auto-plexiglass' },
        { name: 'Plaque immatriculation luxe', price: '39,90€', href: '/plaques/auto-luxe' },
        { name: 'Plaque immatriculation aluminium', price: '34,90€', href: '/plaques/auto-aluminium' },
        { name: 'Plaque immatriculation collection', price: '49,90€', href: '/plaques/auto-collection' },
        { name: 'Plaque noire non homologuée', price: '24,90€', href: '/plaques/auto-noire' },
      ]
    },
    {
      title: 'Plaques moto',
      icon: Bike,
      count: 3,
      plates: [
        { name: 'Plaque immatriculation moto', price: '24,90€', href: '/plaques/moto' },
        { name: 'Plaque moto collection', price: '39,90€', href: '/plaques/moto-collection' },
        { name: 'Plaque moto noire non homologuée', price: '19,90€', href: '/plaques/moto-noire' },
      ]
    },
    {
      title: 'Plaques camion',
      icon: Truck,
      count: 3,
      plates: [
        { name: 'Plaque immatriculation camion', price: '34,90€', href: '/plaques/camion' },
        { name: 'Plaque camion USA', price: '44,90€', href: '/plaques/camion-usa' },
        { name: 'Camion noire non homologuée', price: '29,90€', href: '/plaques/camion-noire' },
      ]
    },
    {
      title: 'Plaques spécifiques',
      icon: Shield,
      count: 5,
      plates: [
        { name: 'Plaque diplomatique', price: 'Sur devis', href: '/plaques/diplomatique' },
        { name: 'Plaque immatriculation transit', price: '39,90€', href: '/plaques/transit' },
        { name: 'Plaque signalétique plexiglass', price: '19,90€', href: '/plaques/signaletique-plexiglass' },
        { name: 'Plaque signalétique aluminium', price: '24,90€', href: '/plaques/signaletique-aluminium' },
        { name: 'Plaque signalétique collection', price: '34,90€', href: '/plaques/signaletique-collection' },
      ]
    },
  ]

  const features = [
    { icon: Award, text: 'Made in France' },
    { icon: Shield, text: 'Matériaux haut de gamme' },
    { icon: Star, text: 'Technologies dernières générations' },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Plaques d'immatriculation homologuées
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leader de la plaque d'immatriculation sur Internet, nous vous proposons toutes les plaques d'immatriculation homologuées pour tous vos véhicules.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.text}</h3>
              <p className="text-gray-600 text-sm">
                {feature.text === 'Made in France' && 'Toutes nos plaques sont fabriquées en France'}
                {feature.text === 'Matériaux haut de gamme' && 'Fabrication avec les meilleurs matériaux'}
                {feature.text === 'Technologies dernières générations' && 'Utilisation des dernières technologies'}
              </p>
            </div>
          ))}
        </div>

        {/* Plate Categories */}
        <div className="space-y-12">
          {plateCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <category.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                  <p className="text-gray-600">{category.count} modèles disponibles</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.plates.map((plate, plateIndex) => (
                  <div
                    key={plateIndex}
                    className="card p-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {plate.name}
                      </h4>
                      <span className="text-lg font-bold text-primary-600">
                        {plate.price}
                      </span>
                    </div>
                    <Link
                      href={plate.href}
                      className="btn btn-primary w-full text-sm"
                    >
                      Commander
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/plaques"
            className="btn btn-primary px-8 py-3 text-lg font-semibold rounded-lg"
          >
            Voir toutes les plaques
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PlateTypes






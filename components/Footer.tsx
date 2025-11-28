import Link from 'next/link'
import Image from 'next/image'
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const services = [
    { name: 'Changement de titulaire', href: '/services/changement-titulaire' },
    { name: 'Duplicata carte grise', href: '/services/duplicata' },
    { name: 'Immatriculation provisoire', href: '/services/immatriculation-provisoire' },
    { name: 'Enregistrement de cession', href: '/services/cession' },
    { name: 'Changement d\'adresse', href: '/services/changement-adresse' },
    { name: 'Fiche d\'identification', href: '/services/fiche-identification' },
  ]

  const plates = [
    { name: 'Plaque auto plexiglass', href: '/plaques/auto-plexiglass' },
    { name: 'Plaque auto luxe', href: '/plaques/auto-luxe' },
    { name: 'Plaque auto aluminium', href: '/plaques/auto-aluminium' },
    { name: 'Plaque collection', href: '/plaques/collection' },
    { name: 'Plaque noire non homologuée', href: '/plaques/noire' },
  ]

  const about = [
    { name: 'Qui sommes-nous ?', href: '/about' },
    { name: 'Conditions générales', href: '/cgv' },
    { name: 'Mentions légales', href: '/mentions-legales' },
    { name: 'Politique de confidentialité', href: '/privacy' },
    { name: 'Politique cookies', href: '/cookies' },
  ]

  const help = [
    { name: 'Centre d\'aide', href: '/aide' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
    { name: 'Documents', href: '/documents' },
    { name: 'Paiement en 3 fois', href: '/paiement-3x' },
  ]

  return (
    <footer className="bg-white text-gray-900">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="EMatricule"
                width={250}
                height={80}
                className="h-20 w-auto"
              />
            </div>
            <p className="text-gray-600 text-sm">
              Faites votre carte grise et vos plaques en 2 min. Service d'immatriculation simplifié en ligne avec habilitation du Ministère de l'Intérieur.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Cartes Grises</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-gray-600 hover:text-primary-600 transition-colors text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Plaques */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Plaques</h3>
            <ul className="space-y-2">
              {plates.map((plate) => (
                <li key={plate.name}>
                  <Link
                    href={plate.href}
                    className="text-gray-600 hover:text-primary-600 transition-colors text-sm"
                  >
                    {plate.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary-600" />
                <a href="tel:0184802827" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  01 84 80 28 27
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary-600" />
                <a href="mailto:contact@ematricule.fr" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  contact@ematricule.fr
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-primary-600 mt-0.5" />
                <span className="text-gray-600 text-sm">
                  123 Avenue des Champs-Élysées<br />
                  75008 Paris, France
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-gray-900">À propos</h4>
              <ul className="space-y-1">
                {about.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-primary-600 transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>© {currentYear} EMatricule. Tous droits réservés.</span>
              <Link href="/mentions-legales" className="hover:text-primary-600 transition-colors">
                Mentions légales
              </Link>
              <Link href="/cgv" className="hover:text-primary-600 transition-colors">
                CGV
              </Link>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Habilitation Ministère de l'Intérieur</span>
              <span>•</span>
              <span>Agrément Trésor Public</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer






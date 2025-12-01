import Link from 'next/link'
import Image from 'next/image'
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

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
    <footer className="bg-white text-gray-900 w-full max-w-full overflow-x-hidden">
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pl-0 lg:pl-0">
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
              Faites votre carte grise et vos plaques en 2 minutes.
              <br />
              Service d'immatriculation simplifié en ligne,
              <br />
              habilité par le Ministère de l'Intérieur.
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

          {/* Services, Contact & About - All titles in one line */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 justify-start sm:justify-items-start">
            {/* Nos Services */}
            <div className="text-left">
              <h3 className="font-semibold text-lg mb-4 text-gray-900 whitespace-nowrap text-left">Nos Services</h3>
            <ul className="space-y-2">
                <li>
                  <Link
                    href="/carte-grise"
                    className="text-gray-600 hover:text-primary-600 transition-colors text-sm"
                  >
                    Carte Grise
                  </Link>
                </li>
                <li>
                  <Link
                    href="/commander-plaques"
                    className="text-gray-600 hover:text-primary-600 transition-colors text-sm"
                  >
                    Plaques d'immatriculation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/commander-un-coc"
                    className="text-gray-600 hover:text-primary-600 transition-colors text-sm"
                  >
                    COC
                  </Link>
                </li>
            </ul>
          </div>

            {/* Contact */}
            <div className="text-left">
              <h3 className="font-semibold text-lg mb-4 text-gray-900 whitespace-nowrap text-left">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary-600" />
                <a href="tel:0147851000" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  01 47 85 10 00
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
                  426 Av. de la République<br />
                  92000 Nanterre, France
                </span>
                </div>
              </div>
            </div>

            {/* À propos */}
            <div className="text-left">
              <h3 className="font-semibold text-lg mb-4 text-gray-900 whitespace-nowrap text-left">À propos</h3>
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






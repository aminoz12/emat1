'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone, Car, FileText, LogIn, ChevronDown, Star, Shield, Globe } from 'lucide-react'

const HeaderTest = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const handleMouseEnter = (dropdown: string) => {
    console.log('Mouse enter:', dropdown)
    setActiveDropdown(dropdown)
  }

  const handleMouseLeave = () => {
    console.log('Mouse leave')
    setTimeout(() => {
      setActiveDropdown(null)
    }, 300)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="EMatricule"
              width={280}
              height={90}
              className="h-20 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Carte grise dropdown */}
            <div className="relative">
              <button 
                className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium"
                onMouseEnter={() => handleMouseEnter('carte-grise')}
                onMouseLeave={handleMouseLeave}
              >
                <FileText className="w-4 h-4" />
                <span>Carte grise</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {activeDropdown === 'carte-grise' && (
                <div 
                  className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-lg shadow-xl border border-gray-200 py-4 z-50"
                  onMouseEnter={() => handleMouseEnter('carte-grise')}
                  onMouseLeave={handleMouseLeave}
                  style={{ zIndex: 9999 }}
                >
                  <div className="px-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Les plus populaires */}
                      <div>
                        <h3 className="text-xs font-semibold text-gray-900 mb-3 flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          Les plus populaires (6)
                        </h3>
                        <div className="space-y-1">
                          <Link href="/carte-grise/changement-titulaire" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Changement de titulaire
                          </Link>
                          <Link href="/carte-grise/duplicata" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Duplicata carte grise
                          </Link>
                          <Link href="/carte-grise/immatriculation-provisoire-ww" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Immatriculation provisoire WW
                          </Link>
                          <Link href="/carte-grise/enregistrement-cession" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Enregistrement de cession
                          </Link>
                          <Link href="/carte-grise/changement-adresse" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Changement d'adresse carte grise
                          </Link>
                          <Link href="/carte-grise/fiche-identification" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Fiche d'identification d'un véhicule
                          </Link>
                        </div>

                        <h3 className="text-xs font-semibold text-gray-900 mb-3 flex items-center mt-4">
                          <Shield className="w-3 h-3 text-blue-500 mr-1" />
                          Pour les pros de l'auto (2)
                        </h3>
                        <div className="space-y-1">
                          <Link href="/carte-grise/declaration-achat" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Déclaration d'achat
                          </Link>
                          <Link href="/carte-grise/w-garage" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            W garage
                          </Link>
                        </div>
                      </div>

                      {/* Autres démarches */}
                      <div>
                        <h3 className="text-xs font-semibold text-gray-900 mb-3 flex items-center">
                          <FileText className="w-3 h-3 text-gray-500 mr-1" />
                          Autres démarches (14)
                        </h3>
                        <div className="space-y-1">
                          <Link href="/carte-grise/vehicule-etranger" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Carte grise véhicule étranger
                          </Link>
                          <Link href="/carte-grise/collection" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Carte grise collection
                          </Link>
                          <Link href="/carte-grise/ajout-mention-collection" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Ajout mention collection
                          </Link>
                          <Link href="/carte-grise/succession" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Succession
                          </Link>
                          <Link href="/carte-grise/premiere-immatriculation-neuf" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            1ère immatriculation véhicule neuf
                          </Link>
                          <Link href="/carte-grise/changement-etat-civil" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Changement état civil ou matrimonial
                          </Link>
                          <Link href="/carte-grise/changement-caracteristiques" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Changement caractéristiques techniques
                          </Link>
                          <Link href="/carte-grise/changement-raison-sociale" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Changement de raison sociale
                          </Link>
                          <Link href="/carte-grise/correction-erreur" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Correction erreur carte grise
                          </Link>
                          <Link href="/carte-grise/usurpation-plaques" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Usurpation de plaques
                          </Link>
                          <Link href="/carte-grise/ajout-retrait-cotitulaire" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Ajout / retrait d'un cotitulaire
                          </Link>
                          <Link href="/carte-grise/changement-locataire-leasing" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Changement de locataire leasing
                          </Link>
                          <Link href="/carte-grise/ajout-retrait-locataire-leasing" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Ajout / retrait locataire leasing
                          </Link>
                          <Link href="/carte-grise/changement-adresse-leasing" className="block text-xs text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                            Changement d'adresse leasing
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Plaque immatriculation */}
            <Link href="/plaque-immatriculation" className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">
              <Car className="w-4 h-4" />
                <span>Plaque immatriculation</span>
                          </Link>
            
            <Link href="/notre-mission" className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">
              <Globe className="w-4 h-4" />
              <span>Commander Votre COC</span>
            </Link>
            
            <Link href="/connexion" className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">
              <LogIn className="w-4 h-4" />
              <span>Connexion</span>
            </Link>
          </nav>

          {/* Right side - Phone and CTA */}
          <div className="flex items-center space-x-4">
            <a href="tel:0147851000" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
              <Phone className="w-4 h-4" />
              <div className="text-right">
                <div className="text-sm font-semibold">01 47 85 10 00</div>
                <div className="text-xs text-gray-500">Appel gratuit</div>
              </div>
            </a>

            <Link
              href="/pro"
              className="btn btn-secondary px-4 py-2 text-sm font-semibold"
            >
              Pro
            </Link>

            <Link
              href="/commander"
              className="btn btn-primary px-5 py-2 text-sm font-semibold"
            >
              Commander
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-1.5"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default HeaderTest


'use client'

import { useState, useRef, useEffect, startTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone, Car, FileText, User, LogIn, ChevronDown, Shield, Clock, CreditCard, Star, Globe, LogOut } from 'lucide-react'
import { useSupabaseSession } from '@/hooks/useSupabaseSession'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const Header = () => {
  const { user, loading } = useSupabaseSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (dropdown: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveDropdown(dropdown)
    
    // Prefetch carte-grise page when dropdown opens
    if (dropdown === 'carte-grise' || dropdown === 'mobile-carte-grise') {
      startTransition(() => {
        router.prefetch('/carte-grise')
        // Prefetch all document type variations
        const types = [
          'changement-titulaire',
          'duplicata',
          'immatriculation-provisoire-ww',
          'enregistrement-cession',
          'changement-adresse',
          'fiche-identification',
          'declaration-achat',
          'w-garage'
        ]
        types.forEach(type => {
          router.prefetch(`/carte-grise?type=${type}`)
        })
      })
    }
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 300) // 300ms delay
  }

  // Debug function to check dropdown state
  console.log('Active dropdown:', activeDropdown)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <header className="bg-white shadow-sm border-b w-full max-w-full overflow-x-hidden overflow-y-visible relative" style={{ zIndex: 9999 }}>
      {/* Main navigation */}
      <div className="container overflow-visible">
        <div className="flex items-center justify-between py-6 overflow-visible">
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
          <nav className="hidden lg:flex items-center space-x-6 overflow-visible">
            {/* Carte grise */}
            <Link 
              href="/carte-grise"
              className="flex items-center space-x-1.5 transition-colors text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              <FileText className="w-4 h-4" />
              <span>Carte grise</span>
            </Link>
            
            {/* Plaque immatriculation */}
            <Link href="/plaque-immatriculation" className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">
              <Car className="w-4 h-4" />
                <span>Plaque immatriculation</span>
                          </Link>
            
            <Link href="/notre-mission" className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">
              <Globe className="w-4 h-4" />
              <span>Commander Votre COC</span>
            </Link>
            
            {user ? (
              <Link href="/dashboard" className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">
                <User className="w-4 h-4" />
                <span>Mon espace</span>
              </Link>
            ) : (
              <Link href="/connexion" className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium">
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </Link>
            )}
          </nav>

          {/* Right side - Phone and CTA */}
          <div className="flex items-center space-x-4">
            {/* Phone */}
            <a href="tel:0147851000" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
              <Phone className="w-4 h-4" />
              <div className="text-right">
                <div className="text-sm font-semibold">01 47 85 10 00</div>
                <div className="text-xs text-gray-500">Appel gratuit</div>
              </div>
            </a>

            {/* Commander Button */}
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t py-3">
            <nav className="space-y-3">
              {/* Mobile Carte grise dropdown */}
              <div>
                <div className="flex items-center justify-between w-full">
                  <Link
                    href="/carte-grise"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Carte grise</span>
                  </Link>
                  <button
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setActiveDropdown(activeDropdown === 'mobile-carte-grise' ? null : 'mobile-carte-grise')}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-carte-grise' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {activeDropdown === 'mobile-carte-grise' && (
                  <div className="ml-6 mt-2 space-y-3">
                    {/* Les plus populaires */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        Les plus populaires (6)
                      </h4>
                      <div className="space-y-1">
                        <Link 
                          href="/carte-grise?type=changement-titulaire" 
                          prefetch={true}
                          className="block text-sm text-gray-600 hover:text-primary-600 transition-colors" 
                          onClick={() => setIsMenuOpen(false)}
                          onMouseEnter={() => router.prefetch('/carte-grise?type=changement-titulaire')}
                        >
                          Changement de titulaire
                        </Link>
                        <Link 
                          href="/carte-grise?type=duplicata" 
                          prefetch={true}
                          className="block text-sm text-gray-600 hover:text-primary-600 transition-colors" 
                          onClick={() => setIsMenuOpen(false)}
                          onMouseEnter={() => router.prefetch('/carte-grise?type=duplicata')}
                        >
                          Duplicata carte grise
                        </Link>
                        <Link 
                          href="/carte-grise?type=immatriculation-provisoire-ww" 
                          prefetch={true}
                          className="block text-sm text-gray-600 hover:text-primary-600 transition-colors" 
                          onClick={() => setIsMenuOpen(false)}
                          onMouseEnter={() => router.prefetch('/carte-grise?type=immatriculation-provisoire-ww')}
                        >
                          Immatriculation provisoire WW
                        </Link>
                        <Link 
                          href="/carte-grise?type=enregistrement-cession" 
                          prefetch={true}
                          className="block text-sm text-gray-600 hover:text-primary-600 transition-colors" 
                          onClick={() => setIsMenuOpen(false)}
                          onMouseEnter={() => router.prefetch('/carte-grise?type=enregistrement-cession')}
                        >
                          Enregistrement de cession
                        </Link>
                        <Link 
                          href="/carte-grise?type=changement-adresse" 
                          prefetch={true}
                          className="block text-sm text-gray-600 hover:text-primary-600 transition-colors" 
                          onClick={() => setIsMenuOpen(false)}
                          onMouseEnter={() => router.prefetch('/carte-grise?type=changement-adresse')}
                        >
                          Changement d'adresse carte grise
                        </Link>
                        <Link 
                          href="/carte-grise?type=fiche-identification" 
                          prefetch={true}
                          className="block text-sm text-gray-600 hover:text-primary-600 transition-colors" 
                          onClick={() => setIsMenuOpen(false)}
                          onMouseEnter={() => router.prefetch('/carte-grise?type=fiche-identification')}
                        >
                          Fiche d'identification d'un véhicule
                        </Link>
                      </div>

                      {/* Pour les pros de l'auto */}
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center">
                          <Shield className="w-3 h-3 text-blue-500 mr-1" />
                          Pour les pros de l'auto (2)
                        </h4>
                        <div className="space-y-1">
                          <Link 
                            href="/carte-grise?type=declaration-achat" 
                            prefetch={true}
                            className="block text-sm text-gray-600 hover:text-primary-600 transition-colors" 
                            onClick={() => setIsMenuOpen(false)}
                            onMouseEnter={() => router.prefetch('/carte-grise?type=declaration-achat')}
                          >
                            Déclaration d'achat
                          </Link>
                          <Link 
                            href="/carte-grise?type=w-garage" 
                            prefetch={true}
                            className="block text-sm text-gray-600 hover:text-primary-600 transition-colors" 
                            onClick={() => setIsMenuOpen(false)}
                            onMouseEnter={() => router.prefetch('/carte-grise?type=w-garage')}
                          >
                            W garage
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile Plaque immatriculation */}
              <Link
                href="/plaque-immatriculation"
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                >
                    <Car className="w-4 h-4" />
                    <span>Plaque immatriculation</span>
                    </Link>
              
              <Link
                href="/notre-mission"
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Globe className="w-4 h-4" />
                <span>Commander Votre COC</span>
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Mon espace</span>
                  </Link>
                  <button
                    onClick={async () => {
                      const supabase = createClient()
                      await supabase.auth.signOut()
                      setIsMenuOpen(false)
                      router.push('/')
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/connexion"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Connexion</span>
                </Link>
              )}

              <div className="pt-4 border-t space-y-2">
                <a href="tel:0147851000" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <Phone className="w-4 h-4" />
                  <div>
                    <div className="font-medium">01 47 85 10 00</div>
                    <div className="text-xs text-gray-500">Appel gratuit</div>
                  </div>
                </a>
                
                <Link
                  href="/commander"
                  className="btn btn-primary w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Commander
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
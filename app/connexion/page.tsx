'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ConnexionPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  
  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Signup state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailSignup: '',
    passwordSignup: '',
    confirmPassword: '',
    phone: '',
  })
  const [showPasswordSignup, setShowPasswordSignup] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoadingSignup, setIsLoadingSignup] = useState(false)
  const [errorSignup, setErrorSignup] = useState('')
  const [success, setSuccess] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message === 'Invalid login credentials' 
          ? 'Email ou mot de passe incorrect' 
          : authError.message)
        return
      }

      if (data.user) {
        // Check user role from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        // If admin tries to login here, redirect them to admin login
        if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
          await supabase.auth.signOut()
          setError('Les administrateurs doivent se connecter via la page d\'administration')
          setTimeout(() => {
            router.push('/admin/login')
          }, 2000)
          return
        }

        // Regular users - redirect to dashboard
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingSignup(true)
    setErrorSignup('')

    if (formData.passwordSignup !== formData.confirmPassword) {
      setErrorSignup('Les mots de passe ne correspondent pas')
      setIsLoadingSignup(false)
      return
    }

    if (formData.passwordSignup.length < 6) {
      setErrorSignup('Le mot de passe doit contenir au moins 6 caractères')
      setIsLoadingSignup(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Créer le compte via l'API avec confirmation automatique de l'email
      const createUserResponse = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.emailSignup,
          password: formData.passwordSignup,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        }),
      })

      const createUserResult = await createUserResponse.json()

      if (!createUserResponse.ok) {
        throw new Error(createUserResult.error || 'Erreur lors de la création du compte')
      }

      // Se connecter automatiquement après la création
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.emailSignup,
        password: formData.passwordSignup,
      })

      if (signInError) {
        // Si la connexion échoue, on affiche juste un message de succès et on passe à l'onglet login
        setSuccess(true)
        setTimeout(() => {
          setActiveTab('login')
          setSuccess(false)
          setEmail(formData.emailSignup)
        }, 2000)
      } else {
        // Connexion réussie, vérifier le rôle et rediriger
        const { data: { user: signedInUser } } = await supabase.auth.getUser()
        
        if (signedInUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', signedInUser.id)
            .single()

          setSuccess(true)
          setTimeout(() => {
            if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
              window.location.href = '/admin'
            } else {
              window.location.href = '/dashboard'
            }
          }, 1500)
        } else {
          setSuccess(true)
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1500)
        }
      }
    } catch (error: any) {
      setErrorSignup(error.message || 'Une erreur est survenue')
    } finally {
      setIsLoadingSignup(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo.png"
              alt="EMatricule"
              width={200}
              height={64}
              className="h-16 w-auto mx-auto"
            />
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('login')
                setError('')
                setErrorSignup('')
              }}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'login'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => {
                setActiveTab('signup')
                setError('')
                setErrorSignup('')
              }}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'signup'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Inscription
            </button>
          </div>

          <div className="p-8">
            {/* Login Form */}
            {activeTab === 'login' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Bienvenue
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Connectez-vous à votre compte EMatricule
                </p>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="votre@email.com"
                        required
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="Votre mot de passe"
                        required
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                      <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
                    </label>
                    <Link href="/mot-de-passe-oublie" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Connexion...</span>
                      </>
                    ) : (
                      <span>Se connecter</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {success ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Compte créé avec succès !
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Vous pouvez maintenant vous connecter
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('login')
                        setSuccess(false)
                      }}
                      className="text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Se connecter maintenant
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                      Créer un compte
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                      Rejoignez EMatricule et simplifiez vos démarches
                    </p>

                    <form onSubmit={handleSignup} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                            Prénom
                          </label>
                          <div className="relative">
                            <input
                              id="firstName"
                              name="firstName"
                              type="text"
                              value={formData.firstName}
                              onChange={handleSignupChange}
                              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="Prénom"
                              required
                            />
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                            Nom
                          </label>
                          <div className="relative">
                            <input
                              id="lastName"
                              name="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={handleSignupChange}
                              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="Nom"
                              required
                            />
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="emailSignup" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <input
                            id="emailSignup"
                            name="emailSignup"
                            type="email"
                            value={formData.emailSignup}
                            onChange={handleSignupChange}
                            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="votre@email.com"
                            required
                          />
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                          Téléphone
                        </label>
                        <div className="relative">
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleSignupChange}
                            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="06 12 34 56 78"
                          />
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="passwordSignup" className="block text-sm font-semibold text-gray-700 mb-2">
                          Mot de passe
                        </label>
                        <div className="relative">
                          <input
                            id="passwordSignup"
                            name="passwordSignup"
                            type={showPasswordSignup ? 'text' : 'password'}
                            value={formData.passwordSignup}
                            onChange={handleSignupChange}
                            className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="Minimum 6 caractères"
                            required
                          />
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <button
                            type="button"
                            onClick={() => setShowPasswordSignup(!showPasswordSignup)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPasswordSignup ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirmer le mot de passe
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleSignupChange}
                            className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="Confirmer le mot de passe"
                            required
                          />
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {errorSignup && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
                        >
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm">{errorSignup}</span>
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoadingSignup}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                      >
                        {isLoadingSignup ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Création...</span>
                          </>
                        ) : (
                          <span>Créer mon compte</span>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            En continuant, vous acceptez nos{' '}
            <Link href="/conditions" className="text-primary-600 hover:text-primary-700 font-medium">
              Conditions d'utilisation
            </Link>
            {' '}et notre{' '}
            <Link href="/confidentialite" className="text-primary-600 hover:text-primary-700 font-medium">
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}


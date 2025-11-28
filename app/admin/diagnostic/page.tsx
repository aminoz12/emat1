'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DiagnosticPage() {
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostic = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // Check auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      const adminEmails = ['mhammed@ematricule.fr', 'admin2@ematricule.fr', 'admin3@ematricule.fr']
      const foundAuthUsers = authUsers?.users?.filter(u => adminEmails.includes(u.email || '')) || []

      // Check profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('email', adminEmails)

      const diagnostic = {
        authUsers: {
          found: foundAuthUsers.length,
          users: foundAuthUsers.map(u => ({
            id: u.id,
            email: u.email,
            emailConfirmed: !!u.email_confirmed_at,
            createdAt: u.created_at
          }))
        },
        profiles: {
          found: profiles?.length || 0,
          profiles: profiles || []
        },
        missing: {
          inAuthButNotInProfiles: foundAuthUsers.filter(au => 
            !profiles?.some(p => p.id === au.id)
          ).map(u => ({ id: u.id, email: u.email })),
          inProfilesButNotInAuth: profiles?.filter(p => 
            !foundAuthUsers.some(au => au.id === p.id)
          ) || []
        }
      }

      setResults(diagnostic)
    } catch (error: any) {
      console.error('Diagnostic error:', error)
      setResults({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const fixMissingProfiles = async () => {
    if (!results?.missing?.inAuthButNotInProfiles?.length) {
      alert('Aucun profil manquant à créer')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()

      for (const user of results.missing.inAuthButNotInProfiles) {
        const role = user.email === 'mhammed@ematricule.fr' ? 'SUPER_ADMIN' : 'ADMIN'
        
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            role: role
          })

        if (error) {
          console.error(`Error creating profile for ${user.email}:`, error)
        }
      }

      alert('Profils créés! Rafraîchissez la page.')
      runDiagnostic()
    } catch (error: any) {
      alert('Erreur: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Diagnostic des Administrateurs
          </h1>
          <p className="text-gray-600 mb-8">
            Cette page vérifie l'état des comptes administrateurs dans auth.users et profiles.
          </p>

          <div className="mb-6">
            <button
              onClick={runDiagnostic}
              disabled={isLoading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Analyse en cours...' : 'Lancer le diagnostic'}
            </button>
          </div>

          {results && (
            <div className="space-y-6">
              {/* Auth Users */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Utilisateurs dans auth.users
                </h2>
                <p className="text-sm text-gray-700 mb-2">
                  Trouvés: {results.authUsers?.found || 0} / 3
                </p>
                {results.authUsers?.users?.length > 0 ? (
                  <div className="space-y-2">
                    {results.authUsers.users.map((user: any) => (
                      <div key={user.id} className="p-3 bg-white rounded border">
                        <p className="font-medium">{user.email}</p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                        <p className="text-xs text-gray-500">
                          Email confirmé: {user.emailConfirmed ? 'Oui' : 'Non'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-red-600">
                    ⚠️ Aucun utilisateur trouvé dans auth.users
                  </p>
                )}
              </div>

              {/* Profiles */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Profils dans profiles
                </h2>
                <p className="text-sm text-gray-700 mb-2">
                  Trouvés: {results.profiles?.found || 0} / 3
                </p>
                {results.profiles?.profiles?.length > 0 ? (
                  <div className="space-y-2">
                    {results.profiles.profiles.map((profile: any) => (
                      <div key={profile.id} className="p-3 bg-white rounded border">
                        <p className="font-medium">{profile.email || 'Email manquant!'}</p>
                        <p className="text-xs text-gray-500">ID: {profile.id}</p>
                        <p className="text-xs text-gray-500">Rôle: {profile.role}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-red-600">
                    ⚠️ Aucun profil trouvé
                  </p>
                )}
              </div>

              {/* Missing */}
              {results.missing?.inAuthButNotInProfiles?.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Profils manquants
                  </h2>
                  <p className="text-sm text-gray-700 mb-3">
                    {results.missing.inAuthButNotInProfiles.length} utilisateur(s) dans auth.users mais pas de profil
                  </p>
                  <button
                    onClick={fixMissingProfiles}
                    disabled={isLoading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Créer les profils manquants
                  </button>
                </div>
              )}

              {/* Instructions */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Instructions
                </h3>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Si des utilisateurs manquent dans auth.users, créez-les dans Supabase Auth</li>
                  <li>Si des profils manquent, utilisez le bouton "Créer les profils manquants"</li>
                  <li>Si les emails manquent dans les profils, exécutez le script SQL: <code className="bg-gray-200 px-1 rounded">scripts/fix-admin-profiles.sql</code></li>
                  <li>Vérifiez que les mots de passe sont corrects dans Supabase Auth</li>
                </ol>
              </div>
            </div>
          )}

          {results?.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Erreur:</p>
              <p className="text-sm text-red-700">{results.error}</p>
              <p className="text-xs text-red-600 mt-2">
                Note: Cette page nécessite des droits admin. Utilisez le script SQL à la place.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



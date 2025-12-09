'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AdminToCreate {
  email: string
  password: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  label: string
}

export default function InitAdminsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Array<{ email: string; status: 'success' | 'error'; message: string }>>([])
  const [completed, setCompleted] = useState(false)

  const adminsToCreate: AdminToCreate[] = [
    {
      email: 'mhammed@ematricule.fr',
      password: 'Mhammed92@++',
      role: 'SUPER_ADMIN',
      label: 'Main Admin (Super Admin - Protégé)'
    },
    {
      email: 'admin2@ematricule.fr',
      password: 'Espace92@++',
      role: 'ADMIN',
      label: 'Admin 2'
    },
    {
      email: 'admin3@ematricule.fr',
      password: 'Espace92@++',
      role: 'ADMIN',
      label: 'Admin 3'
    }
  ]

  const createAdmins = async () => {
    setIsLoading(true)
    setResults([])
    setCompleted(false)

    const newResults: Array<{ email: string; status: 'success' | 'error'; message: string }> = []

    for (const admin of adminsToCreate) {
      try {
        const supabase = createClient()

        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const userExists = existingUsers?.users?.some(u => u.email === admin.email)

        if (userExists) {
          // User exists, just update the profile
          const { data: authUser } = await supabase.auth.admin.listUsers()
          const user = authUser?.users?.find(u => u.email === admin.email)

          if (user) {
            // Update profile
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                email: admin.email,
                role: admin.role,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'id'
              })

            if (profileError) {
              throw new Error(`Erreur profil: ${profileError.message}`)
            }

            newResults.push({
              email: admin.email,
              status: 'success',
              message: `Utilisateur existant mis à jour avec rôle ${admin.role}`
            })
          } else {
            throw new Error('Utilisateur trouvé mais ID introuvable')
          }
        } else {
          // Create new user via API route (uses service role)
          const response = await fetch('/api/admin/init-admins', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: admin.email,
              password: admin.password,
              role: admin.role
            })
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de la création')
          }

          newResults.push({
            email: admin.email,
            status: 'success',
            message: data.message || `Créé avec succès (${admin.role})`
          })
        }
      } catch (error: any) {
        console.error(`Erreur pour ${admin.email}:`, error)
        newResults.push({
          email: admin.email,
          status: 'error',
          message: error.message || 'Erreur inconnue'
        })
      }
    }

    setResults(newResults)
    setCompleted(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Initialisation des Administrateurs
          </h1>
          <p className="text-gray-600 mb-8">
            Cette page crée les 3 administrateurs initiaux du système.
          </p>

          {/* Admins to create */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Administrateurs à créer:
            </h2>
            <div className="space-y-3">
              {adminsToCreate.map((admin, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{admin.email}</p>
                      <p className="text-sm text-gray-600">{admin.label}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      admin.role === 'SUPER_ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {admin.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create button */}
          <div className="mb-8">
            <button
              onClick={createAdmins}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {isLoading ? 'Création en cours...' : 'Créer les 3 administrateurs'}
            </button>
          </div>

          {/* Results */}
          {completed && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Résultats:</h3>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${
                        result.status === 'success' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {result.email}
                      </p>
                      <p className={`text-sm ${
                        result.status === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                    {result.status === 'success' ? (
                      <span className="text-green-600 text-2xl">✓</span>
                    ) : (
                      <span className="text-red-600 text-2xl">✗</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Important note */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note importante:</strong> Si la création échoue, vous devrez peut-être créer les utilisateurs manuellement via Supabase Auth ou utiliser l'API Admin avec la clé de service. 
              Le main admin (mhammed@ematricule.fr) est protégé et ne peut pas être modifié ou supprimé.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SetupAdminsPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [admins, setAdmins] = useState<Array<{ email: string; role: string }>>([])

  const addAdmin = async () => {
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer un email' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()

      // First, find the user by email in auth.users (we need to query profiles)
      const { data: profiles, error: searchError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .ilike('email', email.trim())

      if (searchError) {
        throw new Error('Erreur lors de la recherche: ' + searchError.message)
      }

      if (!profiles || profiles.length === 0) {
        setMessage({ 
          type: 'error', 
          text: `Aucun utilisateur trouvé avec l'email: ${email}. L'utilisateur doit d'abord créer un compte.` 
        })
        setIsLoading(false)
        return
      }

      // Update all matching profiles to ADMIN
      const profileIds = profiles.map(p => p.id)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'ADMIN' })
        .in('id', profileIds)

      if (updateError) {
        throw new Error('Erreur lors de la mise à jour: ' + updateError.message)
      }

      setMessage({ 
        type: 'success', 
        text: `${profiles.length} utilisateur(s) défini(s) comme ADMIN avec succès!` 
      })
      setEmail('')
      
      // Refresh admin list
      fetchAdmins()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAdmins = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('email, role')
        .in('role', ['ADMIN', 'SUPER_ADMIN'])
        .order('email')

      if (error) throw error
      setAdmins(data || [])
    } catch (error: any) {
      console.error('Error fetching admins:', error)
    }
  }

  // Fetch admins on mount
  useEffect(() => {
    fetchAdmins()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuration des Administrateurs
          </h1>
          <p className="text-gray-600 mb-8">
            Ajoutez des administrateurs en entrant leur adresse email. 
            L'utilisateur doit avoir un compte existant.
          </p>

          {/* Add Admin Form */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ajouter un administrateur
            </h2>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addAdmin()
                  }
                }}
              />
              <button
                onClick={addAdmin}
                disabled={isLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>

            {message && (
              <div className={`mt-4 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}
          </div>

          {/* Current Admins List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Administrateurs actuels
              </h2>
              <button
                onClick={fetchAdmins}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Actualiser
              </button>
            </div>

            {admins.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun administrateur trouvé
              </p>
            ) : (
              <div className="space-y-2">
                {admins.map((admin, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{admin.email}</p>
                      <p className="text-sm text-gray-500">
                        Rôle: {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                      {admin.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SQL Script Section */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Alternative: Script SQL pour Supabase
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Vous pouvez également exécuter ce script SQL directement dans l'éditeur SQL de Supabase:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs">
{`-- Mettre à jour 3 utilisateurs en ADMIN par leur email
UPDATE profiles
SET role = 'ADMIN'
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
);`}
              </pre>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Remplacez les emails par les emails réels de vos utilisateurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


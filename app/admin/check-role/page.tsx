'use client'

import { useState, useEffect } from 'react'
import { useSupabaseSession } from '@/hooks/useSupabaseSession'
import { createClient } from '@/lib/supabase/client'

export default function CheckRolePage() {
  const { user, loading } = useSupabaseSession()
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkRole = async () => {
      if (loading || !user) return

      try {
        const supabase = createClient()
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          setError(profileError.message)
          return
        }

        setProfile(data)
      } catch (err: any) {
        setError(err.message)
      }
    }

    checkRole()
  }, [user, loading])

  const makeAdmin = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'ADMIN' })
        .eq('id', user.id)

      if (error) {
        alert('Erreur: ' + error.message)
      } else {
        alert('Rôle ADMIN défini avec succès! Rafraîchissez la page.')
        window.location.reload()
      }
    } catch (err: any) {
      alert('Erreur: ' + err.message)
    }
  }

  if (loading) {
    return <div className="p-8">Chargement...</div>
  }

  if (!user) {
    return <div className="p-8">Veuillez vous connecter</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Vérification du rôle utilisateur</h1>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-600">Email:</p>
          <p className="font-medium">{user.email}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">User ID:</p>
          <p className="font-mono text-xs">{user.id}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
            <p className="font-medium">Erreur:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {profile ? (
          <>
            <div>
              <p className="text-sm text-gray-600">Rôle actuel:</p>
              <p className={`font-bold text-lg ${
                profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {profile.role || 'USER (par défaut)'}
              </p>
            </div>

            {profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN' && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                <p className="text-sm text-yellow-800 mb-3">
                  Votre compte n'a pas le rôle ADMIN. Cliquez sur le bouton ci-dessous pour définir votre rôle comme ADMIN.
                </p>
                <button
                  onClick={makeAdmin}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Définir comme ADMIN
                </button>
              </div>
            )}

            {profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN' ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <p className="text-green-800">
                  ✓ Votre compte a le rôle ADMIN. Vous pouvez accéder à{' '}
                  <a href="/admin" className="underline font-medium">/admin</a>
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-yellow-800 mb-3">
              Aucun profil trouvé. Création d'un profil avec rôle ADMIN...
            </p>
            <button
              onClick={async () => {
                try {
                  const supabase = createClient()
                  const { error } = await supabase
                    .from('profiles')
                    .insert({
                      id: user.id,
                      email: user.email || '',
                      role: 'ADMIN'
                    })

                  if (error) {
                    alert('Erreur: ' + error.message)
                  } else {
                    alert('Profil créé avec rôle ADMIN!')
                    window.location.reload()
                  }
                } catch (err: any) {
                  alert('Erreur: ' + err.message)
                }
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Créer le profil ADMIN
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


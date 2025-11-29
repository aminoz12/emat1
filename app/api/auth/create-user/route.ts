import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST - Create user with auto-confirmed email (no email confirmation required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, address, postalCode, city } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Create user with auto-confirmed email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email - no confirmation needed
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      },
    })

    if (authError) {
      console.error('Erreur création utilisateur:', authError)
      return NextResponse.json(
        { error: authError.message || 'Erreur lors de la création du compte' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Impossible de créer le compte' },
        { status: 500 }
      )
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: firstName || '',
        last_name: lastName || '',
        phone: phone || '',
        address: address || '',
        postal_code: postalCode || '',
        city: city || '',
        role: 'USER',
      })

    if (profileError) {
      console.error('Erreur création profil:', profileError)
      // Continue anyway - user is created
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Erreur API create-user:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}


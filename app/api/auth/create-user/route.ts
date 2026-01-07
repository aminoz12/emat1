import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST - Create user with auto-confirmed email (no email confirmation required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, address, postalCode, city } = body

    console.log('Création utilisateur - Données reçues:', {
      email,
      hasPassword: !!password,
      firstName,
      lastName,
      phone,
      address,
      postalCode,
      city
    })

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
      console.error('Détails erreur auth:', JSON.stringify(authError, null, 2))
      
      // Provide more specific error messages
      let errorMessage = authError.message || 'Erreur lors de la création du compte'
      if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
        errorMessage = 'Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.'
      } else if (authError.message?.includes('password')) {
        errorMessage = 'Le mot de passe ne respecte pas les critères requis.'
      } else if (authError.message?.includes('email')) {
        errorMessage = 'L\'email fourni n\'est pas valide.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? authError.message : undefined
        },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Impossible de créer le compte' },
        { status: 500 }
      )
    }

    // Wait a bit for trigger to create profile (if it exists)
    await new Promise(resolve => setTimeout(resolve, 100))

    // Update profile with user information (profile might already exist from trigger)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        email: email,
        first_name: firstName || null,
        last_name: lastName || null,
        phone: phone || null,
        address: address || null,
        zip_code: postalCode || null,
        city: city || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authData.user.id)
      .select()
      .single()

    if (profileError) {
      console.error('Erreur mise à jour profil (essai update):', profileError)
      
      // If update failed, try insert (profile might not exist yet)
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          first_name: firstName || null,
          last_name: lastName || null,
          phone: phone || null,
          address: address || null,
          zip_code: postalCode || null,
          city: city || null,
          role: 'USER',
        })
        .select()
        .single()

      if (insertError) {
        console.error('Erreur insertion profil:', insertError)
        console.error('Détails erreur:', JSON.stringify(insertError, null, 2))
      } else {
        console.log('Profil créé avec succès (insert):', insertData)
      }
    } else {
      console.log('Profil mis à jour avec succès (update):', profileData)
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


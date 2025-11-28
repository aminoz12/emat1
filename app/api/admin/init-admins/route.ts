import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint uses the service role key to create users
// IMPORTANT: This should only be accessible in development or with proper authentication
const MAIN_ADMIN_EMAIL = 'mhammed@ematricule.fr'

export async function POST(request: NextRequest) {
  try {
    // Get service role key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      )
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await request.json()
    const { email, password, role } = body

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Error checking existing users' },
        { status: 500 }
      )
    }

    const existingUser = existingUsers?.users?.find(u => u.email === email)

    let userId: string

    if (existingUser) {
      // User exists, update password and profile
      userId = existingUser.id

      // Update password
      const { error: updatePasswordError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password }
      )

      if (updatePasswordError) {
        console.error('Error updating password:', updatePasswordError)
        return NextResponse.json(
          { error: 'Error updating password' },
          { status: 500 }
        )
      }
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Auto-confirm email
      })

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { error: `Error creating user: ${createError.message}` },
          { status: 500 }
        )
      }

      if (!newUser.user) {
        return NextResponse.json(
          { error: 'User not created' },
          { status: 500 }
        )
      }

      userId = newUser.user.id
    }

    // Create or update profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email,
        role,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return NextResponse.json(
        { error: 'Error updating profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: existingUser ? 'User updated successfully' : 'User created successfully',
      userId,
      email
    })

  } catch (error: any) {
    console.error('Error in init-admins API:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}



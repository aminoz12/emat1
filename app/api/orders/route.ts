import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      )
    }

    // Ensure profile exists (should be created by trigger, but check just in case)
    // Wait a bit for trigger to create profile if it exists
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let profileExists = false
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profile && !profileError) {
      profileExists = true
    }

    if (!profileExists) {
      // Profile doesn't exist, try to create it using admin client
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const supabaseAdmin = createAdminClient()
        
        // Use upsert to handle race conditions
        const { error: upsertError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email || '',
            role: 'USER'
          }, {
            onConflict: 'id'
          })

        if (upsertError) {
          console.error('Erreur upsert profil:', upsertError)
          console.error('Détails erreur:', JSON.stringify(upsertError, null, 2))
          
          // Try one more time with a simple insert
          await new Promise(resolve => setTimeout(resolve, 200))
          const { error: retryError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              role: 'USER'
            })
            .select()
            .single()
          
          if (retryError && !retryError.message?.includes('duplicate') && !retryError.code?.includes('23505')) {
            return NextResponse.json(
              { 
                error: 'Erreur lors de la création du profil utilisateur',
                details: process.env.NODE_ENV === 'development' ? upsertError.message : undefined
              },
              { status: 500 }
            )
          }
        }
      } catch (adminError: any) {
        console.error('Erreur import/admin client:', adminError)
        // Continue anyway - profile might exist from trigger
      }
    }

    const body = await request.json()
    
    const {
      type, // 'carte-grise' | 'plaque' | 'coc'
      vehicleData,
      serviceType,
      price,
      metadata,
      plaqueType // 'permanente' | 'ww-provisoire' (for plaque orders)
    } = body

    // Validate required fields
    if (!type || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Type et prix sont requis' },
        { status: 400 }
      )
    }

    // Ensure price is a number
    const numericPrice = typeof price === 'string' ? parseFloat(price.replace(',', '.')) : Number(price)
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { error: 'Le prix doit être un nombre valide supérieur à 0' },
        { status: 400 }
      )
    }

    // Generate order reference
    const reference = `EM-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // Create vehicle if vehicle data is provided
    let vehicleId = null
    if (vehicleData && (vehicleData.vin || vehicleData.registrationNumber)) {
      // Check if vehicle already exists
      if (vehicleData.vin) {
        const { data: existingVehicle } = await supabase
          .from('vehicles')
          .select('id')
          .eq('vin', vehicleData.vin.toUpperCase())
          .single()

        if (existingVehicle) {
          vehicleId = existingVehicle.id
        }
      }

      // Create new vehicle if not found
      if (!vehicleId) {
        const { data: newVehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .insert({
            vin: vehicleData.vin?.toUpperCase() || null,
            make: vehicleData.marque || vehicleData.make || null,
            model: vehicleData.model || null,
            year: vehicleData.year || null,
            registration_number: vehicleData.registrationNumber?.toUpperCase() || null,
          })
          .select('id')
          .single()

        if (vehicleError) {
          console.error('Erreur création véhicule:', vehicleError)
          // Continue without vehicle - not critical
        } else if (newVehicle) {
          vehicleId = newVehicle.id
        }
      }
    }

    // Final verification: ensure profile exists before creating order
    // This is critical because orders.user_id has a foreign key constraint to profiles.id
    const { data: finalProfileCheck, error: finalProfileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (finalProfileError || !finalProfileCheck) {
      console.error('Profile verification failed before order creation:', finalProfileError)
      console.error('User ID:', user.id)
      
      // Last attempt: try to create profile with admin client
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const supabaseAdmin = createAdminClient()
        
        const { error: finalCreateError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            role: 'USER'
          })
          .select()
          .single()
        
        if (finalCreateError && !finalCreateError.message?.includes('duplicate') && !finalCreateError.code?.includes('23505')) {
          return NextResponse.json(
            { 
              error: 'Le profil utilisateur n\'existe pas et ne peut pas être créé. Veuillez contacter le support.',
              details: process.env.NODE_ENV === 'development' ? finalCreateError.message : undefined
            },
            { status: 500 }
          )
        }
        
        // Wait a moment after creating profile
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (adminErr: any) {
        console.error('Final profile creation attempt failed:', adminErr)
        return NextResponse.json(
          { 
            error: 'Erreur lors de la vérification du profil utilisateur',
            details: process.env.NODE_ENV === 'development' ? adminErr.message : undefined
          },
          { status: 500 }
        )
      }
    }

    // Create the order
    // Build orderData object conditionally to avoid including plaque_type for non-plaque orders
    const orderData: any = {
      user_id: user.id,
      vehicle_id: vehicleId,
      type: type,
      status: 'pending',
      reference: reference,
      price: numericPrice,
      metadata: metadata || {}
    }
    
    // Only add plaque_type for plaque orders
    // IMPORTANT: Only include plaque_type if type is 'plaque' to avoid schema cache errors
    // This prevents Supabase from trying to validate plaque_type for non-plaque orders
    if (type === 'plaque') {
      const finalPlaqueType = plaqueType || metadata?.plaqueType
      if (finalPlaqueType) {
        // Only add if we have a valid value
        orderData.plaque_type = finalPlaqueType
      }
      // If no plaqueType provided, don't include the field at all (let DB use default NULL)
    }
    // For non-plaque orders, plaque_type is NEVER included in the object
    
    console.log('Creating order with data:', {
      type,
      hasPlaqueType: type === 'plaque' ? !!orderData.plaque_type : false,
      plaqueType: type === 'plaque' ? (orderData.plaque_type || 'not provided') : 'N/A (not a plaque order)',
      orderDataKeys: Object.keys(orderData)
    })
    
    // Create a clean object without any undefined/null plaque_type for non-plaque orders
    // This helps avoid Supabase schema cache issues
    const cleanOrderData = { ...orderData }
    if (type !== 'plaque' && 'plaque_type' in cleanOrderData) {
      delete cleanOrderData.plaque_type
    }
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(cleanOrderData)
      .select()
      .single()

    if (orderError) {
      console.error('Erreur création commande:', orderError)
      console.error('Order data attempted:', {
        user_id: user.id,
        vehicle_id: vehicleId,
        type: type,
        price: numericPrice,
        reference: reference,
        metadata: metadata ? 'present' : 'missing'
      })
      console.error('Full error object:', JSON.stringify(orderError, null, 2))
      
      // Return more detailed error information
      let errorMessage = 'Erreur lors de la création de la commande'
      if (orderError.message) {
        errorMessage = orderError.message
      } else if (orderError.code) {
        errorMessage = `Erreur base de données: ${orderError.code}`
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? {
            message: orderError.message,
            code: orderError.code,
            details: orderError.details,
            hint: orderError.hint
          } : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        reference: order.reference,
        status: order.status,
        price: order.price,
        createdAt: order.created_at
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Erreur API orders:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET - Get all orders for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      )
    }

    // Get orders with vehicle info
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        vehicles (
          id,
          make,
          model,
          registration_number,
          vin
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Erreur récupération commandes:', ordersError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commandes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orders: orders || []
    })

  } catch (error: any) {
    console.error('Erreur API orders GET:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}


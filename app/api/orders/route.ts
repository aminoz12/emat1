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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // Profile doesn't exist, create it
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          role: 'USER'
        })

      if (createProfileError) {
        console.error('Erreur création profil:', createProfileError)
        return NextResponse.json(
          { error: 'Erreur lors de la création du profil utilisateur' },
          { status: 500 }
        )
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
    if (!type || !price) {
      return NextResponse.json(
        { error: 'Type et prix sont requis' },
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

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        vehicle_id: vehicleId,
        type: type,
        status: 'pending',
        reference: reference,
        price: price,
        metadata: metadata || {},
        plaque_type: type === 'plaque' ? (plaqueType || metadata?.plaqueType || null) : null
      })
      .select()
      .single()

    if (orderError) {
      console.error('Erreur création commande:', orderError)
      console.error('Order data attempted:', {
        user_id: user.id,
        vehicle_id: vehicleId,
        type: type,
        price: price,
        reference: reference
      })
      return NextResponse.json(
        { 
          error: 'Erreur lors de la création de la commande',
          details: process.env.NODE_ENV === 'development' ? orderError.message : undefined
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


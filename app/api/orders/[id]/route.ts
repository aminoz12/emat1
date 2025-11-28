import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get a single order with all details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: orderId } = await params

    // Get order with all related data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        vehicles (
          id,
          vin,
          make,
          model,
          year,
          engine,
          fuel_type,
          color,
          body_type,
          weight,
          power,
          displacement,
          registration_number
        ),
        profiles:user_id (
          id,
          email,
          first_name,
          last_name,
          phone,
          address,
          city,
          zip_code,
          country
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id) // Ensure user can only access their own orders
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // Get documents for this order
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    if (docsError) {
      console.error('Error fetching documents:', docsError)
    }

    // Get payment info if exists
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (paymentError) {
      console.error('Error fetching payment:', paymentError)
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        documents: documents || [],
        payment: payment || null
      }
    })

  } catch (error: any) {
    console.error('Erreur API order GET:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH - Update order metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: orderId } = await params
    const body = await request.json()

    // Verify order belongs to user
    const { data: existingOrder, error: orderError } = await supabase
      .from('orders')
      .select('id, metadata')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée ou non autorisée' },
        { status: 404 }
      )
    }

    // Merge metadata if provided
    const updatedMetadata = body.metadata 
      ? { ...existingOrder.metadata, ...body.metadata }
      : existingOrder.metadata

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        ...(body.metadata && { metadata: updatedMetadata }),
        ...(body.status && { status: body.status })
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur mise à jour commande:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la commande' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })

  } catch (error: any) {
    console.error('Erreur API order PATCH:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}


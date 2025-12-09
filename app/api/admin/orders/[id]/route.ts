import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET - Get a single order with all details (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Accès refusé. Droits administrateur requis.' },
        { status: 403 }
      )
    }

    const orderId = params.id

    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()

    // Get order with all related data
    const { data: order, error: orderError } = await adminSupabase
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
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // Get documents for this order
    const { data: documents, error: docsError } = await adminSupabase
      .from('documents')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    if (docsError) {
      console.error('Error fetching documents:', docsError)
    }

    // Get payment info if exists
    const { data: payment, error: paymentError } = await adminSupabase
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
    console.error('Erreur API admin order GET:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH - Update order status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Accès refusé. Droits administrateur requis.' },
        { status: 403 }
      )
    }

    const orderId = params.id
    const { status } = await request.json()

    if (!status || !['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()

    // Update order status
    const { data: order, error: updateError } = await adminSupabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError || !order) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order
    })

  } catch (error: any) {
    console.error('Erreur API admin order PATCH:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}


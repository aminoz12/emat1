import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET - Get all orders with pagination and filters
export async function GET(request: NextRequest) {
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

    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const offset = (page - 1) * limit

    // Build query with relations using admin client (bypasses RLS)
    let query = adminSupabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          first_name,
          last_name,
          phone
        ),
        vehicles:vehicle_id (
          id,
          make,
          model,
          registration_number,
          vin
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    const { data: orders, error: ordersError, count } = await query

    console.log('📊 Query result:', {
      ordersCount: orders?.length || 0,
      totalCount: count || 0,
      hasError: !!ordersError,
      error: ordersError
    })

    if (ordersError) {
      console.error('❌ Erreur récupération commandes:', ordersError)
      console.error('Code erreur:', ordersError.code)
      console.error('Message erreur:', ordersError.message)
      console.error('Détails erreur:', ordersError.details)
      console.error('Hint erreur:', ordersError.hint)
      
      // Try to get orders without relations as fallback
      let fallbackQuery = adminSupabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (status && status !== 'all') {
        fallbackQuery = fallbackQuery.eq('status', status)
      }
      if (type && type !== 'all') {
        fallbackQuery = fallbackQuery.eq('type', type)
      }
      
      const { data: ordersSimple, error: simpleError, count: simpleCount } = await fallbackQuery
      
      if (simpleError) {
        console.error('Erreur même sans relations:', simpleError)
        return NextResponse.json(
          { error: `Erreur lors de la récupération des commandes: ${ordersError.message}` },
          { status: 500 }
        )
      }
      
      console.log(`Fallback: ${ordersSimple?.length || 0} commandes récupérées sans relations`)
      
      // Return orders without relations if relations fail
      return NextResponse.json({
        success: true,
        orders: ordersSimple || [],
        pagination: {
          page,
          limit,
          total: simpleCount || 0,
          totalPages: Math.ceil((simpleCount || 0) / limit)
        }
      })
    }

    console.log(`✅ Récupération réussie: ${orders?.length || 0} commandes sur ${count || 0} total`)
    
    const responseData = {
      success: true,
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
    
    console.log('📤 Sending response:', {
      ordersCount: responseData.orders.length,
      total: responseData.pagination.total,
      totalPages: responseData.pagination.totalPages
    })

    return NextResponse.json(responseData)

  } catch (error: any) {
    console.error('Erreur API admin/orders:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH - Update order status
export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'ID de commande et statut requis' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'unpaid']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
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
    console.error('Erreur API admin/orders PATCH:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}


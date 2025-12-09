import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    if (usersError) {
      console.error('Erreur récupération utilisateurs:', usersError)
    }

    // Get total orders count
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
    
    if (ordersError) {
      console.error('Erreur récupération commandes:', ordersError)
    }

    // Get pending orders count
    const { count: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    if (pendingError) {
      console.error('Erreur récupération commandes en attente:', pendingError)
    }

    // Get processing orders count
    const { count: processingOrders, error: processingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing')
    
    if (processingError) {
      console.error('Erreur récupération commandes en cours:', processingError)
    }

    // Get completed orders count
    const { count: completedOrders, error: completedError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
    
    if (completedError) {
      console.error('Erreur récupération commandes terminées:', completedError)
    }

    // Get total revenue from completed orders
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('price')
      .eq('status', 'completed')

    if (revenueError) {
      console.error('Erreur récupération revenus:', revenueError)
    }

    const totalRevenue = revenueData?.reduce((sum, order) => {
      const price = typeof order.price === 'string' 
        ? parseFloat(order.price) 
        : (order.price || 0)
      return sum + price
    }, 0) || 0

    // Get orders by type
    const { count: carteGriseCount, error: carteGriseError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'carte-grise')
    
    if (carteGriseError) {
      console.error('Erreur récupération cartes grises:', carteGriseError)
    }

    const { count: plaqueCount, error: plaqueError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'plaque')
    
    if (plaqueError) {
      console.error('Erreur récupération plaques:', plaqueError)
    }

    const { count: cocCount, error: cocError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'coc')
    
    if (cocError) {
      console.error('Erreur récupération COC:', cocError)
    }

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { count: recentOrdersCount, error: recentOrdersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())
    
    if (recentOrdersError) {
      console.error('Erreur récupération commandes récentes:', recentOrdersError)
    }

    // Get new users this month
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { count: newUsersThisMonth, error: newUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString())
    
    if (newUsersError) {
      console.error('Erreur récupération nouveaux utilisateurs:', newUsersError)
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        processingOrders: processingOrders || 0,
        completedOrders: completedOrders || 0,
        totalRevenue: totalRevenue,
        recentOrders: recentOrdersCount || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        ordersByType: {
          carteGrise: carteGriseCount || 0,
          plaque: plaqueCount || 0,
          coc: cocCount || 0
        }
      }
    })

  } catch (error: any) {
    console.error('Erreur API admin/stats:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}


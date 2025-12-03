import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const body = await request.json()
    const { orderId, amount, currency = 'eur' } = body

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'orderId et amount sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que la commande appartient à l'utilisateur
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, price, status')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande non trouvée ou non autorisée' },
        { status: 404 }
      )
    }

    // Call backend API to create SumUp checkout
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/payments/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getToken(supabase)}`
      },
      body: JSON.stringify({
        orderId,
        amount,
        currency
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création du checkout');
    }

    const checkoutData = await response.json();

    return NextResponse.json(checkoutData);

  } catch (error: any) {
    console.error('Erreur API create-intent:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Helper function to get user token
async function getToken(supabase: any) {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}
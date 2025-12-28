import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  console.log('Received request to /api/payments/create-checkout')
  
  try {
    const supabase = await createClient()
    const requestData = await request.json()
    console.log('Request data:', requestData)
    
    const { orderId, amount, currency = 'eur' } = requestData
    
    if (!orderId || !amount) {
      console.error('Missing required fields:', { orderId, amount })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Get order details from database
    const { data: order, error: orderError } = await (await supabase)
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // Prepare backend URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    const backendEndpoint = `${backendUrl}/payments/create-checkout`
    
    console.log('Calling backend service:', backendEndpoint, {
      orderId,
      amount,
      currency,
    })
    
    // Call the backend service to create a checkout
    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify({
        orderId,
        amount: parseFloat(amount),
        currency: currency.toLowerCase(),
      }),
    })

    const responseData = await response.json().catch(() => ({}))
    
    if (!response.ok) {
      console.error('Backend error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      })
      throw new Error(responseData.message || 'Erreur lors de la création du paiement')
    }
    
    console.log('Backend response:', responseData)

    const { checkoutUrl, checkoutId } = responseData

    // Update order with checkout ID
    const { error: updateError } = await (await supabase)
      .from('orders')
      .update({ payment_intent_id: checkoutId })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order with checkout ID:', updateError)
      // Don't fail the request if just the update fails
    }

    return NextResponse.json({ checkoutUrl })
  } catch (error: any) {
    console.error('Error in create-checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

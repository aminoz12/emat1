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
    const { data: order, error: orderError } = await supabase
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

    // Get Supabase session token for backend authentication
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Session expirée. Veuillez vous reconnecter.' },
        { status: 401 }
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
    let response: Response;
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}` // Using Supabase token
        },
        body: JSON.stringify({
          orderId,
          amount: parseFloat(amount),
          currency: currency.toLowerCase(),
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      console.error('Failed to connect to backend:', fetchError)
      if (fetchError.name === 'AbortError') {
        throw new Error('Le serveur de paiement ne répond pas. Veuillez réessayer.')
      }
      if (fetchError.code === 'ECONNREFUSED' || fetchError.message?.includes('fetch failed') || fetchError.message?.includes('ECONNREFUSED')) {
        throw new Error('Impossible de se connecter au serveur de paiement. Vérifiez que le serveur backend est démarré sur le port 3001.')
      }
      throw new Error(`Erreur de connexion: ${fetchError.message}`)
    }

    let responseData: any = {};
    try {
      const text = await response.text();
      responseData = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('Failed to parse backend response:', e);
    }
    
    if (!response.ok) {
      console.error('Backend error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        url: backendEndpoint
      })
      throw new Error(responseData.message || responseData.error || `Backend error: ${response.status} ${response.statusText}`)
    }
    
    console.log('Backend response:', responseData)

    const { checkoutUrl, checkoutId } = responseData

    // Update order with checkout ID
    const { error: updateError } = await supabase
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
    console.error('Error stack:', error.stack)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause
    })
    return NextResponse.json(
      { 
        error: error.message || 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

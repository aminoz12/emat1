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

    // Prepare backend URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://emat1.onrender.com'
    const backendEndpoint = `${backendUrl}/payments/create-checkout`
    
    console.log('Calling backend service:', backendEndpoint, {
      orderId,
      amount,
      currency,
    })
    
    // Get session token for backend authorization
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData?.session?.access_token
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Session expirée. Veuillez vous reconnecter.' },
        { status: 401 }
      )
    }
    
    // Call the backend service to create a checkout
    let response: Response
    let responseData: any = {}
    
    try {
      response = await fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          orderId,
          amount: parseFloat(amount),
          currency: currency.toLowerCase(),
        }),
      })

      try {
        responseData = await response.json()
      } catch (parseError) {
        console.error('Failed to parse backend response:', parseError)
        const text = await response.text()
        console.error('Response text:', text)
        throw new Error('Réponse invalide du backend')
      }
    } catch (fetchError: any) {
      console.error('Failed to call backend service:', fetchError)
      console.error('Backend URL:', backendEndpoint)
      console.error('Error details:', {
        message: fetchError.message,
        cause: fetchError.cause,
        code: fetchError.code,
        errno: fetchError.errno,
        stack: fetchError.stack
      })
      
      // If backend is not available, return a helpful error with more details
      if (fetchError.message?.includes('fetch failed') || 
          fetchError.code === 'ECONNREFUSED' || 
          fetchError.code === 'ENOTFOUND' ||
          fetchError.errno === 'ECONNREFUSED') {
        const errorMessage = process.env.NODE_ENV === 'development' 
          ? `Le service de paiement backend n'est pas disponible à ${backendUrl}. Veuillez démarrer le backend ou configurer NEXT_PUBLIC_BACKEND_URL.`
          : 'Le service de paiement n\'est pas disponible. Veuillez réessayer plus tard ou contacter le support.'
        throw new Error(errorMessage)
      }
      throw fetchError
    }
    
    if (!response.ok) {
      console.error('Backend error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      })
      throw new Error(responseData.message || responseData.error || `Erreur ${response.status}: ${response.statusText}`)
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
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

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

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount is already in cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
    })

    // Update order with payment intent ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_intent_id: paymentIntent.id,
        status: 'pending',
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Erreur mise à jour commande:', updateError)
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })

  } catch (error: any) {
    console.error('Erreur API create-intent:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}


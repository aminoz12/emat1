import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/payments/create-checkout
 * Creates a SumUp hosted checkout using only Next.js (no backend server).
 * Requires: SUMUP_API_KEY, SUPABASE_SERVICE_ROLE_KEY, and frontend URL for return_url.
 */
export async function POST(request: Request) {
  console.log('Received request to /api/payments/create-checkout')

  try {
    const supabase = await createClient()
    const requestData = await request.json()

    const { orderId, amount, currency = 'eur' } = requestData

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

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

    const apiKey = process.env.SUMUP_API_KEY
    if (!apiKey) {
      console.error('SUMUP_API_KEY is not set')
      return NextResponse.json(
        { error: 'Configuration paiement manquante' },
        { status: 500 }
      )
    }

    const amountNum = parseFloat(String(amount))
    const rawUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.FRONTEND_URL ||
      (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
      ''
    const baseUrl = rawUrl
      ? (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`).replace(/\/$/, '')
      : 'https://emat1.vercel.app'
    const returnUrl = `${baseUrl}/payment/return?orderId=${orderId}`

    const body: Record<string, unknown> = {
      checkout_reference: orderId,
      amount: amountNum.toFixed(2),
      currency: (currency as string).toUpperCase(),
      description: `Payment for order ${orderId}`,
      return_url: returnUrl,
      hosted_checkout: { enabled: true },
    }
    if (process.env.SUMUP_MERCHANT_CODE) {
      body.merchant_code = process.env.SUMUP_MERCHANT_CODE
    }

    const sumupRes = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!sumupRes.ok) {
      const errText = await sumupRes.text()
      console.error('SumUp create checkout error:', sumupRes.status, errText)
      return NextResponse.json(
        {
          error:
            errText && errText.length < 200
              ? errText
              : 'Impossible de créer le lien de paiement. Réessayez ou contactez le support.',
        },
        { status: 502 }
      )
    }

    const checkout = await sumupRes.json()
    const checkoutId = checkout.id
    let checkoutUrl: string =
      checkout.hosted_checkout_url ||
      (checkout.links && checkout.links[0] && checkout.links[0].href) ||
      `https://checkout.sumup.com/b/${checkoutId}`

    const admin = createAdminClient()
    await admin.from('payments').upsert(
      {
        order_id: orderId,
        amount: amountNum,
        currency: (currency as string).toUpperCase(),
        sumup_checkout_id: checkoutId,
        status: 'pending',
      },
      { onConflict: 'order_id' }
    )

    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_intent_id: checkoutId })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order with checkout ID:', updateError)
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

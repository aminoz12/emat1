import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SUMUP_API_BASE = 'https://api.sumup.com/v0.1'

/**
 * Create SumUp checkout directly (no backend server).
 * Single payment path: SumUp hosted checkout only.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const requestData = await request.json()

    const { orderId, amount, currency = 'eur' } = requestData

    if (!orderId || amount == null || amount === '') {
      return NextResponse.json(
        { error: 'Missing required fields (orderId, amount)' },
        { status: 400 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

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

    const apiKey = process.env.SUMUP_API_KEY?.trim()
    const merchantCode = process.env.SUMUP_MERCHANT_CODE?.trim()
    const frontendUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      process.env.FRONTEND_URL ||
      ''

    if (!apiKey) {
      console.error('SUMUP_API_KEY is not set')
      return NextResponse.json(
        { error: 'Configuration paiement manquante (SUMUP_API_KEY)' },
        { status: 500 }
      )
    }

    if (!merchantCode) {
      console.error('SUMUP_MERCHANT_CODE is not set')
      return NextResponse.json(
        {
          error:
            'Configuration manquante: SUMUP_MERCHANT_CODE est requis. Ajoutez-le dans les variables d\'environnement (ex: Vercel). Vous le trouvez dans SumUp > Paramètres > Développeurs.',
        },
        { status: 500 }
      )
    }

    const amountNum = typeof amount === 'number' ? amount : parseFloat(String(amount))
    const returnUrl = frontendUrl
      ? `${frontendUrl.replace(/\/$/, '')}/payment/return?orderId=${orderId}`
      : undefined

    const body: Record<string, unknown> = {
      checkout_reference: orderId,
      amount: amountNum,
      currency: (currency || 'EUR').toUpperCase(),
      merchant_code: merchantCode,
      description: `Commande ${order.reference || orderId}`,
      hosted_checkout: { enabled: true },
    }

    if (returnUrl) {
      body.return_url = returnUrl
      body.redirect_url = returnUrl
    }

    const sumupResponse = await fetch(`${SUMUP_API_BASE}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    const responseData = await sumupResponse.json().catch(() => ({}))

    if (!sumupResponse.ok) {
      console.error('SumUp API error:', sumupResponse.status, responseData)
      const msg =
        responseData.message ||
        responseData.error ||
        (sumupResponse.status === 403
          ? 'SumUp 403 : le scope "payments" doit être activé par SumUp. Allez sur https://developer.sumup.com/contact et demandez l\'activation du scope "payments" pour votre compte. Vérifiez aussi SUMUP_API_KEY (sup_sk_...) et SUMUP_MERCHANT_CODE.'
          : `SumUp: ${sumupResponse.status}`)
      return NextResponse.json(
        { error: msg },
        { status: sumupResponse.status >= 500 ? 502 : 400 }
      )
    }

    const checkoutId = responseData.id
    let checkoutUrl: string =
      responseData.hosted_checkout_url ||
      responseData.redirect_url

    if (!checkoutUrl && responseData.links?.length) {
      const link = responseData.links.find(
        (l: { href?: string; rel?: string }) =>
          (l.href && (l.href.includes('checkout') || l.href.includes('pay'))) ||
          (l.rel && l.rel.includes('checkout'))
      )
      if (link?.href) checkoutUrl = link.href
    }

    if (!checkoutUrl) {
      checkoutUrl = `https://checkout.sumup.com/b/${checkoutId}`
    }

    await supabase
      .from('orders')
      .update({ payment_intent_id: checkoutId })
      .eq('id', orderId)

    return NextResponse.json({ checkoutUrl, checkoutId })
  } catch (error: unknown) {
    console.error('create-checkout error:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

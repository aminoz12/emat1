import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmationEmail } from '@/lib/email'

/**
 * GET /api/payments/verify-by-order?orderId=xxx
 * Fallback when SumUp redirect doesn't include checkout_id.
 * Looks up payment by order_id, gets sumup_checkout_id, verifies with SumUp, updates DB, sends email.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId') || searchParams.get('checkout_reference')
    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
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

    const apiKey = process.env.SUMUP_API_KEY
    if (!apiKey) {
      console.error('SUMUP_API_KEY is not set')
      return NextResponse.json(
        { error: 'Configuration paiement manquante' },
        { status: 500 }
      )
    }

    const admin = createAdminClient()
    // May have multiple payment rows per order; take latest with sumup_checkout_id
    const { data: payments } = await admin
      .from('payments')
      .select('id, order_id, sumup_checkout_id')
      .eq('order_id', orderId)
      .not('sumup_checkout_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)

    const payment = payments?.[0]
    if (!payment?.sumup_checkout_id) {
      console.error('Verify-by-order: no payment or checkout_id for order', orderId)
      return NextResponse.json(
        { error: 'Paiement non trouvé pour cette commande', status: 'UNKNOWN' },
        { status: 404 }
      )
    }

    const checkoutId = payment.sumup_checkout_id

    // Get checkout status from SumUp API
    const sumupResponse = await fetch(
      `https://api.sumup.com/v0.1/checkouts/${checkoutId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!sumupResponse.ok) {
      const errText = await sumupResponse.text()
      console.error('SumUp API error:', sumupResponse.status, errText)
      return NextResponse.json(
        { error: 'Impossible de vérifier le paiement', status: 'UNKNOWN' },
        { status: 502 }
      )
    }

    const checkout = await sumupResponse.json()
    const status = (checkout.status || '').toUpperCase()
    const paid = status === 'PAID'

    // Update payments and order
    const paymentStatus = paid ? 'succeeded' : 'failed'
    const { error: payUpdateError } = await admin
      .from('payments')
      .update({
        status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    if (payUpdateError) {
      console.error('Verify-by-order: failed to update payment', payUpdateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du paiement', status: 'UNKNOWN' },
        { status: 500 }
      )
    }

    const orderStatus = paid ? 'completed' : 'unpaid'
    const { error: orderUpdateError } = await admin
      .from('orders')
      .update({
        status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.order_id)

    if (orderUpdateError) {
      console.error('Verify-by-order: failed to update order', orderUpdateError)
    }

    // When paid: send confirmation email
    if (paid) {
      const { data: order } = await admin
        .from('orders')
        .select('metadata, user_id')
        .eq('id', payment.order_id)
        .single()

      let clientEmail: string | null = null
      const metadata = (order as any)?.metadata as Record<string, unknown> | null
      if (metadata?.email && typeof metadata.email === 'string') {
        clientEmail = metadata.email
      }
      if (!clientEmail && (order as any)?.user_id) {
        const { data: profile } = await admin
          .from('profiles')
          .select('email')
          .eq('id', (order as any).user_id)
          .single()
        if (profile?.email) clientEmail = profile.email
      }

      if (clientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
        const result = await sendOrderConfirmationEmail(clientEmail)
        if (!result.success) {
          console.error('Order confirmation email failed:', result.error)
        }
      } else {
        console.warn('Verify-by-order: no valid client email for order', payment.order_id, { metadataEmail: metadata?.email })
      }
    }

    return NextResponse.json({ status })
  } catch (error: any) {
    console.error('Error in verify-by-order:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

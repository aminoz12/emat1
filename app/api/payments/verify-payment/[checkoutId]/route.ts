import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SUMUP_API_BASE = 'https://api.sumup.com/v0.1'

/**
 * Verify SumUp payment status by checkout ID.
 * No backend server: calls SumUp API directly.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ checkoutId: string }> }
) {
  try {
    const { checkoutId } = await params
    if (!checkoutId) {
      return NextResponse.json(
        { error: 'checkoutId required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const apiKey = process.env.SUMUP_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Configuration manquante' },
        { status: 500 }
      )
    }

    const res = await fetch(`${SUMUP_API_BASE}/checkouts/${checkoutId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || data.error || 'Vérification impossible' },
        { status: res.status >= 500 ? 502 : 400 }
      )
    }

    const status = data.status || 'PENDING'

    if (status === 'PAID') {
      const orderId = data.checkout_reference
      if (orderId) {
        await supabase
          .from('orders')
          .update({ status: 'processing' })
          .eq('id', orderId)
      }
    }

    return NextResponse.json({ status })
  } catch (error) {
    console.error('verify-payment error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}

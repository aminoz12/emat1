import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderCompletedWithAttachment } from '@/lib/email'

// POST - Upload DOC-FINAL and send to client by email (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

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

    const orderId = params.id
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .select(`
        id,
        metadata,
        profiles:user_id ( email )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    const profiles = order.profiles as { email?: string } | { email?: string }[] | null
    const profileEmail = Array.isArray(profiles) ? profiles[0]?.email : profiles?.email
    const clientEmail =
      (order.metadata as Record<string, unknown>)?.email as string | undefined ||
      profileEmail

    if (!clientEmail || typeof clientEmail !== 'string') {
      return NextResponse.json(
        { error: 'Email client introuvable pour cette commande' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileName = file.name || 'document.pdf'

    const result = await sendOrderCompletedWithAttachment(
      clientEmail,
      buffer,
      fileName
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Envoi email échoué' },
        { status: 500 }
      )
    }

    // Optionally store doc in documents table for history
    const fileExt = fileName.split('.').pop() || 'pdf'
    const storagePath = `admin/${orderId}/doc_final_${Date.now()}.${fileExt}`

    const { error: uploadError } = await adminSupabase.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/pdf',
        upsert: false,
      })

    if (!uploadError) {
      const { data: { publicUrl } } = adminSupabase.storage
        .from('documents')
        .getPublicUrl(storagePath)

      await adminSupabase.from('documents').insert({
        order_id: orderId,
        name: 'DOC-FINAL',
        file_url: publicUrl,
        file_type: file.type || 'application/pdf',
        file_size: file.size,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Document envoyé au client par email.',
    })
  } catch (error: unknown) {
    console.error('Erreur API doc-final:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

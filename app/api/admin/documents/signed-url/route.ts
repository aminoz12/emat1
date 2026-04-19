import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/documents/signed-url?documentId=xxx
 * Returns a short-lived signed URL for a document so admin can view/download
 * even if the bucket is private.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin
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
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const documentId = request.nextUrl.searchParams.get('documentId')
    if (!documentId) {
      return NextResponse.json({ error: 'documentId requis' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Get document record
    const { data: doc, error: docError } = await adminSupabase
      .from('documents')
      .select('id, file_url, name')
      .eq('id', documentId)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    // Extract storage path from the stored URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/documents/[path]
    // or signed:  https://[project].supabase.co/storage/v1/object/sign/documents/[path]
    const fileUrl = doc.file_url
    
    // Try to extract the storage path from common Supabase URL patterns
    let storagePath: string | null = null
    
    const publicMatch = fileUrl.match(/\/object\/(?:public|sign)\/documents\/(.+)/)
    if (publicMatch) {
      storagePath = decodeURIComponent(publicMatch[1].split('?')[0])
    }

    if (!storagePath) {
      // Can't extract path — return original URL as-is
      return NextResponse.json({ url: fileUrl })
    }

    // Generate a signed URL valid for 1 hour
    const { data: signedData, error: signError } = await adminSupabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 3600)

    if (signError || !signedData?.signedUrl) {
      console.error('Signed URL error:', signError)
      // Fallback: return the original URL
      return NextResponse.json({ url: fileUrl })
    }

    return NextResponse.json({ url: signedData.signedUrl })

  } catch (error: any) {
    console.error('Erreur signed-url:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

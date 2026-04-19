import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Verify admin access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé. Droits administrateur requis.' }, { status: 403 })
    }

    // Get the original URL
    const fileUrl = request.nextUrl.searchParams.get('url')
    if (!fileUrl) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
    }

    // Extract path from public URL
    const urlParts = fileUrl.split('/documents/')
    if (!urlParts[1]) {
      return NextResponse.json({ error: 'Format d\'URL invalide' }, { status: 400 })
    }
    
    const filePath = urlParts[1]
    const adminSupabase = createAdminClient()
    
    // Support private buckets by generating a signed URL (valid for 60 seconds)
    const { data, error } = await adminSupabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60)

    if (error || !data?.signedUrl) {
      console.error('Erreur génération URL signée:', error)
      return NextResponse.json({ error: 'Erreur lors de la génération de l\'URL d\'accès' }, { status: 500 })
    }

    // Redirect the browser to the signed URL so it can natively view/download the file
    return NextResponse.redirect(data.signedUrl)
  } catch (error: any) {
    console.error('Erreur API signed-url:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import JSZip from 'jszip'

// GET - Download all documents for an order as ZIP
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Check if user is admin
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

    const { id: orderId } = await params

    // Use admin client to get documents
    const adminSupabase = createAdminClient()

    // Get all documents for this order
    const { data: documents, error: docsError } = await adminSupabase
      .from('documents')
      .select('*')
      .eq('order_id', orderId)

    if (docsError) {
      console.error('Error fetching documents:', docsError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des documents' },
        { status: 500 }
      )
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'Aucun document trouvé pour cette commande' },
        { status: 404 }
      )
    }

    // Create ZIP file
    const zip = new JSZip()

    // Download each document and add to ZIP
    for (const doc of documents) {
      if (doc.file_url) {
        try {
          // Extract file path from URL
          const urlParts = doc.file_url.split('/documents/')
          if (urlParts.length > 1) {
            const filePath = urlParts[1]
            
            // Download file from Supabase Storage
            const { data: fileData, error: downloadError } = await adminSupabase.storage
              .from('documents')
              .download(filePath)

            if (!downloadError && fileData) {
              const arrayBuffer = await fileData.arrayBuffer()
              const fileName = doc.name || `document_${doc.id}.${doc.file_type || 'pdf'}`
              zip.file(fileName, arrayBuffer)
            }
          }
        } catch (error) {
          console.error(`Error downloading document ${doc.id}:`, error)
        }
      }
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const zipBuffer = await zipBlob.arrayBuffer()

    // Get order reference for filename
    const { data: order } = await adminSupabase
      .from('orders')
      .select('reference')
      .eq('id', orderId)
      .single()

    const fileName = `documents_${order?.reference || orderId}_${Date.now()}.zip`

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })

  } catch (error: any) {
    console.error('Erreur API download documents:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}


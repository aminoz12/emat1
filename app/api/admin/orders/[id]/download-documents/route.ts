import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import JSZip from 'jszip'

// GET - Download all documents for an order as ZIP
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const orderId = params.id

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
          // Try to extract file path from URL
          let filePath: string | null = null
          
          // Method 1: Extract from Supabase Storage URL pattern
          // URL format: https://[project].supabase.co/storage/v1/object/public/documents/[path]
          const storageUrlMatch = doc.file_url.match(/\/storage\/v1\/object\/public\/documents\/(.+)$/)
          if (storageUrlMatch) {
            filePath = decodeURIComponent(storageUrlMatch[1])
          } else {
            // Method 2: Extract from /documents/ pattern
          const urlParts = doc.file_url.split('/documents/')
          if (urlParts.length > 1) {
              filePath = decodeURIComponent(urlParts[1].split('?')[0]) // Remove query params
            }
          }
            
          if (filePath) {
            // Download file from Supabase Storage
            const { data: fileData, error: downloadError } = await adminSupabase.storage
              .from('documents')
              .download(filePath)

            if (!downloadError && fileData) {
              const arrayBuffer = await fileData.arrayBuffer()
              // Use document type as filename prefix for better organization
              const fileExt = doc.file_type?.split('/').pop() || 'pdf'
              const sanitizedName = (doc.name || `document_${doc.id}`).replace(/[^a-zA-Z0-9._-]/g, '_')
              const fileName = `${sanitizedName}${!sanitizedName.includes('.') ? '.' + fileExt : ''}`
              zip.file(fileName, arrayBuffer)
            } else {
              // Fallback: Try to download directly from URL
              try {
                const response = await fetch(doc.file_url)
                if (response.ok) {
                  const arrayBuffer = await response.arrayBuffer()
                  const fileExt = doc.file_type?.split('/').pop() || 'pdf'
                  const sanitizedName = (doc.name || `document_${doc.id}`).replace(/[^a-zA-Z0-9._-]/g, '_')
                  const fileName = `${sanitizedName}${!sanitizedName.includes('.') ? '.' + fileExt : ''}`
                  zip.file(fileName, arrayBuffer)
                }
              } catch (fetchError) {
                console.error(`Error fetching document ${doc.id} from URL:`, fetchError)
              }
            }
          } else {
            // Fallback: Try to download directly from URL
            try {
              const response = await fetch(doc.file_url)
              if (response.ok) {
                const arrayBuffer = await response.arrayBuffer()
                const fileExt = doc.file_type?.split('/').pop() || 'pdf'
                const sanitizedName = (doc.name || `document_${doc.id}`).replace(/[^a-zA-Z0-9._-]/g, '_')
                const fileName = `${sanitizedName}${!sanitizedName.includes('.') ? '.' + fileExt : ''}`
                zip.file(fileName, arrayBuffer)
              }
            } catch (fetchError) {
              console.error(`Error fetching document ${doc.id} from URL:`, fetchError)
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

    const fileName = `commande-${orderId}.zip`

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


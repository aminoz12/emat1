import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const plaque = searchParams.get('plaque')
    const postalCode = searchParams.get('code_postal')
    const departement = searchParams.get('departement')

    if (!plaque || !postalCode) {
      return NextResponse.json(
        { error: 'Plaque d\'immatriculation et code postal requis' },
        { status: 400 }
      )
    }

    // Extract department from postal code if not provided
    let dept = departement
    if (!dept && postalCode) {
      // Handle overseas departments (97xxx)
      if (postalCode.startsWith('97')) {
        dept = postalCode.substring(0, 3) // 971, 972, 973, etc.
      } else {
        dept = postalCode.substring(0, 2) // 01-95 for metropolitan France
      }
    }

    // Format plaque: remove spaces, convert to uppercase
    // Try with dashes first (FN-954-ER), then without if needed
    const formattedPlaque = plaque.replace(/\s/g, '').toUpperCase()
    const plaqueWithoutDashes = formattedPlaque.replace(/-/g, '')

    // Build the API path - try with dashes first
    // demarche=1 for changement de titulaire
    const apiPath = `/calc?plaque=${encodeURIComponent(formattedPlaque)}&departement=${dept}&demarche=1&code_postal=${postalCode}`

    // Call RapidAPI
    const options = {
      method: 'GET',
      hostname: 'api-simulateur-de-cout-carte-grise-france1.p.rapidapi.com',
      path: apiPath,
      headers: {
        'x-rapidapi-key': '9053235091msh103688341019d00p12b837jsn994c5dc3e28d',
        'x-rapidapi-host': 'api-simulateur-de-cout-carte-grise-france1.p.rapidapi.com'
      }
    }

    // Use fetch instead of http module (Next.js runs on Node.js but fetch is available)
    let apiUrl = `https://${options.hostname}${apiPath}`
    
    let response = await fetch(apiUrl, {
      method: 'GET',
      headers: options.headers
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    let data = await response.json()
    
    // Check if we got a valid response with actual data (not just empty/zero)
    // If not, try without dashes as fallback
    const hasValidData = data && (
      (typeof data === 'number' && data > 0) ||
      (typeof data === 'object' && (
        data.frais_de_dossier !== undefined ||
        data.fraisDossier !== undefined ||
        (data.total !== undefined && data.total !== null) ||
        (data.cout !== undefined && data.cout !== null) ||
        (data.prix !== undefined && data.prix !== null)
      ))
    )
    
    // If we didn't get valid data, try without dashes
    if (!hasValidData) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Trying plaque format without dashes:', plaqueWithoutDashes)
      }
      const apiPathNoDashes = `/calc?plaque=${encodeURIComponent(plaqueWithoutDashes)}&departement=${dept}&demarche=1&code_postal=${postalCode}`
      const apiUrlNoDashes = `https://${options.hostname}${apiPathNoDashes}`
      const responseNoDashes = await fetch(apiUrlNoDashes, {
        method: 'GET',
        headers: options.headers
      })
      
      if (responseNoDashes.ok) {
        const dataNoDashes = await responseNoDashes.json()
        // Only use this if it has valid data
        if (dataNoDashes && (
          (typeof dataNoDashes === 'number' && dataNoDashes > 0) ||
          (typeof dataNoDashes === 'object' && (
            dataNoDashes.frais_de_dossier !== undefined ||
            dataNoDashes.fraisDossier !== undefined ||
            dataNoDashes.total !== undefined ||
            dataNoDashes.cout !== undefined
          ))
        )) {
          data = dataNoDashes
        }
      }
    }

    // Log the response for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 API Response:', JSON.stringify(data, null, 2))
    }

    // Extract frais de dossier from the API response
    // The API response structure may vary, so we'll try different possible field names
    let fraisDeDossier = 0
    
    if (typeof data === 'object' && data !== null) {
      // Try different possible field names (French and English variations)
      // Check explicitly for undefined/null, not using || which treats 0 as falsy
      if (data.frais_de_dossier !== undefined && data.frais_de_dossier !== null) {
        fraisDeDossier = data.frais_de_dossier
      } else if (data.fraisDossier !== undefined && data.fraisDossier !== null) {
        fraisDeDossier = data.fraisDossier
      } else if (data.frais_de_dossier_total !== undefined && data.frais_de_dossier_total !== null) {
        fraisDeDossier = data.frais_de_dossier_total
      } else if (data.fraisDossierTotal !== undefined && data.fraisDossierTotal !== null) {
        fraisDeDossier = data.fraisDossierTotal
      } else if (data.frais_total !== undefined && data.frais_total !== null) {
        fraisDeDossier = data.frais_total
      } else if (data.fraisTotal !== undefined && data.fraisTotal !== null) {
        fraisDeDossier = data.fraisTotal
      } else if (data.total_frais !== undefined && data.total_frais !== null) {
        fraisDeDossier = data.total_frais
      } else if (data.total !== undefined && data.total !== null) {
        fraisDeDossier = data.total
      } else if (data.cout !== undefined && data.cout !== null) {
        fraisDeDossier = data.cout
      } else if (data.cout_total !== undefined && data.cout_total !== null) {
        fraisDeDossier = data.cout_total
      } else if (data.prix !== undefined && data.prix !== null) {
        fraisDeDossier = data.prix
      } else if (data.montant !== undefined && data.montant !== null) {
        fraisDeDossier = data.montant
      } else if (data.amount !== undefined && data.amount !== null) {
        fraisDeDossier = data.amount
      } else if (data.frais !== undefined && data.frais !== null) {
        fraisDeDossier = data.frais
      }
      
      // If frais_de_dossier is still 0, try to find it in nested structure
      if (fraisDeDossier === 0) {
        // Check nested data object
        if (data.data && typeof data.data === 'object') {
          fraisDeDossier = data.data.frais_de_dossier || 
                          data.data.fraisDossier || 
                          data.data.frais_de_dossier_total ||
                          data.data.frais_total ||
                          data.data.total ||
                          data.data.cout ||
                          data.data.prix ||
                          0
        }
        
        // Check result object
        if (fraisDeDossier === 0 && data.result && typeof data.result === 'object') {
          fraisDeDossier = data.result.frais_de_dossier || 
                          data.result.fraisDossier || 
                          data.result.frais_de_dossier_total ||
                          data.result.frais_total ||
                          data.result.total ||
                          data.result.cout ||
                          0
        }
        
        // Check items array (if response is an array with objects)
        if (fraisDeDossier === 0 && Array.isArray(data)) {
          const firstItem = data[0]
          if (firstItem && typeof firstItem === 'object') {
            fraisDeDossier = firstItem.frais_de_dossier || 
                            firstItem.fraisDossier || 
                            firstItem.frais_de_dossier_total ||
                            firstItem.frais_total ||
                            firstItem.total ||
                            firstItem.cout ||
                            0
          }
        }
      }
    } else if (typeof data === 'number') {
      fraisDeDossier = data
    }

    // Ensure we return a number
    fraisDeDossier = Number(fraisDeDossier) || 0

    // Log the extracted value for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('💰 Extracted fraisDeDossier:', fraisDeDossier)
    }

    return NextResponse.json({
      fraisDeDossier: Math.round(fraisDeDossier * 100) / 100, // Round to 2 decimals
      plaque: formattedPlaque,
      departement: dept,
      codePostal: postalCode,
      rawResponse: data // Include raw response for debugging
    })
  } catch (error: any) {
    console.error('Erreur lors du calcul des frais de dossier:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors du calcul des frais de dossier',
        message: error.message || 'Une erreur est survenue'
      },
      { status: 500 }
    )
  }
}


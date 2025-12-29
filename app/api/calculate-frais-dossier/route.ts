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

    // Helper function to recursively search for numeric values in nested objects
    const findNumericValue = (obj: any, visited = new Set(), depth = 0): number | null => {
      if (!obj || typeof obj !== 'object' || depth > 5) return null // Limit depth to avoid infinite recursion
      if (visited.has(obj)) return null // Avoid circular references
      visited.add(obj)

      // Check for common field names that might contain the value
      const fieldNames = [
        'frais_de_dossier', 'fraisDossier', 'frais_de_dossier_total', 'fraisDossierTotal',
        'frais_total', 'fraisTotal', 'total_frais', 'totalFrais',
        'total', 'cout', 'cout_total', 'coutTotal', 'total_cout', 'totalCout',
        'prix', 'montant', 'amount', 'frais', 'cost', 'price',
        'montant_total', 'montantTotal', 'total_amount', 'totalAmount'
      ]

      // First, check direct field names
      for (const field of fieldNames) {
        if (obj[field] !== undefined && obj[field] !== null) {
          const value = Number(obj[field])
          if (!isNaN(value) && value >= 0) {
            return value
          }
        }
      }

      // Recursively search nested objects
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key]
          if (typeof value === 'number' && value > 0) {
            // Found a positive number, but check if it's in a meaningful context
            // Skip if it's an array index or very small number that's likely an ID
            if (value > 1) {
              return value
            }
          } else if (typeof value === 'object' && value !== null) {
            const nestedValue = findNumericValue(value, visited, depth + 1)
            if (nestedValue !== null) {
              return nestedValue
            }
          }
        }
      }

      return null
    }

    // Extract frais de dossier from the API response
    let fraisDeDossier = 0
    
    // First check if data is a number (direct response)
    if (typeof data === 'number') {
      fraisDeDossier = data
    } else if (typeof data === 'object' && data !== null) {
      // Priority 1: Check for data.data.price.total (the actual structure: data.data.price.total = "178.76")
      if (data.data && typeof data.data === 'object' && data.data.price && typeof data.data.price === 'object' && data.data.price.total !== undefined && data.data.price.total !== null) {
        const value = Number(data.data.price.total)
        if (!isNaN(value)) {
          fraisDeDossier = value
        }
      }
      // Priority 2: Check for data.price.total (direct structure)
      else if (data.price && typeof data.price === 'object' && data.price.total !== undefined && data.price.total !== null) {
        const value = Number(data.price.total)
        if (!isNaN(value)) {
          fraisDeDossier = value
        }
      }
      // Priority 3: Check for data.data.total
      else if (data.data && typeof data.data === 'object' && data.data.total !== undefined && data.data.total !== null) {
        const value = Number(data.data.total)
        if (!isNaN(value)) {
          fraisDeDossier = value
        }
      }
      // Priority 4: Check for data.data.price (direct)
      else if (data.data && typeof data.data === 'object' && data.data.price !== undefined && data.data.price !== null) {
        const value = Number(data.data.price)
        if (!isNaN(value)) {
          fraisDeDossier = value
        }
      }
      // Priority 5: Recursively search in data.data
      else if (data.data && typeof data.data === 'object') {
        const foundValue = findNumericValue(data.data, new Set(), 0)
        if (foundValue !== null) {
          fraisDeDossier = foundValue
        }
      }
      
      // If still 0, recursively search the entire object structure
      if (fraisDeDossier === 0) {
        const foundValue = findNumericValue(data, new Set(), 0)
        if (foundValue !== null) {
          fraisDeDossier = foundValue
        }
      }
    }

    // Ensure we return a number
    fraisDeDossier = Number(fraisDeDossier) || 0

    // Log the extracted value and full structure for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('💰 Extracted fraisDeDossier:', fraisDeDossier)
      console.log('📋 Full response keys:', data && typeof data === 'object' ? Object.keys(data) : 'N/A')
      if (data && typeof data === 'object' && data.price) {
        console.log('📋 data.price:', data.price)
        console.log('📋 data.price.total:', data.price.total)
      }
      if (data && typeof data === 'object' && data.data) {
        console.log('📋 data.data keys:', typeof data.data === 'object' ? Object.keys(data.data) : 'N/A')
        if (data.data && typeof data.data === 'object' && data.data.price) {
          console.log('📋 data.data.price:', data.data.price)
        }
      }
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


import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const postalCode = searchParams.get('postalCode')
    const department = searchParams.get('department')

    if (!postalCode && !department) {
      return NextResponse.json(
        { error: 'Code postal ou département requis' },
        { status: 400 }
      )
    }

    // Extraire le département du code postal
    let dept = department
    if (!dept && postalCode) {
      // Gérer les départements d'outre-mer (97xxx)
      if (postalCode.startsWith('97')) {
        dept = postalCode.substring(0, 3) // 971, 972, 973, etc.
      } else {
        dept = postalCode.substring(0, 2) // 01-95 pour la France métropolitaine
      }
    }

    // Appel à l'API RapidAPI pour obtenir les informations du département
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '400d025f5fmsh992a54decd50a2ap18ee4ejsn012b99663b43',
        'x-rapidapi-host': 'api-simulateur-de-cout-carte-grise-france.p.rapidapi.com'
      }
    }

    // D'abord, récupérer la liste des départements pour obtenir les informations
    const departmentsResponse = await fetch(
      'https://api-simulateur-de-cout-carte-grise-france.p.rapidapi.com/departements',
      options
    )

    if (!departmentsResponse.ok) {
      throw new Error(`API Error: ${departmentsResponse.status}`)
    }

    const departments = await departmentsResponse.json()

    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Réponse API départements:', departments)
    }

    // Trouver le département correspondant
    // L'API peut retourner différentes structures, on essaie plusieurs formats
    let departmentData: any = null
    
    if (Array.isArray(departments)) {
      departmentData = departments.find((d: any) => {
        const code = String(d.code || d.numero || d.departement || '').padStart(2, '0')
        const deptStr = String(dept).padStart(2, '0')
        return code === deptStr || code === dept
      })
    } else if (departments && typeof departments === 'object') {
      // Si c'est un objet, chercher directement par clé
      departmentData = departments[dept] || departments[String(dept).padStart(2, '0')]
    }

    // Si le département n'est pas trouvé, utiliser des valeurs par défaut
    // Les taxes Y1 et Y2 varient selon le département mais on peut utiliser des valeurs moyennes
    const basePrice = 0 // Prix de base (gratuit pour la carte grise elle-même)
    
    // Valeurs par défaut si le département n'est pas trouvé
    let y1Tax = 0
    let y2Tax = 0
    let departmentName = ''

    if (departmentData) {
      // Essayer différents noms de propriétés possibles
      y1Tax = departmentData.taxe_y1 || departmentData.taxeY1 || departmentData.y1 || departmentData.taxe_regionale || 0
      y2Tax = departmentData.taxe_y2 || departmentData.taxeY2 || departmentData.y2 || departmentData.taxe_departementale || 0
      departmentName = departmentData.nom || departmentData.name || departmentData.libelle || departmentData.label || ''
    } else {
      // Si le département n'est pas trouvé, utiliser des valeurs par défaut basées sur le département
      // Les taxes varient généralement entre 0€ et 50€ selon le département
      // Pour simplifier, on utilise une valeur moyenne
      y1Tax = 0 // Taxe régionale (varie selon la région)
      y2Tax = 0 // Taxe départementale (varie selon le département)
    }

    const totalTaxes = y1Tax + y2Tax

    // Prix total = taxes + frais de service (29,90€ par défaut)
    const serviceFee = 29.90
    const totalPrice = totalTaxes + serviceFee

    return NextResponse.json({
      department: dept,
      departmentName: departmentData.nom || departmentData.name || '',
      basePrice,
      taxes: {
        y1: y1Tax,
        y2: y2Tax,
        total: totalTaxes
      },
      serviceFee,
      totalPrice: Math.round(totalPrice * 100) / 100, // Arrondir à 2 décimales
      currency: 'EUR'
    })
  } catch (error: any) {
    console.error('Erreur lors du calcul du prix:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors du calcul du prix',
        message: error.message || 'Une erreur est survenue'
      },
      { status: 500 }
    )
  }
}


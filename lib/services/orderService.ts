/**
 * Service pour la gestion des commandes
 * Centralise les appels API pour créer, récupérer et gérer les commandes
 */

export interface OrderData {
  type: 'carte-grise' | 'plaque' | 'coc'
  vehicleData?: {
    vin?: string
    registrationNumber?: string
    marque?: string
    make?: string
    model?: string
    year?: number
  }
  serviceType?: string
  price: number
  metadata?: Record<string, any>
}

export interface Order {
  id: string
  reference: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  price: number
  createdAt: string
  type: 'carte-grise' | 'plaque' | 'coc'
  vehicleInfo?: {
    brand?: string
    model?: string
    registrationNumber?: string
  }
}

export interface CreateOrderResponse {
  success: boolean
  order?: {
    id: string
    reference: string
    status: string
    price: number
    createdAt: string
  }
  error?: string
}

export interface GetOrdersResponse {
  success: boolean
  orders?: Order[]
  error?: string
}

/**
 * Créer une nouvelle commande
 */
export async function createOrder(data: OrderData): Promise<CreateOrderResponse> {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Inclure les cookies dans la requête
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la création de la commande'
      }
    }

    return {
      success: true,
      order: result.order
    }
  } catch (error: any) {
    console.error('Erreur createOrder:', error)
    return {
      success: false,
      error: error.message || 'Erreur de connexion'
    }
  }
}

/**
 * Récupérer toutes les commandes de l'utilisateur
 */
export async function getOrders(): Promise<GetOrdersResponse> {
  try {
    const response = await fetch('/api/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la récupération des commandes'
      }
    }

    return {
      success: true,
      orders: result.orders
    }
  } catch (error: any) {
    console.error('Erreur getOrders:', error)
    return {
      success: false,
      error: error.message || 'Erreur de connexion'
    }
  }
}

/**
 * Uploader un document pour une commande
 */
export async function uploadDocument(
  file: File,
  orderId: string,
  documentType: string
): Promise<{ success: boolean; document?: any; error?: string }> {
  try {
    // Vérifier que le fichier est valide
    if (!file || file.size === 0) {
      console.error('Fichier invalide:', file)
      return {
        success: false,
        error: 'Fichier invalide ou vide'
      }
    }

    console.log(`Upload document: ${documentType}, taille: ${file.size} bytes, nom: ${file.name}`)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('orderId', orderId)
    formData.append('documentType', documentType)

    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      credentials: 'include', // Important pour inclure les cookies de session
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      console.error(`Erreur upload ${documentType}:`, result.error, 'Status:', response.status)
      return {
        success: false,
        error: result.error || 'Erreur lors de l\'upload du document'
      }
    }

    console.log(`Document ${documentType} uploadé avec succès:`, result.document?.id)
    return {
      success: true,
      document: result.document
    }
  } catch (error: any) {
    console.error('Erreur uploadDocument:', error)
    return {
      success: false,
      error: error.message || 'Erreur de connexion'
    }
  }
}

/**
 * Uploader plusieurs documents pour une commande
 */
export async function uploadDocuments(
  files: Array<{ file: File; documentType: string }>,
  orderId: string
): Promise<{ success: boolean; uploaded: number; errors: string[] }> {
  const errors: string[] = []
  let uploaded = 0

  console.log(`Début upload de ${files.length} documents pour la commande ${orderId}`)

  for (const { file, documentType } of files) {
    try {
      const result = await uploadDocument(file, orderId, documentType)
      if (result.success) {
        uploaded++
        console.log(`✓ ${documentType} uploadé avec succès`)
      } else {
        const errorMsg = `${documentType}: ${result.error}`
        errors.push(errorMsg)
        console.error(`✗ ${errorMsg}`)
      }
    } catch (error: any) {
      const errorMsg = `${documentType}: ${error.message || 'Erreur inconnue'}`
      errors.push(errorMsg)
      console.error(`✗ ${errorMsg}`)
    }
  }

  console.log(`Upload terminé: ${uploaded}/${files.length} documents uploadés`)

  return {
    success: errors.length === 0,
    uploaded,
    errors
  }
}


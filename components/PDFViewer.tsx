'use client'

import { useEffect, useRef, useState } from 'react'

interface PDFViewerProps {
  url: string
  useCanvas?: boolean // Option pour utiliser canvas ou iframe
}

export default function PDFViewer({ url, useCanvas = true }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !url) {
      console.warn('⚠️ PDFViewer: URL ou conteneur manquant')
      setLoading(false)
      return
    }

    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const loadPDF = async () => {
      // Timeout de 30 secondes pour éviter un chargement infini
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.error('❌ Timeout: Le chargement du PDF a pris trop de temps')
          setError('Le chargement du PDF a pris trop de temps. Veuillez réessayer.')
          setLoading(false)
        }
      }, 30000)
      try {
        setLoading(true)
        setError(null)

        console.log('📄 Début du chargement du PDF:', url)

        // Charger pdfjs-dist dynamiquement uniquement côté client
        const pdfjsLib = await import('pdfjs-dist')
        console.log('✅ pdfjs-dist chargé, version:', pdfjsLib.version)
        
        // Configuration du worker - utiliser unpkg comme alternative
        const workerVersion = pdfjsLib.version || '3.11.174'
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${workerVersion}/build/pdf.worker.min.js`
        console.log('🔧 Worker configuré:', pdfjsLib.GlobalWorkerOptions.workerSrc)

        console.log('📥 Chargement du document PDF...')
        // Charger le PDF avec options pour gérer les blobs
        const loadingTask = pdfjsLib.getDocument({ 
          url: url,
          withCredentials: false,
          httpHeaders: {}
        })
        
        const pdf = await loadingTask.promise
        console.log('✅ PDF chargé, nombre de pages:', pdf.numPages)

        if (!isMounted || !containerRef.current) {
          console.log('⚠️ Composant démonté avant le rendu')
          return
        }

        // Vider le conteneur
        containerRef.current.innerHTML = ''

        // Rendre chaque page du PDF
        console.log('🎨 Rendu des pages...')
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (!isMounted || !containerRef.current) {
            console.log('⚠️ Composant démonté pendant le rendu')
            break
          }

          console.log(`📄 Rendu de la page ${pageNum}/${pdf.numPages}...`)
          const page = await pdf.getPage(pageNum)
          const viewport = page.getViewport({ scale: 2.0 }) // Scale pour meilleure qualité

          // Créer un canvas pour cette page
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          
          if (!context) {
            console.warn(`⚠️ Impossible de créer le contexte 2D pour la page ${pageNum}`)
            continue
          }

          canvas.height = viewport.height
          canvas.width = viewport.width
          canvas.style.width = '100%'
          canvas.style.height = 'auto'
          canvas.style.display = 'block'
          canvas.style.marginBottom = '10px'
          canvas.style.border = '1px solid #e5e7eb'
          canvas.style.borderRadius = '4px'
          canvas.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'

          // Renderer la page sur le canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }
          
          await page.render(renderContext).promise
          console.log(`✅ Page ${pageNum} rendue`)

          if (!isMounted || !containerRef.current) break

          // Ajouter le canvas au conteneur
          containerRef.current.appendChild(canvas)
        }

        console.log('✅ Rendu du PDF terminé')
        if (timeoutId) clearTimeout(timeoutId)
        if (isMounted) {
          setLoading(false)
        }
      } catch (err: any) {
        console.error('❌ Erreur lors du chargement du PDF:', err)
        console.error('Détails de l\'erreur:', {
          message: err?.message,
          stack: err?.stack,
          name: err?.name,
          url: url
        })
        if (timeoutId) clearTimeout(timeoutId)
        if (isMounted) {
          // Si le chargement canvas échoue, utiliser le fallback iframe
          console.log('🔄 Passage au mode fallback (iframe)')
          setUseFallback(true)
          setLoading(false)
        }
      }
    }

    loadPDF()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [url])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-600">
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Veuillez essayer de regénérer le mandat</p>
        </div>
      </div>
    )
  }

  // Si le canvas a échoué ou si useCanvas est false, utiliser un iframe en lecture seule
  if (useFallback || !useCanvas) {
    return (
      <div className="w-full h-full relative">
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          className="w-full h-full border-0"
          title="Aperçu du mandat"
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            pointerEvents: 'none' // Empêche toute interaction
          }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError('Impossible de charger le PDF')
            setLoading(false)
          }}
        />
        {/* Overlay pour empêcher les interactions */}
        <div 
          className="absolute inset-0 pointer-events-auto"
          style={{ cursor: 'not-allowed' }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm text-gray-600">Chargement du PDF...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-y-auto bg-gray-50 p-4"
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  )
}


'use client'

import { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { X, RotateCcw } from 'lucide-react'

interface SignaturePadProps {
  onSignatureChange?: (signatureDataUrl: string | null) => void
  width?: number
  height?: number
}

export default function SignaturePad({ 
  onSignatureChange, 
  width = 600, 
  height = 200 
}: SignaturePadProps) {
  const sigPadRef = useRef<SignatureCanvas>(null)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    // Vérifier si la signature existe au chargement
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      setHasSignature(true)
    }
  }, [])

  const handleEnd = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      setHasSignature(true)
      // Exporter en haute qualité PNG avec meilleure résolution
      // Utiliser toDataURL avec options pour meilleure qualité
      const canvas = sigPadRef.current.getCanvas()
      const dataUrl = canvas.toDataURL('image/png', 1.0) // Qualité maximale
      if (onSignatureChange) {
        onSignatureChange(dataUrl)
      }
    }
  }

  const clearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear()
      setHasSignature(false)
      if (onSignatureChange) {
        onSignatureChange(null)
      }
    }
  }

  return (
    <div className="w-full">
      <div className="relative border-2 border-dashed border-gray-400 rounded-lg bg-gradient-to-br from-white to-gray-50 overflow-hidden shadow-inner" style={{ width: '100%', maxWidth: `${width}px` }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <p className="text-xs text-gray-400 italic">Signez ici</p>
        </div>
        <SignatureCanvas
          ref={sigPadRef}
          canvasProps={{
            width: width,
            height: height,
            className: 'w-full h-full relative z-10',
            style: {
              display: 'block',
              cursor: 'crosshair',
              touchAction: 'none',
              background: 'transparent'
            }
          }}
          backgroundColor="transparent"
          penColor="#000000"
          minWidth={1.5}
          maxWidth={3.5}
          throttle={8}
          velocityFilterWeight={0.7}
          onEnd={handleEnd}
        />
        {hasSignature && (
          <button
            type="button"
            onClick={clearSignature}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
            title="Effacer la signature"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {hasSignature ? 'Signature validée' : 'Dessinez votre signature ci-dessus'}
        </p>
        {hasSignature && (
          <button
            type="button"
            onClick={clearSignature}
            className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Effacer</span>
          </button>
        )}
      </div>
    </div>
  )
}

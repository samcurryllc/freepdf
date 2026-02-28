import type { SignatureAnnotation } from '../../types'

interface SignatureAnnotationViewProps {
  annotation: SignatureAnnotation
}

export function SignatureAnnotationView({ annotation }: SignatureAnnotationViewProps) {
  return (
    <img
      src={annotation.dataUrl}
      alt="Signature"
      className="w-full h-full object-contain pointer-events-none select-none"
      draggable={false}
    />
  )
}

import type { ImageAnnotation } from '../../types'

interface Props { annotation: ImageAnnotation }

export function ImageAnnotationView({ annotation }: Props) {
  return (
    <img src={annotation.dataUrl} alt="Image" className="w-full h-full object-contain pointer-events-none select-none" draggable={false} />
  )
}

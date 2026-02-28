import type { InitialsAnnotation } from '../../types'

interface Props { annotation: InitialsAnnotation }

export function InitialsAnnotationView({ annotation }: Props) {
  return (
    <img src={annotation.dataUrl} alt="Initials" className="w-full h-full object-contain pointer-events-none select-none" draggable={false} />
  )
}

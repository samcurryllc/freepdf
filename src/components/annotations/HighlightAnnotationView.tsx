import type { HighlightAnnotation } from '../../types'

interface Props { annotation: HighlightAnnotation }

export function HighlightAnnotationView({ annotation }: Props) {
  return <div className="w-full h-full rounded-sm" style={{ backgroundColor: annotation.color, opacity: 0.35 }} />
}

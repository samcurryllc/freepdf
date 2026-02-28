import type { StrikethroughAnnotation } from '../../types'

interface Props { annotation: StrikethroughAnnotation }

export function StrikethroughAnnotationView({ annotation }: Props) {
  return (
    <div className="w-full h-full flex items-center">
      <div className="w-full" style={{ height: 2, backgroundColor: annotation.color }} />
    </div>
  )
}

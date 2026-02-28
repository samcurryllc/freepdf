import type { UnderlineAnnotation } from '../../types'

interface Props { annotation: UnderlineAnnotation }

export function UnderlineAnnotationView({ annotation }: Props) {
  return (
    <div className="w-full h-full flex items-end">
      <div className="w-full" style={{ height: 2, backgroundColor: annotation.color }} />
    </div>
  )
}

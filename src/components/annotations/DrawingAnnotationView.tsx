import type { DrawingAnnotation } from '../../types'

interface Props { annotation: DrawingAnnotation }

export function DrawingAnnotationView({ annotation }: Props) {
  return (
    <svg className="w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {annotation.paths.map((stroke, i) => {
        if (stroke.length < 2) return null
        const d = stroke.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
        return (
          <path key={i} d={d} fill="none" stroke={annotation.strokeColor} strokeWidth={annotation.strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        )
      })}
    </svg>
  )
}

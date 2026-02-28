import type { ShapeAnnotation } from '../../types'

interface Props { annotation: ShapeAnnotation }

export function ShapeAnnotationView({ annotation }: Props) {
  const { shapeType, strokeColor, fillColor, strokeWidth } = annotation
  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {shapeType === 'rect' && (
        <rect x={strokeWidth} y={strokeWidth} width={100 - strokeWidth * 2} height={100 - strokeWidth * 2} fill={fillColor || 'none'} stroke={strokeColor} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      )}
      {shapeType === 'ellipse' && (
        <ellipse cx="50" cy="50" rx={50 - strokeWidth} ry={50 - strokeWidth} fill={fillColor || 'none'} stroke={strokeColor} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      )}
      {shapeType === 'line' && (
        <line x1="0" y1="100" x2="100" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      )}
      {shapeType === 'arrow' && (
        <>
          <line x1="0" y1="50" x2="90" y2="50" stroke={strokeColor} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
          <polygon points="85,35 100,50 85,65" fill={strokeColor} />
        </>
      )}
    </svg>
  )
}

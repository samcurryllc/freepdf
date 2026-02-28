import type { DateAnnotation } from '../../types'

const FONT_MAP: Record<string, string> = {
  'sans-serif': 'ui-sans-serif, system-ui, sans-serif',
  'serif': 'ui-serif, Georgia, serif',
  'monospace': 'ui-monospace, monospace',
  'cursive': "'Brush Script MT', 'Segoe Script', cursive",
}

interface DateAnnotationViewProps {
  annotation: DateAnnotation
}

export function DateAnnotationView({ annotation }: DateAnnotationViewProps) {
  return (
    <div
      className="w-full h-full flex items-start whitespace-nowrap select-none"
      style={{
        fontSize: `${annotation.fontSize}px`,
        fontFamily: FONT_MAP[annotation.fontFamily],
        color: annotation.color,
        lineHeight: 1.3,
      }}
    >
      {annotation.content}
    </div>
  )
}

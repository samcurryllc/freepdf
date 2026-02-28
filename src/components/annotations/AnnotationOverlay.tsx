import { useEditor } from '../../state/EditorContext'
import { AnnotationItem } from './AnnotationItem'

interface AnnotationOverlayProps {
  pageNumber: number
}

export function AnnotationOverlay({ pageNumber }: AnnotationOverlayProps) {
  const { state } = useEditor()

  const pageAnnotations = state.annotations.filter(
    (a) => a.pageNumber === pageNumber,
  )

  if (pageAnnotations.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      {pageAnnotations.map((annotation) => (
        <AnnotationItem key={annotation.id} annotation={annotation} />
      ))}
    </div>
  )
}

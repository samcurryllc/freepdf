import { useRef, useCallback, useState } from 'react'
import type { Annotation } from '../../types'
import { useEditor } from '../../state/EditorContext'
import { TextAnnotationView } from './TextAnnotationView'
import { SignatureAnnotationView } from './SignatureAnnotationView'
import { InitialsAnnotationView } from './InitialsAnnotationView'
import { DateAnnotationView } from './DateAnnotationView'
import { ImageAnnotationView } from './ImageAnnotationView'
import { DrawingAnnotationView } from './DrawingAnnotationView'
import { HighlightAnnotationView } from './HighlightAnnotationView'
import { StrikethroughAnnotationView } from './StrikethroughAnnotationView'
import { UnderlineAnnotationView } from './UnderlineAnnotationView'
import { StickyNoteAnnotationView } from './StickyNoteAnnotationView'
import { StampAnnotationView } from './StampAnnotationView'
import { ShapeAnnotationView } from './ShapeAnnotationView'
import { CheckboxAnnotationView } from './CheckboxAnnotationView'
import { WhiteoutAnnotationView } from './WhiteoutAnnotationView'
import { ResizeHandles } from './ResizeHandles'

interface AnnotationItemProps {
  annotation: Annotation
}

function renderAnnotation(annotation: Annotation, isSelected: boolean) {
  switch (annotation.type) {
    case 'text': return <TextAnnotationView annotation={annotation} isSelected={isSelected} />
    case 'signature': return <SignatureAnnotationView annotation={annotation} />
    case 'initials': return <InitialsAnnotationView annotation={annotation} />
    case 'date': return <DateAnnotationView annotation={annotation} />
    case 'image': return <ImageAnnotationView annotation={annotation} />
    case 'drawing': return <DrawingAnnotationView annotation={annotation} />
    case 'highlight': return <HighlightAnnotationView annotation={annotation} />
    case 'strikethrough': return <StrikethroughAnnotationView annotation={annotation} />
    case 'underline': return <UnderlineAnnotationView annotation={annotation} />
    case 'sticky-note': return <StickyNoteAnnotationView annotation={annotation} />
    case 'stamp': return <StampAnnotationView annotation={annotation} />
    case 'shape': return <ShapeAnnotationView annotation={annotation} />
    case 'checkbox': return <CheckboxAnnotationView annotation={annotation} />
    case 'whiteout': return <WhiteoutAnnotationView />
    default: return null
  }
}

export function AnnotationItem({ annotation }: AnnotationItemProps) {
  const { state, dispatch } = useEditor()
  const isSelected = state.selectedIds.includes(annotation.id)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Unified pointer handler for mouse + touch
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).dataset.resizeHandle) return
      if ((e.target as HTMLElement).isContentEditable) return
      e.stopPropagation()

      // Don't preventDefault when already selected — allows dblclick for text editing
      if (!isSelected) {
        e.preventDefault()
      }

      if (e.shiftKey) {
        dispatch({ type: 'TOGGLE_SELECT_ANNOTATION', payload: annotation.id })
      } else {
        dispatch({ type: 'SELECT_ANNOTATION', payload: annotation.id })
      }

      const el = containerRef.current
      const parentRect = el?.parentElement?.getBoundingClientRect()
      if (!parentRect || !el) return

      // Capture pointer for touch
      el.setPointerCapture(e.pointerId)

      const startX = e.clientX
      const startY = e.clientY
      const origX = annotation.x
      const origY = annotation.y
      let finalX = origX
      let finalY = origY
      let moved = false

      const handlePointerMove = (moveE: PointerEvent) => {
        if (!moved) {
          moved = true
          setIsDragging(true)
        }
        const dx = ((moveE.clientX - startX) / parentRect.width) * 100
        const dy = ((moveE.clientY - startY) / parentRect.height) * 100
        finalX = Math.max(0, Math.min(100 - annotation.width, origX + dx))
        finalY = Math.max(0, Math.min(100 - annotation.height, origY + dy))

        el.style.left = `${finalX}%`
        el.style.top = `${finalY}%`
      }

      const handlePointerUp = () => {
        setIsDragging(false)
        if (moved) {
          dispatch({ type: 'UPDATE_ANNOTATION', payload: { id: annotation.id, changes: { x: finalX, y: finalY } } })
        }
        el.removeEventListener('pointermove', handlePointerMove)
        el.removeEventListener('pointerup', handlePointerUp)
      }

      el.addEventListener('pointermove', handlePointerMove)
      el.addEventListener('pointerup', handlePointerUp)
    },
    [annotation.id, annotation.x, annotation.y, annotation.width, annotation.height, dispatch],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!e.shiftKey) dispatch({ type: 'SELECT_ANNOTATION', payload: annotation.id })
    },
    [annotation.id, dispatch],
  )

  return (
    <div
      ref={containerRef}
      data-annotation
      className="absolute pointer-events-auto touch-none"
      style={{
        left: `${annotation.x}%`,
        top: `${annotation.y}%`,
        width: `${annotation.width}%`,
        height: `${annotation.height}%`,
        opacity: annotation.opacity,
        zIndex: isSelected ? 20 : 10,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <div
        className={`w-full h-full relative ${isSelected ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}
      >
        {renderAnnotation(annotation, isSelected)}
        {isSelected && <ResizeHandles annotation={annotation} containerRef={containerRef} />}
      </div>
    </div>
  )
}

import { useRef, useCallback, useState, useEffect } from 'react'
import type { TextAnnotation } from '../../types'
import { useEditor } from '../../state/EditorContext'

const FONT_MAP = {
  'sans-serif': 'ui-sans-serif, system-ui, sans-serif',
  'serif': 'ui-serif, Georgia, serif',
  'monospace': 'ui-monospace, monospace',
  'cursive': "'Brush Script MT', 'Segoe Script', cursive",
}

interface TextAnnotationViewProps {
  annotation: TextAnnotation
  isSelected: boolean
}

export function TextAnnotationView({ annotation, isSelected }: TextAnnotationViewProps) {
  const { dispatch } = useEditor()
  const editRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Exit editing mode when deselected
  useEffect(() => {
    if (!isSelected) setIsEditing(false)
  }, [isSelected])

  const handleBlur = useCallback(() => {
    const text = editRef.current?.textContent || ''
    if (text !== annotation.content) {
      dispatch({
        type: 'UPDATE_ANNOTATION',
        payload: { id: annotation.id, changes: { content: text } },
      })
    }
    setIsEditing(false)
  }, [annotation.id, annotation.content, dispatch])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setTimeout(() => {
      editRef.current?.focus()
      const selection = window.getSelection()
      const range = document.createRange()
      if (editRef.current) {
        range.selectNodeContents(editRef.current)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }, 0)
  }, [])

  return (
    <div
      ref={editRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onDoubleClick={handleDoubleClick}
      className="annotation-text w-full h-full flex items-start whitespace-pre-wrap break-words outline-none"
      style={{
        fontSize: `${annotation.fontSize}px`,
        fontFamily: FONT_MAP[annotation.fontFamily],
        color: annotation.color,
        fontWeight: annotation.bold ? 'bold' : 'normal',
        fontStyle: annotation.italic ? 'italic' : 'normal',
        textAlign: annotation.align || 'left',
        lineHeight: 1.3,
        cursor: isEditing ? 'text' : 'inherit',
      }}
    >
      {annotation.content}
    </div>
  )
}

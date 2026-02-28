import { useCallback, type RefObject } from 'react'
import type { Annotation } from '../../types'
import { useEditor } from '../../state/EditorContext'

interface ResizeHandlesProps {
  annotation: Annotation
  containerRef: RefObject<HTMLDivElement | null>
}

const HANDLE_POSITIONS = [
  { cursor: 'nwse-resize', className: '-top-1.5 -left-1.5', dx: -1, dy: -1 },
  { cursor: 'nesw-resize', className: '-top-1.5 -right-1.5', dx: 0, dy: -1 },
  { cursor: 'nesw-resize', className: '-bottom-1.5 -left-1.5', dx: -1, dy: 0 },
  { cursor: 'nwse-resize', className: '-bottom-1.5 -right-1.5', dx: 0, dy: 0 },
]

export function ResizeHandles({ annotation, containerRef }: ResizeHandlesProps) {
  const { dispatch, startBatch, endBatch } = useEditor()

  const handleResizeStart = useCallback(
    (e: React.PointerEvent, handle: typeof HANDLE_POSITIONS[0]) => {
      e.stopPropagation()
      e.preventDefault()

      const target = e.currentTarget as HTMLElement
      target.setPointerCapture(e.pointerId)

      const parent = containerRef.current?.parentElement
      if (!parent) return
      const parentRect = parent.getBoundingClientRect()

      const startX = e.clientX
      const startY = e.clientY
      const startAnn = { x: annotation.x, y: annotation.y, width: annotation.width, height: annotation.height }

      startBatch()

      const handlePointerMove = (moveE: PointerEvent) => {
        const dxPct = ((moveE.clientX - startX) / parentRect.width) * 100
        const dyPct = ((moveE.clientY - startY) / parentRect.height) * 100

        let newX = startAnn.x
        let newY = startAnn.y
        let newW = startAnn.width
        let newH = startAnn.height

        if (handle.dx === -1) {
          newX = startAnn.x + dxPct
          newW = startAnn.width - dxPct
        } else {
          newW = startAnn.width + dxPct
        }

        if (handle.dy === -1) {
          newY = startAnn.y + dyPct
          newH = startAnn.height - dyPct
        } else {
          newH = startAnn.height + dyPct
        }

        newW = Math.max(2, newW)
        newH = Math.max(1.5, newH)
        newX = Math.max(0, Math.min(98, newX))
        newY = Math.max(0, Math.min(98, newY))

        dispatch({
          type: 'UPDATE_ANNOTATION',
          payload: {
            id: annotation.id,
            changes: { x: newX, y: newY, width: newW, height: newH },
          },
        })
      }

      const handlePointerUp = () => {
        endBatch()
        target.removeEventListener('pointermove', handlePointerMove)
        target.removeEventListener('pointerup', handlePointerUp)
      }

      target.addEventListener('pointermove', handlePointerMove)
      target.addEventListener('pointerup', handlePointerUp)
    },
    [annotation, containerRef, dispatch, startBatch, endBatch],
  )

  return (
    <>
      {HANDLE_POSITIONS.map((handle, i) => (
        <div
          key={i}
          data-resize-handle
          className={`absolute w-4 h-4 md:w-3 md:h-3 bg-white border-2 border-primary-500 rounded-sm touch-none ${handle.className}`}
          style={{ cursor: handle.cursor }}
          onPointerDown={(e) => handleResizeStart(e, handle)}
        />
      ))}
    </>
  )
}

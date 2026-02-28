import { useCallback, useRef, useState } from 'react'
import { Page } from 'react-pdf'
import { useEditor } from '../../state/EditorContext'
import { AnnotationOverlay } from '../annotations/AnnotationOverlay'
import type { DrawingAnnotation } from '../../types'

interface PDFPageWrapperProps {
  pageNumber: number
  width: number
}

export function PDFPageWrapper({ pageNumber, width }: PDFPageWrapperProps) {
  const { state, dispatch } = useEditor()
  const drawingRef = useRef<{ points: { x: number; y: number }[] } | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const [livePoints, setLivePoints] = useState<{ x: number; y: number }[] | null>(null)

  const handlePageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('[data-annotation]')) return

      const rect = e.currentTarget.getBoundingClientRect()
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100

      const tool = state.activeTool

      if (tool === 'text') {
        dispatch({
          type: 'ADD_ANNOTATION',
          payload: {
            id: crypto.randomUUID(), type: 'text', pageNumber,
            x: xPercent, y: yPercent, width: 20, height: 4, opacity: 1,
            content: 'Text', fontSize: 16, fontFamily: 'sans-serif',
            color: '#000000', bold: false, italic: false, align: 'left',
          },
        })
      } else if (tool === 'date') {
        dispatch({
          type: 'ADD_ANNOTATION',
          payload: {
            id: crypto.randomUUID(), type: 'date', pageNumber,
            x: xPercent, y: yPercent, width: 15, height: 3.5, opacity: 1,
            content: formatDate(new Date(), 'MM/DD/YYYY'),
            fontSize: 14, fontFamily: 'sans-serif', color: '#000000',
            dateFormat: 'MM/DD/YYYY',
          },
        })
      } else if (tool === 'highlight') {
        dispatch({
          type: 'ADD_ANNOTATION',
          payload: {
            id: crypto.randomUUID(), type: 'highlight', pageNumber,
            x: xPercent - 5, y: yPercent - 0.5, width: 20, height: 2.5,
            opacity: 1, color: '#fbbf24',
          },
        })
      } else if (tool === 'strikethrough') {
        dispatch({
          type: 'ADD_ANNOTATION',
          payload: {
            id: crypto.randomUUID(), type: 'strikethrough', pageNumber,
            x: xPercent - 5, y: yPercent - 0.5, width: 20, height: 2,
            opacity: 1, color: '#dc2626',
          },
        })
      } else if (tool === 'underline') {
        dispatch({
          type: 'ADD_ANNOTATION',
          payload: {
            id: crypto.randomUUID(), type: 'underline', pageNumber,
            x: xPercent - 5, y: yPercent - 0.5, width: 20, height: 2,
            opacity: 1, color: '#2563eb',
          },
        })
      } else if (tool === 'shape-rect') {
        dispatch({
          type: 'ADD_ANNOTATION',
          payload: {
            id: crypto.randomUUID(), type: 'shape', pageNumber,
            x: xPercent - 5, y: yPercent - 4, width: 15, height: 10,
            opacity: 1, shapeType: 'rect', strokeColor: '#000000',
            fillColor: '', strokeWidth: 2,
          },
        })
      } else if (tool === 'shape-ellipse') {
        dispatch({
          type: 'ADD_ANNOTATION',
          payload: {
            id: crypto.randomUUID(), type: 'shape', pageNumber,
            x: xPercent - 5, y: yPercent - 4, width: 15, height: 10,
            opacity: 1, shapeType: 'ellipse', strokeColor: '#000000',
            fillColor: '', strokeWidth: 2,
          },
        })
      } else if (tool === 'shape-line') {
        dispatch({
          type: 'ADD_ANNOTATION',
          payload: {
            id: crypto.randomUUID(), type: 'shape', pageNumber,
            x: xPercent - 5, y: yPercent - 1, width: 20, height: 5,
            opacity: 1, shapeType: 'line', strokeColor: '#000000',
            fillColor: '', strokeWidth: 2,
          },
        })
      } else if (tool === 'shape-arrow') {
        dispatch({
          type: 'ADD_ANNOTATION',
          payload: {
            id: crypto.randomUUID(), type: 'shape', pageNumber,
            x: xPercent - 5, y: yPercent - 1.5, width: 20, height: 4,
            opacity: 1, shapeType: 'arrow', strokeColor: '#000000',
            fillColor: '', strokeWidth: 2,
          },
        })
      } else if (tool === 'checkbox') {
        dispatch({
          type: 'ADD_ANNOTATION',
          payload: {
            id: crypto.randomUUID(), type: 'checkbox', pageNumber,
            x: xPercent, y: yPercent, width: 15, height: 3,
            opacity: 1, checked: false, label: '',
          },
        })
      } else if (tool === 'whiteout') {
        dispatch({
          type: 'ADD_ANNOTATION',
          payload: {
            id: crypto.randomUUID(), type: 'whiteout', pageNumber,
            x: xPercent - 3, y: yPercent - 1, width: 15, height: 3,
            opacity: 1,
          },
        })
      } else if (tool === 'select') {
        dispatch({ type: 'SELECT_ANNOTATION', payload: null })
      }
    },
    [state.activeTool, pageNumber, dispatch],
  )

  // Drawing tool: unified pointer events for mouse + touch
  const handleDrawStart = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (state.activeTool !== 'drawing') return
      if ((e.target as HTMLElement).closest('[data-annotation]')) return
      e.preventDefault()

      const el = e.currentTarget
      el.setPointerCapture(e.pointerId)

      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      const startPoints = [{ x, y }]
      drawingRef.current = { points: startPoints }
      setLivePoints([...startPoints])

      // Throttle preview updates to ~60fps
      let frameId = 0

      const handleMove = (moveE: PointerEvent) => {
        if (!drawingRef.current || !pageRef.current) return
        const r = pageRef.current.getBoundingClientRect()
        const mx = ((moveE.clientX - r.left) / r.width) * 100
        const my = ((moveE.clientY - r.top) / r.height) * 100
        drawingRef.current.points.push({ x: mx, y: my })

        if (!frameId) {
          frameId = requestAnimationFrame(() => {
            if (drawingRef.current) {
              setLivePoints([...drawingRef.current.points])
            }
            frameId = 0
          })
        }
      }

      const handleUp = () => {
        if (frameId) cancelAnimationFrame(frameId)
        setLivePoints(null)

        if (drawingRef.current && drawingRef.current.points.length > 1) {
          const pts = drawingRef.current.points
          const minX = Math.max(0, Math.min(...pts.map(p => p.x)))
          const maxX = Math.min(100, Math.max(...pts.map(p => p.x)))
          const minY = Math.max(0, Math.min(...pts.map(p => p.y)))
          const maxY = Math.min(100, Math.max(...pts.map(p => p.y)))
          const w = maxX - minX || 1
          const h = maxY - minY || 1

          const normalizedPts = pts.map(p => ({
            x: ((p.x - minX) / w) * 100,
            y: ((p.y - minY) / h) * 100,
          }))

          dispatch({
            type: 'ADD_ANNOTATION',
            payload: {
              id: crypto.randomUUID(), type: 'drawing', pageNumber,
              x: minX, y: minY, width: w, height: h, opacity: 1,
              paths: [normalizedPts], strokeColor: '#000000', strokeWidth: 2,
            } as DrawingAnnotation,
          })
        }
        drawingRef.current = null
        el.removeEventListener('pointermove', handleMove)
        el.removeEventListener('pointerup', handleUp)
      }

      el.addEventListener('pointermove', handleMove)
      el.addEventListener('pointerup', handleUp)
    },
    [state.activeTool, pageNumber, dispatch],
  )

  return (
    <div
      ref={pageRef}
      className={`relative bg-white shadow-lg mx-auto mb-4 ${state.activeTool === 'drawing' ? 'touch-none' : ''}`}
      style={{ width }}
      onClick={handlePageClick}
      onPointerDown={handleDrawStart}
    >
      <Page
        pageNumber={pageNumber}
        width={width}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        className="pdf-page"
      />
      <AnnotationOverlay pageNumber={pageNumber} />

      {/* Live drawing preview */}
      {livePoints && livePoints.length > 1 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ zIndex: 30 }}
        >
          <polyline
            points={livePoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {/* Watermark overlay */}
      {state.watermark.enabled && state.watermark.text && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span
            className="font-bold tracking-widest text-center whitespace-nowrap select-none"
            style={{
              color: state.watermark.color,
              opacity: state.watermark.opacity,
              fontSize: state.watermark.fontSize,
              transform: `rotate(${state.watermark.rotation}deg)`,
            }}
          >
            {state.watermark.text}
          </span>
        </div>
      )}
    </div>
  )
}

function formatDate(date: Date, format: string): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const y = String(date.getFullYear())
  switch (format) {
    case 'DD/MM/YYYY': return `${d}/${m}/${y}`
    case 'YYYY-MM-DD': return `${y}-${m}-${d}`
    case 'MMMM D, YYYY': return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    case 'D MMM YYYY': return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    default: return `${m}/${d}/${y}`
  }
}

import { useRef, useCallback, useEffect, useMemo, useState } from 'react'
import { Document } from 'react-pdf'
import { useEditor } from '../../state/EditorContext'
import { PDFPageWrapper } from './PDFPageWrapper'

interface PDFViewportProps {
  pdfUrl: string
}

export function PDFViewport({ pdfUrl }: PDFViewportProps) {
  const { state, dispatch } = useEditor()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Track container width for responsive page sizing
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onDocumentLoadSuccess = useCallback(
    (pdf: { numPages: number }) => {
      dispatch({ type: 'SET_TOTAL_PAGES', payload: pdf.numPages })

      const promises = Array.from({ length: pdf.numPages }, (_, i) =>
        (pdf as any).getPage(i + 1).then((page: any) => {
          const viewport = page.getViewport({ scale: 1 })
          return { width: viewport.width, height: viewport.height }
        })
      )
      Promise.all(promises).then((dims) => {
        dispatch({ type: 'SET_PAGE_DIMENSIONS', payload: dims })
      })
    },
    [dispatch],
  )

  // Responsive: use container width on mobile, 680 on desktop
  const pageWidth = useMemo(() => {
    const baseWidth = containerWidth > 0
      ? Math.min(680, containerWidth - 16) // 8px padding each side
      : 680
    return baseWidth * state.zoom
  }, [state.zoom, containerWidth])

  // Track current page based on scroll position
  const currentPageRef = useRef(state.currentPage)
  currentPageRef.current = state.currentPage

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const pages = container.querySelectorAll('[data-page-number]')
    const targetY = containerRect.top + containerRect.height / 3

    for (let i = pages.length - 1; i >= 0; i--) {
      const page = pages[i] as HTMLElement
      if (page.getBoundingClientRect().top <= targetY) {
        const pageNum = parseInt(page.dataset.pageNumber || '1')
        if (pageNum !== currentPageRef.current) {
          dispatch({ type: 'SET_PAGE', payload: pageNum })
        }
        break
      }
    }
  }, [dispatch])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-slate-100 scrollbar-thin"
      style={{
        cursor: state.activeTool !== 'select' ? 'crosshair' : undefined,
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="py-4 md:py-6 px-2 md:px-4">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          }
        >
          {state.totalPages > 0 &&
            Array.from({ length: state.totalPages }, (_, i) => (
              <div key={i + 1} data-page-number={i + 1}>
                <PDFPageWrapper pageNumber={i + 1} width={pageWidth} />
              </div>
            ))}
        </Document>
      </div>
    </div>
  )
}

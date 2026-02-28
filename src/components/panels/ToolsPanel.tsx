import { useState, useCallback } from 'react'
import {
  MousePointer2, Type, PenLine, Calendar, Undo2, Redo2,
  Image, Pencil, Highlighter, Strikethrough, Underline,
  StickyNote, Square, Circle, Minus, ArrowRight,
  Droplets, FileText, EyeOff, Hash,
  User, Copy, Clipboard,
} from 'lucide-react'
import type { Tool } from '../../types'
import { useEditor } from '../../state/EditorContext'
import { IconButton } from '../ui/IconButton'
import { SignatureModal } from '../modals/SignatureModal'
import { ImageUploadModal } from '../modals/ImageUploadModal'
import { StickyNoteModal } from '../modals/StickyNoteModal'
import { WatermarkModal } from '../modals/WatermarkModal'
import { HeaderFooterModal } from '../modals/HeaderFooterModal'
import { SignerInfoModal } from '../modals/SignerInfoModal'
import { PageThumbnail } from '../pdf/PageThumbnail'

interface ToolsPanelProps {
  pdfUrl: string
  mobile?: boolean
  onClose?: () => void
}

export function ToolsPanel({ pdfUrl, mobile, onClose }: ToolsPanelProps) {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useEditor()
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)
  const [initialsModalOpen, setInitialsModalOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [stickyModalOpen, setStickyModalOpen] = useState(false)
  const [watermarkModalOpen, setWatermarkModalOpen] = useState(false)
  const [headerFooterModalOpen, setHeaderFooterModalOpen] = useState(false)
  const [signerInfoModalOpen, setSignerInfoModalOpen] = useState(false)

  const scrollToCurrentPage = useCallback((page: number) => {
    setTimeout(() => {
      document.querySelector(`[data-page-number="${page}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }, [])

  const handleSignatureConfirm = useCallback(
    (dataUrl: string) => {
      const page = state.currentPage
      dispatch({
        type: 'ADD_ANNOTATION',
        payload: {
          id: crypto.randomUUID(), type: 'signature', pageNumber: page,
          x: 30, y: 40, width: 25, height: 10, opacity: 1, dataUrl,
        },
      })
      dispatch({ type: 'ADD_AUDIT_ENTRY', payload: { action: 'Signature Added', details: `Page ${page}` } })
      scrollToCurrentPage(page)
    },
    [state.currentPage, dispatch, scrollToCurrentPage],
  )

  const handleInitialsConfirm = useCallback(
    (dataUrl: string) => {
      const page = state.currentPage
      dispatch({
        type: 'ADD_ANNOTATION',
        payload: {
          id: crypto.randomUUID(), type: 'initials', pageNumber: page,
          x: 30, y: 40, width: 10, height: 5, opacity: 1, dataUrl,
        },
      })
      dispatch({ type: 'ADD_AUDIT_ENTRY', payload: { action: 'Initials Added', details: `Page ${page}` } })
      scrollToCurrentPage(page)
    },
    [state.currentPage, dispatch, scrollToCurrentPage],
  )

  const handleImageConfirm = useCallback(
    (dataUrl: string, w: number, h: number) => {
      const page = state.currentPage
      const aspect = w / h
      const annWidth = 25
      const annHeight = annWidth / aspect * (state.pageDimensions[0]?.width || 612) / (state.pageDimensions[0]?.height || 792)
      dispatch({
        type: 'ADD_ANNOTATION',
        payload: {
          id: crypto.randomUUID(), type: 'image', pageNumber: page,
          x: 25, y: 30, width: annWidth, height: Math.min(annHeight, 40), opacity: 1,
          dataUrl, originalWidth: w, originalHeight: h,
        },
      })
      scrollToCurrentPage(page)
    },
    [state.currentPage, state.pageDimensions, dispatch, scrollToCurrentPage],
  )

  const handleStickyConfirm = useCallback(
    (content: string, color: string, author: string) => {
      const page = state.currentPage
      dispatch({
        type: 'ADD_ANNOTATION',
        payload: {
          id: crypto.randomUUID(), type: 'sticky-note', pageNumber: page,
          x: 85, y: 10, width: 5, height: 5, opacity: 1,
          content, color, author, timestamp: new Date().toISOString(),
        },
      })
      scrollToCurrentPage(page)
    },
    [state.currentPage, dispatch, scrollToCurrentPage],
  )

  const setTool = (tool: Tool) => {
    dispatch({ type: 'SET_TOOL', payload: tool })
    if (mobile && onClose) onClose()
  }

  return (
    <div className={mobile ? 'bg-white flex flex-col' : 'w-[220px] border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden'}>
      {/* Signer info */}
      <div className="p-3 border-b border-slate-100">
        <button
          onClick={() => setSignerInfoModalOpen(true)}
          className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left"
        >
          <User size={14} className="text-slate-400" />
          <span className="truncate">{state.signerName || 'Set Signer Info'}</span>
        </button>
      </div>

      {/* Primary tools */}
      <div className="p-3 border-b border-slate-100">
        <SectionLabel>Tools</SectionLabel>
        <div className="flex flex-col gap-0.5">
          <ToolBtn icon={<MousePointer2 size={15} />} label="Select" active={state.activeTool === 'select'} onClick={() => setTool('select')} />
          <ToolBtn icon={<Type size={15} />} label="Add Text" active={state.activeTool === 'text'} onClick={() => setTool('text')} />
          <ToolBtn icon={<PenLine size={15} />} label="Signature" active={false} onClick={() => setSignatureModalOpen(true)} />
          <ToolBtn icon={<Hash size={15} />} label="Initials" active={false} onClick={() => setInitialsModalOpen(true)} />
          <ToolBtn icon={<Calendar size={15} />} label="Date" active={state.activeTool === 'date'} onClick={() => setTool('date')} />
          <ToolBtn icon={<Image size={15} />} label="Image" active={false} onClick={() => setImageModalOpen(true)} />
        </div>
      </div>

      {/* Markup tools */}
      <div className="p-3 border-b border-slate-100">
        <SectionLabel>Markup</SectionLabel>
        <div className="flex flex-col gap-0.5">
          <ToolBtn icon={<Pencil size={15} />} label="Draw" active={state.activeTool === 'drawing'} onClick={() => setTool('drawing')} />
          <ToolBtn icon={<Highlighter size={15} />} label="Highlight" active={state.activeTool === 'highlight'} onClick={() => setTool('highlight')} />
          <ToolBtn icon={<Strikethrough size={15} />} label="Strikethrough" active={state.activeTool === 'strikethrough'} onClick={() => setTool('strikethrough')} />
          <ToolBtn icon={<Underline size={15} />} label="Underline" active={state.activeTool === 'underline'} onClick={() => setTool('underline')} />
          <ToolBtn icon={<StickyNote size={15} />} label="Comment" active={false} onClick={() => setStickyModalOpen(true)} />
          <ToolBtn icon={<EyeOff size={15} />} label="Whiteout" active={state.activeTool === 'whiteout'} onClick={() => setTool('whiteout')} />
        </div>
      </div>

      {/* Shapes */}
      <div className="p-3 border-b border-slate-100">
        <SectionLabel>Shapes</SectionLabel>
        <div className="grid grid-cols-4 gap-1">
          <IconButton active={state.activeTool === 'shape-rect'} onClick={() => setTool('shape-rect')} tooltip="Rectangle" size="sm"><Square size={15} /></IconButton>
          <IconButton active={state.activeTool === 'shape-ellipse'} onClick={() => setTool('shape-ellipse')} tooltip="Ellipse" size="sm"><Circle size={15} /></IconButton>
          <IconButton active={state.activeTool === 'shape-line'} onClick={() => setTool('shape-line')} tooltip="Line" size="sm"><Minus size={15} /></IconButton>
          <IconButton active={state.activeTool === 'shape-arrow'} onClick={() => setTool('shape-arrow')} tooltip="Arrow" size="sm"><ArrowRight size={15} /></IconButton>
        </div>
      </div>

      {/* Stamps & Document */}
      <div className="p-3 border-b border-slate-100">
        <SectionLabel>Document</SectionLabel>
        <div className="flex flex-col gap-0.5">
          <ToolBtn icon={<Droplets size={15} />} label="Watermark" active={false} onClick={() => setWatermarkModalOpen(true)} />
          <ToolBtn icon={<FileText size={15} />} label="Header/Footer" active={false} onClick={() => setHeaderFooterModalOpen(true)} />
        </div>
      </div>

      {/* Undo/Redo/Copy */}
      <div className="p-3 border-b border-slate-100">
        <div className="flex gap-1">
          <IconButton tooltip="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo}><Undo2 size={15} /></IconButton>
          <IconButton tooltip="Redo (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}><Redo2 size={15} /></IconButton>
          <IconButton tooltip="Copy (Ctrl+C)" disabled={state.selectedIds.length === 0} onClick={() => dispatch({ type: 'COPY_SELECTED' })}><Copy size={15} /></IconButton>
          <IconButton tooltip="Paste (Ctrl+V)" disabled={state.clipboard.length === 0} onClick={() => dispatch({ type: 'PASTE_CLIPBOARD', payload: state.currentPage })}><Clipboard size={15} /></IconButton>
        </div>
      </div>

      {/* Thumbnails — desktop only */}
      <div className={`flex-1 overflow-auto p-3 scrollbar-thin ${mobile ? 'hidden' : ''}`}>
        <SectionLabel>Pages</SectionLabel>
        <div className="flex flex-col gap-2">
          {state.totalPages > 0 &&
            Array.from({ length: state.totalPages }, (_, i) => (
              <PageThumbnail
                key={i + 1}
                pdfUrl={pdfUrl}
                pageNumber={i + 1}
                isActive={state.currentPage === i + 1}
                onClick={() => {
                  dispatch({ type: 'SET_PAGE', payload: i + 1 })
                  setTimeout(() => {
                    document.querySelector(`[data-page-number="${i + 1}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }, 50)
                }}
              />
            ))}
        </div>
      </div>

      {/* Modals */}
      <SignatureModal open={signatureModalOpen} onClose={() => setSignatureModalOpen(false)} onConfirm={handleSignatureConfirm} />
      <SignatureModal open={initialsModalOpen} onClose={() => setInitialsModalOpen(false)} onConfirm={handleInitialsConfirm} title="Add Initials" confirmLabel="Add Initials" />
      <ImageUploadModal open={imageModalOpen} onClose={() => setImageModalOpen(false)} onConfirm={handleImageConfirm} />
      <StickyNoteModal open={stickyModalOpen} onClose={() => setStickyModalOpen(false)} onConfirm={handleStickyConfirm} defaultAuthor={state.signerName} />
      <WatermarkModal open={watermarkModalOpen} onClose={() => setWatermarkModalOpen(false)} config={state.watermark} onSave={(c) => dispatch({ type: 'SET_WATERMARK', payload: c })} />
      <HeaderFooterModal open={headerFooterModalOpen} onClose={() => setHeaderFooterModalOpen(false)} config={state.headerFooter} onSave={(c) => dispatch({ type: 'SET_HEADER_FOOTER', payload: c })} />
      <SignerInfoModal
        open={signerInfoModalOpen} onClose={() => setSignerInfoModalOpen(false)}
        name={state.signerName} email={state.signerEmail}
        onSave={(n, e) => {
          dispatch({ type: 'SET_SIGNER_INFO', payload: { name: n, email: e } })
          dispatch({ type: 'ADD_AUDIT_ENTRY', payload: { action: 'Signer Info Set', details: `${n} <${e}>` } })
        }}
      />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">{children}</p>
}

function ToolBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-colors w-full text-left
        ${active ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
    >
      {icon}{label}
    </button>
  )
}

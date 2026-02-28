import { useState } from 'react'
import {
  MousePointer2, Type, PenLine, Calendar, Image, Pencil,
  Highlighter, ChevronUp, Settings2, Undo2, Redo2,
} from 'lucide-react'
import type { Tool } from '../../types'
import { useEditor } from '../../state/EditorContext'
import { SignatureModal } from '../modals/SignatureModal'
import { ImageUploadModal } from '../modals/ImageUploadModal'

interface MobileToolBarProps {
  pdfUrl: string
  onOpenTools: () => void
  onOpenProperties: () => void
  toolsOpen: boolean
  propertiesOpen: boolean
}

export function MobileToolBar({ pdfUrl, onOpenTools, onOpenProperties, toolsOpen, propertiesOpen }: MobileToolBarProps) {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useEditor()
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)

  const setTool = (tool: Tool) => dispatch({ type: 'SET_TOOL', payload: tool })

  const tools = [
    { tool: 'select' as Tool, icon: MousePointer2, label: 'Select' },
    { tool: 'text' as Tool, icon: Type, label: 'Text' },
    { tool: null, icon: PenLine, label: 'Sign', action: () => setSignatureModalOpen(true) },
    { tool: 'date' as Tool, icon: Calendar, label: 'Date' },
    { tool: 'drawing' as Tool, icon: Pencil, label: 'Draw' },
    { tool: 'highlight' as Tool, icon: Highlighter, label: 'Mark' },
  ]

  const hasSelection = state.selectedIds.length > 0

  return (
    <>
      <div className="bg-white border-t border-slate-200 px-1.5 py-1">
        <div className="flex items-center justify-between gap-0.5">
          {/* Quick tools */}
          <div className="flex items-center gap-0 flex-1 overflow-x-auto">
            {tools.map(({ tool, icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={() => action ? action() : tool && setTool(tool)}
                className={`flex flex-col items-center justify-center min-w-[44px] h-[44px] rounded-lg text-[10px] transition-colors shrink-0
                  ${tool && state.activeTool === tool ? 'bg-primary-50 text-primary-700' : 'text-slate-500 active:bg-slate-100'}`}
              >
                <Icon size={18} />
                <span className="mt-0.5 leading-none">{label}</span>
              </button>
            ))}
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-0 shrink-0 border-l border-slate-200 pl-1 ml-0.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="w-[36px] h-[36px] flex items-center justify-center rounded-lg text-slate-500 active:bg-slate-100 disabled:opacity-30"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="w-[36px] h-[36px] flex items-center justify-center rounded-lg text-slate-500 active:bg-slate-100 disabled:opacity-30"
            >
              <Redo2 size={16} />
            </button>
          </div>

          {/* More tools + properties */}
          <div className="flex items-center gap-0 shrink-0 border-l border-slate-200 pl-1 ml-0.5">
            <button
              onClick={onOpenTools}
              className={`w-[36px] h-[36px] flex items-center justify-center rounded-lg transition-colors
                ${toolsOpen ? 'bg-primary-50 text-primary-700' : 'text-slate-500 active:bg-slate-100'}`}
            >
              <ChevronUp size={16} />
            </button>
            {hasSelection && (
              <button
                onClick={onOpenProperties}
                className={`w-[36px] h-[36px] flex items-center justify-center rounded-lg transition-colors
                  ${propertiesOpen ? 'bg-primary-50 text-primary-700' : 'text-slate-500 active:bg-slate-100'}`}
              >
                <Settings2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <SignatureModal
        open={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onConfirm={(dataUrl) => {
          dispatch({
            type: 'ADD_ANNOTATION',
            payload: {
              id: crypto.randomUUID(), type: 'signature', pageNumber: state.currentPage,
              x: 30, y: 40, width: 25, height: 10, opacity: 1, dataUrl,
            },
          })
          dispatch({ type: 'ADD_AUDIT_ENTRY', payload: { action: 'Signature Added', details: `Page ${state.currentPage}` } })
        }}
      />
      <ImageUploadModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onConfirm={(dataUrl, w, h) => {
          const aspect = w / h
          const annWidth = 25
          const annHeight = annWidth / aspect * (state.pageDimensions[0]?.width || 612) / (state.pageDimensions[0]?.height || 792)
          dispatch({
            type: 'ADD_ANNOTATION',
            payload: {
              id: crypto.randomUUID(), type: 'image', pageNumber: state.currentPage,
              x: 25, y: 30, width: annWidth, height: Math.min(annHeight, 40), opacity: 1,
              dataUrl, originalWidth: w, originalHeight: h,
            },
          })
        }}
      />
    </>
  )
}

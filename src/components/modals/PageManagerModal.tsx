import { useState, useCallback } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { RotateCw, Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react'

interface PageManagerModalProps {
  open: boolean
  onClose: () => void
  totalPages: number
  onRotatePage: (pageNum: number, degrees: number) => void
  onDeletePage: (pageNum: number) => void
  onAddBlankPage: (afterPage: number) => void
  onMovePage: (from: number, to: number) => void
}

export function PageManagerModal({ open, onClose, totalPages, onRotatePage, onDeletePage, onAddBlankPage, onMovePage }: PageManagerModalProps) {
  const [pages, setPages] = useState(() => Array.from({ length: totalPages }, (_, i) => i + 1))

  return (
    <Modal open={open} onClose={onClose} title="Manage Pages">
      <div className="flex flex-col gap-2 max-h-80 overflow-auto">
        {pages.map((pageNum, index) => (
          <div key={pageNum} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-sm font-medium text-slate-700 w-16">Page {pageNum}</span>
            <div className="flex-1" />
            <button
              onClick={() => { if (index > 0) { const next = [...pages]; [next[index-1], next[index]] = [next[index], next[index-1]]; setPages(next); onMovePage(pageNum, pages[index-1]) }}}
              disabled={index === 0}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 disabled:opacity-30"
              title="Move up"
            ><ArrowUp size={14} /></button>
            <button
              onClick={() => { if (index < pages.length - 1) { const next = [...pages]; [next[index], next[index+1]] = [next[index+1], next[index]]; setPages(next); onMovePage(pageNum, pages[index+1]) }}}
              disabled={index === pages.length - 1}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 disabled:opacity-30"
              title="Move down"
            ><ArrowDown size={14} /></button>
            <button onClick={() => onRotatePage(pageNum, 90)} className="p-1 rounded text-slate-400 hover:text-primary-600 hover:bg-primary-50" title="Rotate 90°">
              <RotateCw size={14} />
            </button>
            <button onClick={() => onAddBlankPage(pageNum)} className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title="Add blank page after">
              <Plus size={14} />
            </button>
            <button onClick={() => { if (pages.length > 1) { setPages(pages.filter(p => p !== pageNum)); onDeletePage(pageNum) }}} disabled={pages.length <= 1} className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30" title="Delete page">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="secondary" onClick={onClose}>Done</Button>
      </div>
    </Modal>
  )
}

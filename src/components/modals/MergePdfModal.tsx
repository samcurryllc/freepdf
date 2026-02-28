import { useState, useRef, useCallback } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Plus, X, GripVertical, FileText } from 'lucide-react'

interface MergePdfModalProps {
  open: boolean
  onClose: () => void
  onMerge: (files: File[]) => void
}

export function MergePdfModal({ open, onClose, onMerge }: MergePdfModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf')
    setFiles((prev) => [...prev, ...newFiles])
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const remove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const moveUp = useCallback((index: number) => {
    if (index === 0) return
    setFiles((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }, [])

  const handleMerge = useCallback(() => {
    if (files.length >= 2) {
      onMerge(files)
      setFiles([])
      onClose()
    }
  }, [files, onMerge, onClose])

  return (
    <Modal open={open} onClose={onClose} title="Merge PDFs">
      <div className="flex flex-col gap-4">
        <input ref={inputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={addFiles} />

        {files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">Add PDF files to merge them into one</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 max-h-60 overflow-auto">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                <button onClick={() => moveUp(i)} className="text-slate-300 hover:text-slate-500 cursor-grab">
                  <GripVertical size={14} />
                </button>
                <FileText size={14} className="text-primary-500 shrink-0" />
                <span className="text-sm text-slate-700 truncate flex-1">{file.name}</span>
                <span className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                <button onClick={() => remove(i)} className="text-slate-300 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button variant="secondary" onClick={() => inputRef.current?.click()}>
          <Plus size={14} /> Add PDFs
        </Button>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleMerge} disabled={files.length < 2}>
            Merge {files.length > 0 ? `${files.length} Files` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

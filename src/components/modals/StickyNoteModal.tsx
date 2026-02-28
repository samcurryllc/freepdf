import { useState, useCallback } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface StickyNoteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (content: string, color: string, author: string) => void
  defaultAuthor: string
}

const NOTE_COLORS = [
  { value: '#fbbf24', label: 'Yellow', bg: 'bg-amber-200' },
  { value: '#34d399', label: 'Green', bg: 'bg-emerald-300' },
  { value: '#60a5fa', label: 'Blue', bg: 'bg-blue-300' },
  { value: '#f472b6', label: 'Pink', bg: 'bg-pink-300' },
]

export function StickyNoteModal({ open, onClose, onConfirm, defaultAuthor }: StickyNoteModalProps) {
  const [content, setContent] = useState('')
  const [color, setColor] = useState('#fbbf24')
  const [author, setAuthor] = useState(defaultAuthor)

  const handleConfirm = useCallback(() => {
    if (content.trim()) {
      onConfirm(content.trim(), color, author)
      setContent('')
      onClose()
    }
  }, [content, color, author, onConfirm, onClose])

  return (
    <Modal open={open} onClose={onClose} title="Add Comment">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Author</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Color</label>
          <div className="flex gap-2">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-full ${c.bg} border-2 transition-all ${
                  color === c.value ? 'border-slate-600 scale-110' : 'border-transparent'
                }`}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Comment</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none"
            placeholder="Type your comment..."
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!content.trim()}>Add Comment</Button>
        </div>
      </div>
    </Modal>
  )
}

import { useState } from 'react'
import type { StickyNoteAnnotation } from '../../types'
import { StickyNote } from 'lucide-react'

interface Props { annotation: StickyNoteAnnotation }

const NOTE_COLORS: Record<string, string> = {
  '#fbbf24': 'bg-amber-100 border-amber-300',
  '#34d399': 'bg-emerald-100 border-emerald-300',
  '#60a5fa': 'bg-blue-100 border-blue-300',
  '#f472b6': 'bg-pink-100 border-pink-300',
}

export function StickyNoteAnnotationView({ annotation }: Props) {
  const [expanded, setExpanded] = useState(false)
  const colorClass = NOTE_COLORS[annotation.color] || 'bg-amber-100 border-amber-300'

  return (
    <div className="relative w-full h-full">
      <div
        className="w-8 h-8 cursor-pointer flex items-center justify-center"
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
      >
        <StickyNote size={24} style={{ color: annotation.color }} />
      </div>
      {expanded && (
        <div className={`absolute top-8 left-0 z-30 w-48 p-3 rounded-lg border shadow-lg text-xs ${colorClass}`} onClick={(e) => e.stopPropagation()}>
          <div className="font-semibold text-slate-700 mb-1">{annotation.author || 'Note'}</div>
          <div className="text-slate-600 whitespace-pre-wrap">{annotation.content}</div>
          <div className="text-[10px] text-slate-400 mt-2">{new Date(annotation.timestamp).toLocaleString()}</div>
        </div>
      )}
    </div>
  )
}

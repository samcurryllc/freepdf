import { useMemo, useCallback } from 'react'
import { Trash2, Copy, Layers } from 'lucide-react'
import { useEditor } from '../../state/EditorContext'
import { Button } from '../ui/Button'
import { ColorPicker } from '../ui/ColorPicker'
import { Select } from '../ui/Select'
import { Slider } from '../ui/Slider'
import type { Annotation, DateFormat } from '../../types'

const FONT_OPTIONS = [
  { value: 'sans-serif', label: 'Sans-serif (Helvetica)' },
  { value: 'serif', label: 'Serif (Times)' },
  { value: 'monospace', label: 'Monospace (Courier)' },
  { value: 'cursive', label: 'Cursive (Script)' },
]

const DATE_FORMAT_OPTIONS: { value: DateFormat; label: string }[] = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'MMMM D, YYYY', label: 'Month D, YYYY' },
  { value: 'D MMM YYYY', label: 'D Mon YYYY' },
]

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
]

export function PropertiesPanel({ mobile }: { mobile?: boolean } = {}) {
  const { state, dispatch } = useEditor()

  const selected = useMemo(
    () => state.annotations.find((a) => a.id === state.selectedIds[0]),
    [state.annotations, state.selectedIds],
  )

  const multiSelected = state.selectedIds.length > 1

  const update = useCallback(
    (changes: Partial<Annotation>) => {
      if (!selected) return
      dispatch({ type: 'UPDATE_ANNOTATION', payload: { id: selected.id, changes } })
    },
    [selected, dispatch],
  )

  const handleDelete = useCallback(() => {
    dispatch({ type: 'DELETE_SELECTED' })
  }, [dispatch])

  const handleDuplicate = useCallback(() => {
    dispatch({ type: 'DUPLICATE_SELECTED' })
  }, [dispatch])

  if (state.selectedIds.length === 0) {
    return (
      <div className={mobile ? 'bg-white p-6 text-center' : 'w-[260px] border-l border-slate-200 bg-white flex flex-col items-center justify-center shrink-0'}>
        <div className={mobile ? '' : 'text-center px-6'}>
          <Layers size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Select an annotation to edit its properties</p>
          <p className="text-xs text-slate-300 mt-2">
            {state.annotations.length} annotation{state.annotations.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>
    )
  }

  if (multiSelected) {
    return (
      <div className={mobile ? 'bg-white p-4' : 'w-[260px] border-l border-slate-200 bg-white shrink-0 p-4'}>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {state.selectedIds.length} Selected
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={handleDuplicate} className="w-full">
            <Copy size={14} /> Duplicate All
          </Button>
          <Button variant="danger" onClick={handleDelete} className="w-full">
            <Trash2 size={14} /> Delete All
          </Button>
        </div>
      </div>
    )
  }

  if (!selected) return null

  const TYPE_LABELS: Record<string, string> = {
    text: 'Text', signature: 'Signature', initials: 'Initials', date: 'Date',
    image: 'Image', drawing: 'Drawing', highlight: 'Highlight',
    strikethrough: 'Strikethrough', underline: 'Underline',
    'sticky-note': 'Comment', stamp: 'Stamp', shape: 'Shape',
    checkbox: 'Checkbox', whiteout: 'Whiteout',
  }

  const hasFont = selected.type === 'text' || selected.type === 'date'
  const hasColor = selected.type === 'text' || selected.type === 'date' || selected.type === 'highlight' || selected.type === 'strikethrough' || selected.type === 'underline'
  const hasStrokeColor = selected.type === 'shape' || selected.type === 'drawing'

  return (
    <div className={mobile ? 'bg-white' : 'w-[260px] border-l border-slate-200 bg-white shrink-0 overflow-auto scrollbar-thin'}>
      <div className="p-4">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {TYPE_LABELS[selected.type] || selected.type} Properties
        </p>

        <div className="flex flex-col gap-4">
          {/* Font Size */}
          {hasFont && (
            <PropSection label="Font Size">
              <Slider value={(selected as any).fontSize} min={8} max={72} step={1} onChange={(v) => update({ fontSize: v })} />
            </PropSection>
          )}

          {/* Font Family */}
          {hasFont && (
            <PropSection label="Font">
              <Select value={(selected as any).fontFamily} options={FONT_OPTIONS} onChange={(e) => update({ fontFamily: e.target.value as any })} />
            </PropSection>
          )}

          {/* Text alignment */}
          {selected.type === 'text' && (
            <PropSection label="Align">
              <Select value={selected.align} options={ALIGN_OPTIONS} onChange={(e) => update({ align: e.target.value as any })} />
            </PropSection>
          )}

          {/* Bold / Italic */}
          {selected.type === 'text' && (
            <PropSection label="Style">
              <div className="flex gap-1">
                <button
                  onClick={() => update({ bold: !selected.bold })}
                  className={`px-3 py-1.5 text-sm font-bold rounded-md border transition-colors
                    ${selected.bold ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >B</button>
                <button
                  onClick={() => update({ italic: !selected.italic })}
                  className={`px-3 py-1.5 text-sm italic rounded-md border transition-colors
                    ${selected.italic ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >I</button>
              </div>
            </PropSection>
          )}

          {/* Date format */}
          {selected.type === 'date' && (
            <PropSection label="Date Format">
              <Select
                value={selected.dateFormat}
                options={DATE_FORMAT_OPTIONS}
                onChange={(e) => {
                  const fmt = e.target.value as DateFormat
                  const d = new Date()
                  const m = String(d.getMonth() + 1).padStart(2, '0')
                  const day = String(d.getDate()).padStart(2, '0')
                  const y = String(d.getFullYear())
                  let content = `${m}/${day}/${y}`
                  if (fmt === 'DD/MM/YYYY') content = `${day}/${m}/${y}`
                  else if (fmt === 'YYYY-MM-DD') content = `${y}-${m}-${day}`
                  else if (fmt === 'MMMM D, YYYY') content = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  else if (fmt === 'D MMM YYYY') content = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  update({ dateFormat: fmt, content })
                }}
              />
            </PropSection>
          )}

          {/* Checkbox label */}
          {selected.type === 'checkbox' && (
            <PropSection label="Label">
              <input
                value={selected.label}
                onChange={(e) => update({ label: e.target.value })}
                className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 focus:outline-none focus:border-primary-400"
                placeholder="Checkbox label"
              />
            </PropSection>
          )}

          {/* Sticky note content */}
          {selected.type === 'sticky-note' && (
            <PropSection label="Comment">
              <textarea
                value={selected.content}
                onChange={(e) => update({ content: e.target.value })}
                rows={3}
                className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 focus:outline-none focus:border-primary-400 resize-none"
              />
            </PropSection>
          )}

          {/* Color */}
          {hasColor && (
            <PropSection label="Color">
              <ColorPicker value={(selected as any).color} onChange={(c) => update({ color: c })} />
            </PropSection>
          )}

          {/* Stroke & fill for shapes */}
          {hasStrokeColor && (
            <>
              <PropSection label="Stroke Color">
                <ColorPicker value={(selected as any).strokeColor} onChange={(c) => update({ strokeColor: c })} />
              </PropSection>
              <PropSection label="Stroke Width">
                <Slider value={(selected as any).strokeWidth} min={1} max={10} step={0.5} onChange={(v) => update({ strokeWidth: v })} />
              </PropSection>
            </>
          )}

          {selected.type === 'shape' && (
            <PropSection label="Fill Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selected.fillColor || '#ffffff'}
                  onChange={(e) => update({ fillColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                />
                <button
                  onClick={() => update({ fillColor: '' })}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  No Fill
                </button>
              </div>
            </PropSection>
          )}

          {/* Opacity */}
          <PropSection label="Opacity">
            <Slider value={selected.opacity} min={0.1} max={1} step={0.05} onChange={(v) => update({ opacity: v })} />
          </PropSection>

          {/* Position */}
          <PropSection label="Position">
            <div className="grid grid-cols-2 gap-2">
              <NumInput label="X" value={selected.x} onChange={(v) => update({ x: v })} />
              <NumInput label="Y" value={selected.y} onChange={(v) => update({ y: v })} />
            </div>
          </PropSection>

          {/* Size */}
          <PropSection label="Size">
            <div className="grid grid-cols-2 gap-2">
              <NumInput label="W" value={selected.width} onChange={(v) => update({ width: v })} />
              <NumInput label="H" value={selected.height} onChange={(v) => update({ height: v })} />
            </div>
          </PropSection>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <Button variant="secondary" onClick={handleDuplicate} className="flex-1">
              <Copy size={14} /> Duplicate
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PropSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

function NumInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <span className="text-[10px] text-slate-400">{label}</span>
      <input
        type="number"
        value={Math.round(value * 10) / 10}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-primary-400"
      />
    </div>
  )
}

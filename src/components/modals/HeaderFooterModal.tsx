import { useState, useCallback, useEffect, useRef } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { HeaderFooterConfig } from '../../types'

interface HeaderFooterModalProps {
  open: boolean
  onClose: () => void
  config: HeaderFooterConfig
  onSave: (config: Partial<HeaderFooterConfig>) => void
}

export function HeaderFooterModal({ open, onClose, config, onSave }: HeaderFooterModalProps) {
  const [state, setState] = useState(config)

  // Re-sync local state when modal opens
  const prevOpen = useRef(false)
  useEffect(() => {
    if (open && !prevOpen.current) {
      setState(config)
    }
    prevOpen.current = open
  }, [open, config])

  const set = (key: keyof HeaderFooterConfig, value: any) => setState((s) => ({ ...s, [key]: value }))

  const handleSave = useCallback(() => {
    onSave(state)
    onClose()
  }, [state, onSave, onClose])

  return (
    <Modal open={open} onClose={onClose} title="Headers & Footers">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={state.enabled} onChange={(e) => set('enabled', e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-slate-200 peer-checked:bg-primary-600 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
          </label>
          <span className="text-sm font-medium text-slate-700">Enable</span>
        </div>

        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Header</p>
        <div className="grid grid-cols-3 gap-2">
          <input value={state.headerLeft} onChange={(e) => set('headerLeft', e.target.value)} placeholder="Left" className="px-2 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-primary-400" />
          <input value={state.headerCenter} onChange={(e) => set('headerCenter', e.target.value)} placeholder="Center" className="px-2 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-primary-400" />
          <input value={state.headerRight} onChange={(e) => set('headerRight', e.target.value)} placeholder="Right" className="px-2 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-primary-400" />
        </div>

        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Footer</p>
        <div className="grid grid-cols-3 gap-2">
          <input value={state.footerLeft} onChange={(e) => set('footerLeft', e.target.value)} placeholder="Left" className="px-2 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-primary-400" />
          <input value={state.footerCenter} onChange={(e) => set('footerCenter', e.target.value)} placeholder="Center" className="px-2 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-primary-400" />
          <input value={state.footerRight} onChange={(e) => set('footerRight', e.target.value)} placeholder="Right" className="px-2 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-primary-400" />
        </div>

        <p className="text-[10px] text-slate-400">Use {'{page}'} for page number and {'{total}'} for total pages.</p>

        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Font Size</label>
          <input type="number" value={state.fontSize} onChange={(e) => set('fontSize', parseInt(e.target.value) || 10)} min={6} max={24} className="w-20 px-2 py-1 text-xs rounded border border-slate-200" />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}

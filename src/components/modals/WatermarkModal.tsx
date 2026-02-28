import { useState, useCallback, useEffect, useRef } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Slider } from '../ui/Slider'
import type { WatermarkConfig } from '../../types'

interface WatermarkModalProps {
  open: boolean
  onClose: () => void
  config: WatermarkConfig
  onSave: (config: Partial<WatermarkConfig>) => void
}

export function WatermarkModal({ open, onClose, config, onSave }: WatermarkModalProps) {
  const [text, setText] = useState(config.text)
  const [fontSize, setFontSize] = useState(config.fontSize)
  const [color, setColor] = useState(config.color)
  const [opacity, setOpacity] = useState(config.opacity)
  const [rotation, setRotation] = useState(config.rotation)
  const [enabled, setEnabled] = useState(config.enabled)

  // Re-sync local state when modal opens
  const prevOpen = useRef(false)
  useEffect(() => {
    if (open && !prevOpen.current) {
      setText(config.text)
      setFontSize(config.fontSize)
      setColor(config.color)
      setOpacity(config.opacity)
      setRotation(config.rotation)
      setEnabled(config.enabled)
    }
    prevOpen.current = open
  }, [open, config])

  const handleSave = useCallback(() => {
    onSave({ text, fontSize, color, opacity, rotation, enabled })
    onClose()
  }, [text, fontSize, color, opacity, rotation, enabled, onSave, onClose])

  return (
    <Modal open={open} onClose={onClose} title="Watermark Settings">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-slate-200 peer-checked:bg-primary-600 rounded-full peer-focus:ring-2 peer-focus:ring-primary-300 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
          </label>
          <span className="text-sm font-medium text-slate-700">Enable Watermark</span>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Text</label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            placeholder="e.g. CONFIDENTIAL, DRAFT"
          />
        </div>
        <Slider label="Font Size" value={fontSize} min={12} max={120} step={2} onChange={setFontSize} />
        <Slider label="Opacity" value={opacity} min={0.02} max={0.5} step={0.01} onChange={setOpacity} />
        <Slider label="Rotation" value={rotation} min={-90} max={90} step={5} onChange={setRotation} />
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Color</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer border border-slate-200" />
        </div>
        {/* Preview */}
        {enabled && text && (
          <div className="relative h-24 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
            <span
              className="font-bold tracking-widest text-center select-none pointer-events-none"
              style={{ color, opacity, fontSize: Math.min(fontSize, 32), transform: `rotate(${rotation}deg)` }}
            >
              {text}
            </span>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}

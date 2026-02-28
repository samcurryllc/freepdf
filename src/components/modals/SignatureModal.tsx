import { useRef, useState, useEffect, useCallback } from 'react'
import SignaturePad from 'signature_pad'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Eraser, Upload, Pen } from 'lucide-react'

const SAVED_SIGNATURES_KEY = 'pdf-signer-signatures'

interface SignatureModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (dataUrl: string) => void
}

function getSavedSignatures(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_SIGNATURES_KEY) || '[]')
  } catch {
    return []
  }
}

function saveSignature(dataUrl: string) {
  const saved = getSavedSignatures()
  // Prepend and keep max 5
  const updated = [dataUrl, ...saved.filter((s) => s !== dataUrl)].slice(0, 5)
  localStorage.setItem(SAVED_SIGNATURES_KEY, JSON.stringify(updated))
}

export function SignatureModal({ open, onClose, onConfirm }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePad | null>(null)
  const [tab, setTab] = useState<'draw' | 'upload' | 'saved'>('draw')
  const [penColor, setPenColor] = useState('#000000')
  const [penWidth, setPenWidth] = useState(2)
  const [savedSignatures] = useState(getSavedSignatures)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open || tab !== 'draw' || !canvasRef.current) return

    const canvas = canvasRef.current
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(ratio, ratio)

    const pad = new SignaturePad(canvas, {
      penColor,
      minWidth: penWidth * 0.5,
      maxWidth: penWidth * 1.5,
      backgroundColor: 'rgba(0,0,0,0)',
    })
    padRef.current = pad

    return () => {
      pad.off()
    }
  }, [open, tab, penColor, penWidth])

  const handleClear = useCallback(() => {
    padRef.current?.clear()
  }, [])

  const handleConfirmDraw = useCallback(() => {
    if (!padRef.current || padRef.current.isEmpty()) return
    const dataUrl = padRef.current.toDataURL('image/png')
    saveSignature(dataUrl)
    onConfirm(dataUrl)
    onClose()
  }, [onConfirm, onClose])

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        saveSignature(dataUrl)
        onConfirm(dataUrl)
        onClose()
      }
      reader.readAsDataURL(file)
    },
    [onConfirm, onClose],
  )

  const handleSavedClick = useCallback(
    (dataUrl: string) => {
      onConfirm(dataUrl)
      onClose()
    },
    [onConfirm, onClose],
  )

  return (
    <Modal open={open} onClose={onClose} title="Add Signature">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-5">
        <button
          onClick={() => setTab('draw')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors
            ${tab === 'draw' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Pen size={14} /> Draw
        </button>
        <button
          onClick={() => setTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors
            ${tab === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Upload size={14} /> Upload
        </button>
        {savedSignatures.length > 0 && (
          <button
            onClick={() => setTab('saved')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors
              ${tab === 'saved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Saved ({savedSignatures.length})
          </button>
        )}
      </div>

      {/* Draw Tab */}
      {tab === 'draw' && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Color</label>
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Width</label>
              <input
                type="range"
                min={1}
                max={5}
                step={0.5}
                value={penWidth}
                onChange={(e) => setPenWidth(parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
            <button
              onClick={handleClear}
              className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
            >
              <Eraser size={14} /> Clear
            </button>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-40 md:h-40 border border-slate-200 rounded-xl bg-white cursor-crosshair touch-none"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleConfirmDraw}>Add Signature</Button>
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {tab === 'upload' && (
        <div className="text-center py-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <Button variant="secondary" size="lg" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Choose Image
          </Button>
          <p className="text-xs text-slate-400 mt-3">PNG, JPG, or SVG</p>
        </div>
      )}

      {/* Saved Tab */}
      {tab === 'saved' && (
        <div className="grid grid-cols-2 gap-3">
          {savedSignatures.map((sig, i) => (
            <button
              key={i}
              onClick={() => handleSavedClick(sig)}
              className="border border-slate-200 rounded-xl p-3 hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
            >
              <img src={sig} alt={`Signature ${i + 1}`} className="w-full h-16 object-contain" />
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}

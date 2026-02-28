import { useRef, useCallback, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Upload, Image as ImageIcon } from 'lucide-react'

interface ImageUploadModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (dataUrl: string, width: number, height: number) => void
}

export function ImageUploadModal({ open, onClose, onConfirm }: ImageUploadModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const img = new window.Image()
      img.onload = () => {
        setDims({ w: img.naturalWidth, h: img.naturalHeight })
        setPreview(dataUrl)
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }, [])

  const handleConfirm = useCallback(() => {
    if (preview) {
      onConfirm(preview, dims.w, dims.h)
      setPreview(null)
      onClose()
    }
  }, [preview, dims, onConfirm, onClose])

  return (
    <Modal open={open} onClose={onClose} title="Insert Image">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {!preview ? (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <ImageIcon className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 mb-4">Upload a PNG, JPG, or SVG image</p>
          <Button variant="secondary" size="lg" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Choose Image
          </Button>
        </div>
      ) : (
        <div>
          <div className="rounded-xl border border-slate-200 p-4 mb-4 bg-slate-50 flex items-center justify-center">
            <img src={preview} alt="Preview" className="max-h-48 object-contain" />
          </div>
          <p className="text-xs text-slate-400 mb-4 text-center">{dims.w} x {dims.h} px</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setPreview(null); fileRef.current!.value = '' }}>Change</Button>
            <Button onClick={handleConfirm}>Insert Image</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

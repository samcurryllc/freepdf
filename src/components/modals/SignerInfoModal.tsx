import { useState, useCallback } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface SignerInfoModalProps {
  open: boolean
  onClose: () => void
  name: string
  email: string
  onSave: (name: string, email: string) => void
}

export function SignerInfoModal({ open, onClose, name, email, onSave }: SignerInfoModalProps) {
  const [n, setN] = useState(name)
  const [e, setE] = useState(email)

  const handleSave = useCallback(() => {
    onSave(n.trim(), e.trim())
    onClose()
  }, [n, e, onSave, onClose])

  return (
    <Modal open={open} onClose={onClose} title="Signer Information">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Full Name</label>
          <input value={n} onChange={(ev) => setN(ev.target.value)} className="w-full px-3 py-2.5 text-base md:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" placeholder="John Doe" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Email</label>
          <input value={e} onChange={(ev) => setE(ev.target.value)} type="email" className="w-full px-3 py-2.5 text-base md:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400" placeholder="john@example.com" />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}

import { useState, useCallback, useRef } from 'react'
import { Download, Loader2, Shield, Merge, LayoutList, ArrowLeft, Check, CloudOff, Info } from 'lucide-react'
import type { SaveStatus } from '../../hooks/useAutoSave'
import { useEditor } from '../../state/EditorContext'
import { useToast } from '../ui/Toast'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'
import { ZoomControls } from '../pdf/ZoomControls'
import { exportSignedPdf } from '../../lib/pdfExporter'
import { downloadPdf } from '../../lib/downloadPdf'
import { generateSelfSignedCertificate, signData, computeDocumentHash } from '../../lib/digitalSignature'
import { mergePdfs } from '../../lib/pdfMerger'
import { MergePdfModal } from '../modals/MergePdfModal'
import { PageManagerModal } from '../modals/PageManagerModal'
import { SignerInfoModal } from '../modals/SignerInfoModal'

interface BottomBarProps {
  pdfBytes: ArrayBuffer | null
  filename: string
  onPdfReload?: (bytes: ArrayBuffer) => void
  onBack?: () => void
  saveStatus?: SaveStatus
}

export function BottomBar({ pdfBytes, filename, onPdfReload, onBack, saveStatus }: BottomBarProps) {
  const { state, dispatch } = useEditor()
  const { showToast } = useToast()
  const [exporting, setExporting] = useState(false)
  const [mergeModalOpen, setMergeModalOpen] = useState(false)
  const [pageManagerOpen, setPageManagerOpen] = useState(false)
  const [signerModalOpen, setSignerModalOpen] = useState(false)
  const pendingSignRef = useRef(false)

  const handleDownload = useCallback(async () => {
    if (!pdfBytes) return
    setExporting(true)
    try {
      const bytes = await exportSignedPdf(pdfBytes, state.annotations, state.pageDimensions, state.watermark, state.headerFooter, state.totalPages)
      downloadPdf(bytes, filename)
      dispatch({ type: 'ADD_AUDIT_ENTRY', payload: { action: 'PDF Downloaded', details: `${state.annotations.length} annotations` } })
      showToast('PDF downloaded successfully!')
    } catch (err) {
      console.error('Export failed:', err)
      showToast('Failed to export PDF', 'error')
    } finally {
      setExporting(false)
    }
  }, [pdfBytes, state, filename, showToast, dispatch])

  const performDigitalSign = useCallback(async (signerName: string, signerEmail: string) => {
    if (!pdfBytes || !signerName) return
    setExporting(true)
    try {
      const pdfResult = await exportSignedPdf(pdfBytes, state.annotations, state.pageDimensions, state.watermark, state.headerFooter, state.totalPages)

      const cert = generateSelfSignedCertificate({
        commonName: signerName,
        email: signerEmail || 'signer@local',
      })

      const hash = await computeDocumentHash(pdfResult.buffer as ArrayBuffer)
      const signature = signData(hash, cert.privateKey)

      dispatch({ type: 'ADD_AUDIT_ENTRY', payload: {
        action: 'Digitally Signed',
        details: `Certificate: ${cert.fingerprint.slice(0, 23)}... | SHA-256: ${hash.slice(0, 16)}... | Signer: ${signerName}`,
      }})

      const finalBytes = await exportSignedPdf(pdfBytes, state.annotations, state.pageDimensions, state.watermark, state.headerFooter, state.totalPages, {
        auditLog: [...state.auditLog, {
          action: 'Digitally Signed',
          details: `Certificate: ${cert.fingerprint} | Signature: ${signature.slice(0, 20)}...`,
          timestamp: new Date().toISOString(),
        }],
        signerName,
        signerEmail,
        documentHash: hash,
        certificateFingerprint: cert.fingerprint,
      })

      downloadPdf(finalBytes, filename.replace(/\.pdf$/i, '') + '_digitally_signed')
      showToast('Digitally signed PDF downloaded!')
    } catch (err) {
      console.error('Digital sign failed:', err)
      showToast('Digital signing failed', 'error')
    } finally {
      setExporting(false)
    }
  }, [pdfBytes, state, filename, showToast, dispatch])

  const handleDigitalSign = useCallback(() => {
    if (!pdfBytes) return
    if (!state.signerName) {
      pendingSignRef.current = true
      setSignerModalOpen(true)
      return
    }
    performDigitalSign(state.signerName, state.signerEmail)
  }, [pdfBytes, state.signerName, state.signerEmail, performDigitalSign])

  const handleSignerSave = useCallback((name: string, email: string) => {
    dispatch({ type: 'SET_SIGNER_INFO', payload: { name, email } })
    dispatch({ type: 'ADD_AUDIT_ENTRY', payload: { action: 'Signer Info Set', details: `${name} <${email}>` } })
    if (pendingSignRef.current && name.trim()) {
      pendingSignRef.current = false
      setTimeout(() => performDigitalSign(name.trim(), email.trim()), 100)
    }
  }, [dispatch, performDigitalSign])

  const handleMerge = useCallback(async (files: File[]) => {
    try {
      const merged = await mergePdfs(files)
      const blob = new Blob([merged as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'merged.pdf'
      a.click()
      URL.revokeObjectURL(url)
      showToast(`Merged ${files.length} PDFs`)
    } catch (err) {
      console.error('Merge failed:', err)
      showToast('Merge failed', 'error')
    }
  }, [showToast])

  return (
    <>
      <div className="min-h-[48px] border-t border-slate-200 bg-white flex items-center justify-between px-2 md:px-4 shrink-0 gap-1 pb-safe">
        {/* Left: back + page info + tools */}
        <div className="flex items-center gap-1 md:gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors shrink-0 min-w-[36px] min-h-[36px] justify-center md:justify-start"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}
          <span className="text-xs text-slate-500 font-medium tabular-nums whitespace-nowrap">
            <span className="hidden xs:inline">Page </span>{state.currentPage}/{state.totalPages}
          </span>
          <div className="hidden sm:flex gap-0.5">
            <IconButton size="sm" tooltip="Manage Pages" onClick={() => setPageManagerOpen(true)}><LayoutList size={14} /></IconButton>
            <IconButton size="sm" tooltip="Merge PDFs" onClick={() => setMergeModalOpen(true)}><Merge size={14} /></IconButton>
          </div>
        </div>

        {/* Center: zoom — hide on very small screens */}
        <div className="hidden sm:block">
          <ZoomControls />
        </div>

        {/* Right: save status + actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Save status — icon only on mobile */}
          {saveStatus && (
            <span className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
              {saveStatus === 'saving' && <Loader2 size={12} className="animate-spin" />}
              {saveStatus === 'saved' && <Check size={12} className="text-emerald-500" />}
              {saveStatus === 'unsaved' && <CloudOff size={12} />}
              <span className="hidden md:inline">
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && 'Saved'}
                {saveStatus === 'unsaved' && 'Unsaved'}
              </span>
            </span>
          )}

          {/* Sign — icon only on mobile */}
          <Tooltip text="Generate a self-signed certificate, hash the document, and download a certified PDF with a full audit trail">
            <Button variant="secondary" size="sm" onClick={handleDigitalSign} disabled={exporting}>
              <Shield size={14} />
              <span className="hidden md:inline">Sign & Certify</span>
            </Button>
          </Tooltip>

          {/* Download — icon only on mobile */}
          <Tooltip text="Export your PDF with all annotations, watermarks, and headers baked in">
            <Button onClick={handleDownload} disabled={exporting} size="sm">
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span className="hidden md:inline">{exporting ? 'Exporting...' : 'Download PDF'}</span>
            </Button>
          </Tooltip>
        </div>
      </div>

      <MergePdfModal open={mergeModalOpen} onClose={() => setMergeModalOpen(false)} onMerge={handleMerge} />
      <PageManagerModal
        open={pageManagerOpen}
        onClose={() => setPageManagerOpen(false)}
        totalPages={state.totalPages}
        onRotatePage={() => showToast('Page rotated (applied on export)')}
        onDeletePage={() => showToast('Page marked for deletion')}
        onAddBlankPage={() => showToast('Blank page will be added on export')}
        onMovePage={() => showToast('Page reordered')}
      />
      <SignerInfoModal
        open={signerModalOpen}
        onClose={() => { setSignerModalOpen(false); pendingSignRef.current = false }}
        name={state.signerName}
        email={state.signerEmail}
        onSave={handleSignerSave}
      />
    </>
  )
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-slate-800 rounded-lg whitespace-normal w-56 text-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 shadow-lg hidden md:block">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
      </div>
    </div>
  )
}

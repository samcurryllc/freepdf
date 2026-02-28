import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Upload, FileText, Shield, MoreHorizontal, Pencil, Trash2, FolderOpen, X, AlertCircle, FileX2 } from 'lucide-react'
import type { DocumentMeta } from '../../types'
import { getAllDocumentMeta, deleteDocument, renameDocument, getStorageEstimate } from '../../lib/documentStore'

interface DashboardScreenProps {
  onUpload: (file: File) => void
  onOpenDocument: (id: string) => void
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString()
}

export function DashboardScreen({ onUpload, onOpenDocument }: DashboardScreenProps) {
  const [documents, setDocuments] = useState<DocumentMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [storage, setStorage] = useState({ usage: 0, quota: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  const loadDocuments = useCallback(async () => {
    try {
      const [docs, est] = await Promise.all([getAllDocumentMeta(), getStorageEstimate()])
      setDocuments(docs)
      setStorage(est)
    } catch (err) {
      console.error('Failed to load documents:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDocuments() }, [loadDocuments])

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  const handleFile = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('File too large (max 100MB)')
      return
    }
    setError(null)
    onUpload(file)
  }, [onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleRename = useCallback(async (id: string) => {
    if (!renameValue.trim()) return
    await renameDocument(id, renameValue.trim())
    setRenamingId(null)
    loadDocuments()
  }, [renameValue, loadDocuments])

  const handleDelete = useCallback(async (id: string) => {
    await deleteDocument(id)
    setDeleteConfirmId(null)
    setMenuOpenId(null)
    loadDocuments()
  }, [loadDocuments])

  const hasDocuments = documents.length > 0

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 min-h-dvh">
      <div className="max-w-5xl w-full mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col flex-1">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 mb-3">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FreePDF</h1>
        </div>

        {/* Privacy Banner */}
        <div className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-4 md:mb-6">
          <Shield size={18} className="text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800">
            Your documents never leave this device. Stored in your browser — never uploaded anywhere.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors mb-4 md:mb-6
            ${hasDocuments ? 'p-4 md:p-6' : 'p-8 md:p-12'}
            ${isDragging
              ? 'border-primary-400 bg-primary-50/80'
              : 'border-slate-200 bg-white/60 hover:border-primary-300 hover:bg-primary-50/40'
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = ''
            }}
          />
          <div className={`flex items-center gap-4 ${hasDocuments ? '' : 'flex-col text-center'}`}>
            <div className={`inline-flex items-center justify-center rounded-xl bg-slate-100 ${hasDocuments ? 'w-10 h-10' : 'w-14 h-14 mb-2'}`}>
              <Upload className={`${hasDocuments ? 'w-5 h-5' : 'w-6 h-6'} ${isDragging ? 'text-primary-500' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className={`font-medium text-slate-700 ${hasDocuments ? 'text-sm' : 'text-base'}`}>
                {isDragging ? 'Drop your PDF here' : 'Drop a PDF here or click to browse'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Up to 100MB</p>
            </div>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100"
            >
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
              <button onClick={(e) => { e.stopPropagation(); setError(null) }} className="ml-auto">
                <X size={14} className="text-red-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Documents Section */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Storage bar — only when we have a usable quota estimate */}
            {hasDocuments && storage.usage > 0 && storage.quota > 1_000_000 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Storage</span>
                  <span className="text-xs text-slate-400">
                    {formatBytes(storage.usage)} / ~{formatBytes(storage.quota)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (storage.usage / storage.quota) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Recent Documents */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Recent Documents</h2>
              {hasDocuments ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                      renamingId={renamingId}
                      setRenamingId={setRenamingId}
                      renameValue={renameValue}
                      setRenameValue={setRenameValue}
                      deleteConfirmId={deleteConfirmId}
                      setDeleteConfirmId={setDeleteConfirmId}
                      renameInputRef={renameInputRef}
                      onOpen={onOpenDocument}
                      onRename={handleRename}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6 rounded-xl border-2 border-dashed border-slate-200 bg-white/40">
                  <FileX2 size={32} className="text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-400">No documents yet</p>
                  <p className="text-xs text-slate-300 mt-1">Upload a PDF above to get started</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Document Card ────────────────────────────────────────── */

interface DocumentCardProps {
  doc: DocumentMeta
  menuOpenId: string | null
  setMenuOpenId: (id: string | null) => void
  renamingId: string | null
  setRenamingId: (id: string | null) => void
  renameValue: string
  setRenameValue: (v: string) => void
  deleteConfirmId: string | null
  setDeleteConfirmId: (id: string | null) => void
  renameInputRef: React.RefObject<HTMLInputElement | null>
  onOpen: (id: string) => void
  onRename: (id: string) => void
  onDelete: (id: string) => void
}

function DocumentCard({
  doc, menuOpenId, setMenuOpenId, renamingId, setRenamingId,
  renameValue, setRenameValue, deleteConfirmId, setDeleteConfirmId,
  renameInputRef, onOpen, onRename, onDelete,
}: DocumentCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
      onClick={() => {
        if (renamingId !== doc.id && deleteConfirmId !== doc.id) {
          onOpen(doc.id)
        }
      }}
    >
      {/* Thumbnail */}
      <div className="aspect-[3/4] bg-slate-50 flex items-center justify-center overflow-hidden">
        {doc.thumbnail ? (
          <img src={doc.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <FileText size={32} className="text-slate-200" />
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {renamingId === doc.id ? (
          <form onSubmit={(e) => { e.preventDefault(); onRename(doc.id) }} onClick={(e) => e.stopPropagation()}>
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => onRename(doc.id)}
              onKeyDown={(e) => { if (e.key === 'Escape') setRenamingId(null) }}
              className="w-full text-sm font-medium text-slate-900 border border-primary-300 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-primary-200"
            />
          </form>
        ) : (
          <p className="text-sm font-medium text-slate-900 truncate" title={doc.filename}>
            {doc.filename}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
          <span>{doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}</span>
          <span>&middot;</span>
          <span>{formatRelativeTime(doc.updatedAt)}</span>
        </div>
        {doc.annotationCount > 0 && (
          <span className="inline-block mt-1.5 text-[10px] font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
            {doc.annotationCount} annotation{doc.annotationCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setMenuOpenId(menuOpenId === doc.id ? null : doc.id)
          setDeleteConfirmId(null)
        }}
        className="absolute top-2 right-2 w-8 h-8 md:w-7 md:h-7 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-slate-50"
      >
        <MoreHorizontal size={14} className="text-slate-500" />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {menuOpenId === doc.id && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-11 right-2 z-10 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setMenuOpenId(null); onOpen(doc.id) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <FolderOpen size={14} /> Open
            </button>
            <button
              onClick={() => {
                setMenuOpenId(null)
                setRenameValue(doc.filename)
                setRenamingId(doc.id)
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={14} /> Rename
            </button>
            {deleteConfirmId === doc.id ? (
              <div className="px-3 py-2">
                <p className="text-xs text-red-600 mb-2">Delete this document?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirmId(doc.id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

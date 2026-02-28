import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ToastProvider } from './components/ui/Toast'
import { DashboardScreen } from './components/screens/DashboardScreen'
import { EditorScreen } from './components/screens/EditorScreen'
import { getDocument } from './lib/documentStore'
import './lib/pdfWorker'

type Screen = 'dashboard' | 'editor'

function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [filename, setFilename] = useState('document.pdf')

  const openEditor = useCallback((id: string, url: string, bytes: ArrayBuffer, name: string) => {
    setActiveDocumentId(id)
    setPdfUrl(url)
    setPdfBytes(bytes)
    setFilename(name)
    setScreen('editor')
  }, [])

  const handleUpload = useCallback((file: File) => {
    const id = crypto.randomUUID()
    const reader = new FileReader()
    reader.onload = () => {
      const bytes = reader.result as ArrayBuffer
      const url = URL.createObjectURL(file)
      openEditor(id, url, bytes, file.name)
    }
    reader.readAsArrayBuffer(file)
  }, [openEditor])

  const handleOpenDocument = useCallback(async (id: string) => {
    const doc = await getDocument(id)
    if (!doc) return
    const blob = new Blob([doc.pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    openEditor(id, url, doc.pdfBytes, doc.filename)
  }, [openEditor])

  const handleBack = useCallback(() => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    setPdfUrl(null)
    setPdfBytes(null)
    setActiveDocumentId(null)
    setScreen('dashboard')
  }, [pdfUrl])

  return (
    <ToastProvider>
      <AnimatePresence mode="wait">
        {screen === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex"
          >
            <DashboardScreen onUpload={handleUpload} onOpenDocument={handleOpenDocument} />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex"
          >
            <EditorScreen
              pdfUrl={pdfUrl!}
              pdfBytes={pdfBytes}
              filename={filename}
              documentId={activeDocumentId!}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ToastProvider>
  )
}

export default App

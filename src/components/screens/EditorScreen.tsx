import { useState, useCallback } from 'react'
import { EditorProvider } from '../../state/EditorContext'
import { PDFViewport } from '../pdf/PDFViewport'
import { ToolsPanel } from '../panels/ToolsPanel'
import { PropertiesPanel } from '../panels/PropertiesPanel'
import { BottomBar } from '../panels/BottomBar'
import { MobileToolBar } from '../panels/MobileToolBar'
import { KeyboardShortcutsHandler } from './KeyboardShortcutsHandler'
import { AutoSaveProvider } from './AutoSaveProvider'
import { DocumentLoader } from './DocumentLoader'

interface EditorScreenProps {
  pdfUrl: string
  pdfBytes: ArrayBuffer | null
  filename: string
  documentId: string
  onBack: () => void
}

export function EditorScreen({ pdfUrl, pdfBytes, filename, documentId, onBack }: EditorScreenProps) {
  const [mobilePanel, setMobilePanel] = useState<'tools' | 'properties' | null>(null)

  const closeMobilePanel = useCallback(() => setMobilePanel(null), [])

  return (
    <EditorProvider>
      <DocumentLoader documentId={documentId} />
      <AutoSaveProvider documentId={documentId} pdfBytes={pdfBytes} filename={filename}>
        {(saveStatus) => (
          <>
            <KeyboardShortcutsHandler />
            <div className="flex-1 flex flex-col h-dvh">
              {/* Desktop: 3-panel layout. Mobile: viewport only */}
              <div className="flex-1 flex min-h-0">
                {/* Desktop tools panel */}
                <div className="hidden md:flex">
                  <ToolsPanel pdfUrl={pdfUrl} />
                </div>

                <PDFViewport pdfUrl={pdfUrl} />

                {/* Desktop properties panel */}
                <div className="hidden md:flex">
                  <PropertiesPanel />
                </div>
              </div>

              {/* Mobile: floating tool bar */}
              <div className="md:hidden">
                <MobileToolBar
                  pdfUrl={pdfUrl}
                  onOpenTools={() => setMobilePanel(mobilePanel === 'tools' ? null : 'tools')}
                  onOpenProperties={() => setMobilePanel(mobilePanel === 'properties' ? null : 'properties')}
                  toolsOpen={mobilePanel === 'tools'}
                  propertiesOpen={mobilePanel === 'properties'}
                />
              </div>

              <BottomBar pdfBytes={pdfBytes} filename={filename} onBack={onBack} saveStatus={saveStatus} />
            </div>

            {/* Mobile panels as bottom sheets */}
            {mobilePanel === 'tools' && (
              <div className="md:hidden fixed inset-0 z-40">
                <div className="absolute inset-0 bg-black/30" onClick={closeMobilePanel} />
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-auto pb-safe shadow-2xl animate-slide-up">
                  <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
                    <span className="text-sm font-semibold text-slate-700">Tools</span>
                    <button onClick={closeMobilePanel} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      &times;
                    </button>
                  </div>
                  <ToolsPanel pdfUrl={pdfUrl} mobile onClose={closeMobilePanel} />
                </div>
              </div>
            )}

            {mobilePanel === 'properties' && (
              <div className="md:hidden fixed inset-0 z-40">
                <div className="absolute inset-0 bg-black/30" onClick={closeMobilePanel} />
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[60vh] overflow-auto pb-safe shadow-2xl animate-slide-up">
                  <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
                    <span className="text-sm font-semibold text-slate-700">Properties</span>
                    <button onClick={closeMobilePanel} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      &times;
                    </button>
                  </div>
                  <PropertiesPanel mobile />
                </div>
              </div>
            )}
          </>
        )}
      </AutoSaveProvider>
    </EditorProvider>
  )
}

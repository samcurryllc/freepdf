import type { ReactNode } from 'react'
import { useEditor } from '../../state/EditorContext'
import { useAutoSave, type SaveStatus } from '../../hooks/useAutoSave'

interface AutoSaveProviderProps {
  documentId: string
  pdfBytes: ArrayBuffer | null
  filename: string
  children: (saveStatus: SaveStatus) => ReactNode
}

export function AutoSaveProvider({ documentId, pdfBytes, filename, children }: AutoSaveProviderProps) {
  const { state } = useEditor()
  const { saveStatus } = useAutoSave({
    documentId,
    state,
    pdfBytes,
    filename,
    enabled: true,
  })
  return <>{children(saveStatus)}</>
}

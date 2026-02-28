import { createContext, useContext, type ReactNode } from 'react'
import type { EditorState, EditorAction } from '../types'
import { useHistory } from '../hooks/useHistory'

interface EditorContextValue {
  state: EditorState
  dispatch: (action: EditorAction) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  startBatch: () => void
  endBatch: () => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
  const value = useHistory()
  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within EditorProvider')
  return ctx
}

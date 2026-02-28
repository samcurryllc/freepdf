import { useEffect } from 'react'
import { useEditor } from '../state/EditorContext'

export function useKeyboardShortcuts() {
  const { state, dispatch, undo, redo } = useEditor()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          target.blur()
          dispatch({ type: 'SELECT_ANNOTATION', payload: null })
        }
        return
      }

      const mod = e.ctrlKey || e.metaKey

      // Ctrl+Z = Undo
      if (mod && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return }
      // Ctrl+Shift+Z or Ctrl+Y = Redo
      if (mod && e.shiftKey && e.key === 'z') { e.preventDefault(); redo(); return }
      if (mod && e.key === 'y') { e.preventDefault(); redo(); return }

      // Ctrl+C = Copy
      if (mod && e.key === 'c') { e.preventDefault(); dispatch({ type: 'COPY_SELECTED' }); return }
      // Ctrl+V = Paste
      if (mod && e.key === 'v') { e.preventDefault(); dispatch({ type: 'PASTE_CLIPBOARD', payload: state.currentPage }); return }
      // Ctrl+D = Duplicate
      if (mod && e.key === 'd') { e.preventDefault(); dispatch({ type: 'DUPLICATE_SELECTED' }); return }
      // Ctrl+A = Select all on page
      if (mod && e.key === 'a') { e.preventDefault(); dispatch({ type: 'SELECT_ALL_ON_PAGE', payload: state.currentPage }); return }

      // Delete/Backspace = delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedIds.length > 0) {
        e.preventDefault()
        dispatch({ type: 'DELETE_SELECTED' })
        return
      }

      // Escape = deselect
      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_ANNOTATION', payload: null })
        dispatch({ type: 'SET_TOOL', payload: 'select' })
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.selectedIds, state.currentPage, dispatch, undo, redo])
}

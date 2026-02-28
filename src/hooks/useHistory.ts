import { useReducer, useCallback, useRef } from 'react'
import type { EditorState, EditorAction } from '../types'
import { editorReducer, initialEditorState } from '../state/editorReducer'

const MAX_HISTORY = 50

const NON_HISTORY_ACTIONS = new Set<string>([
  'SELECT_ANNOTATION',
  'TOGGLE_SELECT_ANNOTATION',
  'SELECT_ALL_ON_PAGE',
  'SET_TOOL',
  'SET_PAGE',
  'SET_ZOOM',
  'SET_TOTAL_PAGES',
  'SET_PAGE_DIMENSIONS',
  'RESTORE_STATE',
  'ADD_AUDIT_ENTRY',
  'COPY_SELECTED',
  'LOAD_DOCUMENT',
])

export function useHistory() {
  const [state, rawDispatch] = useReducer(editorReducer, initialEditorState)
  const stateRef = useRef(state)
  stateRef.current = state
  const pastRef = useRef<EditorState[]>([])
  const futureRef = useRef<EditorState[]>([])
  const batchingRef = useRef(false)
  const batchStartStateRef = useRef<EditorState | null>(null)

  const dispatch = useCallback((action: EditorAction) => {
    if (!NON_HISTORY_ACTIONS.has(action.type)) {
      if (batchingRef.current) {
        // no-op during batch — history saved on endBatch
      } else {
        pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), stateRef.current]
        futureRef.current = []
      }
    }
    rawDispatch(action)
  }, [])

  const startBatch = useCallback(() => {
    batchingRef.current = true
    batchStartStateRef.current = stateRef.current
  }, [])

  const endBatch = useCallback(() => {
    if (batchingRef.current && batchStartStateRef.current) {
      pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), batchStartStateRef.current]
      futureRef.current = []
    }
    batchingRef.current = false
    batchStartStateRef.current = null
  }, [])

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return
    const previous = pastRef.current[pastRef.current.length - 1]
    pastRef.current = pastRef.current.slice(0, -1)
    futureRef.current = [...futureRef.current, stateRef.current]
    rawDispatch({ type: 'RESTORE_STATE', payload: previous })
  }, [])

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return
    const next = futureRef.current[futureRef.current.length - 1]
    futureRef.current = futureRef.current.slice(0, -1)
    pastRef.current = [...pastRef.current, stateRef.current]
    rawDispatch({ type: 'RESTORE_STATE', payload: next })
  }, [])

  const canUndo = pastRef.current.length > 0
  const canRedo = futureRef.current.length > 0

  return { state, dispatch, undo, redo, canUndo, canRedo, startBatch, endBatch }
}

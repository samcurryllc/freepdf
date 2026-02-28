import type { EditorState, EditorAction, Annotation } from '../types'

export const initialEditorState: EditorState = {
  annotations: [],
  selectedIds: [],
  activeTool: 'select',
  currentPage: 1,
  totalPages: 0,
  zoom: 1,
  pageDimensions: [],
  clipboard: [],
  watermark: {
    text: '',
    fontSize: 48,
    color: '#94a3b8',
    opacity: 0.15,
    rotation: -45,
    enabled: false,
  },
  headerFooter: {
    headerLeft: '',
    headerCenter: '',
    headerRight: '',
    footerLeft: '',
    footerCenter: 'Page {page} of {total}',
    footerRight: '',
    fontSize: 10,
    enabled: false,
  },
  auditLog: [],
  signerName: '',
  signerEmail: '',
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'ADD_ANNOTATION':
      return {
        ...state,
        annotations: [...state.annotations, action.payload],
        selectedIds: [action.payload.id],
        activeTool: state.activeTool === 'drawing' ? 'drawing' : 'select',
      }

    case 'UPDATE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload.changes } as typeof a : a
        ),
      }

    case 'DELETE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.filter((a) => a.id !== action.payload),
        selectedIds: state.selectedIds.filter((id) => id !== action.payload),
      }

    case 'DELETE_SELECTED':
      return {
        ...state,
        annotations: state.annotations.filter((a) => !state.selectedIds.includes(a.id)),
        selectedIds: [],
      }

    case 'SELECT_ANNOTATION':
      return { ...state, selectedIds: action.payload ? [action.payload] : [] }

    case 'TOGGLE_SELECT_ANNOTATION': {
      const id = action.payload
      const has = state.selectedIds.includes(id)
      return {
        ...state,
        selectedIds: has
          ? state.selectedIds.filter((sid) => sid !== id)
          : [...state.selectedIds, id],
      }
    }

    case 'SELECT_ALL_ON_PAGE':
      return {
        ...state,
        selectedIds: state.annotations
          .filter((a) => a.pageNumber === action.payload)
          .map((a) => a.id),
      }

    case 'SET_TOOL':
      return { ...state, activeTool: action.payload, selectedIds: [] }

    case 'SET_PAGE':
      return { ...state, currentPage: action.payload }

    case 'SET_ZOOM':
      return { ...state, zoom: Math.min(3, Math.max(0.25, action.payload)) }

    case 'SET_TOTAL_PAGES':
      return { ...state, totalPages: action.payload }

    case 'SET_PAGE_DIMENSIONS':
      return { ...state, pageDimensions: action.payload }

    case 'COPY_SELECTED': {
      const copied = state.annotations.filter((a) => state.selectedIds.includes(a.id))
      return { ...state, clipboard: copied }
    }

    case 'PASTE_CLIPBOARD': {
      const pasted: Annotation[] = state.clipboard.map((a) => ({
        ...a,
        id: crypto.randomUUID(),
        pageNumber: action.payload,
        x: Math.min(a.x + 2, 90),
        y: Math.min(a.y + 2, 90),
      }))
      return {
        ...state,
        annotations: [...state.annotations, ...pasted],
        selectedIds: pasted.map((a) => a.id),
      }
    }

    case 'DUPLICATE_SELECTED': {
      const dupes: Annotation[] = state.annotations
        .filter((a) => state.selectedIds.includes(a.id))
        .map((a) => ({
          ...a,
          id: crypto.randomUUID(),
          x: Math.min(a.x + 2, 90),
          y: Math.min(a.y + 2, 90),
        }))
      return {
        ...state,
        annotations: [...state.annotations, ...dupes],
        selectedIds: dupes.map((a) => a.id),
      }
    }

    case 'SET_WATERMARK':
      return { ...state, watermark: { ...state.watermark, ...action.payload } }

    case 'SET_HEADER_FOOTER':
      return { ...state, headerFooter: { ...state.headerFooter, ...action.payload } }

    case 'ADD_AUDIT_ENTRY':
      return {
        ...state,
        auditLog: [
          ...state.auditLog,
          {
            action: action.payload.action,
            details: action.payload.details,
            timestamp: new Date().toISOString(),
          },
        ],
      }

    case 'SET_SIGNER_INFO':
      return {
        ...state,
        signerName: action.payload.name ?? state.signerName,
        signerEmail: action.payload.email ?? state.signerEmail,
      }

    case 'RESTORE_STATE':
      return action.payload

    case 'LOAD_DOCUMENT':
      return {
        ...state,
        annotations: action.payload.annotations,
        watermark: action.payload.watermark,
        headerFooter: action.payload.headerFooter,
        auditLog: action.payload.auditLog,
        signerName: action.payload.signerName,
        signerEmail: action.payload.signerEmail,
        selectedIds: [],
        activeTool: 'select' as const,
      }

    default:
      return state
  }
}

export type Tool =
  | 'select'
  | 'text'
  | 'signature'
  | 'initials'
  | 'date'
  | 'image'
  | 'drawing'
  | 'highlight'
  | 'strikethrough'
  | 'underline'
  | 'sticky-note'
  | 'stamp'
  | 'shape-rect'
  | 'shape-ellipse'
  | 'shape-line'
  | 'shape-arrow'
  | 'watermark'
  | 'checkbox'
  | 'whiteout'

export type FontFamily = 'sans-serif' | 'serif' | 'monospace' | 'cursive'

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MMMM D, YYYY' | 'D MMM YYYY'

export type StampType =
  | 'approved'
  | 'rejected'
  | 'draft'
  | 'confidential'
  | 'final'
  | 'reviewed'
  | 'received'
  | 'void'
  | 'copy'
  | 'not-approved'
  | 'for-comment'
  | 'preliminary'

export interface BaseAnnotation {
  id: string
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  opacity: number
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text'
  content: string
  fontSize: number
  fontFamily: FontFamily
  color: string
  bold: boolean
  italic: boolean
  align: 'left' | 'center' | 'right'
}

export interface SignatureAnnotation extends BaseAnnotation {
  type: 'signature'
  dataUrl: string
}

export interface InitialsAnnotation extends BaseAnnotation {
  type: 'initials'
  dataUrl: string
}

export interface DateAnnotation extends BaseAnnotation {
  type: 'date'
  content: string
  fontSize: number
  fontFamily: FontFamily
  color: string
  dateFormat: DateFormat
}

export interface ImageAnnotation extends BaseAnnotation {
  type: 'image'
  dataUrl: string
  originalWidth: number
  originalHeight: number
}

export interface DrawingAnnotation extends BaseAnnotation {
  type: 'drawing'
  paths: { x: number; y: number }[][] // array of strokes, each an array of points (in %)
  strokeColor: string
  strokeWidth: number
}

export interface HighlightAnnotation extends BaseAnnotation {
  type: 'highlight'
  color: string
}

export interface StrikethroughAnnotation extends BaseAnnotation {
  type: 'strikethrough'
  color: string
}

export interface UnderlineAnnotation extends BaseAnnotation {
  type: 'underline'
  color: string
}

export interface StickyNoteAnnotation extends BaseAnnotation {
  type: 'sticky-note'
  content: string
  color: string
  author: string
  timestamp: string
}

export interface StampAnnotation extends BaseAnnotation {
  type: 'stamp'
  stampType: StampType
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'shape'
  shapeType: 'rect' | 'ellipse' | 'line' | 'arrow'
  strokeColor: string
  fillColor: string
  strokeWidth: number
}

export interface CheckboxAnnotation extends BaseAnnotation {
  type: 'checkbox'
  checked: boolean
  label: string
}

export interface WhiteoutAnnotation extends BaseAnnotation {
  type: 'whiteout'
}

export type Annotation =
  | TextAnnotation
  | SignatureAnnotation
  | InitialsAnnotation
  | DateAnnotation
  | ImageAnnotation
  | DrawingAnnotation
  | HighlightAnnotation
  | StrikethroughAnnotation
  | UnderlineAnnotation
  | StickyNoteAnnotation
  | StampAnnotation
  | ShapeAnnotation
  | CheckboxAnnotation
  | WhiteoutAnnotation

export interface PageDimensions {
  width: number
  height: number
}

export interface WatermarkConfig {
  text: string
  fontSize: number
  color: string
  opacity: number
  rotation: number // degrees
  enabled: boolean
}

export interface HeaderFooterConfig {
  headerLeft: string
  headerCenter: string
  headerRight: string
  footerLeft: string
  footerCenter: string
  footerRight: string
  fontSize: number
  enabled: boolean
}

export interface AuditEntry {
  action: string
  timestamp: string
  details: string
}

export interface SavedDocument {
  id: string
  filename: string
  pdfBytes: ArrayBuffer
  annotations: Annotation[]
  watermark: WatermarkConfig
  headerFooter: HeaderFooterConfig
  auditLog: AuditEntry[]
  signerName: string
  signerEmail: string
  thumbnail: string
  createdAt: string
  updatedAt: string
  pageCount: number
  fileSize: number
}

export interface DocumentMeta {
  id: string
  filename: string
  thumbnail: string
  createdAt: string
  updatedAt: string
  pageCount: number
  fileSize: number
  annotationCount: number
  isSigned: boolean
}

export interface EditorState {
  annotations: Annotation[]
  selectedIds: string[]
  activeTool: Tool
  currentPage: number
  totalPages: number
  zoom: number
  pageDimensions: PageDimensions[]
  clipboard: Annotation[]
  watermark: WatermarkConfig
  headerFooter: HeaderFooterConfig
  auditLog: AuditEntry[]
  signerName: string
  signerEmail: string
}

export type EditorAction =
  | { type: 'ADD_ANNOTATION'; payload: Annotation }
  | { type: 'UPDATE_ANNOTATION'; payload: { id: string; changes: Partial<Annotation> } }
  | { type: 'DELETE_ANNOTATION'; payload: string }
  | { type: 'DELETE_SELECTED' }
  | { type: 'SELECT_ANNOTATION'; payload: string | null }
  | { type: 'TOGGLE_SELECT_ANNOTATION'; payload: string }
  | { type: 'SELECT_ALL_ON_PAGE'; payload: number }
  | { type: 'SET_TOOL'; payload: Tool }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_TOTAL_PAGES'; payload: number }
  | { type: 'SET_PAGE_DIMENSIONS'; payload: PageDimensions[] }
  | { type: 'COPY_SELECTED' }
  | { type: 'PASTE_CLIPBOARD'; payload: number }
  | { type: 'DUPLICATE_SELECTED' }
  | { type: 'SET_WATERMARK'; payload: Partial<WatermarkConfig> }
  | { type: 'SET_HEADER_FOOTER'; payload: Partial<HeaderFooterConfig> }
  | { type: 'ADD_AUDIT_ENTRY'; payload: { action: string; details: string } }
  | { type: 'SET_SIGNER_INFO'; payload: { name?: string; email?: string } }
  | { type: 'RESTORE_STATE'; payload: EditorState }
  | { type: 'LOAD_DOCUMENT'; payload: { annotations: Annotation[]; watermark: WatermarkConfig; headerFooter: HeaderFooterConfig; auditLog: AuditEntry[]; signerName: string; signerEmail: string } }

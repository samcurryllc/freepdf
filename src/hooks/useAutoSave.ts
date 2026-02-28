import { useEffect, useRef, useState, useCallback } from 'react'
import type { EditorState, SavedDocument } from '../types'
import { saveDocument, getDocument } from '../lib/documentStore'

export type SaveStatus = 'saved' | 'saving' | 'unsaved'

interface UseAutoSaveOptions {
  documentId: string
  state: EditorState
  pdfBytes: ArrayBuffer | null
  filename: string
  enabled: boolean
}

export function useAutoSave({ documentId, state, pdfBytes, filename, enabled }: UseAutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevStateRef = useRef<string>('')
  const savingRef = useRef(false)

  const generateThumbnail = useCallback(async (bytes: ArrayBuffer): Promise<string> => {
    try {
      const { pdfjs } = await import('react-pdf')
      const pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise
      const page = await pdf.getPage(1)
      const scale = 150 / page.getViewport({ scale: 1 }).width
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')!
      await page.render({ canvasContext: ctx, viewport } as any).promise
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
      pdf.destroy()
      return dataUrl
    } catch {
      return ''
    }
  }, [])

  const doSave = useCallback(async () => {
    if (!pdfBytes || !documentId || savingRef.current) return
    savingRef.current = true
    setSaveStatus('saving')
    try {
      const existing = await getDocument(documentId)
      const thumbnail = await generateThumbnail(pdfBytes)
      const now = new Date().toISOString()
      const doc: SavedDocument = {
        id: documentId,
        filename,
        pdfBytes,
        annotations: state.annotations,
        watermark: state.watermark,
        headerFooter: state.headerFooter,
        auditLog: state.auditLog,
        signerName: state.signerName,
        signerEmail: state.signerEmail,
        thumbnail,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        pageCount: state.totalPages,
        fileSize: pdfBytes.byteLength,
      }
      await saveDocument(doc)
      setSaveStatus('saved')
    } catch (err) {
      console.error('Auto-save failed:', err)
      setSaveStatus('unsaved')
    } finally {
      savingRef.current = false
    }
  }, [documentId, pdfBytes, filename, state.annotations, state.watermark, state.headerFooter, state.auditLog, state.signerName, state.signerEmail, state.totalPages, generateThumbnail])

  // Track changes and debounce save
  useEffect(() => {
    if (!enabled || !pdfBytes) return

    const stateFingerprint = JSON.stringify({
      annotations: state.annotations,
      watermark: state.watermark,
      headerFooter: state.headerFooter,
      auditLog: state.auditLog,
      signerName: state.signerName,
      signerEmail: state.signerEmail,
    })

    if (stateFingerprint === prevStateRef.current) return
    prevStateRef.current = stateFingerprint

    setSaveStatus('unsaved')

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      doSave()
    }, 1500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [enabled, pdfBytes, state.annotations, state.watermark, state.headerFooter, state.auditLog, state.signerName, state.signerEmail, doSave])

  // Initial save for new documents
  const initialSaveDone = useRef(false)
  useEffect(() => {
    if (enabled && pdfBytes && state.totalPages > 0 && !initialSaveDone.current) {
      initialSaveDone.current = true
      doSave()
    }
  }, [enabled, pdfBytes, state.totalPages, doSave])

  return { saveStatus }
}

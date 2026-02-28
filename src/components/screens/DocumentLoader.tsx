import { useEffect, useRef } from 'react'
import { useEditor } from '../../state/EditorContext'
import { getDocument } from '../../lib/documentStore'

interface DocumentLoaderProps {
  documentId: string
}

export function DocumentLoader({ documentId }: DocumentLoaderProps) {
  const { dispatch } = useEditor()
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    getDocument(documentId).then((doc) => {
      if (!doc) return
      dispatch({
        type: 'LOAD_DOCUMENT',
        payload: {
          annotations: doc.annotations,
          watermark: doc.watermark,
          headerFooter: doc.headerFooter,
          auditLog: doc.auditLog,
          signerName: doc.signerName,
          signerEmail: doc.signerEmail,
        },
      })
    })
  }, [documentId, dispatch])

  return null
}

import { useState, useCallback } from 'react'

export function usePdfDocument() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadPdf = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.')
      return
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('File too large. Maximum 100MB.')
      return
    }
    setError(null)
    setPdfFile(file)

    const bytes = await file.arrayBuffer()
    setPdfBytes(bytes)

    // Revoke previous URL
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
  }, [pdfUrl])

  const resetPdf = useCallback(() => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    setPdfFile(null)
    setPdfUrl(null)
    setPdfBytes(null)
    setError(null)
  }, [pdfUrl])

  return { pdfFile, pdfUrl, pdfBytes, error, loadPdf, resetPdf }
}

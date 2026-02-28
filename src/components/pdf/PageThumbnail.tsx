import { Document, Page } from 'react-pdf'

interface PageThumbnailProps {
  pdfUrl: string
  pageNumber: number
  isActive: boolean
  onClick: () => void
}

export function PageThumbnail({ pdfUrl, pageNumber, isActive, onClick }: PageThumbnailProps) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg overflow-hidden border-2 transition-colors group
        ${isActive ? 'border-primary-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
    >
      <Document file={pdfUrl} loading={null}>
        <Page
          pageNumber={pageNumber}
          width={160}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
      <div className={`absolute bottom-0 inset-x-0 text-center py-0.5 text-[10px] font-medium
        ${isActive ? 'bg-primary-500 text-white' : 'bg-slate-800/60 text-white'}`}>
        {pageNumber}
      </div>
    </button>
  )
}

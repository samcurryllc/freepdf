import type { StampAnnotation, StampType } from '../../types'

const STAMP_CONFIG: Record<StampType, { label: string; color: string; bg: string }> = {
  approved: { label: 'APPROVED', color: '#16a34a', bg: '#f0fdf4' },
  rejected: { label: 'REJECTED', color: '#dc2626', bg: '#fef2f2' },
  draft: { label: 'DRAFT', color: '#d97706', bg: '#fffbeb' },
  confidential: { label: 'CONFIDENTIAL', color: '#dc2626', bg: '#fef2f2' },
  final: { label: 'FINAL', color: '#2563eb', bg: '#eff6ff' },
  reviewed: { label: 'REVIEWED', color: '#7c3aed', bg: '#f5f3ff' },
  received: { label: 'RECEIVED', color: '#0891b2', bg: '#ecfeff' },
  void: { label: 'VOID', color: '#6b7280', bg: '#f9fafb' },
  copy: { label: 'COPY', color: '#6b7280', bg: '#f9fafb' },
  'not-approved': { label: 'NOT APPROVED', color: '#dc2626', bg: '#fef2f2' },
  'for-comment': { label: 'FOR COMMENT', color: '#d97706', bg: '#fffbeb' },
  preliminary: { label: 'PRELIMINARY', color: '#6b7280', bg: '#f9fafb' },
}

interface Props { annotation: StampAnnotation }

export function StampAnnotationView({ annotation }: Props) {
  const config = STAMP_CONFIG[annotation.stampType]
  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-md border-3 select-none"
      style={{
        borderColor: config.color,
        backgroundColor: config.bg,
        transform: 'rotate(-12deg)',
      }}
    >
      <span
        className="font-black tracking-widest text-center leading-none"
        style={{
          color: config.color,
          fontSize: 'clamp(10px, 2.5vw, 28px)',
        }}
      >
        {config.label}
      </span>
    </div>
  )
}

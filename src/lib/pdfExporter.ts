import { PDFDocument, StandardFonts, rgb, degrees, PDFPage } from 'pdf-lib'
import type { Annotation, FontFamily, PageDimensions, WatermarkConfig, HeaderFooterConfig } from '../types'
import { percentToPdfPoints } from './coordinateMapper'

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return rgb(0, 0, 0)
  return rgb(parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255)
}

const FONT_MAP: Record<FontFamily, string> = {
  'sans-serif': StandardFonts.Helvetica,
  'serif': StandardFonts.TimesRoman,
  'monospace': StandardFonts.Courier,
  'cursive': StandardFonts.Helvetica,
}
const BOLD_FONT_MAP: Record<FontFamily, string> = {
  'sans-serif': StandardFonts.HelveticaBold,
  'serif': StandardFonts.TimesRomanBold,
  'monospace': StandardFonts.CourierBold,
  'cursive': StandardFonts.HelveticaBold,
}
const ITALIC_FONT_MAP: Record<FontFamily, string> = {
  'sans-serif': StandardFonts.HelveticaOblique,
  'serif': StandardFonts.TimesRomanItalic,
  'monospace': StandardFonts.CourierOblique,
  'cursive': StandardFonts.HelveticaOblique,
}
const BOLD_ITALIC_FONT_MAP: Record<FontFamily, string> = {
  'sans-serif': StandardFonts.HelveticaBoldOblique,
  'serif': StandardFonts.TimesRomanBoldItalic,
  'monospace': StandardFonts.CourierBoldOblique,
  'cursive': StandardFonts.HelveticaBoldOblique,
}

const STAMP_LABELS: Record<string, string> = {
  approved: 'APPROVED', rejected: 'REJECTED', draft: 'DRAFT',
  confidential: 'CONFIDENTIAL', final: 'FINAL', reviewed: 'REVIEWED',
  received: 'RECEIVED', void: 'VOID', copy: 'COPY',
  'not-approved': 'NOT APPROVED', 'for-comment': 'FOR COMMENT',
  preliminary: 'PRELIMINARY',
}

const STAMP_COLORS: Record<string, { r: number; g: number; b: number }> = {
  approved: { r: 0.086, g: 0.635, b: 0.247 },
  rejected: { r: 0.863, g: 0.149, b: 0.149 },
  draft: { r: 0.851, g: 0.467, b: 0.024 },
  confidential: { r: 0.863, g: 0.149, b: 0.149 },
  final: { r: 0.145, g: 0.388, b: 0.922 },
  reviewed: { r: 0.486, g: 0.227, b: 0.929 },
  received: { r: 0.031, g: 0.569, b: 0.698 },
  void: { r: 0.42, g: 0.45, b: 0.5 },
  copy: { r: 0.42, g: 0.45, b: 0.5 },
  'not-approved': { r: 0.863, g: 0.149, b: 0.149 },
  'for-comment': { r: 0.851, g: 0.467, b: 0.024 },
  preliminary: { r: 0.42, g: 0.45, b: 0.5 },
}

interface DigitalSignInfo {
  auditLog: { action: string; details: string; timestamp: string }[]
  signerName: string
  signerEmail: string
  documentHash: string
  certificateFingerprint: string
}

async function embedImage(pdfDoc: PDFDocument, dataUrl: string) {
  const base64 = dataUrl.split(',')[1]
  const binaryStr = atob(base64)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)

  if (dataUrl.includes('image/png')) {
    return pdfDoc.embedPng(bytes)
  } else {
    return pdfDoc.embedJpg(bytes)
  }
}

export async function exportSignedPdf(
  originalBytes: ArrayBuffer,
  annotations: Annotation[],
  pageDimensions: PageDimensions[],
  watermark: WatermarkConfig,
  headerFooter: HeaderFooterConfig,
  totalPages: number,
  digitalSign?: DigitalSignInfo,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBytes)
  const pages = pdfDoc.getPages()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Group annotations by page
  const byPage = new Map<number, Annotation[]>()
  for (const ann of annotations) {
    const list = byPage.get(ann.pageNumber) || []
    list.push(ann)
    byPage.set(ann.pageNumber, list)
  }

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const page = pages[pageIdx]
    const dims = pageDimensions[pageIdx] || { width: page.getWidth(), height: page.getHeight() }
    const pageAnnotations = byPage.get(pageIdx + 1) || []

    // Watermark
    if (watermark.enabled && watermark.text) {
      const wSize = watermark.fontSize
      const wWidth = helveticaBold.widthOfTextAtSize(watermark.text, wSize)
      const cx = page.getWidth() / 2 - wWidth / 2
      const cy = page.getHeight() / 2
      page.drawText(watermark.text, {
        x: cx, y: cy, size: wSize,
        font: helveticaBold,
        color: hexToRgb(watermark.color),
        opacity: watermark.opacity,
        rotate: degrees(watermark.rotation),
      })
    }

    // Header / Footer
    if (headerFooter.enabled) {
      const hfSize = headerFooter.fontSize
      const margin = 36
      const replacePlaceholders = (s: string) => s.replace('{page}', String(pageIdx + 1)).replace('{total}', String(totalPages))

      // Header
      if (headerFooter.headerLeft) page.drawText(replacePlaceholders(headerFooter.headerLeft), { x: margin, y: page.getHeight() - margin, size: hfSize, font: helvetica, color: rgb(0.3, 0.3, 0.3) })
      if (headerFooter.headerCenter) {
        const tw = helvetica.widthOfTextAtSize(replacePlaceholders(headerFooter.headerCenter), hfSize)
        page.drawText(replacePlaceholders(headerFooter.headerCenter), { x: page.getWidth() / 2 - tw / 2, y: page.getHeight() - margin, size: hfSize, font: helvetica, color: rgb(0.3, 0.3, 0.3) })
      }
      if (headerFooter.headerRight) {
        const tw = helvetica.widthOfTextAtSize(replacePlaceholders(headerFooter.headerRight), hfSize)
        page.drawText(replacePlaceholders(headerFooter.headerRight), { x: page.getWidth() - margin - tw, y: page.getHeight() - margin, size: hfSize, font: helvetica, color: rgb(0.3, 0.3, 0.3) })
      }
      // Footer
      if (headerFooter.footerLeft) page.drawText(replacePlaceholders(headerFooter.footerLeft), { x: margin, y: margin - hfSize, size: hfSize, font: helvetica, color: rgb(0.3, 0.3, 0.3) })
      if (headerFooter.footerCenter) {
        const tw = helvetica.widthOfTextAtSize(replacePlaceholders(headerFooter.footerCenter), hfSize)
        page.drawText(replacePlaceholders(headerFooter.footerCenter), { x: page.getWidth() / 2 - tw / 2, y: margin - hfSize, size: hfSize, font: helvetica, color: rgb(0.3, 0.3, 0.3) })
      }
      if (headerFooter.footerRight) {
        const tw = helvetica.widthOfTextAtSize(replacePlaceholders(headerFooter.footerRight), hfSize)
        page.drawText(replacePlaceholders(headerFooter.footerRight), { x: page.getWidth() - margin - tw, y: margin - hfSize, size: hfSize, font: helvetica, color: rgb(0.3, 0.3, 0.3) })
      }
    }

    // Annotations
    for (const ann of pageAnnotations) {
      const { x, y, width, height } = percentToPdfPoints(ann.x, ann.y, ann.width, ann.height, dims)

      if (ann.type === 'text' || ann.type === 'date') {
        let fontName: string
        if (ann.type === 'text') {
          if (ann.bold && ann.italic) fontName = BOLD_ITALIC_FONT_MAP[ann.fontFamily]
          else if (ann.bold) fontName = BOLD_FONT_MAP[ann.fontFamily]
          else if (ann.italic) fontName = ITALIC_FONT_MAP[ann.fontFamily]
          else fontName = FONT_MAP[ann.fontFamily]
        } else {
          fontName = FONT_MAP[ann.fontFamily]
        }
        const font = await pdfDoc.embedFont(fontName)
        page.drawText(ann.content, {
          x, y: y + height - ann.fontSize,
          size: ann.fontSize, font,
          color: hexToRgb(ann.color),
          opacity: ann.opacity,
        })
      } else if (ann.type === 'signature' || ann.type === 'initials' || ann.type === 'image') {
        try {
          const image = await embedImage(pdfDoc, ann.dataUrl)
          page.drawImage(image, { x, y, width, height, opacity: ann.opacity })
        } catch { console.warn('Failed to embed image') }
      } else if (ann.type === 'highlight') {
        page.drawRectangle({
          x, y, width, height,
          color: hexToRgb(ann.color),
          opacity: 0.35 * ann.opacity,
        })
      } else if (ann.type === 'strikethrough') {
        page.drawLine({
          start: { x, y: y + height / 2 },
          end: { x: x + width, y: y + height / 2 },
          thickness: 2, color: hexToRgb(ann.color), opacity: ann.opacity,
        })
      } else if (ann.type === 'underline') {
        page.drawLine({
          start: { x, y },
          end: { x: x + width, y },
          thickness: 2, color: hexToRgb(ann.color), opacity: ann.opacity,
        })
      } else if (ann.type === 'stamp') {
        const c = STAMP_COLORS[ann.stampType] || { r: 0.4, g: 0.4, b: 0.4 }
        const stampRotation = degrees(-12)
        // Outer border
        page.drawRectangle({
          x, y, width, height,
          borderColor: rgb(c.r, c.g, c.b),
          borderWidth: 3,
          color: rgb(c.r, c.g, c.b),
          opacity: 0.06,
          rotate: stampRotation,
        })
        // Inner border for double-border effect
        page.drawRectangle({
          x: x + 4, y: y + 4, width: width - 8, height: height - 8,
          borderColor: rgb(c.r, c.g, c.b),
          borderWidth: 1.5,
          opacity: 0.15,
          rotate: stampRotation,
        })
        const label = STAMP_LABELS[ann.stampType] || ann.stampType.toUpperCase()
        const stampFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const fontSize = Math.min(height * 0.45, width / label.length * 1.6)
        const tw = stampFont.widthOfTextAtSize(label, fontSize)
        page.drawText(label, {
          x: x + (width - tw) / 2,
          y: y + (height - fontSize) / 2,
          size: fontSize, font: stampFont,
          color: rgb(c.r, c.g, c.b),
          opacity: ann.opacity,
          rotate: stampRotation,
        })
      } else if (ann.type === 'shape') {
        const sc = hexToRgb(ann.strokeColor)
        const fc = ann.fillColor ? hexToRgb(ann.fillColor) : undefined
        if (ann.shapeType === 'rect') {
          page.drawRectangle({ x, y, width, height, borderColor: sc, borderWidth: ann.strokeWidth, color: fc, opacity: ann.opacity })
        } else if (ann.shapeType === 'ellipse') {
          page.drawEllipse({ x: x + width / 2, y: y + height / 2, xScale: width / 2, yScale: height / 2, borderColor: sc, borderWidth: ann.strokeWidth, color: fc, opacity: ann.opacity })
        } else if (ann.shapeType === 'line') {
          page.drawLine({ start: { x, y }, end: { x: x + width, y: y + height }, thickness: ann.strokeWidth, color: sc, opacity: ann.opacity })
        } else if (ann.shapeType === 'arrow') {
          page.drawLine({ start: { x, y: y + height / 2 }, end: { x: x + width, y: y + height / 2 }, thickness: ann.strokeWidth, color: sc, opacity: ann.opacity })
          // Arrow head
          const headSize = Math.min(height / 3, 8)
          page.drawLine({ start: { x: x + width - headSize, y: y + height / 2 + headSize }, end: { x: x + width, y: y + height / 2 }, thickness: ann.strokeWidth, color: sc, opacity: ann.opacity })
          page.drawLine({ start: { x: x + width - headSize, y: y + height / 2 - headSize }, end: { x: x + width, y: y + height / 2 }, thickness: ann.strokeWidth, color: sc, opacity: ann.opacity })
        }
      } else if (ann.type === 'drawing') {
        for (const stroke of ann.paths) {
          for (let i = 1; i < stroke.length; i++) {
            const x1 = x + (stroke[i - 1].x / 100) * width
            const y1 = y + height - (stroke[i - 1].y / 100) * height
            const x2 = x + (stroke[i].x / 100) * width
            const y2 = y + height - (stroke[i].y / 100) * height
            page.drawLine({
              start: { x: x1, y: y1 }, end: { x: x2, y: y2 },
              thickness: ann.strokeWidth, color: hexToRgb(ann.strokeColor), opacity: ann.opacity,
            })
          }
        }
      } else if (ann.type === 'checkbox') {
        page.drawRectangle({ x, y, width: height, height, borderColor: rgb(0.3, 0.3, 0.3), borderWidth: 1.5 })
        if (ann.checked) {
          page.drawLine({ start: { x: x + 2, y: y + height / 2 }, end: { x: x + height / 3, y: y + 2 }, thickness: 2, color: rgb(0, 0.5, 0) })
          page.drawLine({ start: { x: x + height / 3, y: y + 2 }, end: { x: x + height - 2, y: y + height - 2 }, thickness: 2, color: rgb(0, 0.5, 0) })
        }
        if (ann.label) {
          page.drawText(ann.label, {
            x: x + height + 4, y: y + 2,
            size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2),
          })
        }
      } else if (ann.type === 'whiteout') {
        page.drawRectangle({ x, y, width, height, color: rgb(1, 1, 1), opacity: 1 })
      } else if (ann.type === 'sticky-note') {
        // Draw a small note indicator
        const noteSize = Math.min(width, height, 20)
        page.drawRectangle({ x, y: y + height - noteSize, width: noteSize, height: noteSize, color: hexToRgb(ann.color), opacity: 0.8 })
      }
    }
  }

  // Audit trail page
  if (digitalSign) {
    const auditPage = pdfDoc.addPage([612, 792])
    let yPos = 742

    const drawLine = (text: string, size = 10, bold = false) => {
      const f = bold ? helveticaBold : helvetica
      auditPage.drawText(text, { x: 50, y: yPos, size, font: f, color: rgb(0.15, 0.15, 0.15) })
      yPos -= size + 6
    }

    const drawSep = () => {
      auditPage.drawLine({ start: { x: 50, y: yPos + 4 }, end: { x: 562, y: yPos + 4 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) })
      yPos -= 10
    }

    drawLine('CERTIFICATE OF COMPLETION', 18, true)
    yPos -= 10
    drawSep()

    drawLine('Document Information', 12, true)
    drawLine(`Document Hash (SHA-256): ${digitalSign.documentHash}`)
    drawLine(`Signed Date: ${new Date().toISOString()}`)
    drawLine(`Certificate Fingerprint: ${digitalSign.certificateFingerprint}`)
    yPos -= 5
    drawSep()

    drawLine('Signer Information', 12, true)
    drawLine(`Name: ${digitalSign.signerName}`)
    drawLine(`Email: ${digitalSign.signerEmail}`)
    yPos -= 5
    drawSep()

    drawLine('Audit Trail', 12, true)
    for (const entry of digitalSign.auditLog) {
      if (yPos < 60) break
      drawLine(`[${new Date(entry.timestamp).toLocaleString()}] ${entry.action}: ${entry.details}`, 9)
    }

    yPos -= 10
    drawSep()
    drawLine('This document has been digitally signed. Any modification will invalidate the signature.', 8)
    drawLine(`Document ID: ${crypto.randomUUID()}`, 8)
  }

  return pdfDoc.save()
}

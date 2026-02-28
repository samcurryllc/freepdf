import type { PageDimensions } from '../types'

/**
 * Convert percentage-based annotation coordinates to PDF points.
 * PDF coordinate system has origin at bottom-left, Y increases upward.
 */
export function percentToPdfPoints(
  xPercent: number,
  yPercent: number,
  widthPercent: number,
  heightPercent: number,
  pageDims: PageDimensions,
) {
  // Round to 2 decimal places to avoid floating-point edge overflow
  const r = (n: number) => Math.round(n * 100) / 100
  const x = r((xPercent / 100) * pageDims.width)
  // Flip Y: PDF origin is bottom-left
  const y = r(pageDims.height - ((yPercent / 100) * pageDims.height) - ((heightPercent / 100) * pageDims.height))
  const width = r((widthPercent / 100) * pageDims.width)
  const height = r((heightPercent / 100) * pageDims.height)

  return { x, y, width, height }
}

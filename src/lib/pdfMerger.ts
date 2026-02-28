import { PDFDocument } from 'pdf-lib'

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create()

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const srcDoc = await PDFDocument.load(bytes)
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices())
    pages.forEach((page) => mergedDoc.addPage(page))
  }

  return mergedDoc.save()
}

export async function splitPdf(bytes: ArrayBuffer, ranges: [number, number][]): Promise<Uint8Array[]> {
  const srcDoc = await PDFDocument.load(bytes)
  const results: Uint8Array[] = []

  for (const [start, end] of ranges) {
    const newDoc = await PDFDocument.create()
    const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i)
    const pages = await newDoc.copyPages(srcDoc, indices)
    pages.forEach((page) => newDoc.addPage(page))
    results.push(await newDoc.save())
  }

  return results
}

export async function extractPages(bytes: ArrayBuffer, pageIndices: number[]): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(bytes)
  const newDoc = await PDFDocument.create()
  const pages = await newDoc.copyPages(srcDoc, pageIndices)
  pages.forEach((page) => newDoc.addPage(page))
  return newDoc.save()
}

export async function deletePages(bytes: ArrayBuffer, pageIndicesToDelete: number[]): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(bytes)
  const allIndices = srcDoc.getPageIndices()
  const keepIndices = allIndices.filter(i => !pageIndicesToDelete.includes(i))
  const newDoc = await PDFDocument.create()
  const pages = await newDoc.copyPages(srcDoc, keepIndices)
  pages.forEach((page) => newDoc.addPage(page))
  return newDoc.save()
}

export async function rotatePage(bytes: ArrayBuffer, pageIndex: number, degrees: number): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const page = doc.getPage(pageIndex)
  const current = page.getRotation().angle
  page.setRotation({ type: 0, angle: (current + degrees) % 360 } as any)
  return doc.save()
}

export async function addBlankPage(bytes: ArrayBuffer, afterPageIndex: number): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes)
  const refPage = doc.getPage(Math.min(afterPageIndex, doc.getPageCount() - 1))
  const { width, height } = refPage.getSize()
  doc.insertPage(afterPageIndex + 1, [width, height])
  return doc.save()
}

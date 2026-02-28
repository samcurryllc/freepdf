import type { SavedDocument, DocumentMeta } from '../types'

const DB_NAME = 'pdf-signer'
const DB_VERSION = 1
const STORE_NAME = 'documents'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveDocument(doc: SavedDocument): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(doc)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function getAllDocumentMeta(): Promise<DocumentMeta[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => {
      db.close()
      const docs = request.result as SavedDocument[]
      const metas: DocumentMeta[] = docs.map((d) => ({
        id: d.id,
        filename: d.filename,
        thumbnail: d.thumbnail,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        pageCount: d.pageCount,
        fileSize: d.fileSize,
        annotationCount: d.annotations.length,
        isSigned: d.auditLog.some((e) => e.action === 'Digitally Signed'),
      }))
      metas.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      resolve(metas)
    }
    request.onerror = () => { db.close(); reject(request.error) }
  })
}

export async function getDocument(id: string): Promise<SavedDocument | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(id)
    request.onsuccess = () => { db.close(); resolve(request.result as SavedDocument | undefined) }
    request.onerror = () => { db.close(); reject(request.error) }
  })
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
  })
}

export async function renameDocument(id: string, filename: string): Promise<void> {
  const doc = await getDocument(id)
  if (!doc) return
  doc.filename = filename
  doc.updatedAt = new Date().toISOString()
  await saveDocument(doc)
}

export async function getStorageEstimate(): Promise<{ usage: number; quota: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate()
    return { usage: est.usage ?? 0, quota: est.quota ?? 0 }
  }
  return { usage: 0, quota: 0 }
}

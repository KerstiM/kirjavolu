import type { StoredImageRef } from '../domain/models'
import { createId } from './id'

/**
 * Uploaded pictures are kept in IndexedDB: they are too large for localStorage
 * (about 5 MB in total) and never leave the device.
 */
const DB_NAME = 'kirjavolu-images'
const STORE = 'images'
const MAX_SIDE = 2000

interface ImageRecord {
  id: string
  dataUrl: string
}

/** Target size that keeps the aspect ratio and fits `maxSide`. Never upscales. */
export function fitWithin(width: number, height: number, maxSide = MAX_SIDE): { width: number; height: number } {
  const scale = Math.min(1, maxSide / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB ei ole saadaval'))
      return
    }
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = run(db.transaction(STORE, mode).objectStore(STORE))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function loadBitmap(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Pilti ei õnnestunud avada'))
    }
    img.src = url
  })
}

/** Downscales the picture, stores it and returns its reference. */
export async function saveImage(file: Blob): Promise<StoredImageRef> {
  const img = await loadBitmap(file)
  const size = fitWithin(img.naturalWidth, img.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Pilti ei õnnestunud töödelda')
  context.drawImage(img, 0, 0, size.width, size.height)
  const record: ImageRecord = { id: createId(), dataUrl: canvas.toDataURL('image/jpeg', 0.88) }
  await withStore('readwrite', (store) => store.put(record))
  return { id: record.id, ...size }
}

export async function loadImage(id: string): Promise<string | null> {
  try {
    const record = await withStore<ImageRecord | undefined>('readonly', (store) => store.get(id))
    return record?.dataUrl ?? null
  } catch {
    return null
  }
}

export async function deleteImage(id: string): Promise<void> {
  try {
    await withStore('readwrite', (store) => store.delete(id))
  } catch {
    // Nothing to clean up when IndexedDB is unavailable.
  }
}

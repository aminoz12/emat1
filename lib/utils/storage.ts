/**
 * Utility for storing files in IndexedDB (guest mode persistence)
 * Stores raw ArrayBuffer + metadata so files survive page navigation
 */

const DB_NAME = 'emattricule_temp_store'
const STORE_NAME = 'pending_files'
const DB_VERSION = 2 // bumped to force schema upgrade

interface StoredFile {
  buffer: ArrayBuffer
  name: string
  type: string
  size: number
}

/**
 * Initialize/Open the database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onblocked = () => reject(new Error('IndexedDB est bloqué par un autre onglet. Veuillez fermer les autres onglets du site.'))

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result
      // Drop old store if it exists (schema upgrade)
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME)
      }
      db.createObjectStore(STORE_NAME)
    }
  })
}

/**
 * Save a dictionary of files to IndexedDB.
 * Converts each File to an ArrayBuffer so it survives page navigation.
 */
export async function saveFilesToIndexedDB(filesMap: Record<string, File>): Promise<void> {
  try {
    // 1. Prepare all data FIRST (async non-IDB work)
    // This is crucial because awaiting inside an IDB transaction can cause it to auto-commit
    const entries = Object.entries(filesMap).filter(([, file]) => file instanceof File)
    const preparedFiles: Array<{ key: string, data: StoredFile }> = []

    for (const [key, file] of entries) {
      try {
        const buffer = await file.arrayBuffer()
        preparedFiles.push({
          key,
          data: {
            buffer,
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
          }
        })
      } catch (err) {
        console.error(`Failed to serialize file "${key}":`, err)
      }
    }

    if (preparedFiles.length === 0) return

    // 2. Open DB and start transaction
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    // Clear previous files first
    store.clear()

    // 3. Put all files (all synchronous relative to the transaction)
    for (const { key, data } of preparedFiles) {
      store.put(data, key)
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log(`Saved ${preparedFiles.length} files to IndexedDB`)
        db.close()
        resolve()
      }
      transaction.onerror = () => {
        console.error('IndexedDB transaction error:', transaction.error)
        db.close()
        reject(transaction.error)
      }
      transaction.onabort = () => {
        console.error('IndexedDB transaction aborted')
        db.close()
        reject(new Error('IndexedDB transaction aborted'))
      }
    })
  } catch (error) {
    console.error('Error saving to IndexedDB:', error)
    throw error
  }
}

/**
 * Retrieve all pending files from IndexedDB.
 * Reconstructs File objects from stored ArrayBuffers.
 */
export async function getFilesFromIndexedDB(): Promise<Record<string, File>> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.openCursor()

    const files: Record<string, File> = {}

    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        const cursor = event.target.result
        if (cursor) {
          const key = cursor.key as string
          const value = cursor.value

          // Handle both old (File object) and new (StoredFile) formats
          if (value instanceof File) {
            files[key] = value
          } else if (value && value.buffer instanceof ArrayBuffer) {
            const storedFile = value as StoredFile
            const blob = new Blob([storedFile.buffer], { type: storedFile.type })
            files[key] = new File([blob], storedFile.name, { type: storedFile.type })
          }

          cursor.continue()
        } else {
          console.log(`Retrieved ${Object.keys(files).length} files from IndexedDB:`, Object.keys(files))
          db.close()
          resolve(files)
        }
      }
      request.onerror = () => {
        db.close()
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('Error reading from IndexedDB:', error)
    return {}
  }
}

/**
 * Clear all files from IndexedDB
 */
export async function clearIndexedDB(): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    store.clear()

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close()
        resolve()
      }
      transaction.onerror = () => {
        db.close()
        reject(transaction.error)
      }
    })
  } catch (error) {
    console.error('Error clearing IndexedDB:', error)
  }
}

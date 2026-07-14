import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'aurora-todo'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv')
        if (!db.objectStoreNames.contains('outbox')) db.createObjectStore('outbox', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

/** Simple key/value cache used by Zustand persistence for offline support. */
export const idb = {
  async get<T>(key: string): Promise<T | undefined> {
    return (await getDB()).get('kv', key)
  },
  async set<T>(key: string, value: T) {
    return (await getDB()).put('kv', value, key)
  },
  async del(key: string) {
    return (await getDB()).delete('kv', key)
  },
  async pushOutbox(action: { id: string; type: string; payload: unknown; createdAt: string }) {
    return (await getDB()).put('outbox', action)
  },
  async listOutbox() {
    return (await getDB()).getAll('outbox') as Promise<Array<{ id: string; type: string; payload: unknown; createdAt: string }>>
  },
  async clearOutbox(id: string) {
    return (await getDB()).delete('outbox', id)
  },
}

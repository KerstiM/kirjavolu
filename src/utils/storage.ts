import type { ChildProfile, GeneratedContent } from '../domain/models'

export const STORAGE_KEY = 'kirjavolu.state'
export const SCHEMA_VERSION = 1
const MAX_CREATIONS = 30

export interface PersistedState {
  schemaVersion: typeof SCHEMA_VERSION
  children: ChildProfile[]
  creations: GeneratedContent[]
  /** True once demo profiles have been offered, so deleting them is respected. */
  demoSeeded: boolean
}

export function emptyState(): PersistedState {
  return { schemaVersion: SCHEMA_VERSION, children: [], creations: [], demoSeeded: false }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Upgrades stored data to the current schema. Add a case per version bump so
 * older browsers' data keeps working.
 */
export function migrate(raw: unknown): PersistedState {
  if (!isRecord(raw)) return emptyState()
  const version = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 0
  if (version > SCHEMA_VERSION) return emptyState()
  // Version 0 (pre-release) had no schemaVersion; the shape was otherwise the same.
  return {
    schemaVersion: SCHEMA_VERSION,
    children: Array.isArray(raw.children) ? (raw.children as ChildProfile[]) : [],
    creations: Array.isArray(raw.creations) ? (raw.creations as GeneratedContent[]) : [],
    demoSeeded: raw.demoSeeded === true,
  }
}

export function loadState(storage: Storage | undefined = safeStorage()): PersistedState {
  if (!storage) return emptyState()
  try {
    const text = storage.getItem(STORAGE_KEY)
    return text ? migrate(JSON.parse(text)) : emptyState()
  } catch {
    return emptyState()
  }
}

export function saveState(state: PersistedState, storage: Storage | undefined = safeStorage()): boolean {
  if (!storage) return false
  try {
    const trimmed = { ...state, creations: state.creations.slice(0, MAX_CREATIONS) }
    storage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    return true
  } catch {
    return false
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { loadState, migrate, saveState, SCHEMA_VERSION, STORAGE_KEY } from '@/utils/storage'
import { useChildrenStore, emptyChildDraft } from '@/features/children/childrenStore'
import { RUBEN } from './helpers'

describe('storage', () => {
  it('returns an empty state when nothing is stored', () => {
    expect(loadState()).toEqual({ schemaVersion: SCHEMA_VERSION, children: [], creations: [], demoSeeded: false })
  })

  it('round-trips state through localStorage', () => {
    saveState({ schemaVersion: SCHEMA_VERSION, children: [RUBEN], creations: [], demoSeeded: true })
    const loaded = loadState()
    expect(loaded.children[0]?.name).toBe('Ruben')
    expect(loaded.demoSeeded).toBe(true)
  })

  it('survives corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadState().children).toEqual([])
  })

  it('migrates unversioned data and ignores data from a newer schema', () => {
    expect(migrate({ children: [RUBEN] }).children).toHaveLength(1)
    expect(migrate({ schemaVersion: SCHEMA_VERSION + 1, children: [RUBEN] }).children).toHaveLength(0)
  })
})

describe('children store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('starts with no profiles and adds the demo profiles only on request', () => {
    const store = useChildrenStore()
    expect(store.children).toHaveLength(0)
    store.restoreDemo()
    expect(store.children.map((c) => c.name)).toEqual(['Ruben', 'Jasper', 'Brita'])
  })

  it('keeps saved profiles', () => {
    saveState({ schemaVersion: SCHEMA_VERSION, children: [RUBEN], creations: [], demoSeeded: true })
    expect(useChildrenStore().children.map((c) => c.name)).toEqual(['Ruben'])
  })

  it('adds, updates and removes profiles with cleaned lists', () => {
    const store = useChildrenStore()
    const child = store.add({ ...emptyChildDraft(), name: '  Mia ', interests: [' joonistamine ', ''] })
    expect(child.name).toBe('Mia')
    expect(child.interests).toEqual(['joonistamine'])
    store.update(child.id, { ...emptyChildDraft(), name: 'Mia', age: 9 })
    expect(store.byId(child.id)?.age).toBe(9)
    store.remove(child.id)
    expect(store.byId(child.id)).toBeUndefined()
  })
})

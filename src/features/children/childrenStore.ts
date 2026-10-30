import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChildProfile, ChildProfileDraft } from '../../domain/models'
import { DEMO_CHILDREN } from '../../data/demo/children'
import { createId } from '../../utils/id'
import { loadState } from '../../utils/storage'
import { clone } from '../../utils/clone'

export function emptyChildDraft(): ChildProfileDraft {
  return {
    name: '',
    nameGenitive: '',
    age: 6,
    readingLevel: 'beginner',
    personality: '',
    interests: [],
    favorites: [],
    foods: [],
    family: [],
    achievements: [],
    details: '',
    parentNotes: '',
  }
}

function cleanList(list: string[]): string[] {
  return list.map((entry) => entry.trim()).filter(Boolean)
}

function cleanDraft(draft: ChildProfileDraft): ChildProfileDraft {
  return {
    ...draft,
    name: draft.name.trim(),
    nameGenitive: draft.nameGenitive?.trim() || undefined,
    interests: cleanList(draft.interests),
    favorites: cleanList(draft.favorites),
    foods: cleanList(draft.foods),
    family: cleanList(draft.family),
    achievements: cleanList(draft.achievements),
  }
}

export const useChildrenStore = defineStore('children', () => {
  const stored = loadState()
  const children = ref<ChildProfile[]>(stored.demoSeeded ? stored.children : clone(DEMO_CHILDREN))

  function byId(id: string): ChildProfile | undefined {
    return children.value.find((child) => child.id === id)
  }

  function add(draft: ChildProfileDraft): ChildProfile {
    const now = new Date().toISOString()
    const child: ChildProfile = { ...cleanDraft(draft), id: createId(), createdAt: now, updatedAt: now }
    children.value.push(child)
    return child
  }

  function update(id: string, draft: ChildProfileDraft): void {
    const index = children.value.findIndex((child) => child.id === id)
    const existing = children.value[index]
    if (!existing) return
    children.value[index] = { ...existing, ...cleanDraft(draft), updatedAt: new Date().toISOString() }
  }

  function remove(id: string): void {
    children.value = children.value.filter((child) => child.id !== id)
  }

  function restoreDemo(): void {
    const missing = DEMO_CHILDREN.filter((demo) => !byId(demo.id))
    children.value.push(...clone(missing))
  }

  return { children, byId, add, update, remove, restoreDemo }
})

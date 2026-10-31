import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Decoration, GeneratedContent, GeneratedItem, PrintableLayout } from '../../domain/models'
import { deleteImage } from '../../utils/imageStore'
import { loadState } from '../../utils/storage'

export const useCreationsStore = defineStore('creations', () => {
  const creations = ref<GeneratedContent[]>(loadState().creations)

  function byId(id: string): GeneratedContent | undefined {
    return creations.value.find((creation) => creation.id === id)
  }

  function add(content: GeneratedContent): void {
    creations.value.unshift(content)
  }

  function remove(id: string): void {
    const imageId = byId(id)?.decoration?.image?.id
    creations.value = creations.value.filter((creation) => creation.id !== id)
    if (imageId) void deleteImage(imageId)
  }

  function setDecoration(id: string, decoration: Decoration): void {
    const creation = byId(id)
    if (!creation) return
    const previous = creation.decoration?.image?.id
    creation.decoration = decoration
    if (previous && previous !== decoration.image?.id) void deleteImage(previous)
  }

  function updateItem(id: string, item: GeneratedItem): void {
    const creation = byId(id)
    if (!creation) return
    const index = creation.items.findIndex((existing) => existing.id === item.id)
    if (index >= 0) creation.items[index] = item
  }

  function editItem(id: string, itemId: string, patch: Partial<Pick<GeneratedItem, 'heading' | 'body' | 'signature'>>): void {
    const item = byId(id)?.items.find((existing) => existing.id === itemId)
    if (!item) return
    Object.assign(item, patch, { edited: true })
  }

  function setLayout(id: string, layout: PrintableLayout): void {
    const creation = byId(id)
    if (creation) creation.layout = layout
  }

  function rename(id: string, title: string): void {
    const creation = byId(id)
    if (creation && title.trim()) creation.title = title.trim()
  }

  return { creations, byId, add, remove, setDecoration, updateItem, editItem, setLayout, rename }
})

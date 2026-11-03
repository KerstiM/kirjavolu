import { watch } from 'vue'
import { useChildrenStore } from '../features/children/childrenStore'
import { useCreationsStore } from '../features/preview/creationsStore'
import { SCHEMA_VERSION, STORAGE_KEY, loadState, saveState } from '../utils/storage'

/**
 * Saves both stores to localStorage whenever they change, and takes in what another tab of the
 * same browser saved, so two open tabs never show (or overwrite) different children.
 * Call after Pinia is installed.
 */
export function setupPersistence(): void {
  const children = useChildrenStore()
  const creations = useCreationsStore()
  watch(
    () => [children.children, creations.creations] as const,
    () => {
      saveState({
        schemaVersion: SCHEMA_VERSION,
        children: children.children,
        creations: creations.creations,
        demoSeeded: true,
      })
    },
    { deep: true, immediate: true },
  )
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY || event.storageArea !== localStorage) return
    const saved = loadState()
    // Only a real difference is taken in, so the save this triggers does not bounce back.
    if (JSON.stringify(saved.children) !== JSON.stringify(children.children)) children.children = saved.children
    if (JSON.stringify(saved.creations) !== JSON.stringify(creations.creations)) creations.creations = saved.creations
  })
}

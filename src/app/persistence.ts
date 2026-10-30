import { watch } from 'vue'
import { useChildrenStore } from '../features/children/childrenStore'
import { useCreationsStore } from '../features/preview/creationsStore'
import { SCHEMA_VERSION, saveState } from '../utils/storage'

/** Saves both stores to localStorage whenever they change. Call after Pinia is installed. */
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
}

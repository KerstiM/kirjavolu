import { ref, watch, type Ref } from 'vue'
import { loadImage } from '../utils/imageStore'

/** Loads an uploaded picture from IndexedDB as a data URL, following the id. */
export function useStoredImage(id: () => string | undefined): Ref<string | null> {
  const url = ref<string | null>(null)
  watch(
    id,
    async (current) => {
      const loaded = current ? await loadImage(current) : null
      // Ignore results for an id that has been replaced in the meantime.
      if (id() === current) url.value = loaded
    },
    { immediate: true },
  )
  return url
}

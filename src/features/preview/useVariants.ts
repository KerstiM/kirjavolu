import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import type { GeneratedContent } from '../../domain/models'

/**
 * Ids of the items that have no other variant, found in a worker while the parent looks at
 * the letters (buttons turn off one by one). Looked up again whenever the letters change; an
 * item a click found nothing for is added at once. Without workers (tests) only clicks count.
 */
export function useNoVariants(content: Ref<GeneratedContent | undefined>, enabled: Ref<boolean>) {
  const ids = ref(new Set<string>())
  let worker: Worker | null = null
  let job = 0

  function stop(): void {
    worker?.terminate()
    worker = null
  }

  watch(
    () => (enabled.value && content.value ? content.value.items.map((item) => `${item.id}:${item.variant}:${item.body}`).join('|') : ''),
    (key) => {
      stop()
      ids.value = new Set()
      const current = content.value
      if (!key || !current || typeof Worker === 'undefined') return
      job += 1
      const mine = job
      worker = new Worker(new URL('./variantWorker.ts', import.meta.url), { type: 'module' })
      worker.onmessage = (event: MessageEvent<{ job: number; id: string }>) => {
        if (event.data.job === mine) ids.value = new Set([...ids.value, event.data.id])
      }
      // Plain data: the reactive proxies cannot be posted.
      worker.postMessage({ job: mine, content: JSON.parse(JSON.stringify({ request: current.request, items: current.items })) })
    },
    { immediate: true },
  )
  onBeforeUnmount(stop)

  function markNone(id: string): void {
    ids.value = new Set([...ids.value, id])
  }

  return { noVariantIds: ids, markNone }
}

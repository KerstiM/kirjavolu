import type { GeneratedContent } from '../../domain/models'
import { findVariant } from '../../domain/generators/templateGenerator'

/**
 * Off the page's thread: which items have no other variant, so their "Uus variant" button can
 * be off. Looking takes up to 25 runs of the generator per item, seconds for a family series.
 */
self.onmessage = (event: MessageEvent<{ job: number; content: Pick<GeneratedContent, 'request' | 'items'> }>) => {
  const { job, content } = event.data
  content.items.forEach((item, index) => {
    if (!findVariant(content, index)) self.postMessage({ job, id: item.id })
  })
}

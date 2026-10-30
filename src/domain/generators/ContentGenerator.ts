import type { GeneratedContent, GeneratedItem, GenerationRequest } from '../models'

/**
 * Generation abstraction used by the UI. The MVP ships a local template-based
 * implementation; a server-backed AI provider can implement the same interface
 * later without touching the components.
 */
export interface ContentGenerator {
  readonly id: string
  /** Honest, user-facing label of how content is produced. */
  readonly label: string
  generate(request: GenerationRequest): Promise<GeneratedContent>
  /** Returns a new version of a single item, keeping the rest of the set intact. */
  regenerateItem(content: GeneratedContent, itemIndex: number): Promise<GeneratedItem>
}

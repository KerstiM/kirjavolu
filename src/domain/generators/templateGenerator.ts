import type { GeneratedContent, GeneratedItem, GenerationRequest } from '../models'
import { getContentType } from '../contentTypes'
import { validateGenerationRequest } from '../validation'
import { createId } from '../../utils/id'
import type { ContentGenerator } from './ContentGenerator'
import type { TypeResult } from './context'
import { generateCalendar } from './calendarGenerator'
import { generateCertificates } from './certificateGenerator'
import { generateLetters } from './letterGenerator'
import { generatePuzzles } from './puzzleGenerator'
import { generateStory } from './storyGenerator'
import { generateTreasureHunt } from './treasureHuntGenerator'

export class GenerationError extends Error {
  constructor(readonly errors: string[]) {
    super(errors.join(' '))
    this.name = 'GenerationError'
  }
}

/** Runs the type-specific generator. Pure and deterministic for a given request + variants. */
export function runTemplates(request: GenerationRequest, variants: readonly number[] = []): TypeResult {
  switch (request.contentType) {
    case 'letter':
      return generateLetters(request, variants)
    case 'treasure-hunt':
      return generateTreasureHunt(request, variants)
    case 'story':
      return generateStory(request, variants)
    case 'puzzle':
      return generatePuzzles(request, variants)
    case 'calendar':
      return generateCalendar(request, variants)
    case 'certificate':
      return generateCertificates(request, variants)
  }
}

const MAX_REGENERATION_ATTEMPTS = 25

/**
 * Local, deterministic template engine. It does not use AI – texts are assembled
 * from hand-written Estonian templates and the child profiles.
 */
export class TemplateGenerator implements ContentGenerator {
  readonly id = 'local-templates'
  readonly label = 'Kirjavõlu mallimootor (töötab sinu brauseris, ilma tehisintellektita)'

  async generate(request: GenerationRequest): Promise<GeneratedContent> {
    const errors = validateGenerationRequest(request)
    if (errors.length > 0) throw new GenerationError(errors)
    const result = runTemplates(request)
    return {
      id: createId(),
      title: result.title,
      subtitle: result.subtitle,
      createdAt: new Date().toISOString(),
      request,
      items: result.items.map((item) => ({ ...item, id: createId(), variant: 0, edited: false })),
      instructions: result.instructions,
      layout: getContentType(request.contentType).defaultLayout,
      generator: { id: this.id, label: this.label },
    }
  }

  async regenerateItem(content: GeneratedContent, itemIndex: number): Promise<GeneratedItem> {
    const current = content.items[itemIndex]
    if (!current) throw new Error(`Item ${itemIndex} does not exist`)
    const variants = content.items.map((item) => item.variant)
    const others = new Set(content.items.filter((_, i) => i !== itemIndex).map((item) => item.body))
    for (let attempt = 1; attempt <= MAX_REGENERATION_ATTEMPTS; attempt++) {
      const variant = current.variant + attempt
      variants[itemIndex] = variant
      const candidate = runTemplates(content.request, variants).items[itemIndex]
      if (candidate && candidate.body !== current.body && !others.has(candidate.body)) {
        return { ...candidate, id: current.id, variant, edited: false }
      }
    }
    return current
  }
}

export const templateGenerator = new TemplateGenerator()

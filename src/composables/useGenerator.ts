import type { ContentGenerator } from '../domain/generators/ContentGenerator'
import { templateGenerator } from '../domain/generators/templateGenerator'

/**
 * Single place where the UI obtains its content generator. To plug in an AI
 * provider later, return a server-backed implementation of ContentGenerator here
 * (never call an AI API with a secret key directly from the browser).
 */
export function useGenerator(): ContentGenerator {
  return templateGenerator
}

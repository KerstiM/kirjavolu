import { DEMO_CHILDREN } from '@/data/demo/children'
import { DEFAULT_GENERAL, defaultOptions } from '@/domain/defaults'
import type {
  ChildProfile,
  ContentOptionsMap,
  ContentTypeId,
  GeneralOptions,
  GenerationRequest,
  OccasionId,
  RequestFor,
} from '@/domain/models'

export const [MARKUS, PAARU, KAI] = DEMO_CHILDREN as [ChildProfile, ChildProfile, ChildProfile]

export function makeRequest<K extends ContentTypeId>(
  contentType: K,
  overrides: {
    children?: ChildProfile[]
    occasionId?: OccasionId
    general?: Partial<GeneralOptions>
    options?: Partial<ContentOptionsMap[K]>
    seed?: number
  } = {},
): RequestFor<K> {
  const occasionId = overrides.occasionId ?? 'everyday'
  // The texts are tested at the language suggested by age (as in older creations and in the
  // parent's "Lihtne"); new creations start rich, see defaults.spec.
  const { defaultLanguage: _rich, ...letterDefaults } = defaultOptions(occasionId).letter
  const defaults = { ...defaultOptions(occasionId), letter: letterDefaults }
  return {
    contentType,
    children: overrides.children ?? [MARKUS],
    occasionId,
    general: { ...DEFAULT_GENERAL, ...overrides.general },
    seed: overrides.seed ?? 1234,
    options: { ...defaults[contentType], ...overrides.options },
  } as GenerationRequest as RequestFor<K>
}

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

export const [RUBEN, JASPER, BRITA] = DEMO_CHILDREN as [ChildProfile, ChildProfile, ChildProfile]

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
  return {
    contentType,
    children: overrides.children ?? [RUBEN],
    occasionId,
    general: { ...DEFAULT_GENERAL, ...overrides.general },
    seed: overrides.seed ?? 1234,
    options: { ...defaultOptions(occasionId)[contentType], ...overrides.options },
  } as GenerationRequest as RequestFor<K>
}

import type { ChildProfile, GenerationRequest } from '../../domain/models'
import { DEFAULT_GENERAL, defaultOptions } from '../../domain/defaults'
import { DEMO_CHILDREN } from './children'

/** The sample child of "Vaata näidet": six years old, reads, likes riddles and comics. */
export const SAMPLE_CHILD: ChildProfile = DEMO_CHILDREN.find((child) => child.id === 'demo-jasper') ?? DEMO_CHILDREN[0]!

/** A 24-letter Christmas series for the sample child; the seed is fixed so the sample stays the same. */
export function sampleRequest(year = new Date().getFullYear()): GenerationRequest {
  return {
    contentType: 'letter',
    occasionId: 'christmas',
    children: [{ ...SAMPLE_CHILD }],
    general: { ...DEFAULT_GENERAL },
    options: { ...defaultOptions('christmas').letter, startDate: `${year}-12-01`, count: 24 },
    seed: 1201,
  }
}

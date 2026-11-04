import { describe, expect, it } from 'vitest'
import { runTemplates } from '@/domain/generators/templateGenerator'
import type { RequestFor } from '@/domain/models'
import { formatCollection } from './collectionText'
import { KAI, PAARU, makeRequest, MARKUS } from './helpers'

/**
 * Golden files: the full 72-letter family collection (and a single-child series)
 * as plain text. A change in any scenario or in the planner shows up as a diff
 * that can be read and reviewed as a whole. Update with `npx vitest run -u`.
 */
describe('golden collections', () => {
  it('Markus, Pääru and Kai: 24 letters each', async () => {
    const request = makeRequest('letter', {
      occasionId: 'christmas',
      children: [MARKUS, PAARU, KAI],
      options: { startDate: '2026-12-01', sundaySweets: true },
    }) as RequestFor<'letter'>
    await expect(formatCollection(runTemplates(request))).toMatchFileSnapshot(
      '../docs/samples/christmas-family.md',
    )
  })

  it('Pääru alone, without the story arc', async () => {
    const request = makeRequest('letter', {
      occasionId: 'christmas',
      children: [PAARU],
      options: { startDate: '2026-12-01', connected: false },
    }) as RequestFor<'letter'>
    await expect(formatCollection(runTemplates(request))).toMatchFileSnapshot(
      '../docs/samples/christmas-paaru-standalone.md',
    )
  })
})

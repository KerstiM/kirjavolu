import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { runTemplates } from '@/domain/generators/templateGenerator'
import { challengeFor, challengeSupporter, familyInstructions } from '@/domain/generators/familyEvents'
import { familyPlan, personasFor } from '@/domain/generators/linkedLetters'
import ChallengesEditor from '@/features/creation/options/ChallengesEditor.vue'
import type { ChildChallenge, GeneratedItem, RequestFor } from '@/domain/models'
import { BRITA, JASPER, makeRequest, RUBEN } from './helpers'
import { HELPER_GOSSIP, TODDLER_HELPER_GOSSIP } from '@/data/templates/gossip'
import { nameCase } from '@/domain/text/estonian'

type Item = Omit<GeneratedItem, 'id' | 'variant' | 'edited'>
const sweetsBreak: ChildChallenge = { id: 'c', childId: JASPER.id, kind: 'no-sweets', start: '2026-12-11', end: '2026-12-13', title: '' }
const family = (extra: Partial<RequestFor<'letter'>['options']> = {}) =>
  makeRequest('letter', {
    occasionId: 'christmas',
    children: [RUBEN, JASPER, BRITA],
    options: { startDate: '2026-12-01', ...extra },
  }) as RequestFor<'letter'>
const on = (items: Item[], childId: string, day: number) =>
  items.find((item) => item.childId === childId && item.date === `2026-12-${String(day).padStart(2, '0')}`)!.body

describe('child challenges', () => {
  const request = family({ challenges: [sweetsBreak], sundaySweets: true })
  const items = runTemplates(request).items

  it('invites the child on the first day and praises on the last', () => {
    expect(on(items, JASPER.id, 11)).toContain('kuni 13. detsembrini ei sööda ühtegi kommi')
    expect(on(items, JASPER.id, 13)).toContain('Hurraa, Jasper! Tugevate hammaste päevad on läbi')
  })

  it('asks the oldest sibling to support in secret on the same day', () => {
    expect(challengeSupporter(request, sweetsBreak)?.id).toBe(RUBEN.id)
    expect(on(items, RUBEN.id, 11)).toContain('Salajane palve: täna alustab Jasper kommideta päevi.')
    expect(on(items, BRITA.id, 11)).not.toContain('kommideta')
  })

  it('no Sunday sweet in the middle of sweets-free days', () => {
    expect(on(items, JASPER.id, 13)).not.toContain('sussis on üks komm')
    expect(on(items, RUBEN.id, 13)).toContain('sussis on üks komm')
  })

  it('paired sibling tasks avoid challenge days', () => {
    for (const day of familyPlan(request)) {
      for (const id of [day.giverId, day.receiverId]) expect(challengeFor(request, id, day.index)).toBeUndefined()
    }
  })

  it('toddlers get no challenges', () => {
    const toddler = family({ challenges: [{ ...sweetsBreak, childId: BRITA.id }] })
    expect(challengeFor(toddler, BRITA.id, 10)).toBeUndefined()
  })

  it('parent sheet lists the challenge and the supporter', () => {
    const steps = familyInstructions(request).find((i) => i.title === 'Väljakutsed')!.steps
    expect(steps[0]).toBe('Jasper: kommideta päevad, 11. detsember – 13. detsember. Ruben saab salajase palve teda toetada.')
  })
})

describe('helpers talk about each other', () => {
  const request = family()
  const items = runTemplates(request).items
  const personas = personasFor(request)
  // Every possible gossip sentence, rendered for each sibling, so detection is exact.
  const possible = new Map<string, string>()
  for (const sibling of [RUBEN, JASPER, BRITA]) {
    const ctx = {
      helper: personas[sibling.id]!.name,
      child: sibling.name,
      childGenitive: nameCase(sibling, 'genitive'),
      childElative: nameCase(sibling, 'elative'),
      childAllative: nameCase(sibling, 'allative'),
    }
    for (const t of [...HELPER_GOSSIP, ...TODDLER_HELPER_GOSSIP]) possible.set(t(ctx), personas[sibling.id]!.name)
  }
  const gossipOf = (childId: string) =>
    items
      .filter((item) => item.childId === childId)
      .flatMap((item) => item.body.split('\n\n'))
      .filter((p) => possible.has(p))

  it('every reader hears regularly about the siblings’ helpers, by their right names', () => {
    for (const child of [RUBEN, JASPER]) {
      const lines = gossipOf(child.id)
      expect(lines.length).toBeGreaterThanOrEqual(3)
      const own = personas[child.id]!.name
      for (const line of lines) expect(possible.get(line)).not.toBe(own)
      expect(new Set(lines.map((line) => possible.get(line))).size).toBe(2)
    }
  })

  it('no story is told twice in the family', () => {
    const all = [...gossipOf(RUBEN.id), ...gossipOf(JASPER.id)]
    expect(new Set(all).size).toBe(all.length)
  })

  it('toddler cards mention the big siblings', () => {
    const brita = items.filter((item) => item.childId === BRITA.id).map((item) => item.body)
    expect(brita.filter((b) => b.includes('Ruben') && b.includes('Jasper')).length).toBeGreaterThanOrEqual(3)
    expect(brita.some((b) => /ja Jasper ja/.test(b))).toBe(false)
  })
})

describe('challenges editor', () => {
  it('adds a sweets-free challenge for a reader, not for the toddler', async () => {
    const user = userEvent.setup()
    const { emitted } = render(ChallengesEditor, {
      props: { children: [RUBEN, JASPER, BRITA], startDate: '2026-12-01', count: 24, modelValue: [] },
    })
    await user.click(screen.getByRole('button', { name: /Lisa väljakutse/ }))
    const added = (emitted()['update:modelValue']!.at(-1) as [ChildChallenge[]])[0]
    expect(added[0]).toMatchObject({ childId: JASPER.id, kind: 'no-sweets', start: '2026-12-11', end: '2026-12-13' })
    expect(screen.queryByRole('option', { name: 'Brita' })).toBeNull()
  })
})

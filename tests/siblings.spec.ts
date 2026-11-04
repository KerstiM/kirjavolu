import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { runTemplates } from '@/domain/generators/templateGenerator'
import { challengeFor, challengeSupporter, familyInstructions } from '@/domain/generators/familyEvents'
import { familyPlan, personasFor } from '@/domain/generators/linkedLetters'
import ChallengesEditor from '@/features/creation/options/ChallengesEditor.vue'
import type { ChildChallenge, GeneratedItem, RequestFor } from '@/domain/models'
import { KAI, PAARU, makeRequest, MARKUS } from './helpers'

type Item = Omit<GeneratedItem, 'id' | 'variant' | 'edited'>
const sweetsBreak: ChildChallenge = { id: 'c', childId: PAARU.id, kind: 'no-sweets', start: '2026-12-11', end: '2026-12-13', title: '' }
const family = (extra: Partial<RequestFor<'letter'>['options']> = {}) =>
  makeRequest('letter', {
    occasionId: 'christmas',
    children: [MARKUS, PAARU, KAI],
    options: { startDate: '2026-12-01', ...extra },
  }) as RequestFor<'letter'>
const on = (items: Item[], childId: string, day: number) =>
  items.find((item) => item.childId === childId && item.date === `2026-12-${String(day).padStart(2, '0')}`)!.body

describe('child challenges', () => {
  const request = family({ challenges: [sweetsBreak], sundaySweets: true })
  const items = runTemplates(request).items

  it('invites the child on the first day and praises on the last', () => {
    expect(on(items, PAARU.id, 11)).toContain('kuni 13. detsembrini ei sööda ühtegi kommi')
    expect(on(items, PAARU.id, 13)).toContain('Hurraa, Pääru! Tugevate hammaste päevad on läbi')
  })

  it('asks the oldest sibling to support in secret on the same day', () => {
    expect(challengeSupporter(request, sweetsBreak)?.id).toBe(MARKUS.id)
    expect(on(items, MARKUS.id, 11)).toContain('Salajane palve: täna alustab Pääru kommideta päevi.')
    expect(on(items, KAI.id, 11)).not.toContain('kommideta')
  })

  it('no Sunday sweet in the middle of sweets-free days', () => {
    expect(on(items, PAARU.id, 13)).not.toContain('sussis on üks komm')
    expect(on(items, MARKUS.id, 13)).toContain('sussis on üks komm')
  })

  it('paired sibling tasks avoid challenge days', () => {
    for (const day of familyPlan(request)) {
      for (const id of [day.giverId, day.receiverId]) expect(challengeFor(request, id, day.index)).toBeUndefined()
    }
  })

  it('toddlers get no challenges', () => {
    const toddler = family({ challenges: [{ ...sweetsBreak, childId: KAI.id }] })
    expect(challengeFor(toddler, KAI.id, 10)).toBeUndefined()
  })

  it('parent sheet lists the challenge and the supporter', () => {
    const steps = familyInstructions(request).find((i) => i.title === 'Väljakutsed')!.steps
    expect(steps[0]).toBe('Pääru: kommideta päevad, 11. detsember – 13. detsember. Markus saab salajase palve teda toetada.')
  })
})

describe('helpers know each other', () => {
  const request = family()
  const items = runTemplates(request).items
  const personas = personasFor(request)
  const others = (childId: string) => [MARKUS, PAARU, KAI].filter((c) => c.id !== childId).map((c) => personas[c.id]!.name)
  const storiesWith = (childId: string) =>
    items
      .filter((item) => item.childId === childId)
      .slice(1)
      .filter((item) => others(childId).some((name) => item.body.includes(name)))

  it('every reader regularly meets the siblings’ helpers inside the stories, by their right names', () => {
    for (const child of [MARKUS, PAARU]) expect(storiesWith(child.id).length).toBeGreaterThanOrEqual(3)
  })

  it('toddler cards mention the big siblings', () => {
    const kai = items.filter((item) => item.childId === KAI.id).map((item) => item.body)
    expect(kai.filter((b) => b.includes('Markus') && b.includes('Pääru')).length).toBeGreaterThanOrEqual(3)
    expect(kai.some((b) => /ja Pääru ja/.test(b))).toBe(false)
  })
})

describe('challenges editor', () => {
  it('adds a sweets-free challenge for a reader, not for the toddler', async () => {
    const user = userEvent.setup()
    const { emitted } = render(ChallengesEditor, {
      props: { children: [MARKUS, PAARU, KAI], startDate: '2026-12-01', count: 24, modelValue: [] },
    })
    await user.click(screen.getByRole('button', { name: /Lisa väljakutse/ }))
    const added = (emitted()['update:modelValue']!.at(-1) as [ChildChallenge[]])[0]
    expect(added[0]).toMatchObject({ childId: PAARU.id, kind: 'no-sweets', start: '2026-12-11', end: '2026-12-13' })
    expect(screen.queryByRole('option', { name: 'Kai' })).toBeNull()
  })
})

describe('helper stories are kind and clear', () => {
  const items = runTemplates(family()).items

  it('never compare the children: no sibling is praised in another child’s letter', () => {
    for (const child of [MARKUS, PAARU, KAI]) {
      const siblings = [MARKUS, PAARU, KAI].filter((c) => c.id !== child.id).map((c) => c.name)
      for (const item of items.filter((i) => i.childId === child.id)) {
        for (const name of siblings) expect(item.body).not.toMatch(new RegExp(`${name}[^.!?]*(tubli|parem kui|rohkem kui sina)`))
      }
    }
  })
})

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { runTemplates } from '@/domain/generators/templateGenerator'
import { familyPlan } from '@/domain/generators/linkedLetters'
import { planCollection } from '@/domain/story/planner'
import { CHRISTMAS_LIBRARY } from '@/domain/story/library'
import ParentSheet from '@/features/preview/ParentSheet.vue'
import type { GeneratedContent, GeneratedItem, RequestFor } from '@/domain/models'
import { BRITA, JASPER, makeRequest, RUBEN } from './helpers'

const family = (extra: Partial<RequestFor<'letter'>['options']> = {}) =>
  makeRequest('letter', {
    occasionId: 'christmas',
    children: [RUBEN, JASPER, BRITA],
    options: { startDate: '2026-12-01', ...extra },
  }) as RequestFor<'letter'>

type Item = Omit<GeneratedItem, 'id' | 'variant' | 'edited'>
const series = (items: Item[], childId: string) => items.filter((item) => item.childId === childId)

describe('question today, answer tomorrow', () => {
  const items = runTemplates(family()).items

  it('every puzzle is answered in a postscript of the next letter, without assuming a reply', () => {
    for (const child of [RUBEN, JASPER]) {
      const letters = series(items, child.id)
      const asked = letters.map((item, i) => ({ item, i })).filter(({ item }) => item.answer)
      expect(asked.length).toBeGreaterThanOrEqual(2)
      for (const { i } of asked) {
        const ps = letters[i + 1]!.body.split('\n\n').find((p) => p.startsWith('P.S.'))
        expect(ps).toBeDefined()
        expect(ps).not.toMatch(/Aitäh vastuse|Lugesin su vastust|nägin/)
      }
    }
  })

  it('never asks on the last day', () => {
    for (const child of [RUBEN, JASPER]) expect(series(items, child.id).at(-1)!.answer).toBeUndefined()
  })

  it('toddlers get no questions', () => {
    expect(series(items, BRITA.id).some((item) => item.answer)).toBe(false)
  })

  it('siblings do not get the same puzzle', () => {
    const answers = (id: string) => series(items, id).flatMap((item) => (item.answer ? [item.answer] : []))
    const ruben = new Set(answers(RUBEN.id))
    expect(answers(JASPER.id).filter((a) => ruben.has(a))).toEqual([])
  })

  it('experiments tell the parent what to prepare', () => {
    const experiments = [RUBEN, JASPER].flatMap((c) => series(items, c.id)).filter((item) => item.body.includes('jääkuubikut'))
    for (const item of experiments) expect(item.parentNote).toMatch(/^Valmista ette: /)
  })
})

describe('secret helper', () => {
  const request = family()
  const plan = planCollection(request, CHRISTMAS_LIBRARY)
  const ruben = series(runTemplates(request).items, RUBEN.id)

  it('invites the oldest child and explains the rules in the same letter', () => {
    const invite = plan.secret!.inviteIndex
    expect(ruben[invite]!.body).toContain('Igal aastal valime ühe salajase abilise')
    expect(ruben[invite]!.body).toContain('eriti mitte Jasper ja Brita')
  })

  it('does not wait for an answer: agreeing means keeping the secret', () => {
    const invite = plan.secret!.inviteIndex
    expect(ruben[invite]!.body).toContain('ei pea sa midagi vastama')
    expect(ruben[invite + 1]!.body).not.toMatch(/Suurepärane|ma teadsin, et võin sinu peale loota/)
  })

  it('gives secret missions on free days and the title in the last letter', () => {
    expect(plan.secret!.missionIndexes).toHaveLength(3)
    expect(ruben.filter((item) => item.body.includes('Salamissioon:'))).toHaveLength(3)
    expect(ruben[23]!.body).toContain('nimetan su ametlikult päkapikkude abiliseks 2026')
  })

  it('the younger siblings never hear about it', () => {
    const others = [JASPER, BRITA].flatMap((c) => series(runTemplates(request).items, c.id))
    expect(others.some((item) => /Salamissioon|salajane abiline/.test(item.body))).toBe(false)
  })

  it('needs a younger sibling, Christmas and a long series', () => {
    const plans = (r: RequestFor<'letter'>) => planCollection(r, CHRISTMAS_LIBRARY).secret
    expect(plans(family({ count: 7 }))).toBeUndefined()
    const onlyRuben = makeRequest('letter', { occasionId: 'christmas', children: [RUBEN] }) as RequestFor<'letter'>
    expect(plans(onlyRuben)).toBeUndefined()
    const pair = makeRequest('letter', { occasionId: 'christmas', children: [JASPER, BRITA], options: { startDate: '2026-12-01' } }) as RequestFor<'letter'>
    expect(plans(pair)?.childId).toBe(JASPER.id)
  })

  it('avoids the oldest child’s family events', () => {
    const busy = family({ events: [{ id: 'e', date: '2026-12-02', kind: 'hobby', title: 'trenn', participants: [RUBEN.id] }] })
    expect(planCollection(busy, CHRISTMAS_LIBRARY).secret!.inviteIndex).toBeGreaterThan(1)
  })
})

describe('daily preparation for the parent', () => {
  it('lists preparation per child and day on the parent sheet', () => {
    const request = family({ sundaySweets: true })
    const result = runTemplates(request)
    const items = result.items.map((item, i) => ({ ...item, id: `x${i}`, variant: 0, edited: false })) as GeneratedItem[]
    const content = { id: 'c', title: 't', subtitle: 's', createdAt: '', request, items, instructions: result.instructions, layout: 'poster', generator: { id: 'g', label: 'l' } } as GeneratedContent
    render(ParentSheet, { props: { content } })
    expect(screen.getByText('Vastused ja ettevalmistus')).toBeInTheDocument()
    expect(screen.getAllByText('Ruben · 6. detsember 2026').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Valmista ette: komm sussi').length).toBe(9)
    expect(screen.getByText('Ruben on salajane abiline')).toBeInTheDocument()
  })

  it('a book is prepared for the read-aloud day', () => {
    const result = runTemplates(family())
    const read = familyPlan(family()).find((d) => d.template.id === 'read')
    if (read) {
      const giver = series(result.items, read.giverId)[read.index]!
      expect(giver.parentNote).toContain('raamat, mida')
    }
  })
})

describe('poster map on the parent sheet', () => {
  it('shows one child’s poster, not all cards of the family', () => {
    const request = family()
    const result = runTemplates(request)
    const items = result.items.map((item, i) => ({ ...item, id: `y${i}`, variant: 0, edited: false })) as GeneratedItem[]
    const content = { id: 'c', title: 't', subtitle: 's', createdAt: '', request, items, instructions: result.instructions, layout: 'poster', generator: { id: 'g', label: 'l' } } as GeneratedContent
    const labels = Array.from({ length: 24 }, (_, i) => `${i + 1}. detsember`)
    render(ParentSheet, { props: { content, posterLabels: labels } })
    expect(document.querySelectorAll('.map td')).toHaveLength(24)
  })
})

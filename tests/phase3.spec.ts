import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { runTemplates } from '@/domain/generators/templateGenerator'
import { familyPlan, planHelperArc } from '@/domain/generators/linkedLetters'
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

  it('every question is answered in the next letter', () => {
    for (const child of [RUBEN, JASPER]) {
      const letters = series(items, child.id)
      const asked = letters.map((item, i) => ({ item, i })).filter(({ item }) => item.answer)
      expect(asked.length).toBeGreaterThanOrEqual(3)
      for (const { item, i } of asked) {
        const next = letters[i + 1]!.body
        expect(next).toMatch(/^(Eilse|Aitäh vastuse|Lugesin su vastust)/)
        if (item.body.includes('Mõistatus:')) expect(next).toContain(`vastus oli: ${item.answer}`)
      }
    }
  })

  it('never asks on the last day or on days with a sibling task', () => {
    const plan = familyPlan(family())
    for (const child of [RUBEN, JASPER]) {
      const letters = series(items, child.id)
      expect(letters.at(-1)!.answer).toBeUndefined()
      expect(letters.at(-2)!.answer).toBeUndefined()
      for (const day of plan.filter((d) => d.giverId === child.id || d.receiverId === child.id)) {
        expect(letters[day.index]!.answer).toBeUndefined()
      }
    }
  })

  it('toddlers get no questions', () => {
    expect(series(items, BRITA.id).some((item) => item.answer)).toBe(false)
  })

  it('siblings do not get the same riddle', () => {
    const answers = (id: string) => series(items, id).flatMap((item) => (item.body.includes('Mõistatus:') ? [item.answer] : []))
    const ruben = new Set(answers(RUBEN.id))
    expect(answers(JASPER.id).filter((a) => ruben.has(a))).toEqual([])
  })

  it('experiments tell the parent what to prepare', () => {
    const experiments = [RUBEN, JASPER].flatMap((c) => series(items, c.id)).filter((item) => item.body.includes('Teaduskatse:'))
    expect(experiments.length).toBeGreaterThan(0)
    for (const item of experiments) expect(item.parentNote).toMatch(/^Valmista ette: /)
  })
})

describe('secret helper', () => {
  const request = family()
  const arc = planHelperArc(request, familyPlan(request), RUBEN)!
  const ruben = series(runTemplates(request).items, RUBEN.id)

  it('invites the oldest child and explains the rule the next day', () => {
    const invite = [...arc.days.keys()].sort((a, b) => a - b)[0]!
    expect(ruben[invite]!.body).toContain('Kas sa oleksid sel aastal meie salajane abiline?')
    expect(ruben[invite + 1]!.body).toContain('eriti mitte Jasper ja Brita')
  })

  it('the reply to the invitation opens the next letter, so the child connects it', () => {
    const invite = [...arc.days.keys()].sort((a, b) => a - b)[0]!
    const next = ruben[invite + 1]!.body
    expect(next.startsWith('Suurepärane – ma teadsin, et võin sinu peale loota!')).toBe(true)
    // One or two things on that card: the reply and a short story part, no extra task.
    expect(next).not.toMatch(/Tänane ülesanne|Päkapikuülesanne/)
  })

  it('gives secret missions on free days and the title in the last letter', () => {
    expect(arc.days.size).toBe(5)
    expect(ruben.filter((item) => item.body.includes('Salamissioon:'))).toHaveLength(3)
    expect(ruben[23]!.body).toContain('nimetan su ametlikult päkapikkude abiliseks 2026')
  })

  it('the younger siblings never hear about it', () => {
    const others = [JASPER, BRITA].flatMap((c) => series(runTemplates(request).items, c.id))
    expect(others.some((item) => /Salamissioon|salajane abiline/.test(item.body))).toBe(false)
  })

  it('needs a younger sibling and Christmas', () => {
    expect(planHelperArc(family(), [], JASPER)).not.toBeNull()
    const onlyRuben = makeRequest('letter', { occasionId: 'christmas', children: [RUBEN] }) as RequestFor<'letter'>
    expect(planHelperArc(onlyRuben, [], RUBEN)).toBeNull()
    const easter = makeRequest('letter', { occasionId: 'easter', children: [RUBEN, JASPER] }) as RequestFor<'letter'>
    expect(planHelperArc(easter, [], RUBEN)).toBeNull()
  })

  it('avoids the oldest child’s family events', () => {
    const busy = family({ events: [{ id: 'e', date: '2026-12-02', kind: 'hobby', title: 'trenn', participants: [RUBEN.id] }] })
    const shifted = planHelperArc(busy, familyPlan(busy), RUBEN)!
    expect(Math.min(...shifted.days.keys())).toBeGreaterThan(1)
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

describe('story replies', () => {
  it('the reply to the sign the child left comes the very next day, first', () => {
    for (const count of [7, 24] as const) {
      for (let seed = 1; seed < 6; seed++) {
        const items = runTemplates(
          makeRequest('letter', { seed, occasionId: 'christmas', children: [RUBEN], options: { count, connected: true } }),
        ).items
        const ask = items.findIndex((item) => item.body.includes('joonista paberile täht ja jäta see aknalauale'))
        expect(ask).toBeGreaterThan(-1)
        expect(items[ask + 1]!.body.startsWith('Ma nägin sinu märki!')).toBe(true)
        expect(items.filter((item) => item.body.includes('Ma nägin sinu märki!'))).toHaveLength(1)
      }
    }
  })
})

import { describe, expect, it } from 'vitest'
import { CHRISTMAS_LIBRARY } from '@/domain/story/library'
import { planCollection } from '@/domain/story/planner'
import { renderPlan } from '@/domain/story/render'
import { CARD_LIMITS, validateCollection } from '@/domain/story/validate'
import { findVariant, runTemplates } from '@/domain/generators/templateGenerator'
import type { ChildProfile, RequestFor } from '@/domain/models'
import { KAI, MARKUS, PAARU, makeRequest } from './helpers'

const library = CHRISTMAS_LIBRARY

function christmas(
  children: ChildProfile[],
  extra: Partial<RequestFor<'letter'>['options']> = {},
  general: Partial<RequestFor<'letter'>['general']> = {},
): RequestFor<'letter'> {
  return makeRequest('letter', {
    seed: 1234,
    occasionId: 'christmas',
    children,
    general,
    options: { startDate: '2026-12-01', ...extra },
  }) as RequestFor<'letter'>
}

const stagesOf = (request: RequestFor<'letter'>, child: ChildProfile) =>
  planCollection(request, library)
    .days.filter((d) => d.childId === child.id && d.content.kind === 'scenario')
    .map((d) => (d.content.kind === 'scenario' ? d.content.stageId : undefined))
    .filter(Boolean)

describe('a change for one child leaves the others alone', () => {
  it('another child choosing richer language keeps everyone’s story arc', () => {
    const family = [KAI, PAARU, MARKUS]
    for (const count of [24, 7]) {
      const base = christmas(family, { count })
      for (const child of family) {
        for (const other of family.filter((c) => c.id !== child.id)) {
          const changed = christmas(family, { count, language: { [other.id]: 'rich' } })
          const before = stagesOf(base, child)
          const after = stagesOf(changed, child)
          expect(after.length, `${child.name} after ${other.name} → rich (${count})`).toBe(before.length)
          expect(before.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('renders', () => {
    const request = christmas([KAI, PAARU], { count: 24, language: { [KAI.id]: 'rich' } })
    const plan = planCollection(request, library)
    expect(renderPlan(plan, library, request).length).toBe(48)
  })
})

describe('every story gets its ending', () => {
  it('the lost star is back by the farewell for every band, length and series size', () => {
    for (const child of [KAI, PAARU, MARKUS]) {
      for (const language of ['simple', 'rich'] as const) {
        for (const length of ['short', 'long'] as const) {
          for (const count of [7, 12, 24]) {
            const request = christmas([child], { count, language: { [child.id]: language } }, { length })
            const plan = planCollection(request, library)
            const label = `${child.name} ${language} ${length} ${count}`
            expect(plan.facts.has('star-lost'), label).toBe(true)
            expect(plan.facts.has('star-back'), label).toBe(true)
          }
        }
      }
    }
  })
})

describe('the tooth fairy letter is one story', () => {
  const tooth = (children: ChildProfile[], seed = 1234) =>
    makeRequest('letter', { occasionId: 'lost-tooth', children, seed })

  it('tells one event and ties the task to it', () => {
    const body = runTemplates(tooth([PAARU])).items[0]!.body
    // The introduction, three story paragraphs and one task: no stray mood or filler paragraphs.
    expect(body.split('\n\n')).toHaveLength(5)
    expect(body.match(/ülesanne/g)).toHaveLength(1)
    expect(body.match(/Tere/g)).toHaveLength(1)
  })

  it('uses the child’s topic as the reason for the story', () => {
    const builder = { ...MARKUS, topics: ['lego'], topicNotes: {} } as ChildProfile
    const bodies = new Set<string>()
    for (let seed = 1; seed <= 40; seed++) bodies.add(runTemplates(tooth([builder], seed)).items[0]!.body)
    expect([...bodies].some((body) => /klotsidest/.test(body))).toBe(true)
  })

  it('"Uus variant" gives another letter', () => {
    const request = tooth([PAARU])
    const result = runTemplates(request)
    const content = { request, items: result.items.map((item) => ({ ...item, id: 'a', variant: 0, edited: false })) }
    const next = findVariant(content, 0)
    expect(next).not.toBeNull()
    expect(next!.body).not.toBe(content.items[0]!.body)
  })
})

describe('what is made by default fits its print format', () => {
  it('toddler mini cards stay within the measured card size, in every series and seed', () => {
    for (const count of [7, 12, 24]) {
      for (let seed = 1; seed <= 12; seed++) {
        const request = makeRequest('letter', {
          seed,
          occasionId: 'christmas',
          children: [KAI, PAARU, MARKUS],
          general: { length: 'short' },
          options: { startDate: '2026-12-01', count },
        }) as RequestFor<'letter'>
        const plan = planCollection(request, library)
        const items = renderPlan(plan, library, request)
        const issues = validateCollection(plan, items, library)
        expect(issues.filter((i) => i.severity === 'error'), `${count}/${seed}`).toEqual([])
        plan.days.forEach((d, k) => {
          if (d.childId === KAI.id) expect(items[k]!.body.length, `${count}/${seed}/${k}`).toBeLessThanOrEqual(CARD_LIMITS.toddler)
        })
      }
    }
  })
})

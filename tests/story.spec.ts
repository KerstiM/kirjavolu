import { describe, expect, it } from 'vitest'
import { runTemplates } from '@/domain/generators/templateGenerator'
import { CHRISTMAS_LIBRARY, scenarioIn } from '@/domain/story/library'
import { planCollection, type CollectionPlan } from '@/domain/story/planner'
import { renderPlan } from '@/domain/story/render'
import { usesScenarioEngine } from '@/domain/story/scenarioLetters'
import { profileHooks } from '@/domain/story/hooks'
import { CARD_HARD_LIMITS, validateCollection, validateLibrary } from '@/domain/story/validate'
import { STAR_ARC } from '@/data/scenarios/christmas/starArc'
import type { ChildProfile, RequestFor } from '@/domain/models'
import type { DraftItem } from '@/domain/generators/context'
import { BRITA, JASPER, makeRequest, RUBEN } from './helpers'

const library = CHRISTMAS_LIBRARY

function christmas(
  children: ChildProfile[],
  extra: Partial<RequestFor<'letter'>['options']> = {},
  seed = 1234,
  general: Partial<RequestFor<'letter'>['general']> = {},
): RequestFor<'letter'> {
  return makeRequest('letter', {
    seed,
    occasionId: 'christmas',
    children,
    general,
    options: { startDate: '2026-12-01', ...extra },
  }) as RequestFor<'letter'>
}

function build(request: RequestFor<'letter'>): { plan: CollectionPlan; items: DraftItem[] } {
  const plan = planCollection(request, library)
  return { plan, items: renderPlan(plan, library, request) }
}

const daysOf = (plan: CollectionPlan, child: ChildProfile) =>
  plan.days.filter((d) => d.childId === child.id)
const scenarioIds = (plan: CollectionPlan, child: ChildProfile) =>
  daysOf(plan, child).flatMap((d) => (d.content.kind === 'scenario' ? [d.content.scenarioId] : []))
const bodies = (items: DraftItem[], child: ChildProfile, linked = true) =>
  items.filter((item) => !linked || item.childId === child.id).map((item) => item.body)

const FAMILIES = [
  [RUBEN, JASPER, BRITA],
  [RUBEN],
  [JASPER],
  [BRITA],
  [RUBEN, JASPER],
  [JASPER, BRITA],
]

describe('scenario library', () => {
  it('passes the authoring checks (ids, hooks, lengths, puzzles, arc)', () => {
    expect(validateLibrary(library)).toEqual([])
  })

  it('has enough complete episodes for a 24-day series in every age band', () => {
    for (const band of ['older', 'young', 'toddler'] as const) {
      const standalone = library.scenarios.filter(
        (s) => s.role === 'standalone' && s.variants[band] && !s.onlyWithHook && !s.needsSiblings,
      )
      expect(standalone.length, band).toBeGreaterThanOrEqual(22)
    }
  })
})

describe('engine selection', () => {
  it('writes Christmas daily series; single letters and shared letters keep the older generator', () => {
    expect(usesScenarioEngine(christmas([RUBEN]))).toBe(true)
    expect(usesScenarioEngine(christmas([RUBEN, JASPER], { mode: 'linked' }))).toBe(true)
    expect(usesScenarioEngine(christmas([RUBEN, JASPER], { mode: 'shared' }))).toBe(false)
    expect(usesScenarioEngine(christmas([RUBEN], { count: 3 }))).toBe(false)
    expect(
      usesScenarioEngine(makeRequest('letter', { occasionId: 'easter', options: { count: 7 } })),
    ).toBe(false)
  })
})

describe('collection validation', () => {
  it('finds no errors in many generated collections', { timeout: 60_000 }, () => {
    for (let seed = 1; seed <= 8; seed++) {
      for (const children of FAMILIES) {
        for (const connected of [true, false]) {
          for (const count of [7, 24] as const) {
            const request = christmas(
              children,
              { connected, count, sundaySweets: seed % 2 === 0 },
              seed,
            )
            const { plan, items } = build(request)
            const errors = validateCollection(plan, items, library).filter(
              (issue) => issue.severity === 'error',
            )
            expect(
              errors,
              `${children.map((c) => c.name)} seed ${seed} ${count} ${connected}`,
            ).toEqual([])
          }
        }
      }
    }
  })

  it('detects a repeated scenario, a leaked secret and an assumed reply', () => {
    const request = christmas([RUBEN, JASPER, BRITA])
    const { plan, items } = build(request)
    const jasper = plan.days.findIndex((d) => d.childId === JASPER.id && d.index === 10)
    const broken = items.map((item, k) =>
      k === jasper
        ? { ...item, body: `${item.body}\n\nAitäh vastuse eest! Salamissioon ootab.` }
        : item,
    )
    const codes = validateCollection(plan, broken, library).map((issue) => issue.code)
    expect(codes).toContain('assumed-response')
    expect(codes).toContain('secret-leak')

    const twice = { ...plan, days: plan.days.map((d) => ({ ...d })) }
    const rubenDays = twice.days.filter(
      (d) => d.childId === RUBEN.id && d.content.kind === 'scenario' && !d.content.stageId,
    )
    const [first, second] = rubenDays.slice(1, 3)
    if (
      first &&
      second &&
      first.content.kind === 'scenario' &&
      second.content.kind === 'scenario'
    ) {
      second.content = { ...second.content, scenarioId: first.content.scenarioId }
    }
    expect(
      validateCollection(twice, renderPlan(twice, library, request), library).map((i) => i.code),
    ).toContain('duplicate-scenario')
  })
})

describe('reproducibility', () => {
  it('the same input and seed give the same letters; another seed gives others', () => {
    const a = runTemplates(christmas([RUBEN, JASPER, BRITA], {}, 7)).items.map((i) => i.body)
    const b = runTemplates(christmas([RUBEN, JASPER, BRITA], {}, 7)).items.map((i) => i.body)
    const c = runTemplates(christmas([RUBEN, JASPER, BRITA], {}, 8)).items.map((i) => i.body)
    expect(a).toEqual(b)
    expect(c).not.toEqual(a)
  })

  it('regenerating one day changes only that day’s scenario choice', () => {
    const request = christmas([JASPER], { connected: false })
    const base = planCollection(request, library)
    const variants = Array.from({ length: 24 }, (_, i) => (i === 9 ? 1 : 0))
    const changed = planCollection(request, library, variants)
    const pick = (plan: CollectionPlan, i: number) =>
      (plan.days[i]?.content as { scenarioId: string }).scenarioId
    expect(pick(changed, 9)).not.toBe(pick(base, 9))
    for (let i = 0; i < 9; i++) expect(pick(changed, i)).toBe(pick(base, i))
  })
})

describe('collection planning', () => {
  const request = christmas([RUBEN, JASPER, BRITA], { sundaySweets: true })
  const { plan, items } = build(request)

  it('plans every day for every child, framed by an introduction and a farewell', () => {
    for (const child of [RUBEN, JASPER, BRITA]) {
      const days = daysOf(plan, child)
      expect(days.map((d) => d.index)).toEqual(Array.from({ length: 24 }, (_, i) => i))
      expect(scenarioIds(plan, child)[0]).toBe('introduction')
      expect(scenarioIds(plan, child).at(-1)).toBe('farewell')
    }
    expect(items).toHaveLength(72)
  })

  it('each letter has one focus: no scenario twice for a child, siblings get different episodes', () => {
    for (const child of [RUBEN, JASPER, BRITA]) {
      const ids = scenarioIds(plan, child)
      expect(new Set(ids).size).toBe(ids.length)
    }
    const shared = (a: ChildProfile, b: ChildProfile) => {
      const theirs = new Set(scenarioIds(plan, b))
      return scenarioIds(plan, a).filter(
        (id) =>
          theirs.has(id) &&
          !scenarioIn(library, id).world &&
          scenarioIn(library, id).role === 'standalone',
      )
    }
    expect(shared(RUBEN, JASPER)).toEqual([])
  })

  it('alternates plot, standalone episodes, family days and activities instead of one long mystery', () => {
    const ruben = daysOf(plan, RUBEN)
    const stages = ruben.filter((d) => d.content.kind === 'scenario' && d.content.stageId)
    const standalone = ruben.filter(
      (d) =>
        d.content.kind === 'scenario' &&
        scenarioIn(library, d.content.scenarioId).role === 'standalone',
    )
    expect(stages.length).toBeGreaterThanOrEqual(5)
    expect(stages.length).toBeLessThanOrEqual(10)
    expect(standalone.length).toBeGreaterThanOrEqual(5)
    // Not every letter has a task.
    const withActivity = ruben.filter((d) => d.content.kind === 'scenario' && d.content.activity)
    expect(withActivity.length).toBeLessThan(ruben.length / 2)
  })

  it('length "short" leaves optional activities out, "long" offers them more often', () => {
    const activities = (length: 'short' | 'medium' | 'long') =>
      planCollection(christmas([JASPER], { connected: false }, 3, { length }), library).days.filter(
        (d) =>
          d.content.kind === 'scenario' &&
          d.content.activity &&
          !scenarioIn(library, d.content.scenarioId).activities?.young?.essential,
      ).length
    expect(activities('short')).toBe(0)
    expect(activities('long')).toBeGreaterThanOrEqual(activities('medium'))
  })
})

describe('age and reading level', () => {
  it('uses the child’s band: older reader, young reader, read-aloud toddler', () => {
    const { plan } = build(christmas([RUBEN, JASPER, BRITA]))
    expect(plan.children.map((p) => p.band)).toEqual(['older', 'young', 'toddler'])
  })

  it('a six-year-old who reads advanced texts can be moved up with the difficulty setting', () => {
    const { plan } = build(christmas([JASPER], {}, 1, { difficulty: 'harder' }))
    expect(plan.children[0]!.band).toBe('older')
  })

  it('toddler cards are one short paragraph meant for reading aloud; reader cards fit the poster', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const { plan, items } = build(christmas([RUBEN, JASPER, BRITA], { sundaySweets: true }, seed))
      plan.days.forEach((d, k) => {
        const band = plan.children.find((p) => p.child.id === d.childId)!.band
        const body = items[k]!.body
        expect(body.length, body).toBeLessThanOrEqual(CARD_HARD_LIMITS[band])
        if (band === 'toddler') expect(body.split('\n\n')).toHaveLength(1)
      })
    }
  })
})

describe('personalization', () => {
  it('reads hooks from the profile only', () => {
    expect([...profileHooks(RUBEN)].sort()).toEqual(['codes', 'comics', 'riddles', 'rubik'])
    expect([...profileHooks(JASPER)].sort()).toEqual(['comics', 'porridge', 'riddles'])
    expect([...profileHooks(BRITA)]).toEqual(['peppa'])
  })

  it('mixes personal and purely fictional letters, and never overuses one interest', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const { plan } = build(christmas([RUBEN, JASPER, BRITA], {}, seed))
      for (const child of [RUBEN, JASPER]) {
        const days = daysOf(plan, child)
        const personal = days.filter((d) => d.personalizationIds.length > 0)
        expect(personal.length, child.name).toBeGreaterThanOrEqual(2)
        expect(personal.length, child.name).toBeLessThanOrEqual(10)
        const byHook = new Map<string, number[]>()
        for (const d of personal)
          for (const hook of d.personalizationIds)
            byHook.set(hook, [...(byHook.get(hook) ?? []), d.index])
        for (const [hook, uses] of byHook) {
          expect(uses.length, hook).toBeLessThanOrEqual(2)
          if (uses.length === 2) expect(uses[1]! - uses[0]!).toBeGreaterThanOrEqual(5)
        }
      }
    }
  })

  it('weaves the interest into the event instead of a standalone remark', () => {
    const { items } = build(christmas([RUBEN, JASPER, BRITA]))
    const all = items.map((i) => i.body).join('\n')
    expect(all).not.toMatch(/Kuulsin, et (sulle|sa)|Kuulsin sinu lemmikust/)
  })

  it('a child without the interest never hears about it', () => {
    const plain: ChildProfile = {
      ...JASPER,
      id: 'plain',
      name: 'Mia',
      favorites: [],
      foods: [],
      interests: [],
      details: '',
    }
    const { items } = build(christmas([plain], { connected: false }))
    const text = items.map((i) => i.body).join('\n')
    expect(text).not.toMatch(/riisipu|Miki Hiir|mõistatusesõber/i)
  })
})

describe('story arc and continuity', () => {
  it('stages follow the arc order and the mystery ends before the farewell', () => {
    for (let seed = 1; seed <= 10; seed++) {
      for (const count of [7, 24] as const) {
        const { plan } = build(christmas([RUBEN, JASPER, BRITA], { count }, seed))
        const order = STAR_ARC.stages.map((s) => s.id)
        for (const child of [RUBEN, JASPER, BRITA]) {
          const stages = daysOf(plan, child).flatMap((d) =>
            d.content.kind === 'scenario' && d.content.stageId
              ? [order.indexOf(d.content.stageId)]
              : [],
          )
          expect(stages).toEqual([...stages].sort((a, b) => a - b))
          expect(stages[0]).toBe(0)
          expect(stages).toContain(order.indexOf('found'))
        }
        expect(plan.facts.get('star-found')).toBeLessThan(count - 1)
      }
    }
  })

  it('nothing says the star is still missing once it is found', () => {
    const { plan, items } = build(christmas([RUBEN, JASPER, BRITA]))
    const found = plan.facts.get('star-found')!
    plan.days.forEach((d, k) => {
      if (d.index > found)
        expect(items[k]!.body).not.toMatch(/on kadunud|otsime|otsivad|Varsti läheme/)
    })
  })

  it('the farewell mentions the returned star only to a child who heard the story', () => {
    const story = runTemplates(christmas([RUBEN])).items.at(-1)!.body
    const none = runTemplates(christmas([RUBEN], { connected: false })).items.at(-1)!.body
    expect(story).toContain('Täht särab jälle')
    expect(none).not.toContain('Täht')
    expect(
      runTemplates(christmas([RUBEN], { connected: false }))
        .items.map((i) => i.body)
        .join(' '),
    ).not.toMatch(/täht on kadunud/i)
  })
})

describe('shared world for siblings', () => {
  const { plan, items } = build(christmas([RUBEN, JASPER, BRITA]))

  it('a shared event happens on one day and every child hears it from their own helper', () => {
    const shared = plan.worldEvents.filter((e) => e.childIds.length > 1)
    expect(shared.length).toBeGreaterThanOrEqual(3)
    for (const event of shared) {
      const texts = event.childIds.map(
        (id) =>
          items[plan.days.findIndex((d) => d.childId === id && d.index === event.index)]!.body,
      )
      expect(new Set(texts).size).toBe(texts.length)
      for (const id of event.childIds) {
        const d = plan.days.find((day) => day.childId === id && day.index === event.index)!
        expect(d.content.kind === 'scenario' && d.content.scenarioId).toBe(event.scenarioId)
      }
    }
  })

  it('all three children follow the star story, each from their own side', () => {
    const story = (child: ChildProfile) =>
      bodies(items, child).filter((b) => /täht|Täht/.test(b)).length
    expect(story(RUBEN)).toBeGreaterThanOrEqual(5)
    expect(story(JASPER)).toBeGreaterThanOrEqual(4)
    expect(story(BRITA)).toBeGreaterThanOrEqual(2)
    const found = plan.facts.get('star-found')!
    const onDay = (child: ChildProfile) =>
      items[plan.days.findIndex((d) => d.childId === child.id && d.index === found)]!.body
    expect(onDay(RUBEN)).not.toBe(onDay(JASPER))
    expect(onDay(BRITA)).toContain('Täht on leitud!')
  })

  it('siblings’ helpers appear by their right names in the readers’ letters', () => {
    expect(
      bodies(items, RUBEN).some((b) => b.includes('Tipp-Topp') && !b.startsWith('Tere!')),
    ).toBe(true)
    expect(
      bodies(items, JASPER).some((b) => b.includes('Kõpsu-Mõpsu') && !b.startsWith('Tere!')),
    ).toBe(true)
    for (const b of bodies(items, RUBEN)) expect(b).not.toMatch(/Nupsik|Kribu-Krabu/)
  })

  it('a single child meets workshop elves instead of invented siblings', () => {
    const text = runTemplates(christmas([RUBEN], { connected: false }, 5))
      .items.map((i) => i.body)
      .join(' ')
    expect(text).not.toMatch(/Jasper|Brita|Tipp-Topp/)
  })
})

describe('secrets and real-world actions', () => {
  it('the secret helper is only in the oldest child’s letters, and the invitation needs no answer', () => {
    const { plan, items } = build(christmas([RUBEN, JASPER, BRITA]))
    expect(plan.secret?.childId).toBe(RUBEN.id)
    const ruben = bodies(items, RUBEN)
    expect(ruben[plan.secret!.inviteIndex]).toContain('ei pea sa midagi vastama')
    expect(ruben[plan.secret!.inviteIndex]).toContain('eriti mitte Jasper ja Brita')
    expect(ruben.filter((b) => b.startsWith('Salamissioon:'))).toHaveLength(3)
    for (const child of [JASPER, BRITA])
      for (const b of bodies(items, child))
        expect(b).not.toMatch(/salajane abiline|Salamissioon|salajane missioon/i)
  })

  it('a secret mission never repeats that day’s paired task', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const { plan, items } = build(christmas([RUBEN, JASPER, BRITA], {}, seed))
      const ruben = bodies(items, RUBEN)
      const slipper = ruben.filter((b) => /suss/.test(b) && /aknalaual/.test(b))
      expect(slipper.length, `seed ${seed}`).toBeLessThanOrEqual(1)
      expect(plan.secret).toBeDefined()
    }
  })

  it('no letter claims the child answered, drew or completed something', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const text = runTemplates(christmas([RUBEN, JASPER, BRITA], {}, seed))
        .items.map((i) => i.body)
        .join('\n')
      expect(text).not.toMatch(
        /Ma nägin sinu märki|Lugesin su vastust|Aitäh vastuse eest|sa said hakkama/i,
      )
    }
  })
})

describe('puzzles and activities', () => {
  it('every puzzle answer is correct, on the parent sheet and revealed the next morning', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const request = christmas([RUBEN, JASPER], {}, seed)
      const { plan, items } = build(request)
      plan.days.forEach((d, k) => {
        if (d.content.kind !== 'scenario' || !d.content.activity) return
        const band = plan.children.find((p) => p.child.id === d.childId)!.band
        const activity = scenarioIn(library, d.content.scenarioId).activities![band]!
        if (activity.check) expect(activity.check(), d.content.scenarioId).toBe(true)
        if (!activity.reveal) return
        expect(items[k]!.answer).toBeTruthy()
        const next = items[k + 1]!
        expect(next.childId ?? null).toBe(items[k]!.childId ?? null)
        const ps = next.body.split('\n\n').find((p) => p.startsWith('P.S.'))
        expect(ps, d.content.scenarioId).toBeTruthy()
      })
    }
  })

  it('activities that need materials tell the parent what to prepare', () => {
    const { plan, items } = build(christmas([JASPER], { connected: false }, 11))
    plan.days.forEach((d, k) => {
      if (d.content.kind !== 'scenario' || !d.content.activity) return
      const prep = scenarioIn(library, d.content.scenarioId).activities?.young?.prep
      if (prep) expect(items[k]!.parentNote).toContain(prep)
    })
  })
})

describe('editing flow', () => {
  it('regenerating one letter of a family series replaces only that letter', async () => {
    const { templateGenerator } = await import('@/domain/generators/templateGenerator')
    const content = await templateGenerator.generate(christmas([RUBEN, JASPER, BRITA]))
    const index = content.items.findIndex(
      (item) => item.childId === JASPER.id && item.date === '2026-12-10',
    )
    const before = content.items[index]!
    const after = await templateGenerator.regenerateItem(content, index)
    expect(after.id).toBe(before.id)
    expect(after.body).not.toBe(before.body)
    expect(after.childId).toBe(JASPER.id)
    expect(content.items.filter((item, i) => i !== index).map((item) => item.body)).not.toContain(
      after.body,
    )
  })
})

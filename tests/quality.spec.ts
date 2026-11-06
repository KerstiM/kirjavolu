import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { defaultLayoutFor, runTemplates, templateGenerator } from '@/domain/generators/templateGenerator'
import { useCreationsStore } from '@/features/preview/creationsStore'
import { carryEdits } from '@/features/preview/carryEdits'
import { genitive, genitiveIsSure, nameCase, namesInCase } from '@/domain/text/estonian'
import { languageFor, textLevel } from '@/domain/generators/audience'
import { planCollection } from '@/domain/story/planner'
import { CHRISTMAS_LIBRARY, scenarioIn } from '@/domain/story/library'
import { STAR_ARC } from '@/data/scenarios/christmas/starArc'
import { validateCollection } from '@/domain/story/validate'
import { renderPlan } from '@/domain/story/render'
import { christmasLettersUntilEve, validateGenerationRequest } from '@/domain/validation'
import type { ChildProfile, GeneratedItem, RequestFor } from '@/domain/models'
import { KAI, PAARU, makeRequest, MARKUS } from './helpers'

/**
 * Content checks on real output: names, the order of events, riddles and their answers, the
 * world's frame, siblings' letters, and the preview's child filter and hand-made changes.
 * Passing them does not make a letter good – docs/samples/ is read for that.
 */
const child = (name: string, age: number, extra: Partial<ChildProfile> = {}): ChildProfile => ({
  ...PAARU,
  id: `c-${name}`,
  name,
  nameGenitive: undefined,
  age,
  readingLevel: age <= 4 ? 'read-aloud' : age <= 7 ? 'beginner' : 'independent',
  topics: [],
  topicNotes: {},
  interests: [],
  foods: [],
  family: [],
  ...extra,
})

const christmas = (
  children: ChildProfile[],
  options: Partial<RequestFor<'letter'>['options']> = {},
  general: Partial<RequestFor<'letter'>['general']> = {},
  seed = 1234,
) =>
  makeRequest('letter', {
    occasionId: 'christmas',
    children,
    general,
    seed,
    options: { startDate: '2026-12-01', ...options },
  }) as RequestFor<'letter'>

describe('names', () => {
  it('declines common Estonian names correctly', () => {
    expect(genitive('Mikk')).toBe('Miku')
    expect(genitive('Mart')).toBe('Mardi')
    expect(genitive('Rasmus')).toBe('Rasmuse')
    expect(genitive('Mari')).toBe('Mari')
    expect(genitive('Jüri')).toBe('Jüri')
    expect(genitive('Karl')).toBe('Karli')
    expect(genitive('Toomas')).toBe('Tooma')
  })

  it('declines only the last part of hyphenated and two-part names', () => {
    expect(genitive('Mari-Liis')).toBe('Mari-Liisi')
    expect(genitive('Karl-Erik')).toBe('Karl-Eriku')
    expect(genitive('Anna Maria')).toBe('Anna Maria')
    expect(genitive('Hanna-Mari')).toBe('Hanna-Mari')
  })

  it('builds every case from the genitive the parent typed in', () => {
    const mart = { name: 'Mart', nameGenitive: 'Mardi' }
    expect(nameCase(mart, 'allative')).toBe('Mardile')
    expect(nameCase(mart, 'comitative')).toBe('Mardiga')
    expect(namesInCase([{ name: 'Mikk' }, { name: 'Rasmus' }], 'comitative')).toBe('Miku ja Rasmusega')
    // A form typed in wins over the list.
    expect(nameCase({ name: 'Mikk', nameGenitive: 'Mikku' }, 'genitive')).toBe('Mikku')
  })

  it('knows when a form is only a guess', () => {
    for (const name of ['Mari', 'Jüri', 'Rasmus', 'Mikk', 'Mart', 'Karl', 'Mari-Liis']) expect(genitiveIsSure({ name }), name).toBe(true)
    expect(genitiveIsSure({ name: 'Brent' })).toBe(false)
    expect(genitiveIsSure({ name: 'Brent', nameGenitive: 'Brenti' })).toBe(true)
  })

  it('keeps an uncertain name in the nominative instead of guessing its case', () => {
    const family = [child('Uku', 10), child('Brent', 6)]
    const items = runTemplates(christmas(family)).items
    const uku = items.filter((item) => item.childId === 'c-Uku')
    expect(uku[0]!.body).toContain('Kirju saab ka Brent: talle kirjutab')
    for (const item of items) expect(item.body).not.toMatch(/Brenti|Brentile|Brentiga/)
    // With certain forms the shorter genitive sentence is used.
    const sure = runTemplates(christmas([child('Mari', 10), child('Mikk', 6)])).items
    expect(sure.find((item) => item.childId === 'c-Mari')!.body).toContain('Miku juures')
  })

  it('writes Mikk, Mart, Rasmus, Mari, Jüri and two-part names without broken forms', () => {
    const names = ['Mikk', 'Mart', 'Rasmus', 'Mari', 'Jüri', 'Mari-Liis', 'Karl Erik']
    const family = names.slice(0, 3).map((name, k) => child(name, [10, 6, 1][k]!))
    const other = names.slice(3).map((name, k) => child(name, [9, 5, 2, 7][k]!))
    const text = [...runTemplates(christmas(family)).items, ...runTemplates(christmas(other)).items].map((item) => item.body).join('\n')
    expect(text).not.toMatch(/Mikki|Marti\b|Rasmusi|Martile|Mikkile|Rasmusile|Mari-Liisile\b/)
  })
})

describe('language and length', () => {
  it('gives the two languages the texts one step apart, by age', () => {
    // A one-year-old's longer letter is a little story read aloud; the shorter one a one-line card.
    expect(textLevel(child('A', 1), 'simple')).toEqual({ band: 'toddler', readAloud: true })
    expect(textLevel(child('A', 1), 'simple', 'short')).toEqual({ band: 'toddler', readAloud: false })
    expect(textLevel(child('A', 1), 'rich')).toEqual({ band: 'young', readAloud: false })
    expect(textLevel(child('A', 6), 'simple').band).toBe('young')
    expect(textLevel(child('A', 6), 'rich').band).toBe('older')
    expect(textLevel(child('A', 10), 'simple').band).toBe('young')
    expect(textLevel(child('A', 10), 'rich').band).toBe('older')
  })

  it('reads an older creation’s "Lihtsam" and "Keerulisem" as the same texts', () => {
    const six = child('Mia', 6)
    expect(languageFor(six, {}, 'harder')).toBe('rich')
    expect(languageFor(six, {}, 'auto')).toBe('simple')
    expect(languageFor(child('Uku', 10), {}, 'easier')).toBe('simple')
    const before = runTemplates({ ...christmas([six]), general: { ...christmas([six]).general, difficulty: 'harder' } })
    const now = runTemplates(christmas([six], { language: { [six.id]: 'rich' } }))
    expect(now.items.map((item) => item.body)).toEqual(before.items.map((item) => item.body))
  })

  it('a rich letter is the same day’s story, told with more words', () => {
    const six = child('Mia', 6)
    const simple = planCollection(christmas([six], { connected: false }), CHRISTMAS_LIBRARY)
    const rich = planCollection(christmas([six], { connected: false, language: { [six.id]: 'rich' } }), CHRISTMAS_LIBRARY)
    expect(simple.children[0]!.band).toBe('young')
    expect(rich.children[0]!.band).toBe('older')
  })

  it('keeps the shorter letter whole: the same stories, no continuation added', () => {
    const request = christmas([child('Uku', 10)], {}, { length: 'short' })
    const long = christmas([child('Uku', 10)], {}, { length: 'long' })
    const scenarios = (r: RequestFor<'letter'>) =>
      planCollection(r, CHRISTMAS_LIBRARY).days.map((d) => (d.content.kind === 'scenario' ? d.content.scenarioId : d.content.kind))
    expect(scenarios(request)).toEqual(scenarios(long))
    const shortItems = runTemplates(request).items
    const longItems = runTemplates(long).items
    shortItems.forEach((item, k) => expect(longItems[k]!.body.length).toBeGreaterThanOrEqual(item.body.length - 120))
  })
})

describe('single letters', () => {
  it('is a whole letter: who writes, one episode and a closing, without promising tomorrow', () => {
    for (const age of [1, 3, 6, 10]) {
      for (const seed of [1, 2, 3]) {
        const request = christmas([child('Mia', age)], { count: 1 }, {}, seed)
        const plan = planCollection(request, CHRISTMAS_LIBRARY)
        const [item] = renderPlan(plan, CHRISTMAS_LIBRARY, request)
        const day = plan.days[0]!
        expect(day.content.kind === 'scenario' && day.content.story, `${age} ${seed}`).toBeTruthy()
        expect(item!.body).toMatch(/Mina olen/)
        expect(item!.body).toMatch(/Häid jõul/)
        expect(item!.body).not.toMatch(/Igal (hommikul|õhtul)|homme kirjutan|homses kirjas|järgmises kirjas/i)
        expect(validateCollection(plan, [item!], CHRISTMAS_LIBRARY).filter((i) => i.severity === 'error')).toEqual([])
      }
    }
  })

  it('gives siblings different stories on the same day', () => {
    const plan = planCollection(christmas([MARKUS, PAARU, KAI], { count: 1 }), CHRISTMAS_LIBRARY)
    const stories = plan.days.map((d) => (d.content.kind === 'scenario' ? d.content.story : undefined))
    expect(new Set(stories).size).toBe(3)
  })
})

describe('order of events and the frame of the world', () => {
  const families = [[MARKUS, PAARU, KAI], [MARKUS], [child('Uku', 10), child('Mia', 6), child('Kai', 1)]]

  it('tells the star story in order, and only says "jõululaupäev" on 24 December', () => {
    for (const children of families) {
      for (const count of [7, 12, 24]) {
        const request = christmas(children, { count })
        const plan = planCollection(request, CHRISTMAS_LIBRARY)
        const items = renderPlan(plan, CHRISTMAS_LIBRARY, request)
        for (const p of plan.children) {
          const days = plan.days.filter((d) => d.childId === p.child.id)
          const stages = days.flatMap((d) => (d.content.kind === 'scenario' && d.content.stageId ? [d.content.stageId] : []))
          const order = STAR_ARC.stages.map((stage) => stage.id)
          const positions = stages.map((id) => order.indexOf(id))
          expect(positions).not.toContain(-1)
          expect(positions, `${p.child.name} ${count}`).toEqual([...positions].sort((a, b) => a - b))
        }
        plan.days.forEach((d, k) => {
          if (/Täna on jõululaupäev/.test(items[k]!.body)) expect(d.date).toBe('2026-12-24')
        })
        expect(validateCollection(plan, items, CHRISTMAS_LIBRARY).filter((i) => i.severity === 'error')).toEqual([])
      }
    }
  })

  it('keeps the helper in the workshop: nobody moves in with the child', () => {
    for (const children of families) {
      for (const count of [1, 7, 24]) {
        const text = runTemplates(christmas(children, { count })).items.map((item) => item.body).join('\n')
        expect(text).not.toMatch(/jään sinu juurde|elan (ma )?sinu juures|Mul oli sinu juures|ronin (sinu|teie) (taskusse|kingikotti)/)
      }
    }
  })

  it('answers every riddle in the next letter, with the answer on the parent sheet', () => {
    for (const seed of [1, 2, 3, 4]) {
      const request = christmas([MARKUS, PAARU, KAI], {}, {}, seed)
      const plan = planCollection(request, CHRISTMAS_LIBRARY)
      const items = renderPlan(plan, CHRISTMAS_LIBRARY, request)
      plan.days.forEach((d, k) => {
        const asked = d.addenda.find((a) => /Vastuse kirjutan homme|Vastus tuleb homses kirjas|Homme ütlen vastuse/.test(a))
        if (!asked) return
        expect(items[k]!.answer).toBeTruthy()
        const next = items[k + 1]!
        expect(next.childId).toBe(items[k]!.childId)
        expect(next.body).toContain(`Eilse mõistatuse vastus: ${items[k]!.answer}.`)
      })
      // And story puzzles reveal in the next letter too.
      plan.days.forEach((d, k) => {
        if (d.content.kind !== 'scenario' || !d.content.activity) return
        const p = plan.children.find((c) => c.child.id === d.childId)!
        if (!scenarioIn(CHRISTMAS_LIBRARY, d.content.scenarioId).activities?.[p.band]?.reveal) return
        expect(items[k + 1]!.body, d.content.scenarioId).toMatch(/P\.S\./)
      })
    }
  })

  it('ends Christmas letters on Christmas Eve at the latest', () => {
    expect(christmasLettersUntilEve('2026-12-01')).toBe(24)
    expect(christmasLettersUntilEve('2026-12-10')).toBe(15)
    expect(christmasLettersUntilEve('2026-11-20')).toBe(24)
    expect(christmasLettersUntilEve('2026-12-26')).toBe(1)
    expect(validateGenerationRequest(christmas([MARKUS], { startDate: '2026-12-10', count: 24 }))).toContain(
      'Jõulukirjad lõpevad jõululaupäeval: selle alguskuupäevaga mahub sarja kuni 15 kirja.',
    )
    expect(validateGenerationRequest(christmas([MARKUS], { startDate: '2026-12-10', count: 15 }))).toEqual([])
  })
})

describe('siblings with the same language level', () => {
  it('still get a letter every day; only a few days borrow a story one step over', () => {
    for (const language of ['simple', 'rich'] as const) {
      for (const seed of [1, 2, 3]) {
        const children = [child('Jüri', 10), child('Mari-Liis', 6), child('Mart', 1)]
        const request = christmas(children, { language: Object.fromEntries(children.map((c) => [c.id, language])) }, {}, seed)
        const plan = planCollection(request, CHRISTMAS_LIBRARY)
        const items = renderPlan(plan, CHRISTMAS_LIBRARY, request)
        for (const c of children) expect(plan.days.filter((d) => d.childId === c.id), `${language} ${seed} ${c.name}`).toHaveLength(24)
        expect(plan.days.filter((d) => d.band).length, `${language} ${seed}`).toBeLessThanOrEqual(8)
        expect(validateCollection(plan, items, CHRISTMAS_LIBRARY).filter((i) => i.severity === 'error')).toEqual([])
      }
    }
  })
})

describe('three children on the same day', () => {
  it('tells shared events on one day to all, each in their own words', () => {
    const request = christmas([MARKUS, PAARU, KAI])
    const plan = planCollection(request, CHRISTMAS_LIBRARY)
    const items = renderPlan(plan, CHRISTMAS_LIBRARY, request)
    for (const event of plan.worldEvents.filter((e) => e.childIds.length > 1)) {
      const texts = event.childIds.map((id) => {
        const k = plan.days.findIndex((d) => d.childId === id && d.index === event.index)
        expect(plan.days[k]!.content.kind === 'scenario' && plan.days[k]!.content.scenarioId).toBe(event.scenarioId)
        return items[k]!.body
      })
      expect(new Set(texts).size).toBe(texts.length)
    }
  })

  it('gives a one-year-old pointing, sounds and moving with an adult – never reading, saying or jumping', () => {
    const toddler = child('Kai', 1)
    const items = runTemplates(christmas([MARKUS, PAARU, toddler])).items.filter((item) => item.childId === toddler.id)
    for (const item of items) {
      expect(item.body).not.toMatch(/Kas sina oskad (ka )?hüpata|Hüppame koos|\bHüppa\b|\bÜtle\b|Loe sina|\bKirjuta\b|joonista ise/i)
    }
  })
})

describe('preview', () => {
  async function open(content: Awaited<ReturnType<typeof templateGenerator.generate>>) {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useCreationsStore()
    store.add(content)
    const router = createRouter({ history: createMemoryHistory(), routes })
    router.push(`/looming/${content.id}`)
    await router.isReady()
    render(App, { global: { plugins: [pinia, router] } })
    await screen.findByRole('heading', { level: 1 })
    return { store, user: userEvent.setup() }
  }
  afterEach(() => vi.restoreAllMocks())

  it('shows every letter again when a child filter no longer fits the letters', async () => {
    const family = await templateGenerator.generate(christmas([MARKUS, PAARU], { count: 7 }, { length: 'short' }))
    const { store, user } = await open(family)
    await user.click(screen.getByRole('radio', { name: 'Markus' }))
    expect(screen.queryByRole('heading', { name: 'Pääru' })).toBeNull()
    // The same creation, now one letter for both (as an older creation may be).
    const shared = await templateGenerator.generate(christmas([MARKUS, PAARU], { count: 1, mode: 'shared' }))
    store.applyChoices(family.id, shared)
    await vi.waitFor(() => expect(document.querySelectorAll('.paper').length).toBeGreaterThan(0))
    expect(screen.getByText(/Kallid Markus ja Pääru!/)).toBeInTheDocument()
  })

  it('exports only the letters of the child shown, and says so', async () => {
    let blob: Blob | undefined
    Object.assign(URL, { createObjectURL: vi.fn((b: Blob) => ((blob = b), 'blob:x')), revokeObjectURL: vi.fn() })
    const family = await templateGenerator.generate(christmas([MARKUS, PAARU], { count: 7 }, { length: 'short' }))
    const { user } = await open(family)
    await user.click(screen.getByRole('radio', { name: 'Pääru' }))
    await user.click(screen.getByRole('button', { name: 'Tekstifail: Pääru' }))
    const text = await blob!.text()
    expect(text).toContain('Ainult ühe lapse kirjad: Pääru')
    expect(text).toContain('Kallis Pääru!'.toLocaleUpperCase('et-EE'))
    expect(text).not.toContain('Kallis Markus!'.toLocaleUpperCase('et-EE'))
    await user.click(screen.getByRole('radio', { name: 'Kõik lapsed' }))
    await user.click(screen.getByRole('button', { name: 'Tekstifail' }))
    expect(await blob!.text()).toContain('Kallis Markus!'.toLocaleUpperCase('et-EE'))
  })

  it('carries letters edited by hand into letters written again, and reports any it cannot keep', () => {
    const item = (childId: string, body: string, edited = false): GeneratedItem => ({
      id: body,
      kind: 'letter',
      label: '',
      heading: '',
      body,
      childId,
      variant: 0,
      edited,
    })
    const before = [item('a', 'a1'), item('a', 'oma a2', true), item('b', 'b1'), item('b', 'oma b2', true)]
    const after = [item('a', 'uus a1'), item('a', 'uus a2'), item('b', 'uus b1')]
    const { items, kept, lost } = carryEdits(before, after)
    expect(items.map((i) => i.body)).toEqual(['uus a1', 'oma a2', 'uus b1'])
    expect(kept).toBe(1)
    expect(lost.map((i) => i.body)).toEqual(['oma b2'])
  })

  it('offers no shared letter for Christmas families, and the length and language choices plainly', async () => {
    const family = await templateGenerator.generate(christmas([MARKUS, PAARU], { count: 7 }))
    await open(family)
    const panel = screen.getByRole('region', { name: /Kohanda/ })
    await userEvent.setup().click(within(panel).getByRole('button', { name: /Sisu kohandamine/ }))
    expect(within(panel).queryByText('Üks ühine kiri kõigile')).toBeNull()
    expect(within(panel).queryByRole('group', { name: 'Toon' })).toBeNull()
    expect(within(within(panel).getByRole('group', { name: /^Kirja pikkus/ })).getAllByRole('radio')).toHaveLength(2)
    // Each child's text complexity sits in their own block.
    const markus = within(panel).getByRole('group', { name: 'Markus' })
    expect(within(within(markus).getByRole('group', { name: 'Teksti keerukus' })).getByRole('radio', { name: 'Rikkalikum keel' })).toBeChecked()
    const paaru = within(panel).getByRole('group', { name: 'Pääru' })
    expect(within(within(paaru).getByRole('group', { name: 'Teksti keerukus' })).getByRole('radio', { name: 'Lihtne keel' })).toBeChecked()
    expect(within(paaru).getByText(/Lihtne keel: lühikesed laused/)).toBeInTheDocument()
  })
})

describe('puzzle switched off', () => {
  it('prints a series one letter to a page, and keeps the toddler cards in a family', () => {
    const series = (children: ChildProfile[], length: 'short' | 'long' = 'long') =>
      makeRequest('letter', { children, occasionId: 'christmas', general: { length }, options: { count: 24, mode: 'linked' } })
    expect(defaultLayoutFor(series([MARKUS]))).toBe('page')
    // A toddler's long letter is the little story read aloud, on a page like the others.
    expect(defaultLayoutFor(series([MARKUS, KAI]))).toBe('page')
    expect(defaultLayoutFor(series([MARKUS, KAI], 'short'))).toBe('poster')
  })
})

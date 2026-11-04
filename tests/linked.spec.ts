import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/app/App.vue'
import { routes } from '@/app/router'
import { runTemplates, templateGenerator } from '@/domain/generators/templateGenerator'
import { familyPlan, pairedDayIndexes, personasFor, siblingPairs } from '@/domain/generators/linkedLetters'
import { useCreationsStore } from '@/features/preview/creationsStore'
import type { GeneratedItem, RequestFor } from '@/domain/models'
import { KAI, PAARU, makeRequest, MARKUS } from './helpers'

const family = (extra: Partial<RequestFor<'letter'>['options']> = {}) =>
  makeRequest('letter', { occasionId: 'christmas', children: [MARKUS, PAARU, KAI], options: { startDate: '2026-12-01', ...extra } })

const byChild = <T extends Pick<GeneratedItem, 'childId'>>(items: T[], id: string) => items.filter((item) => item.childId === id)

describe('family plan', () => {
  it('suggests helpers from interests, the oldest child gets the oldest helper', () => {
    const personas = personasFor(family())
    expect(personas[MARKUS.id]).toMatchObject({ name: 'Kõpsu-Mõpsu', title: 'Kuubikuvõlur' })
    expect(personas[MARKUS.id]!.origin).toContain('kõige vanem')
    expect(personas[PAARU.id]).toMatchObject({ name: 'Tipp-Topp', title: 'Riisiterake' })
    expect(personas[KAI.id]!.origin).toContain('kõige pisem')
  })

  it('keeps the names the parent chose', () => {
    const personas = personasFor(family({ personas: { [KAI.id]: { name: 'Pisi-Pätsi', title: 'Roosaninake', origin: '' } } }))
    expect(personas[KAI.id]).toMatchObject({ name: 'Pisi-Pätsi', title: 'Roosaninake' })
    expect(personas[KAI.id]!.origin).toContain('pisem')
  })

  it('only older readers give tasks to younger siblings', () => {
    const pairs = siblingPairs([MARKUS, PAARU, KAI]).map((p) => `${p.giver.name}→${p.receiver.name}`)
    expect(pairs).toEqual(['Markus→Pääru', 'Markus→Kai', 'Pääru→Kai'])
  })

  it('paired days are spread out and never the first or last day', () => {
    expect(pairedDayIndexes(24)).toEqual([4, 9, 14, 19])
    expect(pairedDayIndexes(3)).toEqual([])
    const plan = familyPlan(family())
    expect(plan).toHaveLength(4)
    expect(new Set(plan.map((d) => d.template.id)).size).toBe(4)
  })
})

describe('linked letters', () => {
  const items = runTemplates(family()).items

  it('every child gets their own full series, signed by their own helper', () => {
    expect(byChild(items, MARKUS.id)).toHaveLength(24)
    expect(byChild(items, KAI.id)).toHaveLength(24)
    expect(byChild(items, PAARU.id).every((i) => i.signature?.endsWith('Tipp-Topp'))).toBe(true)
  })

  it('the first letter introduces the siblings’ helpers', () => {
    const markus = byChild(items, MARKUS.id)[0]!.body
    expect(markus).toContain('Mina olen Kõpsu-Mõpsu Kuubikuvõlur')
    expect(markus).toContain('Pääru juures Tipp-Topp Riisiterake')
    expect(markus).toContain('Kai juures Pisi-Pätsi')
    expect(byChild(items, KAI.id)[0]!.body).toContain('Markus ja Pääru saavad ka kirju!')
  })

  it('both letters of a paired day tell the same thing from both sides', () => {
    for (const day of familyPlan(family())) {
      const giver = byChild(items, day.giverId)[day.index]!.body
      const receiver = byChild(items, day.receiverId)[day.index]!.body
      const receiverName = [MARKUS, PAARU, KAI].find((c) => c.id === day.receiverId)!
      const giverName = [MARKUS, PAARU, KAI].find((c) => c.id === day.giverId)!.name
      expect(giver).toMatch(new RegExp(receiverName.name.slice(0, 4)))
      if (day.template.id !== 'secret-letter' && day.template.id !== 'kindness') expect(receiver).toContain(giverName)
    }
  })

  it('a letter left by a slipper is found the next morning, not the same day', async () => {
    const { PAIR_TEMPLATES } = await import('@/data/templates/pairs')
    const template = PAIR_TEMPLATES.find((t) => t.id === 'secret-letter')!
    const ctx = { giver: 'Markus', giverGenitive: 'Markuse', receiver: 'Pääru', receiverGenitive: 'Pääru', receiverAllative: 'Päärule', receiverComitative: 'Pääruga', receiverHelper: 'Tipp-Topp' }
    expect(template.giver(ctx)).toMatch(/õhtul/)
    expect(template.giver(ctx)).toMatch(/homme hommikul/)
    expect(template.receiverReader!(ctx)).toMatch(/homme hommikul/)
    expect(template.receiverReader!(ctx)).not.toMatch(/\bTäna\b/)
  })

  it('siblings never get the same story part', async () => {
    const { OCCASION_CORES, GENERIC_CORES } = await import('@/data/templates/letters')
    const ctx = { v: (s: string) => s, sender: '', vocab: { words: [], moods: [], greeting: '', sender: '', senderHome: '', prize: '' } }
    const cores = [...(OCCASION_CORES.christmas ?? []), ...GENERIC_CORES].map((line) => line(ctx))
    const coresOf = (id: string) => byChild(items, id).flatMap((item) => cores.filter((core) => item.body.includes(core)))
    const markus = new Set(coresOf(MARKUS.id))
    expect(coresOf(PAARU.id).filter((core) => markus.has(core))).toEqual([])
  })

  it('every child follows the star story from their own helper’s side', () => {
    const story = (id: string) => byChild(items, id).filter((i) => /täht|Täht/.test(i.body)).map((i) => i.body)
    expect(story(MARKUS.id).length).toBeGreaterThan(story(KAI.id).length)
    expect(story(PAARU.id).length).toBeGreaterThanOrEqual(4)
    const markus = new Set(story(MARKUS.id))
    expect(story(PAARU.id).filter((b) => markus.has(b))).toEqual([])
  })

  it('the last letter is a shared farewell for the readers', () => {
    expect(byChild(items, MARKUS.id)[23]!.body).toContain('Kõpsu-Mõpsu, Tipp-Topp ja Pisi-Pätsi')
    expect(byChild(items, KAI.id)[23]!.body).toContain('Häid jõule, väike Kai!')
  })

  it('shared mode still makes one letter for all', () => {
    const shared = runTemplates(family({ mode: 'shared' })).items
    expect(shared).toHaveLength(24)
    expect(shared[0]!.heading).toBe('Kallid Markus, Pääru ja Kai!')
  })

  it('parent sheet lists helpers and paired days', () => {
    const instructions = runTemplates(family()).instructions
    expect(instructions[0]!.title).toBe('Pere päkapikud')
    expect(instructions[1]!.steps.some((s) => /^5\. detsember: Markus → /.test(s))).toBe(true)
  })
})

describe('linked preview', () => {
  it('shows each child separately with their own layout and a filter', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    // The puzzle poster is for short and medium letters.
    const request = family()
    const content = await templateGenerator.generate({ ...request, general: { ...request.general, length: 'medium' } })
    useCreationsStore().add(content)
    const router = createRouter({ history: createMemoryHistory(), routes })
    router.push(`/looming/${content.id}`)
    await router.isReady()
    render(App, { global: { plugins: [pinia, router] } })
    expect(await screen.findByRole('heading', { name: 'Markus' })).toBeInTheDocument()
    expect(document.querySelectorAll('.sheet')).toHaveLength(8)
    expect(document.querySelectorAll('.mini-sheet')).toHaveLength(2)
    await userEvent.setup().click(screen.getByRole('radio', { name: 'Kai' }))
    expect(document.querySelectorAll('.sheet')).toHaveLength(0)
    expect(document.querySelectorAll('.mini-sheet')).toHaveLength(2)
  })
})
